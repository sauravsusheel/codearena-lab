import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:8787';

test('Judge0 Execution Gateway: Validation and Queueing', async (t) => {
  await t.test('rejects missing or empty source code', async () => {
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_id: 71 })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /source_code.*required/);
  });

  await t.test('rejects unsupported language IDs', async () => {
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code: 'print(1)', language_id: 9999 })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Unsupported language_id/);
  });

  await t.test('rejects payload exceeding 64KB size limit', async () => {
    const hugeCode = 'a = 1\n'.repeat(12000); // > 64KB
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code: hugeCode, language_id: 71 })
    });
    assert.equal(res.status, 413);
    const body = await res.json();
    assert.match(body.error, /exceeds the 64KB maximum limit/);
  });

  await t.test('accepts valid Python 3.12 code and returns polling token', async () => {
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: 'name = input()\nprint(f"Hello, {name}!")',
        language_id: 71,
        stdin: 'Chanakya'
      })
    });
    assert.equal(res.status, 202);
    const body = await res.json();
    assert.ok(body.token);
    assert.equal(body.status, 'QUEUED');

    // Poll until completed
    let completed = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 100));
      const pollRes = await fetch(`${BASE_URL}/api/execute/${body.token}`);
      assert.equal(pollRes.status, 200);
      const pollData = await pollRes.json();
      if (pollData.statusId === 3) {
        assert.match(pollData.stdout, /Chanakya/);
        completed = true;
        break;
      }
    }
    assert.ok(completed, 'Job should complete within polling window');
  });

  await t.test('accepts SQLite (ID 82) and Node.js (ID 63)', async () => {
    for (const langId of [82, 63]) {
      const res = await fetch(`${BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: 'SELECT 1;',
          language_id: langId
        })
      });
      assert.equal(res.status, 202);
      const body = await res.json();
      assert.ok(body.token);
    }
  });

  await t.test('handles invalid token format gracefully', async () => {
    const res = await fetch(`${BASE_URL}/api/execute/not-a-valid-uuid`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Invalid submission token format/);
  });
});
