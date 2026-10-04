import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function startsAndFails(env) {
  const proc = spawn(process.execPath,['server/index.mjs'],{env:{...process.env,...env}});
  let output='';
  proc.stdout.on('data',d=>output+=String(d));
  proc.stderr.on('data',d=>output+=String(d));
  const code=await new Promise(resolve=>{proc.on('close',resolve);setTimeout(()=>proc.kill('SIGTERM'),1500);});
  return {code,output};
}

test('production rejects missing PostgreSQL configuration', async()=>{
  const r=await startsAndFails({CODEARENA_PORT:'8878',CODEARENA_PRODUCTION:'1',CODEARENA_JWT_SECRET:'production-test-secret-32-characters-long',CODEARENA_WORKER_SECRET:'worker-secret-strong-123456789'});
  assert.notEqual(r.code,0);
  assert.match(r.output,/Production requires DATABASE_URL for PostgreSQL/);
});

test('production rejects external-worker mode without Redis configuration', async()=>{
  const r=await startsAndFails({CODEARENA_PORT:'8879',CODEARENA_PRODUCTION:'1',CODEARENA_EXTERNAL_WORKER:'1',DATABASE_URL:'postgresql://invalid:invalid@127.0.0.1:1/codearena',CODEARENA_JWT_SECRET:'production-test-secret-32-characters-long',CODEARENA_WORKER_SECRET:'worker-secret-strong-123456789'});
  // DATABASE_URL is present, so startup reaches PostgreSQL and fails rather than silently switching to SQLite.
  assert.notEqual(r.code,0);
  assert.doesNotMatch(r.output,/SQLite production/);
});
