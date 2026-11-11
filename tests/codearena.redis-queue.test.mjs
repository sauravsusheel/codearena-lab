import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { 
  redisCommand, 
  redisMultiPush, 
  redisMultiPop, 
  registerWorker, 
  heartbeatWorker, 
  unregisterWorker, 
  getActiveWorkers,
  DEFAULT_PRIORITY_QUEUES 
} from '../server/redisQueue.mjs';

function createMockRedisServer() {
  const store = new Map();
  const sets = new Map();
  const lists = new Map();

  const server = net.createServer(socket => {
    let buf = '';
    socket.on('data', chunk => {
      buf += chunk.toString();
      while (buf.length > 0) {
        if (!buf.startsWith('*')) break;
        const lines = buf.split('\r\n');
        const numArgs = Number(lines[0].slice(1));
        if (lines.length < 1 + numArgs * 2 + 1) break; // Not complete yet

        const args = [];
        for (let i = 0; i < numArgs; i++) {
          args.push(lines[2 + i * 2]);
        }
        
        // Remove processed command from buf
        let consumed = 0;
        for (let i = 0; i < 1 + numArgs * 2; i++) {
          consumed += lines[i].length + 2;
        }
        buf = buf.slice(consumed);

        const cmd = args[0].toUpperCase();
        if (cmd === 'PING') {
          socket.write('+PONG\r\n');
        } else if (cmd === 'LPUSH') {
          const key = args[1], val = args[2];
          if (!lists.has(key)) lists.set(key, []);
          lists.get(key).unshift(val);
          socket.write(`:${lists.get(key).length}\r\n`);
        } else if (cmd === 'RPOP') {
          const key = args[1];
          const list = lists.get(key);
          if (list && list.length > 0) {
            const val = list.pop();
            socket.write(`$${Buffer.byteLength(val)}\r\n${val}\r\n`);
          } else {
            socket.write('$-1\r\n');
          }
        } else if (cmd === 'LLEN') {
          const key = args[1];
          const len = (lists.get(key) || []).length;
          socket.write(`:${len}\r\n`);
        } else if (cmd === 'SETEX' || cmd === 'SET') {
          const key = args[1], val = cmd === 'SETEX' ? args[3] : args[2];
          store.set(key, val);
          socket.write('+OK\r\n');
        } else if (cmd === 'GET') {
          const key = args[1];
          if (store.has(key)) {
            const val = store.get(key);
            socket.write(`$${Buffer.byteLength(val)}\r\n${val}\r\n`);
          } else {
            socket.write('$-1\r\n');
          }
        } else if (cmd === 'DEL') {
          const key = args[1];
          const count = store.delete(key) ? 1 : 0;
          socket.write(`:${count}\r\n`);
        } else if (cmd === 'SADD') {
          const key = args[1], member = args[2];
          if (!sets.has(key)) sets.set(key, new Set());
          sets.get(key).add(member);
          socket.write(':1\r\n');
        } else if (cmd === 'SREM') {
          const key = args[1], member = args[2];
          if (sets.has(key)) sets.get(key).delete(member);
          socket.write(':1\r\n');
        } else if (cmd === 'SMEMBERS') {
          const key = args[1];
          const members = Array.from(sets.get(key) || []);
          let resp = `*${members.length}\r\n`;
          for (const m of members) {
            resp += `$${Buffer.byteLength(m)}\r\n${m}\r\n`;
          }
          socket.write(resp);
        } else {
          socket.write('+OK\r\n');
        }
      }
    });
  });

  return server;
}

test('Multi-queue priority popping enforces exam priority over standard queue', async () => {
  const mockServer = createMockRedisServer();
  await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
  const port = mockServer.address().port;
  const redisUrl = `redis://127.0.0.1:${port}/0`;

  // Push standard job first, then priority job
  await redisMultiPush(redisUrl, 'codearena:submissions:standard', 'sub-standard-01');
  await redisMultiPush(redisUrl, 'codearena:submissions:priority', 'sub-priority-99');

  // MultiPop should yield the priority item first despite being pushed later
  const firstPop = await redisMultiPop(redisUrl, DEFAULT_PRIORITY_QUEUES);
  assert.ok(firstPop);
  assert.equal(firstPop.id, 'sub-priority-99');
  assert.equal(firstPop.queue, 'codearena:submissions:priority');

  // Next pop should yield the standard item
  const secondPop = await redisMultiPop(redisUrl, DEFAULT_PRIORITY_QUEUES);
  assert.ok(secondPop);
  assert.equal(secondPop.id, 'sub-standard-01');
  assert.equal(secondPop.queue, 'codearena:submissions:standard');

  // Queue should now be empty
  const thirdPop = await redisMultiPop(redisUrl, DEFAULT_PRIORITY_QUEUES);
  assert.equal(thirdPop, null);

  await new Promise(resolve => mockServer.close(resolve));
});

test('Worker registry, heartbeat, and discovery operations', async () => {
  const mockServer = createMockRedisServer();
  await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
  const port = mockServer.address().port;
  const redisUrl = `redis://127.0.0.1:${port}/0`;

  const workerInfo = {
    id: 'worker-node-alpha',
    hostname: 'worker-host-1',
    runtime: 'runsc',
    gVisorEnforced: true,
    status: 'IDLE'
  };

  // 1. Register worker
  await registerWorker(redisUrl, workerInfo, 30);

  let active = await getActiveWorkers(redisUrl);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, 'worker-node-alpha');
  assert.equal(active[0].runtime, 'runsc');
  assert.equal(active[0].gVisorEnforced, true);

  // 2. Heartbeat worker with updated stats
  await heartbeatWorker(redisUrl, 'worker-node-alpha', { status: 'BUSY', currentJobId: 'sub-404' }, 30);

  active = await getActiveWorkers(redisUrl);
  assert.equal(active.length, 1);
  assert.equal(active[0].status, 'BUSY');
  assert.equal(active[0].currentJobId, 'sub-404');

  // 3. Unregister worker on shutdown
  await unregisterWorker(redisUrl, 'worker-node-alpha');
  active = await getActiveWorkers(redisUrl);
  assert.equal(active.length, 0);

  await new Promise(resolve => mockServer.close(resolve));
});
