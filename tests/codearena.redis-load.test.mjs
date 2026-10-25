import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { redisPush, redisPop, redisCommand } from '../server/redisQueue.mjs';

const API_PORT = '8886';
const REDIS_PORT = 16379;
const REDIS_URL = `redis://127.0.0.1:${REDIS_PORT}/0`;
const QUEUE_KEY = 'codearena:submissions';
const WORKER_SECRET = 'worker-secret-super-strong-12345';

let redisServer;
let apiProc;
const queue = [];

function createRespServer(port) {
  return new Promise((resolve, reject) => {
    const s = net.createServer(socket => {
      let buffer = '';
      socket.on('data', chunk => {
        buffer += chunk.toString();
        while (buffer.length > 0) {
          if (!buffer.startsWith('*')) {
            buffer = '';
            break;
          }
          const lines = buffer.split('\r\n');
          const argCount = parseInt(lines[0].slice(1), 10);
          if (isNaN(argCount)) { buffer = ''; break; }

          // Check if we have all arguments
          let idx = 1;
          const args = [];
          let complete = true;
          for (let i = 0; i < argCount; i++) {
            if (idx >= lines.length || !lines[idx].startsWith('$')) { complete = false; break; }
            const len = parseInt(lines[idx].slice(1), 10);
            idx++;
            if (idx >= lines.length) { complete = false; break; }
            args.push(lines[idx]);
            idx++;
          }
          if (!complete) break; // wait for more data

          // Consume processed commands
          buffer = lines.slice(idx).join('\r\n');

          const cmd = (args[0] || '').toUpperCase();
          if (cmd === 'PING') {
            socket.write('+PONG\r\n');
          } else if (cmd === 'AUTH' || cmd === 'SELECT') {
            socket.write('+OK\r\n');
          } else if (cmd === 'LPUSH') {
            const val = args[2];
            queue.unshift(val);
            socket.write(`:${queue.length}\r\n`);
          } else if (cmd === 'RPUSH') {
            const val = args[2];
            queue.push(val);
            socket.write(`:${queue.length}\r\n`);
          } else if (cmd === 'RPOP') {
            const val = queue.pop();
            if (val === undefined) {
              socket.write('$-1\r\n');
            } else {
              socket.write(`$${Buffer.byteLength(val)}\r\n${val}\r\n`);
            }
          } else if (cmd === 'LLEN') {
            socket.write(`:${queue.length}\r\n`);
          } else {
            socket.write('+OK\r\n');
          }
        }
      });
    });
    s.listen(port, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });
}

before(async () => {
  redisServer = await createRespServer(REDIS_PORT);
  await rm('server/data_test_redis', { recursive: true, force: true });

  apiProc = spawn(process.execPath, ['server/index.mjs'], {
    env: {
      ...process.env,
      CODEARENA_DATA_DIR: 'server/data_test_redis',
      CODEARENA_PORT: API_PORT,
      CODEARENA_JWT_SECRET: 'test-secret-super-strong-jwt-key-32',
      CODEARENA_WORKER_SECRET: WORKER_SECRET,
      CODEARENA_EXTERNAL_WORKER: '1',
      CODEARENA_REDIS_URL: REDIS_URL,
      CODEARENA_REDIS_QUEUE_KEY: QUEUE_KEY,
      CODEARENA_DOCKER: '0'
    }
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server start timeout')), 10000);
    apiProc.stdout.on('data', d => {
      if (String(d).includes('CodeArena API listening')) {
        clearTimeout(t);
        resolve();
      }
    });
    apiProc.stderr.on('data', d => process.stderr.write(d));
  });
});

after(() => {
  apiProc?.kill();
  redisServer?.close();
});

test('Redis queue basic push, pop and atomic operations', async () => {
  const p = await redisPush(REDIS_URL, QUEUE_KEY, 'sub_test_001');
  assert.ok(p > 0);
  const popped = await redisPop(REDIS_URL, QUEUE_KEY);
  assert.equal(popped, 'sub_test_001');
  const empty = await redisPop(REDIS_URL, QUEUE_KEY);
  assert.equal(empty, null);
});

test('concurrent workers cannot claim the same submission (atomic claim test)', async () => {
  // Login as student and submit
  const loginRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usn: '1CU23CS001', password: 'student123' })
  });
  const { token } = await loginRes.json();

  const subRes = await fetch(`http://127.0.0.1:${API_PORT}/api/codearena/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      problemId: 'prob_101',
      language: 'python',
      sourceCode: 'print(42)'
    })
  });
  const subData = await subRes.json();
  const subId = subData.submissionId;
  assert.ok(subId);

  // Two workers concurrently attempt to claim the exact same submission
  const [claim1, claim2] = await Promise.all([
    fetch(`http://127.0.0.1:${API_PORT}/api/internal/worker/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': WORKER_SECRET },
      body: JSON.stringify({ id: subId })
    }).then(r => r.json()),
    fetch(`http://127.0.0.1:${API_PORT}/api/internal/worker/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': WORKER_SECRET },
      body: JSON.stringify({ id: subId })
    }).then(r => r.json())
  ]);

  const claimedJobs = [claim1.job, claim2.job].filter(Boolean);
  assert.equal(claimedJobs.length, 1, 'Exactly one worker must win the claim; zero double-claims');
  assert.equal(claimedJobs[0].id, subId);

  // Complete the winning worker's job
  const compRes = await fetch(`http://127.0.0.1:${API_PORT}/api/internal/worker/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': WORKER_SECRET },
    body: JSON.stringify({
      id: subId,
      verdict: 'ACCEPTED',
      passed: 2,
      total: 2,
      marks: 10,
      runtimeMs: 45,
      memoryMb: 32
    })
  });
  assert.equal(compRes.status, 200);
});

