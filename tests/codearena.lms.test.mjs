import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const base='http://127.0.0.1:8880';
let proc;
const headers=(id,role,name,usn)=>({'Content-Type':'application/json','X-User-Id':id,'X-User-Role':role,'X-User-Name':name,'X-User-USN':usn});
async function req(path,options={}){const r=await fetch(base+path,{...options,headers:{...headers('usr_std_01','STUDENT','Arjun Kumar','24MCA003'),...(options.headers||{})}});const body=await r.json();return {r,body};}
before(async()=>{await rm('server/data_test_lms',{recursive:true,force:true});proc=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,CODEARENA_DATA_DIR:'server/data_test_lms',CODEARENA_PORT:'8880',CODEARENA_ALLOW_HEADER_AUTH:'1',CODEARENA_DOCKER:'1'}});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server start timeout')),5000);proc.stdout.on('data',d=>{if(String(d).includes('CodeArena API listening')){clearTimeout(t);resolve();}});proc.stderr.on('data',d=>process.stderr.write(d));});});
after(()=>proc?.kill());

test('LMS bootstrap exposes terms, courses and student enrollment',async()=>{const {r,body}=await req('/api/lms/bootstrap');assert.equal(r.status,200);assert.ok(body.terms.some(x=>x.code==='2026-27-ODD'));assert.ok(body.courses.some(x=>x.course_code==='PRG301'));assert.ok(body.mySections.some(x=>x.course_code==='PRG301'));});
test('faculty assignment is required for faculty section management',async()=>{const {r,body}=await req('/api/lms/sections/section_prg301_2026_27_a',{headers:headers('usr_fac_01','FACULTY','Deepak B','CUP2025/00303')});assert.equal(r.status,200);assert.equal(body.teacher,true);assert.equal(body.faculty[0].role,'FACULTY');});
test('student submission is scoped to an LMS problem assignment',async()=>{let x=await req('/api/codearena/submit',{method:'POST',headers:headers('usr_std_01','STUDENT','Arjun Kumar','24MCA003'),body:JSON.stringify({problemId:'prob_102',language:'java',sourceCode:'class Solution { public static void main(String[] a){} }'})});assert.equal(x.r.status,403);x=await req('/api/codearena/submit',{method:'POST',headers:headers('usr_std_01','STUDENT','Arjun Kumar','24MCA003'),body:JSON.stringify({problemId:'prob_101',language:'python',sourceCode:'import sys\na=sys.stdin.read().split(); print(sum(map(int,a[1:])))'})});assert.equal(x.r.status,200);assert.equal(x.body.lmsSectionId,'section_prg301_2026_27_a');});

test('faculty-created CodeArena problems persist their test cases in the database',async()=>{
  const problemId=`prob_db_${Date.now()}`;
  let x=await req('/api/codearena/problems',{method:'POST',headers:headers('usr_fac_01','FACULTY','Deepak B','CUP2025/00303'),body:JSON.stringify({id:problemId,subjectId:'subj_py',title:'DB persistence test',statement:'Return 42',starterCodes:{python:'print(42)'},testCases:[{input:'',expectedOutput:'42',isHidden:false,weight:1},{input:'',expectedOutput:'42',isHidden:true,weight:2}]})});
  assert.equal(x.r.status,200);
  const persistedId=x.body.id;
  x=await req(`/api/codearena/problems?subjectId=subj_py`,{headers:headers('usr_fac_01','FACULTY','Deepak B','CUP2025/00303')});
  const saved=x.body.find((p)=>p.id===persistedId);
  assert.ok(saved);
  assert.equal(saved.testCases.length,2);
  assert.equal(saved.testCases[1].expectedOutput,'42');
});
