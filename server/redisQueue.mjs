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
function readLine(socket) {
  return new Promise((resolve, reject) => {
    let data = '';
    const onData = chunk => {
      data += chunk.toString();
      const idx = data.indexOf('\r\n');
      if (idx < 0) return;
      socket.off('data', onData);
      resolve(data.slice(0, idx));
    };
    socket.on('data', onData);
    socket.once('error', reject);
  });
}
async function readResponse(socket) {
  const head = await readLine(socket);
  if (head.startsWith('+')) return head.slice(1);
  if (head.startsWith('-')) throw new Error(head.slice(1));
  if (head.startsWith(':')) return Number(head.slice(1));
  if (head.startsWith('$')) {
    const n = Number(head.slice(1));
    if (n === -1) return null;
    let out = Buffer.alloc(0);
    while (out.length < n + 2) {
      const chunk = await new Promise((resolve, reject) => {
        const onData = c => { socket.off('data', onData); resolve(c); };
        socket.once('data', onData); socket.once('error', reject);
      });
      out = Buffer.concat([out, chunk]);
    }
    return out.subarray(0, n).toString();
  }
  throw new Error(`Unsupported Redis response: ${head}`);
}
export async function redisCommand(url, parts) {
  const cfg = parseUrl(url);
  const socket = cfg.protocol === 'rediss:' ? tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }) : net.createConnection({ host: cfg.host, port: cfg.port });
  const timeoutMs = Number(process.env.CODEARENA_REDIS_TIMEOUT_MS || 1500);
  socket.setTimeout(timeoutMs, () => socket.destroy(new Error(`Redis command timed out after ${timeoutMs}ms`)));
  await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('error', reject); });
  try {
    if (cfg.password) { socket.write(encode(['AUTH', cfg.password])); await readResponse(socket); }
    if (cfg.db) { socket.write(encode(['SELECT', cfg.db])); await readResponse(socket); }
    socket.write(encode(parts));
    return await readResponse(socket);
  } finally { socket.end(); }
}
export const redisPush = (url, key, value) => redisCommand(url, ['LPUSH', key, value]);
export const redisPop = (url, key) => redisCommand(url, ['RPOP', key]);