test('high-concurrency submission burst load test on judge worker queue', async () => {
  const loginRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usn: '1CU23CS001', password: 'student123' })
  });
  const { token } = await loginRes.json();

  const BURST_SIZE = 30;
  const startTime = Date.now();

  // 1. Submit burst of submissions concurrently
  const submissionPromises = [];
  for (let i = 0; i < BURST_SIZE; i++) {
    submissionPromises.push(
      fetch(`http://127.0.0.1:${API_PORT}/api/codearena/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          problemId: 'prob_101',
          language: 'python',
          sourceCode: `print(${i})`
        })
      }).then(r => r.json())
    );
  }
  const submissions = await Promise.all(submissionPromises);
  const subIds = submissions.map(s => s.submissionId).filter(Boolean);
  assert.equal(subIds.length, BURST_SIZE, 'All burst submissions must be queued successfully');

  // 2. Simulate 4 concurrent judge workers draining the queue
  let processedCount = 0;
  const simulateWorker = async workerId => {
    while (true) {
      const id = await redisPop(REDIS_URL, QUEUE_KEY);
      if (!id) break;
      const claimRes = await fetch(`http://127.0.0.1:${API_PORT}/api/internal/worker/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': WORKER_SECRET },
        body: JSON.stringify({ id })
      });
      const claim = await claimRes.json();
      if (!claim.job) continue;

      // Complete job
      await fetch(`http://127.0.0.1:${API_PORT}/api/internal/worker/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': WORKER_SECRET },
        body: JSON.stringify({
          id: claim.job.id,
          verdict: 'ACCEPTED',
          passed: 2,
          total: 2,
          marks: 10,
          runtimeMs: 15,
          memoryMb: 24
        })
      });
      processedCount++;
    }
  };

  await Promise.all([
    simulateWorker(1),
    simulateWorker(2),
    simulateWorker(3),
    simulateWorker(4)
  ]);

  const durationMs = Date.now() - startTime;
  assert.equal(processedCount, BURST_SIZE, `All ${BURST_SIZE} burst jobs must be successfully claimed and completed`);
  const remainingInQueue = queue.length;
  assert.equal(remainingInQueue, 0, 'Redis queue must be completely drained');
  console.log(`\n  ⚡ Load Test Stats: ${BURST_SIZE} jobs processed in ${durationMs}ms (~${Math.round((BURST_SIZE / (durationMs / 1000)) * 10) / 10} submissions/sec across 4 workers)`);
});
