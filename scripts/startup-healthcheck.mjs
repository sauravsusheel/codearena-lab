import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const DEFAULT_BACKEND_PORTS = [8787, 8788, 8789, 8790, 8791, 8792, 8793, 8794, 8795, 8800];
export const DEFAULT_FRONTEND_PORTS = [5173, 5174, 5175, 5176, 5177, 5178, 4173, 3000];

export function buildStartupSummary({
  backendPort,
  frontendPort,
  backendHost = '127.0.0.1',
  frontendHost = 'localhost',
  dockerEnabled = false,
  dockerAvailable = false,
}) {
  const apiUrl = `http://${backendHost}:${backendPort}`;
  const frontendUrl = `http://${frontendHost}:${frontendPort}`;
  const dockerState = dockerEnabled ? (dockerAvailable ? 'ready' : 'missing') : 'not required';
  const dockerLabel = dockerState === 'ready' ? 'ready' : dockerState === 'not required' ? 'not required' : 'missing';

  return {
    apiUrl,
    frontendUrl,
    dockerState,
    message: [
      'CodeArena is ready.',
      `API: ${apiUrl}`,
      `Frontend: ${frontendUrl}`,
      `Docker: ${dockerLabel}`,
    ].join('\n'),
  };
}

export async function waitForHttp(url, { timeoutMs = 20000, intervalMs = 250 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok || response.status < 500) return response;
    } catch {
      // wait and retry until the service is ready
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

export async function detectBackendPort(candidatePorts = DEFAULT_BACKEND_PORTS, host = '127.0.0.1') {
  for (const port of candidatePorts) {
    try {
      const response = await waitForHttp(`http://${host}:${port}/api/health`, { timeoutMs: 2000, intervalMs: 100 });
      if (response.ok) return { port, host, ready: true };
    } catch {
      // continue scanning candidate ports
    }
  }
  return { port: candidatePorts[0], host, ready: false };
}

export async function detectFrontendPort(candidatePorts = DEFAULT_FRONTEND_PORTS, host = 'localhost') {
  for (const port of candidatePorts) {
    try {
      const response = await waitForHttp(`http://${host}:${port}`, { timeoutMs: 2000, intervalMs: 100 });
      if (response.ok) return { port, host, ready: true };
    } catch {
      // continue scanning candidate ports
    }
  }
  return { port: candidatePorts[0], host, ready: false };
}

export function detectDockerStatus(enabled = process.env.CODEARENA_DOCKER === '1') {
  if (!enabled) {
    return { dockerEnabled: false, dockerAvailable: false };
  }

  const result = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  return {
    dockerEnabled: true,
    dockerAvailable: result.status === 0 && Boolean((result.stdout || '').trim()),
  };
}

export async function collectStartupState(options = {}) {
  const explicitBackendPort = Number(process.env.CODEARENA_PORT || process.env.BACKEND_PORT || '');
  const explicitFrontendPort = Number(process.env.VITE_PORT || process.env.FRONTEND_PORT || '');
  const backendPorts = options.backendPorts || (Number.isFinite(explicitBackendPort) && explicitBackendPort > 0 ? [explicitBackendPort] : DEFAULT_BACKEND_PORTS);
  const frontendPorts = options.frontendPorts || (Number.isFinite(explicitFrontendPort) && explicitFrontendPort > 0 ? [explicitFrontendPort] : DEFAULT_FRONTEND_PORTS);
  const backendHost = options.backendHost || '127.0.0.1';
  const frontendHost = options.frontendHost || 'localhost';
  const docker = detectDockerStatus(options.dockerEnabled ?? (process.env.CODEARENA_DOCKER === '1'));

  const backend = await detectBackendPort(backendPorts, backendHost);
  const frontend = await detectFrontendPort(frontendPorts, frontendHost);

  return {
    backendPort: backend.port,
    frontendPort: frontend.port,
    backendHost,
    frontendHost,
    ...docker,
  };
}

async function main() {
  const state = await collectStartupState();
  const summary = buildStartupSummary(state);
  console.log(summary.message);

  if (state.dockerEnabled && !state.dockerAvailable) {
    console.warn('Docker is enabled but unavailable. The backend will still start in fallback mode unless CODEARENA_DOCKER=1 is corrected.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Startup health check failed: ${message}`);
    process.exitCode = 1;
  });
}
