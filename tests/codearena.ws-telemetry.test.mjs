import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { WebSocket } from 'ws';
import { initTelemetryWebSocket, broadcastStationHeartbeat, broadcastTelemetryEvent, sendStationCommand } from '../server/telemetryWs.mjs';

test('WebSocket telemetry server handles workstation heartbeats and faculty streaming', async () => {
  const mockStations = [
    { id: 'PC-01', station_number: 1, status: 'OPERATIONAL', cpu_usage_pct: 25, ram_usage_pct: 40 },
    { id: 'PC-02', station_number: 2, status: 'IDLE', cpu_usage_pct: 5, ram_usage_pct: 20 }
  ];

  let lastSavedHeartbeat = null;
  let lastAcknowledgedCommand = null;

  const server = http.createServer((req, res) => res.end('ok'));
  initTelemetryWebSocket(server, {
    verifyToken: (token) => token === 'valid-faculty-token' ? { sub: 'fac-1', role: 'FACULTY' } : null,
    getAllStations: () => mockStations,
    updateHeartbeat: async (stationId, payload) => {
      lastSavedHeartbeat = { stationId, ...payload };
      return { id: stationId, station_number: 1, ...payload };
    },
    ackCommand: async (stationId, commandId, status, result) => {
      lastAcknowledgedCommand = { stationId, commandId, status, result };
    }
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  // 1. Faculty Dashboard client connects
  const facultyWs = new WebSocket(`ws://127.0.0.1:${port}/ws/telemetry?role=faculty&token=valid-faculty-token`);
  
  const facultyMessages = [];
  facultyWs.on('message', data => {
    facultyMessages.push(JSON.parse(data.toString()));
  });

  await new Promise(resolve => facultyWs.on('open', resolve));

  // Verify faculty receives initial FLEET_SNAPSHOT
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.ok(facultyMessages.length >= 1, 'Faculty client should receive initial snapshot');
  assert.equal(facultyMessages[0].type, 'FLEET_SNAPSHOT');
  assert.equal(facultyMessages[0].stations.length, 2);

  // 2. Station Agent connects
  const stationWs = new WebSocket(`ws://127.0.0.1:${port}/ws/telemetry?role=station&station_id=PC-01&token=`);
  const stationMessages = [];
  stationWs.on('message', data => {
    stationMessages.push(JSON.parse(data.toString()));
  });

  await new Promise(resolve => stationWs.on('open', resolve));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.ok(stationMessages.length >= 1);
  assert.equal(stationMessages[0].type, 'CONNECTED');
  assert.equal(stationMessages[0].stationId, 'PC-01');

  // 3. Station sends real-time HEARTBEAT over WebSocket
  stationWs.send(JSON.stringify({
    type: 'HEARTBEAT',
    payload: {
      status: 'RUNNING_SANDBOX',
      cpuUsagePct: 77,
      ramUsagePct: 65,
      studentUsn: '1CU23CS042',
      currentProblemTitle: 'Dynamic Matrix Search'
    }
  }));

  await new Promise(resolve => setTimeout(resolve, 100));

  // Verify DB update was triggered
  assert.ok(lastSavedHeartbeat, 'updateHeartbeat callback must be invoked');
  assert.equal(lastSavedHeartbeat.stationId, 'PC-01');
  assert.equal(lastSavedHeartbeat.cpuUsagePct, 77);

  // Verify Station received HEARTBEAT_ACK
  const ack = stationMessages.find(m => m.type === 'HEARTBEAT_ACK');
  assert.ok(ack, 'Station must receive HEARTBEAT_ACK');

  // Verify Faculty Dashboard received real-time STATION_HEARTBEAT event
  const heartbeatEvent = facultyMessages.find(m => m.type === 'STATION_HEARTBEAT');
  assert.ok(heartbeatEvent, 'Faculty client must receive broadcast STATION_HEARTBEAT');
  assert.equal(heartbeatEvent.station.id, 'PC-01');
  assert.equal(heartbeatEvent.station.cpuUsagePct, 77);

  // 4. Test real-time push COMMAND to connected station
  const commandPushed = sendStationCommand('PC-01', {
    id: 'cmd-999',
    command: 'REBOOT'
  });
  assert.equal(commandPushed, true, 'Command should be pushed directly over WebSocket');

  await new Promise(resolve => setTimeout(resolve, 50));
  const cmdMsg = stationMessages.find(m => m.type === 'COMMAND');
  assert.ok(cmdMsg, 'Station must receive real-time push COMMAND');
  assert.equal(cmdMsg.command, 'REBOOT');
  assert.equal(cmdMsg.id, 'cmd-999');

  // 5. Station acknowledges command
  stationWs.send(JSON.stringify({
    type: 'COMMAND_ACK',
    commandId: 'cmd-999',
    status: 'SUCCESS',
    result: 'Reboot simulated'
  }));

  await new Promise(resolve => setTimeout(resolve, 100));
  assert.ok(lastAcknowledgedCommand, 'ackCommand callback must be invoked');
  assert.equal(lastAcknowledgedCommand.commandId, 'cmd-999');

  // Clean up
  facultyWs.close();
  stationWs.close();
  await new Promise(resolve => server.close(resolve));
});
