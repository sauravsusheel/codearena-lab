import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';

export const SandboxExecutionResultSchema = z.object({
  submission_id: z.string().uuid(),
  student_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  language_id: z.string().min(1),
  station_id: z.string().optional().nullable(),
  source_code: z.string(),
  verdict: z.enum([
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED',
    'RUNTIME_ERROR',
    'COMPILATION_ERROR',
  ]),
  execution_time_ms: z.number().int().nonnegative(),
  memory_used_kb: z.number().int().nonnegative(),
  score: z.number().min(0).max(1000),
  compiler_output: z.string().optional().nullable(),
  retry_count: z.number().int().default(0),
});

export type SandboxExecutionResult = z.infer<typeof SandboxExecutionResultSchema>;

export class JudgeResultConsumer {
  private isRunning = false;
  private readonly queueKey: string;
  private readonly processingKey: string;
  private readonly dlqKey: string;
  private readonly maxRetries = 3;

  constructor(
    private readonly redis: Redis,
    private readonly pool: Pool,
    queueName = 'codearena:sandbox:results'
  ) {
    this.queueKey = queueName;
    this.processingKey = `${queueName}:processing`;
    this.dlqKey = `${queueName}:dlq`;

    this.registerLuaScripts();
  }

  private registerLuaScripts() {
    this.redis.defineCommand('updateStudentStats', {
      numberOfKeys: 1,
      lua: `
        local key = KEYS[1]
        local is_accepted = tonumber(ARGV[1])
        local now = ARGV[2]
        local last_sub_id = ARGV[3]

        local total = redis.call('HINCRBY', key, 'total_runs', 1)
        local accepted = 0
        if is_accepted == 1 then
          accepted = redis.call('HINCRBY', key, 'accepted_count', 1)
        else
          accepted = tonumber(redis.call('HGET', key, 'accepted_count') or 0)
        end

        local pass_rate = 0
        if total > 0 then
          pass_rate = (accepted / total) * 100
        end

        redis.call('HSET', key, 
          'pass_rate', string.format('%.2f', pass_rate),
          'last_active_at', now,
          'last_submission_id', last_sub_id
        )

        -- Retain stats in cache for 7 days
        redis.call('EXPIRE', key, 604800)
        return {total, accepted, string.format('%.2f', pass_rate)}
      `,
    });
  }

  async start() {
    this.isRunning = true;
    console.log(`[JudgeWorker] Listening on queue: ${this.queueKey}`);

    while (this.isRunning) {
      try {
        // Atomic reliable fetch: moves message from queueKey to processingKey
        const rawPayload = await this.redis.brpoplpush(this.queueKey, this.processingKey, 2);
        if (!rawPayload) continue;

        await this.processItem(rawPayload);
      } catch (err: any) {
        console.error('[JudgeWorker] Worker loop encountered an error:', err.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  stop() {
    this.isRunning = false;
  }

  async processItem(rawPayload: string) {
    let payload: SandboxExecutionResult;

    try {
      const parsedJson = JSON.parse(rawPayload);
      const validation = SandboxExecutionResultSchema.safeParse(parsedJson);

      if (!validation.success) {
        console.error('[JudgeWorker] Schema validation failed. Moving to DLQ:', validation.error);
        await this.moveToDLQ(rawPayload, 'INVALID_PAYLOAD_SCHEMA', validation.error.message);
        await this.redis.lrem(this.processingKey, 1, rawPayload);
        return;
      }
      payload = validation.data;
    } catch (err: any) {
      console.error('[JudgeWorker] Corrupt JSON string. Moving to DLQ:', err.message);
      await this.moveToDLQ(rawPayload, 'MALFORMED_JSON', err.message);
      await this.redis.lrem(this.processingKey, 1, rawPayload);
      return;
    }

    try {
      // 1. Idempotent Database Write to PostgreSQL
      await this.persistSubmission(payload);

      // 2. Atomic Aggregate State Synchronization in Redis
      await this.updateRedisStudentStats(payload);

      // 3. Acknowledge & remove from processing queue
      await this.redis.lrem(this.processingKey, 1, rawPayload);
    } catch (error: any) {
      console.error(`[JudgeWorker] Failed processing submission ${payload.submission_id}:`, error.message);
      await this.handleProcessingFailure(rawPayload, payload, error);
    }
  }

  private async persistSubmission(result: SandboxExecutionResult): Promise<void> {
    const insertQuery = `
      INSERT INTO submissions (
        submission_id, student_id, problem_id, language_id, station_id,
        source_code, verdict, execution_time_ms, memory_used_kb, score,
        compiler_output, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (submission_id) DO UPDATE SET
        verdict = EXCLUDED.verdict,
        execution_time_ms = EXCLUDED.execution_time_ms,
        memory_used_kb = EXCLUDED.memory_used_kb,
        score = EXCLUDED.score,
        compiler_output = EXCLUDED.compiler_output;
    `;

    await this.pool.query(insertQuery, [
      result.submission_id,
      result.student_id,
      result.problem_id,
      result.language_id,
      result.station_id || null,
      result.source_code,
      result.verdict,
      result.execution_time_ms,
      result.memory_used_kb,
      result.score,
      result.compiler_output || null,
    ]);
  }

  private async updateRedisStudentStats(result: SandboxExecutionResult): Promise<void> {
    const studentStatsKey = `student:${result.student_id}:stats`;
    const isAccepted = result.verdict === 'ACCEPTED' ? 1 : 0;
    const nowIso = new Date().toISOString();

    // Invoke atomic custom Lua script
    await (this.redis as any).updateStudentStats(
      studentStatsKey,
      isAccepted,
      nowIso,
      result.submission_id
    );

    // Sync station activity if submitted from a designated station
    if (result.station_id) {
      await this.redis.hset(`station:${result.station_id}:active`, {
        last_submission_id: result.submission_id,
        last_verdict: result.verdict,
        last_active_at: nowIso,
      });
    }
  }

  private async handleProcessingFailure(
    rawPayload: string,
    payload: SandboxExecutionResult,
    error: Error
  ) {
    const retries = (payload.retry_count || 0) + 1;

    // Remove from in-flight processing list
    await this.redis.lrem(this.processingKey, 1, rawPayload);

    if (retries > this.maxRetries) {
      console.warn(`[JudgeWorker] Max retries (${this.maxRetries}) exceeded for submission ${payload.submission_id}. Moving to DLQ.`);
      await this.moveToDLQ(rawPayload, 'MAX_RETRIES_EXCEEDED', error.message);
    } else {
      payload.retry_count = retries;
      console.log(`[JudgeWorker] Requeueing submission ${payload.submission_id} (Attempt ${retries}/${this.maxRetries}) with backoff...`);

      const delayMs = Math.pow(2, retries) * 1000;
      setTimeout(async () => {
        try {
          await this.redis.lpush(this.queueKey, JSON.stringify(payload));
        } catch (err: any) {
          console.error('[JudgeWorker] Failed to requeue message back to queue:', err.message);
        }
      }, delayMs);
    }
  }

  private async moveToDLQ(payload: string, reason: string, errorMessage: string) {
    const dlqRecord = JSON.stringify({
      failed_at: new Date().toISOString(),
      reason,
      error: errorMessage,
      original_payload: payload,
    });
    await this.redis.rpush(this.dlqKey, dlqRecord);
  }
}
