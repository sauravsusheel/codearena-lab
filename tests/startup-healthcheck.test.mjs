import test from 'node:test';
import assert from 'node:assert/strict';

import { buildStartupSummary } from '../scripts/startup-healthcheck.mjs';

test('buildStartupSummary reports final URLs and Docker state clearly', () => {
  const summary = buildStartupSummary({
    backendPort: 8789,
    frontendPort: 5176,
    backendHost: '127.0.0.1',
    frontendHost: 'localhost',
    dockerEnabled: true,
    dockerAvailable: true,
  });

  assert.equal(summary.apiUrl, 'http://127.0.0.1:8789');
  assert.equal(summary.frontendUrl, 'http://localhost:5176');
  assert.match(summary.message, /CodeArena is ready/i);
  assert.match(summary.message, /Docker: ready/i);
  assert.match(summary.message, /Frontend:/i);
});
