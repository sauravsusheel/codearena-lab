import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const base='http://127.0.0.1:8881';
const SSO_SECRET='test-sso-secret-32-characters-long';
let proc;
function assertion(claims){
  const body=Buffer.from(JSON.stringify({...claims,exp:Date.now()+60_000})).toString('base64url');
  const sig=createHmac('sha256',SSO_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
async function req(path,options={}){
  const r=await fetch(base+path,options);
  const body=await r.json().catch(()=>({}));
  return {r,body};
}
before(async()=>{
  await rm('server/data',{recursive:true,force:true});
  proc=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,CODEARENA_PORT:'8881',CODEARENA_ALLOW_HEADER_AUTH:'1',CODEARENA_SSO_JWT_SECRET:SSO_SECRET}});
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server start timeout')),5000);proc.stdout.on('data',d=>{if(String(d).includes('CodeArena API listening')){clearTimeout(t);resolve();}});proc.stderr.on('data',d=>process.stderr.write(d));});
});
after(()=>proc?.kill());

test('student cannot evaluate a problem outside their LMS assignment',async()=>{
  const r=await req('/api/codearena/evaluate',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':'usr_std_01','X-User-Role':'STUDENT','X-User-Name':'Arjun Kumar','X-User-USN':'24MCA003'},body:JSON.stringify({problemId:'prob_102',language:'java',sourceCode:'class Solution {}'})});
  assert.equal(r.r.status,403);
});

test('UniSphere signed SSO assertion exchanges for a CodeArena token',async()=>{
  const a=assertion({iss:'unisphere',sub:'portal-security-test',name:'Portal Student',role:'STUDENT',usn:'PORTAL001'});
  const r=await req('/api/auth/portal-exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assertion:a})});
  assert.equal(r.r.status,200);
  assert.ok(r.body.token);
  assert.equal(r.body.user.role,'STUDENT');
  const me=await req('/api/auth/me',{headers:{Authorization:`Bearer ${r.body.token}`}});
  assert.equal(me.r.status,200);
  assert.equal(me.body.user.sub,'sso-portal-security-test');
});
