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
