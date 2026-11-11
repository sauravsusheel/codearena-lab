// CodeArena Lab Station real-time heartbeat and telemetry agent.
// Usage:
//   node scripts/station-agent.mjs PC-01 http://SERVER:8787
import os from 'node:os';
import { spawn } from 'node:child_process';
import { WebSocket } from 'ws';

const stationId = process.argv[2];
const serverUrl = process.argv[3] || 'http://localhost:8787';
const token = process.env.CODEARENA_STATION_TOKEN || '';

if (!token && process.env.CODEARENA_ALLOW_ANONYMOUS_HEARTBEAT !== '1') {
  console.error('CODEARENA_STATION_TOKEN is required; predictable station tokens are disabled');
  process.exit(1);
}
if (!stationId) {
  console.error('Usage: node scripts/station-agent.mjs PC-01 http://localhost:8787');
  process.exit(1);
}

function getTelemetryPayload() {
  const cpu = Math.max(1, Math.min(99, Math.round(os.loadavg()[0] * 100 / Math.max(1, os.cpus().length))));
  const used = Math.round((1 - os.freemem() / os.totalmem()) * 100);
  return {
    cpuUsagePct: cpu,
    ramUsagePct: used,
    status: 'OPERATIONAL',
    hardware: {
      hostname: os.hostname(),
      platform: process.platform,
      arch: process.arch,
      cpuCores: os.cpus().length,
      totalMemoryGb: (os.totalmem() / 1073741824).toFixed(1)
    }
  };
}

async function executeCommand(command) {
  let status = 'SUCCESS', result = '';
  try {
    if (command.command === 'REBOOT') {
      const platform = process.platform;
      if (process.env.CODEARENA_MOCK_REBOOT === '1' || process.env.CODEARENA_STATION_AGENT_DRY_RUN === '1') {
        result = 'Simulated workstation reboot executed successfully (dry run)';
      } else if (platform === 'win32') {
        result = await new Promise((resolve, reject) => {
          const p = spawn('shutdown', ['/r', '/t', '0', '/f'], { windowsHide: true });
          p.on('error', reject);
          p.on('close', c => resolve(`shutdown exit ${c}`));
        });
      } else {
        result = await new Promise((resolve, reject) => {
          const p = spawn('systemctl', ['reboot']);
          p.on('error', reject);
          p.on('close', c => resolve(`systemctl reboot exit ${c}`));
        });
      }
    } else if (command.command === 'RESET') {
      result = 'Station reset acknowledged by agent';
    } else {
      result = 'Unknown command';
    }
  } catch (e) {
    status = 'FAILED';
    result = e.message || String(e);
  }
  return { status, result };
}

let ws = null;
let wsConnected = false;

function buildWsUrl() {
  const httpUrl = new URL(serverUrl);
  const protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${httpUrl.host}/ws/telemetry?role=station&station_id=${encodeURIComponent(stationId)}&token=${encodeURIComponent(token)}`;
}

function connectWebSocket() {
  try {
    const wsUrl = buildWsUrl();
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      wsConnected = true;
      console.log(`[Station ${stationId}] Real-time WebSocket telemetry connected to ${wsUrl}`);
      sendWsHeartbeat();
    });

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'COMMAND') {
          console.log(`[Station ${stationId}] Received real-time push command: ${msg.command}`);
          const { status, result } = await executeCommand(msg);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'COMMAND_ACK',
              commandId: msg.id,
              status,
              result
            }));
          }
        }
      } catch (err) {
        console.error(`[Station ${stationId}] WS message handling error:`, err.message);
      }
    });

    ws.on('close', () => {
      wsConnected = false;
      setTimeout(connectWebSocket, 5000);
    });

    ws.on('error', () => {
      wsConnected = false;
      try { ws.close(); } catch {}
    });
  } catch {
    wsConnected = false;
    setTimeout(connectWebSocket, 5000);
  }
}

function sendWsHeartbeat() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const payload = getTelemetryPayload();
    ws.send(JSON.stringify({ type: 'HEARTBEAT', payload }));
    return true;
  }
  return false;
}

// HTTP Fallback routines
async function beatHttp() {
  if (wsConnected) return; // WebSocket is active, no need for HTTP polling
  const payload = getTelemetryPayload();
  try {
    const r = await fetch(`${serverUrl}/api/codearena/stations/${encodeURIComponent(stationId)}/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Station-Agent': 'true',
        'X-Station-Token': token
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) console.error(`[Station ${stationId}] HTTP heartbeat failed ${r.status}`);
  } catch (e) {
    console.error(`[Station ${stationId}] HTTP heartbeat unavailable:`, e.message);
  }
}

async function pollCommandsHttp() {
  if (wsConnected) return; // WebSocket delivers commands via push
  try {
    const r = await fetch(`${serverUrl}/api/codearena/stations/${encodeURIComponent(stationId)}/commands`, {
      headers: { 'X-Station-Token': token }
    });
    if (!r.ok) return;
    const commands = await r.json();
    for (const command of commands) {
      const { status, result } = await executeCommand(command);
      await fetch(`${serverUrl}/api/codearena/stations/${encodeURIComponent(stationId)}/commands/${encodeURIComponent(command.id)}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Station-Token': token },
        body: JSON.stringify({ status, result })
      }).catch(() => {});
    }
  } catch (e) {
    console.error(`[Station ${stationId}] HTTP command poll unavailable:`, e.message);
  }
}

// Initialize connections and intervals
connectWebSocket();
setInterval(() => {
  if (!sendWsHeartbeat()) {
    void beatHttp();
  }
}, 5000);

setInterval(pollCommandsHttp, 3000);
