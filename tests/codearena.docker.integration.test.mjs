import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { dockerAvailable, runDocker } from '../server/sandbox.mjs';

test('Python code executes in the CodeArena Docker sandbox', async t => {
  if (!(await dockerAvailable())) {
    t.skip('Docker daemon is unavailable');
    return;
  }

  try {
    execFileSync('docker', ['image', 'inspect', 'python:3.12-alpine'], { stdio: 'ignore' });
  } catch {
    t.skip('python:3.12-alpine sandbox image is not present');
    return;
  }

  const root = await mkdtemp(path.join(os.tmpdir(), 'codearena-docker-test-'));
  try {
    const result = await runDocker('python', 'print(1 + 2)', '', { time: 5000, memory: 64 }, { root });
    assert.equal(result.status, 'SUCCESS', result.stderr);
    assert.equal(result.stdout.trim(), '3');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});