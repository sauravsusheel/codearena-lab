import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const base = 'http://127.0.0.1:8885';
let proc;
let superAdminToken;
let facultyToken;
let studentToken;

async function req(path, options = {}) {
  const r = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.ok, body };
}

before(async () => {
  await rm('server/data_test_station', { recursive: true, force: true });
  proc = spawn(process.execPath, ['server/index.mjs'], {
    env: {
      ...process.env,
      CODEARENA_DATA_DIR: 'server/data_test_station',
      CODEARENA_PORT: '8885',
      CODEARENA_JWT_SECRET: 'test-secret-super-strong-station-key',
      CODEARENA_WORKER_SECRET: 'worker-secret',
      CODEARENA_DOCKER: '0'
    }
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server start timeout')), 10000);
    proc.stdout.on('data', d => {
      if (String(d).includes('CodeArena API listening')) {
        clearTimeout(t);
        resolve();
      }
    });
    proc.stderr.on('data', d => process.stderr.write(d));
  });

  // Login personas
  const adminLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usn: 'ADMIN001', password: 'admin123' })
  });
  superAdminToken = adminLogin.body.token;

  const facultyLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usn: 'FAC001', password: 'faculty123' })
  });
  facultyToken = facultyLogin.body.token;

  const studentLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usn: '1CU23CS001', password: 'student123' })
  });
  studentToken = studentLogin.body.token;
});

after(() => proc?.kill());

test('non-admin cannot rotate station agent tokens', async () => {
  const studentRes = await req('/api/codearena/stations/PC-01/agent-credentials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(studentRes.status, 403, 'Student must be denied token rotation');

  const facultyRes = await req('/api/codearena/stations/PC-01/agent-credentials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert.equal(facultyRes.status, 403, 'Faculty must be denied token rotation (Super Admin only)');
});

test('super admin can rotate and retrieve physical station agent credentials', async () => {
  const res = await req('/api/codearena/stations/PC-01/agent-credentials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.stationId, 'PC-01');
  assert.ok(res.body.token, 'A cryptographic hex token must be returned');
  assert.equal(typeof res.body.token, 'string');
  assert.ok(res.body.token.length >= 32, 'Token must be sufficiently strong');
});

test('station heartbeat requires the configured station agent token', async () => {
  // First rotate to establish a known token
  const creds = await req('/api/codearena/stations/PC-02/agent-credentials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  const token = creds.body.token;

  // Unauthenticated heartbeat without token must fail
  const unauth = await req('/api/codearena/stations/PC-02/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ cpuUsagePct: 15, ramUsagePct: 35, status: 'OPERATIONAL' })
  });
  assert.equal(unauth.status, 401, 'Heartbeat without X-Station-Token must return 401');

  // Heartbeat with wrong token must fail
  const badToken = await req('/api/codearena/stations/PC-02/heartbeat', {
    method: 'POST',
    headers: { 'X-Station-Token': 'wrong-token-value' },
    body: JSON.stringify({ cpuUsagePct: 15, ramUsagePct: 35, status: 'OPERATIONAL' })
  });
  assert.equal(badToken.status, 401, 'Heartbeat with invalid token must return 401');

  // Heartbeat with valid token must succeed and update hardware metrics
  const authHeartbeat = await req('/api/codearena/stations/PC-02/heartbeat', {
    method: 'POST',
    headers: { 'X-Station-Token': token, 'X-Station-Agent': 'true' },
    body: JSON.stringify({
      cpuUsagePct: 22,
      ramUsagePct: 48,
      status: 'OPERATIONAL',
      hardware: { hostname: 'lab-pc-02', arch: 'x64', cpuCores: 16, totalMemoryGb: '32.0' }
    })
  });
  assert.equal(authHeartbeat.status, 200);
  assert.equal(authHeartbeat.body.ok, true);
  assert.ok(authHeartbeat.body.lastHeartbeat);

  // Verify telemetry persisted in station inventory
  const inventory = await req('/api/codearena/stations', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const pc02 = inventory.body.find(s => s.id === 'PC-02');
  assert.ok(pc02);
  assert.equal(pc02.cpu_usage_pct, 22);
  assert.equal(pc02.ram_usage_pct, 48);
});

test('faculty triggers remote reboot action, agent polls command and acknowledges completion', async () => {
  // Rotate and get agent token
  const creds = await req('/api/codearena/stations/PC-03/agent-credentials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  const token = creds.body.token;

  // 1. Faculty triggers remote reboot
  const rebootRes = await req('/api/codearena/stations/PC-03/reboot', {
    method: 'POST',
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert.equal(rebootRes.status, 200);
  assert.equal(rebootRes.body.ok, true);
  assert.ok(rebootRes.body.commandId);
  assert.equal(rebootRes.body.status, 'QUEUED');

  // Verify station status changed to REBOOTING
  const invRebooting = await req('/api/codearena/stations', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const pc03Rebooting = invRebooting.body.find(s => s.id === 'PC-03');
  assert.equal(pc03Rebooting.status, 'REBOOTING');

  // 2. Station agent polls queued commands
  const pollRes = await req('/api/codearena/stations/PC-03/commands', {
    headers: { 'X-Station-Token': token }
  });
  assert.equal(pollRes.status, 200);
  assert.ok(Array.isArray(pollRes.body));
  const rebootCmd = pollRes.body.find(c => c.command === 'REBOOT');
  assert.ok(rebootCmd, 'Agent must receive the QUEUED REBOOT command');
  assert.equal(rebootCmd.id, rebootRes.body.commandId);

  // 3. Station agent acknowledges reboot command completion
  const ackRes = await req(`/api/codearena/stations/PC-03/commands/${rebootCmd.id}/ack`, {
    method: 'POST',
    headers: { 'X-Station-Token': token },
    body: JSON.stringify({
      status: 'SUCCESS',
      result: 'Simulated workstation reboot executed successfully (dry run)'
    })
  });
  assert.equal(ackRes.status, 200);
  assert.equal(ackRes.body.ok, true);

  // 4. Verify station returns to OPERATIONAL and command queue is cleared
  const invRestored = await req('/api/codearena/stations', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const pc03Restored = invRestored.body.find(s => s.id === 'PC-03');
  assert.equal(pc03Restored.status, 'OPERATIONAL');

  const pollAfter = await req('/api/codearena/stations/PC-03/commands', {
    headers: { 'X-Station-Token': token }
  });
  assert.equal(pollAfter.body.length, 0, 'Completed command must no longer be queued');
});
