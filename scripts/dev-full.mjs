import { spawn } from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import { dockerAvailable } from '../server/sandbox.mjs';

const root = process.cwd();
const findAvailablePort = async (preferredPort) => {
  for (let port = preferredPort; port < preferredPort + 25; port += 1) {
    const available = await new Promise(resolve => {
      const tester = net.createServer();
      tester.once('error', () => resolve(false));
      tester.listen(port, '127.0.0.1', () => tester.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error(`No free CodeArena API port found starting at ${preferredPort}`);
};

const backendPort = await findAvailablePort(Number(process.env.CODEARENA_PORT) || 8787);
const dockerRequested = process.env.CODEARENA_DOCKER === '1';
const dockerEnabled = dockerRequested || (process.env.CODEARENA_DOCKER !== '0' && await dockerAvailable());
const serverEnv = {
  ...process.env,
  CODEARENA_PORT: String(backendPort),
  CODEARENA_DOCKER: dockerEnabled ? '1' : '0',
};
const viteEnv = {
  ...process.env,
  CODEARENA_API_PROXY_TARGET: `http://127.0.0.1:${backendPort}`,
};
console.log('Starting CodeArena backend and Vite frontend from:', root);
if (dockerEnabled) console.log('CodeArena Docker sandboxing enabled for development.');
else console.warn('Docker is unavailable; CodeArena execution will fail closed. Set CODEARENA_DOCKER=1 or start Docker Desktop.');
const server = spawn(process.execPath, [path.join(root, 'server', 'index.mjs')], {
  cwd: root,
  env: serverEnv,
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
});

const vite = spawn(process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'], {
  cwd: root,
  env: viteEnv,
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
});

const stop = () => {
  try { server.kill('SIGTERM'); } catch {}
  try { vite.kill('SIGTERM'); } catch {}
};

process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn('CodeArena backend port 8787 is already in use; reusing the running instance.');
    return;
  }
  console.error('CodeArena backend failed to start:', err);
  try { vite.kill('SIGTERM'); } catch {}
  process.exit(1);
});
server.on('exit', code => {
  if (code && code !== 0) {
    console.error(`CodeArena backend exited with ${code}`);
    try { vite.kill('SIGTERM'); } catch {}
    process.exit(code);
  }
});
vite.on('exit', code => {
  if (code && code !== 0) {
    console.error(`Vite exited with ${code}`);
    try { server.kill('SIGTERM'); } catch {}
    process.exit(code);
  }
});
