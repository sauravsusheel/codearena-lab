import { WebSocketServer, WebSocket } from 'ws';

const facultyClients = new Set();
const stationClients = new Map(); // stationId -> Set of ws sockets

let dbInstance = null;
let verifyTokenFn = null;
let updateHeartbeatFn = null;
let ackCommandFn = null;

export function initTelemetryWebSocket(server, options = {}) {
  dbInstance = options.db;
  verifyTokenFn = options.verifyToken;
  updateHeartbeatFn = options.updateHeartbeat;
  ackCommandFn = options.ackCommand;

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const u = new URL(request.url || '/', 'http://127.0.0.1');
    const pathname = u.pathname;
    const query = Object.fromEntries(u.searchParams.entries());
    if (pathname === '/ws/telemetry' || pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, query);
      });
    }
  });

  wss.on('connection', (ws, request, query) => {
    const role = (query.role || '').toLowerCase();
    const token = query.token || query.access_token || '';
    const stationId = query.station_id || query.stationId || '';

    if (role === 'station' || (!role && stationId)) {
      // Station workstation agent connection
      if (!stationId) {
        ws.close(1008, 'Missing station_id');
        return;
      }

      // Authenticate station agent token if required
      if (dbInstance && process.env.CODEARENA_ALLOW_ANONYMOUS_HEARTBEAT !== '1') {
        const row = dbInstance.prepare('SELECT agent_token FROM stations WHERE id=?').get(stationId);
        if (!row || (row.agent_token && row.agent_token !== token)) {
          ws.close(1008, 'Unauthorized station credentials');
          return;
        }
      }

      if (!stationClients.has(stationId)) {
        stationClients.set(stationId, new Set());
      }
      stationClients.get(stationId).add(ws);

      ws.send(JSON.stringify({
        type: 'CONNECTED',
        stationId,
        message: 'Real-time workstation telemetry channel established'
      }));

      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'HEARTBEAT') {
            const payload = msg.payload || msg;
            let updatedStation = null;
            if (updateHeartbeatFn) {
              updatedStation = await updateHeartbeatFn(stationId, payload);
            }
            ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK', timestamp: new Date().toISOString() }));
            if (updatedStation) {
              broadcastStationHeartbeat(updatedStation);
            }
          } else if (msg.type === 'COMMAND_ACK') {
            if (ackCommandFn) {
              await ackCommandFn(stationId, msg.commandId, msg.status, msg.result);
            }
            broadcastTelemetryEvent('COMMAND_ACK', { stationId, commandId: msg.commandId, status: msg.status });
          }
        } catch (e) {
          ws.send(JSON.stringify({ type: 'ERROR', message: e.message }));
        }
      });

      ws.on('close', () => {
        const set = stationClients.get(stationId);
        if (set) {
          set.delete(ws);
          if (set.size === 0) stationClients.delete(stationId);
        }
      });

    } else {
      // Faculty monitoring dashboard client
      let user = null;
      if (verifyTokenFn && token) {
        user = verifyTokenFn(token);
      } else if (process.env.NODE_ENV !== 'production' || process.env.CODEARENA_ALLOW_HEADER_AUTH === '1') {
        user = { role: 'FACULTY', name: 'Authorized Monitor' };
      }

      if (!user) {
        ws.close(1008, 'Unauthorized faculty monitoring token');
        return;
      }

      facultyClients.add(ws);

      // Send immediate fleet snapshot
      let initialStations = [];
      if (options.getAllStations) {
        try { initialStations = options.getAllStations(); } catch {}
      } else if (dbInstance) {
        try {
          initialStations = dbInstance.prepare('SELECT id,station_number,ip_address,row_name,os,cpu_cores,ram_gb,gpu_model,sandbox_runtime,status,cpu_usage_pct,ram_usage_pct,student_usn,student_name,subject_code,language,current_problem_title,session_minutes,active_minutes,idle_minutes,total_submissions,accepted_submissions,last_heartbeat,incident_notes,hardware_json FROM stations ORDER BY station_number').all();
        } catch {}
      }

      ws.send(JSON.stringify({
        type: 'FLEET_SNAPSHOT',
        stations: initialStations,
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {}
      });

      ws.on('close', () => {
        facultyClients.delete(ws);
      });
    }
  });

  return wss;
}

export function broadcastStationHeartbeat(station) {
  const payload = JSON.stringify({
    type: 'STATION_HEARTBEAT',
    station,
    timestamp: new Date().toISOString()
  });
  for (const client of facultyClients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(payload); } catch {}
    }
  }
}

export function broadcastTelemetryEvent(type, payload = {}) {
  const msg = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  for (const client of facultyClients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(msg); } catch {}
    }
  }
}

export function sendStationCommand(stationId, command) {
  const sockets = stationClients.get(stationId);
  if (!sockets || sockets.size === 0) return false;
  const msg = JSON.stringify({
    type: 'COMMAND',
    ...command
  });
  let sent = false;
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(msg);
        sent = true;
      } catch {}
    }
  }
  return sent;
}

export function getConnectedFacultyCount() {
  return facultyClients.size;
}

export function getConnectedStationCount() {
  return stationClients.size;
}
