import os from 'node:os';
import { randomBytes } from 'node:crypto';
import { runDocker, dockerAvailable, isGVisorAvailable } from '../server/sandbox.mjs';
import { 
  redisCommand, 
  redisMultiPop, 
  parseRedisUrls, 
  registerWorker, 
  heartbeatWorker, 
  unregisterWorker, 
  DEFAULT_PRIORITY_QUEUES 
} from '../server/redisQueue.mjs';

const API = process.env.CODEARENA_API_URL || 'http://127.0.0.1:8787';
const SECRET = process.env.CODEARENA_WORKER_SECRET || 'change-me-in-production';
const REDIS_URLS = parseRedisUrls(process.env.CODEARENA_REDIS_URLS || process.env.CODEARENA_REDIS_URL || 'redis://redis:6379/0');
const QUEUE_KEYS = process.env.CODEARENA_REDIS_QUEUE_KEY 
  ? [process.env.CODEARENA_REDIS_QUEUE_KEY, ...DEFAULT_PRIORITY_QUEUES] 
  : DEFAULT_PRIORITY_QUEUES;
const poll = Number(process.env.CODEARENA_WORKER_POLL_MS || 250);
const ROOT = process.env.CODEARENA_WORKER_TMP || '/tmp/codearena-worker';
const RUNTIME = process.env.CODEARENA_SANDBOX_RUNTIME || '';
const PRODUCTION = process.env.CODEARENA_PRODUCTION === '1' || process.env.NODE_ENV === 'production';

if (PRODUCTION && !process.env.CODEARENA_DOCKER) process.env.CODEARENA_DOCKER = '1';
if (PRODUCTION && !(await dockerAvailable())) throw new Error('Docker daemon is required for the CodeArena judge worker');

// Determine active sandbox runtime (gVisor runsc kernel isolation or runc)
const gVisorAvailable = await isGVisorAvailable();
const activeRuntime = RUNTIME || (gVisorAvailable ? 'runsc' : '');

const WORKER_ID = process.env.CODEARENA_WORKER_ID || `worker-${os.hostname()}-${process.pid}-${randomBytes(4).toString('hex')}`;
let jobsCompleted = 0;
let currentJobId = null;

async function execute(language, sourceCode, input, timeLimitMs, memoryLimitMb) {
  return runDocker(
    language,
    sourceCode,
    input,
    { 
      time: timeLimitMs || 2000, 
      memory: memoryLimitMb || 256, 
      maxOutput: 1000000, 
      runtime: activeRuntime 
    },
    { 
      root: ROOT, 
      runtime: activeRuntime 
    }
  );
}

async function tick() {
  let claimedId = null;
  let sourceQueue = null;
  let sourceRedis = null;

  try {
    const popResult = await redisMultiPop(REDIS_URLS, QUEUE_KEYS);
    if (!popResult) return;
    
    const { id, queue: qKey, redisUrl } = popResult;
    sourceQueue = qKey;
    sourceRedis = redisUrl;

    const claimResponse = await fetch(`${API}/api/internal/worker/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': SECRET },
      body: JSON.stringify({ id, workerId: WORKER_ID, runtime: activeRuntime })
    });

    if (!claimResponse.ok) throw new Error(`claim failed ${claimResponse.status}`);
    const claim = await claimResponse.json();
    if (!claim.job) {
      await redisCommand(sourceRedis, ['LPUSH', sourceQueue, id]);
      return;
    }

    claimedId = claim.job.id;
    currentJobId = claimedId;
    const j = claim.job;
    let passed = 0, maxTime = 0, peakMemoryMb = 0, verdict = 'ACCEPTED';

    for (const t of j.tests) {
      const r = await execute(j.language, j.sourceCode, t.input, j.timeLimitMs, j.memoryLimitMb);
      maxTime = Math.max(maxTime, r.timeMs || 0);
      peakMemoryMb = Math.max(peakMemoryMb, r.memoryMb || 0);
      if (r.status !== 'SUCCESS') {
        verdict = r.status;
        break;
      }
      if (r.stdout.trim().replace(/\s+/g, ' ') !== t.expected_output.trim().replace(/\s+/g, ' ')) {
        verdict = 'WRONG_ANSWER';
        break;
      }
      passed++;
    }

    const total = j.tests.length;
    const marks = Math.round((passed / Math.max(total, 1)) * j.points * 100) / 100;

    await fetch(`${API}/api/internal/worker/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': SECRET },
      body: JSON.stringify({
        id: j.id,
        verdict,
        passed,
        total,
        runtimeMs: maxTime,
        memoryMb: peakMemoryMb,
        marks,
        workerId: WORKER_ID,
        sandboxRuntime: activeRuntime || 'runc'
      })
    });

    jobsCompleted++;
    currentJobId = null;
  } catch (e) {
    currentJobId = null;
    console.error(`[Worker ${WORKER_ID}] error:`, e.message);
    if (claimedId) {
      try {
        const r = await fetch(`${API}/api/internal/worker/requeue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': SECRET },
          body: JSON.stringify({ id: claimedId, workerId: WORKER_ID })
        });
        if (!r.ok && sourceRedis && sourceQueue) {
          await redisCommand(sourceRedis, ['LPUSH', sourceQueue, claimedId]);
        }
      } catch {
        if (sourceRedis && sourceQueue) {
          try { await redisCommand(sourceRedis, ['LPUSH', sourceQueue, claimedId]); } catch {}
        }
      }
    }
  }
}

// Register worker with external Redis multi-instances
await registerWorker(REDIS_URLS, {
  id: WORKER_ID,
  hostname: os.hostname(),
  pid: process.pid,
  runtime: activeRuntime || 'runc',
  gVisorEnforced: activeRuntime === 'runsc',
  status: 'IDLE',
  jobsCompleted: 0
});

// Periodic worker heartbeat to Redis
const heartbeatInterval = setInterval(async () => {
  await heartbeatWorker(REDIS_URLS, WORKER_ID, {
    status: currentJobId ? 'BUSY' : 'IDLE',
    currentJobId,
    jobsCompleted
  });
}, 5000);

// Graceful cleanup on shutdown
const shutdown = async () => {
  clearInterval(heartbeatInterval);
  await unregisterWorker(REDIS_URLS, WORKER_ID);
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`[CodeArena Worker ${WORKER_ID}] Online`);
console.log(` -> API: ${API}`);
console.log(` -> Redis Nodes: ${REDIS_URLS.join(', ')}`);
console.log(` -> Priority Queues: ${QUEUE_KEYS.join(' > ')}`);
console.log(` -> Sandbox Runtime: ${activeRuntime || 'runc (standard)'}`);
console.log(` -> gVisor Syscall Filtering: ${activeRuntime === 'runsc' ? 'ENFORCED (runsc sandbox)' : 'DISABLED'}`);

setInterval(tick, poll);
tick();
