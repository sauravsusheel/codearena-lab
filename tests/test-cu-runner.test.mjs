import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';

function runRunner(args = []) {
  return new Promise((resolve, reject) => {
    const root = process.cwd();
    const child = spawn(process.execPath, [path.join(root, 'cu_test_runner'), ...args], {
      cwd: root,
      env: { ...process.env, CODEARENA_DOCKER: '1' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
    child.on('error', reject);
  });
}

test('cu_test_runner evaluates PHP 8.3 on prob_101 with all test cases accepted', async () => {
  const { code, stdout } = await runRunner(['--problem=prob_101', '--lang=php', '--json']);
  assert.equal(code, 0);

  const jsonStart = stdout.indexOf('{');
  assert.ok(jsonStart >= 0, 'Must output JSON');
  const res = JSON.parse(stdout.slice(jsonStart));

  assert.equal(res.problemId, 'prob_101');
  assert.equal(res.language, 'php');
  assert.equal(res.allPassed, true);
  assert.equal(res.passedCases, 3);
  assert.equal(res.totalCases, 3);
  assert.equal(res.marksAwarded, 10);

  for (const tc of res.results) {
    assert.equal(tc.verdict, 'ACCEPTED');
    assert.equal(tc.passed, true);
    assert.notEqual(tc.executionTimeMs, undefined);
    assert.ok(tc.executionTimeMs >= 0);
    assert.notEqual(tc.status, undefined);
  }
});

test('cu_test_runner evaluates Python 3.12 on prob_101 with all test cases accepted', async () => {
  const { code, stdout } = await runRunner(['--problem=prob_101', '--lang=python', '--json']);
  assert.equal(code, 0);

  const jsonStart = stdout.indexOf('{');
  assert.ok(jsonStart >= 0, 'Must output JSON');
  const res = JSON.parse(stdout.slice(jsonStart));

  assert.equal(res.problemId, 'prob_101');
  assert.equal(res.language, 'python');
  assert.equal(res.allPassed, true);
  assert.equal(res.passedCases, 3);
  assert.equal(res.totalCases, 3);
  assert.equal(res.marksAwarded, 10);

  for (const tc of res.results) {
    assert.equal(tc.verdict, 'ACCEPTED');
    assert.equal(tc.passed, true);
    assert.notEqual(tc.executionTimeMs, undefined);
    assert.ok(tc.executionTimeMs >= 0);
  }
});

test('cu_test_runner terminal output prints clean format without undefined values', async () => {
  const { code, stdout } = await runRunner(['--problem=prob_101', '--lang=php']);
  assert.equal(code, 0);

  assert.match(stdout, /Case #1 \[Sample Case\] -> ACCEPTED \(\d+ms\)/);
  assert.match(stdout, /Case #2 \[Sample Case\] -> ACCEPTED \(\d+ms\)/);
  assert.match(stdout, /Case #3 \[Hidden Evaluation\] -> ACCEPTED \(\d+ms\)/);
  assert.match(stdout, /\[VERDICT\]: 3\/3 Test Cases Passed\. Marks Awarded: 10 \/ 10/);

  // Guarantee no undefined strings in stdout
  assert.equal(stdout.includes('undefined'), false);
});

test('cu_test_runner gracefully handles runtime crash with stderr and 0 marks', async () => {
  const badPhpCode = '<?php throw new Exception("Custom runtime crash");';
  const { code, stdout } = await runRunner(['--problem=prob_101', '--lang=php', `--code=${badPhpCode}`]);
  assert.equal(code, 1);

  assert.match(stdout, /Case #1 \[Sample Case\] -> RUNTIME_ERROR \(\d+ms\)/);
  assert.match(stdout, /\[VERDICT\]: 0\/3 Test Cases Passed\. Marks Awarded: 0 \/ 10/);
  assert.equal(stdout.includes('undefined'), false);
});
