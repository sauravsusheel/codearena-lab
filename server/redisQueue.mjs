import net from 'node:net';
import tls from 'node:tls';
import { URL } from 'node:url';

function parseUrl(value) {
  const u = new URL(value || 'redis://127.0.0.1:6379/0');
  return { protocol: u.protocol, host: u.hostname, port: Number(u.port || 6379), password: u.password || null, db: Number((u.pathname || '/0').slice(1) || 0) };
}
function encode(parts) {
  return `*${parts.length}\r\n${parts.map(x => `$${Buffer.byteLength(String(x))}\r\n${String(x)}\r\n`).join('')}`;
}
class RespReader {
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.waiting = null;
    socket.on('data', chunk => {
      this.buf = Buffer.concat([this.buf, chunk]);
      if (this.waiting) {
        const cb = this.waiting;
        this.waiting = null;
        cb();
      }
    });
  }

  async need(fn) {
    while (true) {
      const res = fn();
      if (res !== undefined) return res;
      await new Promise(resolve => { this.waiting = resolve; });
    }
  }

  async readLine() {
    return this.need(() => {
      const idx = this.buf.indexOf('\r\n');
      if (idx < 0) return undefined;
      const line = this.buf.subarray(0, idx).toString('utf8');
      this.buf = this.buf.subarray(idx + 2);
      return line;
    });
  }

  async readResponse() {
    const head = await this.readLine();
    if (head.startsWith('+')) return head.slice(1);
    if (head.startsWith('-')) throw new Error(head.slice(1));
    if (head.startsWith(':')) return Number(head.slice(1));
    if (head.startsWith('$')) {
      const n = Number(head.slice(1));
      if (n === -1) return null;
      return this.need(() => {
        if (this.buf.length < n + 2) return undefined;
        const val = this.buf.subarray(0, n).toString('utf8');
        this.buf = this.buf.subarray(n + 2);
        return val;
      });
    }
    if (head.startsWith('*')) {
      const count = Number(head.slice(1));
      if (count === -1) return null;
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(await this.readResponse());
      }
      return arr;
    }
    throw new Error(`Unsupported Redis response: ${head}`);
  }
}

export async function redisCommand(url, parts) {
  const cfg = parseUrl(url);
  const socket = cfg.protocol === 'rediss:' ? tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }) : net.createConnection({ host: cfg.host, port: cfg.port });
  const timeoutMs = Number(process.env.CODEARENA_REDIS_TIMEOUT_MS || 2500);
  socket.setTimeout(timeoutMs, () => socket.destroy(new Error(`Redis command timed out after ${timeoutMs}ms`)));
  await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('error', reject); });
  const reader = new RespReader(socket);
  try {
    if (cfg.password) { socket.write(encode(['AUTH', cfg.password])); await reader.readResponse(); }
    if (cfg.db) { socket.write(encode(['SELECT', cfg.db])); await reader.readResponse(); }
    socket.write(encode(parts));
    return await reader.readResponse();
  } finally { socket.end(); }
}
export const redisPush = (url, key, value) => redisCommand(url, ['LPUSH', key, value]);
export const redisPop = (url, key) => redisCommand(url, ['RPOP', key]);

export const DEFAULT_PRIORITY_QUEUES = [
  'codearena:submissions:priority',
  'codearena:submissions:standard',
  'codearena:submissions:batch',
  'codearena:submissions'
];

export function parseRedisUrls(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  const raw = String(val || process.env.CODEARENA_REDIS_URLS || process.env.CODEARENA_REDIS_URL || 'redis://127.0.0.1:6379/0');
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export async function redisMultiPush(urls, key, value) {
  const list = parseRedisUrls(urls);
  let lastErr = null;
  for (const u of list) {
    try {
      return await redisPush(u, key, value);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('No available Redis instances for redisMultiPush');
}

export async function redisMultiPop(urls, queueKeys = DEFAULT_PRIORITY_QUEUES) {
  const list = parseRedisUrls(urls);
  const keys = Array.isArray(queueKeys) ? queueKeys : [queueKeys];
  for (const u of list) {
    try {
      for (const k of keys) {
        const item = await redisPop(u, k);
        if (item) {
          return { id: item, queue: k, redisUrl: u };
        }
      }
    } catch {
      // Instance down or unreachable, continue to next instance in pool
    }
  }
  return null;
}

export async function registerWorker(urls, workerInfo, ttlSec = 15) {
  const list = parseRedisUrls(urls);
  const payload = JSON.stringify({
    ...workerInfo,
    registeredAt: workerInfo.registeredAt || new Date().toISOString(),
    lastHeartbeat: new Date().toISOString()
  });
  const key = `codearena:workers:${workerInfo.id}`;
  for (const u of list) {
    try {
      await redisCommand(u, ['SETEX', key, String(ttlSec), payload]);
      await redisCommand(u, ['SADD', 'codearena:workers:active', workerInfo.id]);
    } catch {}
  }
}

export async function heartbeatWorker(urls, workerId, stats = {}, ttlSec = 15) {
  const list = parseRedisUrls(urls);
  const key = `codearena:workers:${workerId}`;
  for (const u of list) {
    try {
      const existing = await redisCommand(u, ['GET', key]);
      const current = existing ? JSON.parse(existing) : { id: workerId };
      const updated = JSON.stringify({
        ...current,
        ...stats,
        lastHeartbeat: new Date().toISOString()
      });
      await redisCommand(u, ['SETEX', key, String(ttlSec), updated]);
      await redisCommand(u, ['SADD', 'codearena:workers:active', workerId]);
    } catch {}
  }
}

export async function unregisterWorker(urls, workerId) {
  const list = parseRedisUrls(urls);
  const key = `codearena:workers:${workerId}`;
  for (const u of list) {
    try {
      await redisCommand(u, ['DEL', key]);
      await redisCommand(u, ['SREM', 'codearena:workers:active', workerId]);
    } catch {}
  }
}

export async function getActiveWorkers(urls) {
  const list = parseRedisUrls(urls);
  for (const u of list) {
    try {
      const members = await redisCommand(u, ['SMEMBERS', 'codearena:workers:active']);
      if (!Array.isArray(members)) continue;
      const workers = [];
      for (const id of members) {
        const info = await redisCommand(u, ['GET', `codearena:workers:${id}`]);
        if (info) {
          try { workers.push(JSON.parse(info)); } catch {}
        } else {
          // Worker TTL expired, clean up from set
          void redisCommand(u, ['SREM', 'codearena:workers:active', id]).catch(() => {});
        }
      }
      return workers;
    } catch {}
  }
  return [];
}

