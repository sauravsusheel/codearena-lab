import http from 'node:http';
import { URL } from 'node:url';
import { randomUUID, createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { redisCommand, redisPush, redisPop } from './redisQueue.mjs';
import { db, DB_PATH, DATA_DIR } from './db.mjs';
import { analyze as analyzePlagiarism } from './plagiarism.mjs';
import { runDocker, startDockerInteractive, dockerAvailable } from './sandbox.mjs';
import { handleExecuteSubmit, handleExecutePoll, startFallbackInteractiveSession, executeCodeUnified } from './judge0Execution.mjs';

const resolvePort = async (preferredPort = 8787) => {
  const net = await import('node:net');
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(preferredPort + 1));
    server.listen(preferredPort, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
};

const resolveAvailablePort = async (preferredPort) => {
  const startPort = Number(preferredPort) || 8787;
  for (let offset = 0; offset < 25; offset++) {
    const port = startPort + offset;
    const isAvailable = await new Promise((resolve) => {
      const tester = net.createServer();
      tester.once('error', () => resolve(false));
      tester.listen(port, '127.0.0.1', () => {
        tester.close(() => resolve(true));
      });
    });
    if (isAvailable) return port;
  }
  return startPort;
};

const preferredPort = Number(process.env.CODEARENA_PORT || 8787);
const PORT = await resolveAvailablePort(preferredPort);
if (PORT !== preferredPort) {
  console.warn(`CodeArena port ${preferredPort} is busy; using ${PORT} instead.`);
} else {
  console.log(`CodeArena configured port: ${PORT}`);
}
const PRODUCTION = process.env.NODE_ENV === 'production' || process.env.CODEARENA_PRODUCTION === '1';
const HOST = process.env.CODEARENA_HOST || (PRODUCTION ? '0.0.0.0' : '127.0.0.1');
const ROOT = process.cwd();
const RUN_ROOT = path.join(DATA_DIR, 'runs');
const REDIS_URL = process.env.CODEARENA_REDIS_URL || 'redis://127.0.0.1:6379/0';
const REDIS_QUEUE_KEY = process.env.CODEARENA_REDIS_QUEUE_KEY || 'codearena:submissions';
const SANDBOX_RUNTIME = process.env.CODEARENA_SANDBOX_RUNTIME || '';
const REQUIRE_REDIS = process.env.CODEARENA_EXTERNAL_WORKER === '1' || process.env.CODEARENA_REDIS_REQUIRED === '1';
const SSO_SECRET = process.env.CODEARENA_SSO_JWT_SECRET || '';
const JWT_SECRET = process.env.CODEARENA_JWT_SECRET || 'change-me-in-production';
const DEMO_SEED = process.env.CODEARENA_SEED_DEMO === '1';
await mkdir(RUN_ROOT, { recursive: true });
if (PRODUCTION) {
  const jwt = process.env.CODEARENA_JWT_SECRET || '';
  const worker = process.env.CODEARENA_WORKER_SECRET || '';
  if (jwt.length < 32 || jwt === 'change-me-in-production') throw new Error('Production requires CODEARENA_JWT_SECRET of at least 32 characters');
  if (worker.length < 24 || worker === 'change-me-in-production') throw new Error('Production requires a strong CODEARENA_WORKER_SECRET');
  if (!process.env.DATABASE_URL && process.env.CODEARENA_ALLOW_SQLITE_PRODUCTION !== '1') throw new Error('Production requires DATABASE_URL for PostgreSQL; SQLite production is disabled');
  if (process.env.CODEARENA_DOCKER !== '1') throw new Error('Production requires CODEARENA_DOCKER=1 for the authoritative sandbox');
  if (!process.env.CODEARENA_CORS_ORIGIN || process.env.CODEARENA_CORS_ORIGIN === '*') throw new Error('Production requires an explicit CODEARENA_CORS_ORIGIN; wildcard CORS is disabled');
  if (REQUIRE_REDIS && !process.env.CODEARENA_REDIS_URL) throw new Error('Redis URL is required when external workers are enabled');
}

const ensureDockerRuntime = async () => {
  if (process.env.CODEARENA_DOCKER !== '1') return;
  const ok = await dockerAvailable();
  if (!ok) {
    if (PRODUCTION) {
      throw new Error('CodeArena startup requires Docker Desktop/Engine to be running because CODEARENA_DOCKER=1 is enabled.');
    }
    console.warn('Docker daemon is unavailable; CodeArena sandbox execution will fail closed.');
    return;
  }
  console.log('CodeArena Docker sandboxing is enabled and Docker is available.');
};

const now = () => new Date().toISOString();
const stmt = (sql) => db.prepare(sql);
const safeJson = (x, fallback = {}) => { try { return JSON.parse(x); } catch { return fallback; } };
const norm = (s='') => String(s).replace(/\r/g,'').trim().replace(/\s+/g,' ');
const hashPassword = (p) => { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(p,salt,64).toString('hex')}`; };
const verifyPassword = (p,h) => { const [salt,hex] = String(h||'').split(':'); if(!salt||!hex)return false; const a=scryptSync(p,salt,64),b=Buffer.from(hex,'hex'); return a.length===b.length&&timingSafeEqual(a,b); };
const signToken = (payload,ttlMs=8*60*60*1000) => { const body=Buffer.from(JSON.stringify({...payload,exp:Date.now()+ttlMs})).toString('base64url'); return `${body}.${createHmac('sha256',process.env.CODEARENA_JWT_SECRET||'change-me-in-production').update(body).digest('base64url')}`; };
const verifyToken = (token, secret=JWT_SECRET) => { try { const [body,sig]=String(token||'').split('.'); if(!body||!sig||!secret)return null; const expected=createHmac('sha256',secret).update(body).digest('base64url'); const a=Buffer.from(sig); const b=Buffer.from(expected); if(a.length!==b.length||!timingSafeEqual(a,b))return null; const p=JSON.parse(Buffer.from(body,'base64url')); if(!p.exp || p.exp<=Date.now())return null; return p; } catch{return null;} };

const seed = () => {
  const insU=stmt('INSERT OR IGNORE INTO users(id,name,role,usn,password_hash,active,created_at) VALUES(?,?,?,?,?,?,?)');
  for(const u of [['demo-student','Demo Student','STUDENT','1CU23CS001','student123'],['demo-faculty','Demo Faculty','FACULTY','FAC001','faculty123'],['demo-admin','CodeArena Admin','SUPER_ADMIN','ADMIN001','admin123'],['lab-agent','Lab Station Agent','LAB_INSTRUCTOR','LAB001','lab123']]) insU.run(u[0],u[1],u[2],u[3],hashPassword(u[4]),1,now());
  const subjects=[['subj_py','PRG301','Advanced Python & Algorithmic Design','School of Engineering (MCA / CS)','python','Deepak B (Faculty Lead)','High-performance Python and algorithms.',1],['subj_java','OOP202','Enterprise Systems & Java Architecture','School of Engineering','java','Dr. Anita Desai','Java architecture and concurrency.',1],['subj_cpp','SYS101','Systems Programming & Operating Engines','School of Engineering','cpp','Vinay Varma','Modern C++ systems programming.',1]];
  const is=stmt('INSERT OR IGNORE INTO subjects VALUES(?,?,?,?,?,?,?,?)'); for(const s of subjects)is.run(...s);
  const probs=[
    ['prob_101','subj_py','Array Range Sum Query','EASY','Prefix Sums',100,2000,256,'Given N integers, print their sum.','5\n10 20 30 40 50','150',JSON.stringify({python:`import sys\na=sys.stdin.read().split(); n=int(a[0]); print(sum(map(int,a[1:n+1])))`,cpp:`#include <iostream>\nint main(){int n;if(!(std::cin>>n))return 0;long long s=0,x;for(int i=0;i<n;i++){std::cin>>x;s+=x;}std::cout<<s<<"\\n";}`,java:`import java.util.*; public class Solution{public static void main(String[]x){Scanner s=new Scanner(System.in);int n=s.nextInt();long z=0;for(int i=0;i<n;i++)z+=s.nextLong();System.out.println(z);}}`,javascript:`const a=require('fs').readFileSync(0,'utf8').trim().split(/\\s+/);let n=+a[0],s=0;for(let i=1;i<=n;i++)s+=+a[i];console.log(s);`,go:`package main; import "fmt"; func main(){var n int;fmt.Scan(&n);var s,x int64;for i:=0;i<n;i++{fmt.Scan(&x);s+=x};fmt.Println(s)}`}),1],
    ['prob_102','subj_java','Concurrent Bank Account Ledger','MEDIUM','Concurrency',150,2500,512,'Apply deposit and withdrawal operations and print final balance.','1000\nDEPOSIT 250\nWITHDRAW 100\nEND','1150',JSON.stringify({java:`import java.util.*; public class Solution{public static void main(String[]a){Scanner s=new Scanner(System.in);long b=s.nextLong();while(s.hasNext()){String op=s.next();if(op.equals("END"))break;long n=s.nextLong();if(op.equals("DEPOSIT"))b+=n;else b-=n;}System.out.println(b);}}`}),1],
    ['prob_103','subj_cpp','Fast Matrix Transpose','HARD','Matrices',200,1000,128,'Transpose an N x M matrix.','2 3\n1 2 3\n4 5 6','1 4\n2 5\n3 6',JSON.stringify({cpp:`#include <iostream>\n#include <vector>\nint main(){int n,m;std::cin>>n>>m;std::vector<std::vector<int>>a(n,std::vector<int>(m));for(auto&r:a)for(auto&x:r)std::cin>>x;for(int j=0;j<m;j++){for(int i=0;i<n;i++)std::cout<<a[i][j]<<(i+1==n?'\\n':' ');}}`}),1]
  ];
  const ip=stmt('INSERT OR IGNORE INTO problems(id,subject_id,title,difficulty,category,points,time_limit_ms,memory_limit_mb,statement,sample_input,sample_output,starter_codes,published,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for(const p of probs){ip.run(...p.slice(0,12),1,'demo-faculty',now(),now()); const tests=p[0]==='prob_101'?[['1','5\n10 20 30 40 50','150',0],['2','4\n1 2 3 4','10',0],['3','1\n42','42',1]]:p[0]==='prob_102'?[['1','1000\nDEPOSIT 250\nWITHDRAW 100\nEND','1150',0],['2','0\nDEPOSIT 1000\nWITHDRAW 250\nEND','750',1]]:[['1','2 3\n1 2 3\n4 5 6','1 4\n2 5\n3 6',0],['2','1 1\n42','42',1]]; const it=stmt('INSERT OR IGNORE INTO test_cases(id,problem_id,test_case_number,input,expected_output,is_hidden,weight) VALUES(?,?,?,?,?,?,?)'); for(const t of tests)it.run(`${p[0]}_${t[0]}`,p[0],Number(t[0]),t[1],t[2],t[3],1); }
  if(!stmt('SELECT 1 FROM stations LIMIT 1').get()){
    const ins=stmt('INSERT INTO stations VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    for(let i=1;i<=60;i++){
      const status=i<=2?'RUNNING_SANDBOX':i===3?'MAINTENANCE':i===4?'OFFLINE':'OPERATIONAL';
      ins.run(`PC-${String(i).padStart(2,'0')}`,i,`10.20.4.${100+i}`,`Row ${String.fromCharCode(65+Math.floor((i-1)/12))}`,i%2?'Ubuntu 24.04 LTS':'Windows 11 Pro',16,32,i%2?'Intel UHD 770':'NVIDIA RTX 4060','gVisor-ready',status,0,0,null,null,null,null,null,0,0,0,0,0,now(),null,randomBytes(32).toString('hex'),JSON.stringify({manufacturer:'Lab PC',model:'CodeArena Station'}));
    }
  }
  stmt("UPDATE stations SET status='OPERATIONAL' WHERE station_number BETWEEN 5 AND 60 AND status='OFFLINE'").run();

  // Bridge the portal/LMS identity into CodeArena. The external_id is the portal's
  // stable user id; it avoids creating a second student/faculty identity in CodeArena.
  const portalUsers=[
    ['usr_std_01','Arjun Kumar','STUDENT','24MCA003','student@chanakya.edu'],
    ['usr_fac_01','Deepak B','FACULTY','CUP2025/00303','faculty@chanakya.edu'],
    ['usr_coord_01','Dr. Anita Desai','COORDINATOR','CUP2022/00084','coordinator@chanakya.edu'],
    ['usr_lab_01','Vinay Varma','LAB_INSTRUCTOR','CUP2024/00112','lab@chanakya.edu'],
    ['usr_adm_01','Dr. R. Sharma','SUPER_ADMIN','CUA2021/00001','admin@chanakya.edu']
  ];
  const up=stmt('UPDATE users SET external_id=? WHERE id=?');
  for(const u of portalUsers){
    const existing=stmt('SELECT id FROM users WHERE id=?').get(u[0]);
    if(existing) up.run(u[0],u[0]);
    else stmt('INSERT OR IGNORE INTO users(id,name,role,usn,password_hash,active,created_at,external_id) VALUES(?,?,?,?,?,?,?,?)').run(u[0],u[1],u[2],u[3],hashPassword('portal-managed'),1,now(),u[0]);
  }

  const stationUpdate=stmt('UPDATE stations SET status=?,cpu_usage_pct=?,ram_usage_pct=?,student_usn=?,student_name=?,subject_code=?,language=?,current_problem_title=?,session_minutes=?,active_minutes=?,idle_minutes=?,total_submissions=?,accepted_submissions=?,last_heartbeat=?,incident_notes=? WHERE id=?');
  stationUpdate.run('RUNNING_SANDBOX',68,72,'24MCA003','Arjun Kumar','PRG301','python','Array Range Sum Query',46,39,7,12,9,new Date(Date.now()-60_000).toISOString(),null,'PC-01');
  stationUpdate.run('RUNNING_SANDBOX',54,61,'1CU23CS001','Demo Student','OOP202','java','Concurrent Bank Account Ledger',31,25,6,8,6,new Date(Date.now()-2*60_000).toISOString(),null,'PC-02');
  stationUpdate.run('MAINTENANCE',0,0,null,null,null,null,null,0,0,0,0,0,new Date(Date.now()-45*60_000).toISOString(),'Keyboard replacement scheduled','PC-03');

  const timeRecord=stmt('INSERT OR IGNORE INTO time_records(usn,name,school,subject_code,subject_name,total_hours,weekly_hours,active_ratio,submissions,accuracy,assigned_station,last_active,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const demoRecords=[
    ['24MCA003','Arjun Kumar','School of Engineering (MCA / CS)','PRG301','Advanced Python & Algorithmic Design',18.5,5.2,0.86,26,84,'PC-01',new Date(Date.now()-60_000).toISOString(),'ACTIVE'],
    ['1CU23CS001','Demo Student','School of Engineering (MCA / CS)','PRG301','Advanced Python & Algorithmic Design',11.25,3.4,0.73,14,71,'PC-02',new Date(Date.now()-4*60_000).toISOString(),'IDLE'],
    ['24MCA017','Maya Rao','School of Engineering (MCA / CS)','PRG301','Advanced Python & Algorithmic Design',9.75,4.1,0.79,17,76,'PC-05',new Date(Date.now()-12*60_000).toISOString(),'ACTIVE'],
    ['24MCA021','Neel Shah','School of Engineering','OOP202','Enterprise Systems & Java Architecture',14.0,4.8,0.91,21,88,'PC-06',new Date(Date.now()-8*60_000).toISOString(),'ACTIVE'],
    ['24MCA032','Isha Nair','School of Engineering','SYS101','Systems Programming & Operating Engines',8.5,2.7,0.68,10,65,'PC-08',new Date(Date.now()-25*60_000).toISOString(),'IDLE']
  ];
  for(const record of demoRecords) timeRecord.run(...record);

  const demoTickets=[
    ['demo-ticket-pc03','PC-03','KEYBOARD_MOUSE','MEDIUM','Keyboard replacement scheduled after repeated key failures.','demo-faculty',now(),'OPEN','lab-agent',null],
    ['demo-ticket-pc04','PC-04','SANDBOX_CONTAINER','LOW','Sandbox image refresh completed; station is back in service.','lab-agent',new Date(Date.now()-2*60*60_000).toISOString(),'RESOLVED','demo-admin',new Date(Date.now()-60*60_000).toISOString()]
  ];
  const insertTicket=stmt('INSERT OR IGNORE INTO tickets(id,station_id,category,severity,description,reported_by,reported_at,status,assigned_to,resolved_at) VALUES(?,?,?,?,?,?,?,?,?,?)');
  for(const ticket of demoTickets) insertTicket.run(...ticket);

  // LMS academic catalog and the initial CodeArena course offerings.
  const termId='term_2026_27_odd';
  stmt('INSERT OR IGNORE INTO academic_terms(id,code,name,starts_at,ends_at,status,created_at) VALUES(?,?,?,?,?,?,?)').run(termId,'2026-27-ODD','Odd Semester 2026-27','2026-07-01T00:00:00.000Z','2026-12-31T23:59:59.999Z','ACTIVE',now());
  const subjectsForLms=stmt('SELECT id,code,name,school,description FROM subjects').all();
  for(const sub of subjectsForLms){
    const courseId=`course_${sub.code.toLowerCase()}`;
    stmt('INSERT OR IGNORE INTO lms_courses(id,course_code,title,description,credits,subject_id,department,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(courseId,sub.code,sub.name,sub.description||'',3,sub.id,sub.school||'School of Computer Science & Applications',1,now(),now());
    const sectionId=`section_${sub.code.toLowerCase()}_2026_27_a`;
    stmt('INSERT OR IGNORE INTO lms_sections(id,course_id,term_id,section_code,room,schedule_json,capacity,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(sectionId,courseId,termId,'A','CodeArena Lab',JSON.stringify({days:['MON','WED'],start:'09:00',end:'11:00'}),60,'ACTIVE',now());
    const facultyExternal=sub.code==='PRG301'?'usr_fac_01':sub.code==='SYS101'?'usr_lab_01':'usr_coord_01';
    const faculty=stmt('SELECT id FROM users WHERE external_id=?').get(facultyExternal);
    if(faculty) stmt('INSERT OR IGNORE INTO lms_faculty_assignments(id,section_id,user_id,assignment_role,assigned_at,active) VALUES(?,?,?,?,?,?)').run(randomUUID(),sectionId,faculty.id,'FACULTY',now(),1);
    if(sub.code==='PRG301'){
      // Seed all development/test students into the default PRG301 section so the
      // legacy CodeArena API tests and the portal's demo student share LMS scope.
      const students=stmt("SELECT id FROM users WHERE role='STUDENT' AND active=1").all();
      for(const student of students) stmt('INSERT OR IGNORE INTO lms_enrollments(id,section_id,user_id,enrollment_status,enrolled_at) VALUES(?,?,?,?,?)').run(randomUUID(),sectionId,student.id,'ENROLLED',now());
    }
    const probs=stmt('SELECT id FROM problems WHERE subject_id=? ORDER BY title').all(sub.id);
    for(const pr of probs) stmt('INSERT OR IGNORE INTO lms_course_problems(id,section_id,problem_id,assessment_type,available_from,required,max_attempts,weight,published,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),sectionId,pr.id,'PRACTICE',now(),1,0,1,1,faculty?.id||'demo-faculty',now());
  }
};
if ((!PRODUCTION && !process.env.DATABASE_URL) || DEMO_SEED) seed();

// Optional production bootstrap: creates exactly one initial admin when explicitly configured.
// This avoids shipping demo accounts while still making a fresh PostgreSQL deployment operable.
if (PRODUCTION && process.env.CODEARENA_BOOTSTRAP_ADMIN_USN && process.env.CODEARENA_BOOTSTRAP_ADMIN_PASSWORD) {
  const adminUsn=String(process.env.CODEARENA_BOOTSTRAP_ADMIN_USN).trim();
  const adminPassword=String(process.env.CODEARENA_BOOTSTRAP_ADMIN_PASSWORD);
  if(adminPassword.length < 12) throw new Error('CODEARENA_BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters');
  const existing=stmt('SELECT id FROM users WHERE usn=?').get(adminUsn);
  if(!existing) {
    const adminId=process.env.CODEARENA_BOOTSTRAP_ADMIN_ID || `bootstrap-admin-${randomUUID()}`;
    const adminName=process.env.CODEARENA_BOOTSTRAP_ADMIN_NAME || 'CodeArena Administrator';
    stmt('INSERT INTO users(id,name,role,usn,password_hash,active,created_at,external_id) VALUES(?,?,?,?,?,?,?,?)').run(adminId,adminName,'SUPER_ADMIN',adminUsn,hashPassword(adminPassword),1,now(),adminId);
  }
}

try{const legacy=stmt("SELECT id FROM stations WHERE agent_token LIKE 'agent-%'").all();for(const st of legacy)stmt('UPDATE stations SET agent_token=? WHERE id=?').run(randomBytes(32).toString('hex'),st.id);}catch{}

await ensureDockerRuntime();

const queues = new Map();
const queue = { pending: [], running: 0, concurrency: Number(process.env.CODEARENA_WORKERS||4), enqueue(job){this.pending.push(job); this.pump();}, pump(){while(this.running<this.concurrency&&this.pending.length){const j=this.pending.shift();this.running++;Promise.resolve().then(j).catch(()=>{}).finally(()=>{this.running--;this.pump();});}} };

const interactiveSessions = new Map();
async function startInteractiveDocker(language, source, initialStdin = '') {
  if (process.env.CODEARENA_DOCKER !== '1' || !(await dockerAvailable())) {
    return startFallbackInteractiveSession(language, source, initialStdin, interactiveSessions);
  }
  let sandbox;
  try {
    sandbox = await startDockerInteractive(language, source, { root: RUN_ROOT, timeoutMs: 10 * 60 * 1000 });
  } catch (error) {
    console.warn('Docker interactive start failed, falling back to sandbox runner:', error.message);
    return startFallbackInteractiveSession(language, source, initialStdin, interactiveSessions);
  }

  const id = sandbox.id;
  const session = {
    id,
    child: sandbox.child,
    started: Date.now(),
    subscribers: new Set(),
    outputBytes: 0,
    closed: false,
    userId: null,
    cleanup: sandbox.cleanup,
    timeout: sandbox.timeout
  };
  interactiveSessions.set(id, session);

  const emit = (type, text = '', exitCode = 0) => {
    const payload = JSON.stringify({ type, text, exitCode, timeMs: Date.now() - session.started });
    for (const res of session.subscribers) {
      try { res.write(`data: ${payload}\n\n`); } catch {}
    }
  };
  const cleanup = async () => {
    if (session.closed) return;
    session.closed = true;
    clearTimeout(session.timeout);
    interactiveSessions.delete(id);
    try { session.child.kill('SIGKILL'); } catch {}
    await session.cleanup();
  };

  session.child.stdout.on('data', data => {
    const text = data.toString();
    session.outputBytes += Buffer.byteLength(text);
    if (session.outputBytes <= 1_000_000) emit('stdout', text);
    else {
      emit('stderr', 'Output limit exceeded');
      void cleanup();
    }
  });
  session.child.stderr.on('data', data => {
    const text = data.toString();
    session.outputBytes += Buffer.byteLength(text);
    if (session.outputBytes <= 1_000_000) emit('stderr', text);
  });
  session.child.on('error', error => {
    emit('stderr', error.message || 'Interactive sandbox failed');
    emit('exit', '', 1);
    void cleanup();
  });
  session.child.on('close', code => {
    if (!session.closed) {
      emit('exit', '', code ?? 1);
      void cleanup();
    }
  });

  if (initialStdin) session.child.stdin.write(String(initialStdin));
  return id;
}
async function redisQueueLength(){try{return Number(await redisCommand(REDIS_URL,['LLEN',REDIS_QUEUE_KEY]))||0;}catch{return 0;}}
async function redisHealthy(){try{return String(await redisCommand(REDIS_URL,['PING'])).toUpperCase()==='PONG';}catch{return false;}}
async function enqueueExternalSubmission(id){if(!(await redisHealthy()))throw Object.assign(new Error('Redis queue unavailable; submission was not accepted'),{status:503});await redisPush(REDIS_URL,REDIS_QUEUE_KEY,id);}

function commandFor(language, dir){
  const f=path.join(dir,'Main');
  switch(language){
    case 'python': return {file:'main.py', compile:null, run:['python3',[path.join(dir,'main.py')]]};
    case 'javascript': return {file:'main.js', compile:null, run:['node',[path.join(dir,'main.js')]]};
    case 'cpp': return {file:'main.cpp', compile:['g++',['-std=c++20','-O2','-pipe',path.join(dir,'main.cpp'),'-o',f]], run:[f,[]]};
    case 'c': return {file:'main.c', compile:['gcc',['-std=c17','-O2','-pipe',path.join(dir,'main.c'),'-o',f]], run:[f,[]]};
    case 'java': return {file:'Solution.java', compile:['javac',[path.join(dir,'Solution.java')]], run:['java',['-cp',dir,'Solution']]};
    case 'go': return {file:'main.go', compile:['go',['build','-o',f,path.join(dir,'main.go')]], run:[f,[]]};
    case 'rust': return {file:'main.rs', compile:['rustc',['-O',path.join(dir,'main.rs'),'-o',f]], run:[f,[]]};
    case 'typescript': return {file:'main.ts', compile:['tsc',['--target','ES2022','--module','commonjs','--strict','false','--outDir',path.join(dir,'out'),path.join(dir,'main.ts')]], run:['node',[path.join(dir,'out','main.js')]]};
    case 'csharp': return {file:'Program.cs', compile:['dotnet',['build',path.join(dir,'Program.cs'),'-o',path.join(dir,'out')]], run:['dotnet',[path.join(dir,'out','Program.dll')]]};
    case 'php': return {file:'main.php', compile:null, run:['php',[path.join(dir,'main.php')]]};
    case 'ruby': return {file:'main.rb', compile:null, run:['ruby',[path.join(dir,'main.rb')]]};
    case 'kotlin': return {file:'Main.kt', compile:['kotlinc',[path.join(dir,'Main.kt'),'-include-runtime','-d',path.join(dir,'main.jar')]], run:['java',['-jar',path.join(dir,'main.jar')]]};
    case 'swift': return {file:'main.swift', compile:['swiftc',[path.join(dir,'main.swift'),'-o',f]], run:[f,[]]};
    case 'dart': return {file:'main.dart', compile:null, run:['dart',[path.join(dir,'main.dart')]]};
    case 'r': return {file:'main.R', compile:null, run:['Rscript',[path.join(dir,'main.R')]]};
    case 'bash': return {file:'main.sh', compile:null, run:['bash',[path.join(dir,'main.sh')]]};
    case 'lua': return {file:'main.lua', compile:null, run:['lua',[path.join(dir,'main.lua')]]};
    case 'sql': return {file:'main.sql', compile:null, run:['python3',['-c',`import sqlite3,sys; db=sqlite3.connect(':memory:'); db.row_factory=sqlite3.Row; sql=open(${JSON.stringify(path.join(dir,'main.sql'))},encoding='utf8').read(); cur=db.executescript(sql);
for row in cur.execute('SELECT * FROM sqlite_master WHERE type=\"table\" ORDER BY name'): print(row['name']); db.close()`]]};
    case 'html': return {file:'index.html', compile:null, run:['python3',['-c',`from pathlib import Path; s=Path(${JSON.stringify(path.join(dir,'index.html'))}).read_text(); print('HTML OK' if '<html' in s.lower() else 'HTML validation warning')`]]};
    case 'css': return {file:'style.css', compile:null, run:['python3',['-c',`from pathlib import Path; s=Path(${JSON.stringify(path.join(dir,'style.css'))}).read_text(); print('CSS source accepted ('+str(len(s))+' chars)')`]]};
    default: throw new Error('Unsupported language');
  }
}
async function dockerExecute(language,source,input,limits){
  if (process.env.CODEARENA_DOCKER === '1' && (await dockerAvailable())) {
    return runDocker(language,source,input,limits,{root:RUN_ROOT});
  }
  return executeCodeUnified(language,source,input,limits);
}

function quality(source){const lines=source.split('\n').length;const complexity=(source.match(/\b(for|while|foreach|map|filter)\b/g)||[]).length;const comments=(source.match(/\/\/|#|\/\*/g)||[]).length;const score=Math.max(0,Math.min(100,100-Math.min(35,complexity*3)-Math.min(20,Math.floor(lines/120)*5)+Math.min(10,comments)));return {score,lines,complexity,comments};}
function fingerprint(source){return analyzePlagiarism(source,source).tokensA;}
function similarity(a,b){return analyzePlagiarism(a,b).score;}
async function processSubmission(id){
  const row=stmt('SELECT s.*,p.subject_id,p.points,p.time_limit_ms,p.memory_limit_mb,p.title FROM submissions s JOIN problems p ON p.id=s.problem_id WHERE s.id=?').get(id);
  if(!row)return;
  const tests=stmt('SELECT * FROM test_cases WHERE problem_id=? ORDER BY test_case_number').all(row.problem_id);
  let passed=0,max=0,peak=0,verdict='ACCEPTED';
  for(const t of tests){
    const r=await dockerExecute(row.language,row.source_code,t.input,{time:row.time_limit_ms,memory:row.memory_limit_mb,maxOutput:1000000});
    max=Math.max(max,r.timeMs||0); peak=Math.max(peak,r.memoryMb||0);
    if(r.status!=='SUCCESS'){verdict=r.status;break;}
    if(norm(r.stdout)!==norm(t.expected_output)){verdict='WRONG_ANSWER';break;}
    passed++;
  }
  const total=tests.length; const marks=Math.round((passed/Math.max(total,1))*row.points*100)/100;
  stmt('UPDATE submissions SET verdict=?,passed=?,total=?,runtime_ms=?,memory_mb=?,marks=?,queue_status=?,queue_started_at=NULL WHERE id=?').run(verdict,passed,total,max,peak,marks,'COMPLETED',id);
  const subjectCode=stmt('SELECT code FROM subjects WHERE id=?').get(row.subject_id)?.code||'';
  const existingGrade=stmt('SELECT id FROM gradebook WHERE user_id=? AND assessment_type=? AND assessment_id=?').get(row.user_id,'CODEARENA',row.problem_id);
  if(existingGrade) stmt('UPDATE gradebook SET marks=?,max_marks=?,updated_at=? WHERE id=? AND locked=0').run(marks,row.points,now(),existingGrade.id); else stmt('INSERT INTO gradebook VALUES(?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),row.user_id,subjectCode,'CODEARENA',row.problem_id,marks,row.points,0,0,now());
  notify(row.user_id,'Submission evaluated',`${row.title}: ${verdict} (${marks}/${row.points})`,verdict==='ACCEPTED'?'SUCCESS':'WARNING');
  audit(row.user_id,'SUBMIT','SUBMISSION',id,{verdict,passed,total,runtimeMs:max,memoryMb:peak});
  return {id,verdict,passed,total,marks};
}

function audit(userId,action,type,id,details){stmt('INSERT INTO audit_logs VALUES(?,?,?,?,?,?,?)').run(randomUUID(),userId,action,type,id,JSON.stringify(details||{}),now());}
function notify(userId,title,message,severity='INFO'){stmt('INSERT INTO notifications VALUES(?,?,?,?,?,?,?)').run(randomUUID(),userId,title,message,severity,null,now());}
function rateLimit(key,max=30,windowMs=60000){const t=Date.now();const r=stmt('SELECT * FROM rate_limits WHERE key=?').get(key);if(!r||t-r.window_start>windowMs){stmt('INSERT OR REPLACE INTO rate_limits VALUES(?,?,?)').run(key,t,1);return true;}if(r.count>=max)return false;stmt('UPDATE rate_limits SET count=count+1 WHERE key=?').run(key);return true;}

function auth(req,roles=[]){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');
  let u=verifyToken(token);
  if(!u && (!PRODUCTION || process.env.CODEARENA_ALLOW_HEADER_AUTH==='1')){
    const externalId=String(req.headers['x-user-id']||'').trim()||'demo-student';
    let row=stmt('SELECT id,name,role,usn FROM users WHERE (id=? OR external_id=? OR usn=?) AND active=1').get(externalId,externalId,externalId);
    if(!row && externalId && externalId!=='demo-student'){
      const role=String(req.headers['x-user-role']||'STUDENT').toUpperCase();
      const allowed=['SUPER_ADMIN','STUDENT','FACULTY','COORDINATOR','LAB_INSTRUCTOR'].includes(role)?role:'STUDENT';
      const name=String(req.headers['x-user-name']||externalId).slice(0,160);
      const usn=String(req.headers['x-user-usn']||externalId).slice(0,80);
      const id=`portal-${externalId.replace(/[^a-zA-Z0-9_-]/g,'_')}`;
      try{stmt('INSERT INTO users(id,name,role,usn,password_hash,active,created_at,external_id) VALUES(?,?,?,?,?,?,?,?)').run(id,name,allowed,usn,hashPassword('portal-managed'),1,now(),externalId);}catch{}
      row=stmt('SELECT id,name,role,usn FROM users WHERE (id=? OR external_id=?) AND active=1').get(id,externalId);
    }
    u=row?{sub:row.id,name:row.name,role:row.role,usn:row.usn}:null;
  }
  if(!u)throw Object.assign(new Error('Authentication required'),{status:401});
  if(roles.length&&!roles.includes(u.role))throw Object.assign(new Error('Forbidden'),{status:403});
  return u;
}

const LMS_MANAGER_ROLES=['SUPER_ADMIN','COORDINATOR'];
const LMS_TEACHING_ROLES=['FACULTY','LAB_INSTRUCTOR','SUPER_ADMIN','COORDINATOR'];
function lmsSection(id){return stmt('SELECT s.*,c.course_code,c.title course_title,c.subject_id,t.code term_code,t.name term_name FROM lms_sections s JOIN lms_courses c ON c.id=s.course_id JOIN academic_terms t ON t.id=s.term_id WHERE s.id=?').get(id);}
function lmsCanTeach(user,sectionId){if(LMS_MANAGER_ROLES.includes(user.role))return true;return LMS_TEACHING_ROLES.includes(user.role)&&!!stmt('SELECT 1 FROM lms_faculty_assignments WHERE section_id=? AND user_id=? AND active=1').get(sectionId,user.sub);}
function lmsIsEnrolled(user,sectionId){return !!stmt("SELECT 1 FROM lms_enrollments WHERE section_id=? AND user_id=? AND enrollment_status IN ('ENROLLED','COMPLETED')").get(sectionId,user.sub);}
function lmsAssertSection(user,sectionId,teacher=false){const section=lmsSection(sectionId);if(!section)throw Object.assign(new Error('LMS section not found'),{status:404});if(LMS_MANAGER_ROLES.includes(user.role))return section;if(teacher&&lmsCanTeach(user,sectionId))return section;if(!teacher&&lmsIsEnrolled(user,sectionId))return section;throw Object.assign(new Error('You are not authorized for this LMS section'),{status:403});}
function lmsAudit(user,sectionId,eventType,entityId,metadata={}){stmt('INSERT INTO lms_audit_events VALUES(?,?,?,?,?,?,?)').run(randomUUID(),user.sub,sectionId,eventType,entityId,JSON.stringify(metadata),now());}
function studentAssignment(user, problemId, sectionId=null, enforceAttempts=true) {
  if(user.role!=='STUDENT') return null;
  const prob=stmt('SELECT p.id,p.subject_id,s.code subject_code FROM problems p JOIN subjects s ON s.id=p.subject_id WHERE p.id=? AND p.published=1').get(problemId);
  if(!prob) throw Object.assign(new Error('Problem not found'),{status:404});
  let assignment;
  if(sectionId) {
    lmsAssertSection(user,sectionId,false);
    assignment=stmt(`SELECT cp.* FROM lms_course_problems cp JOIN lms_sections ls ON ls.id=cp.section_id JOIN lms_courses c ON c.id=ls.course_id WHERE cp.section_id=? AND cp.problem_id=? AND c.course_code=? AND cp.published=1`).get(sectionId,problemId,prob.subject_code);
  } else {
    assignment=stmt(`SELECT cp.* FROM lms_course_problems cp JOIN lms_sections ls ON ls.id=cp.section_id JOIN lms_courses c ON c.id=ls.course_id JOIN lms_enrollments e ON e.section_id=ls.id WHERE cp.problem_id=? AND c.course_code=? AND cp.published=1 AND e.user_id=? AND e.enrollment_status IN ('ENROLLED','COMPLETED') ORDER BY cp.created_at DESC LIMIT 1`).get(problemId,prob.subject_code,user.sub);
  }
  if(!assignment) throw Object.assign(new Error('LMS enrollment and assignment are required for this CodeArena problem'),{status:403});
  const nowMs=Date.now();
  if(assignment.available_from && nowMs<Date.parse(assignment.available_from)) throw Object.assign(new Error('This CodeArena assignment is not available yet'),{status:409});
  if(assignment.due_at && nowMs>Date.parse(assignment.due_at)) throw Object.assign(new Error('The CodeArena assignment deadline has passed'),{status:409});
  const maxAttempts=Number(assignment.max_attempts||0);
  if(enforceAttempts && maxAttempts>0) {
    const attempts=Number(stmt('SELECT COUNT(*) c FROM submissions WHERE user_id=? AND problem_id=? AND lms_section_id=?').get(user.sub,problemId,assignment.section_id)?.c||0);
    if(attempts>=maxAttempts) throw Object.assign(new Error('Maximum submission attempts reached for this LMS assignment'),{status:429});
  }
  return assignment;
}


async function body(req){let s='';for await(const c of req)s+=c;if(s.length>2_000_000)throw Object.assign(new Error('Payload too large'),{status:413});return s?JSON.parse(s):{};}
function send(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',...headers});res.end(JSON.stringify(data));}
function ok(res,data){send(res,200,data);} function fail(res,e){send(res,e.status||500,{error:e.message||'Server error'});}
function logSystemError(e,req){try{stmt('INSERT INTO system_errors VALUES(?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),(e.status||500)>=500?'ERROR':'WARN','api',e.message||'Server error',e.stack||'',req.headers['x-request-id']||'',now(),0,null,null);}catch{}}

async function handle(req,res){
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':process.env.CODEARENA_CORS_ORIGIN||'*','Access-Control-Allow-Headers':'Content-Type, Authorization, X-User-Id, X-User-Role','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end();}
  const u=new URL(req.url,`http://${req.headers.host}`);const p=u.pathname;
  if(!rateLimit(`${req.socket.remoteAddress||'unknown'}:${req.method}:${p}`,Number(process.env.CODEARENA_RATE_LIMIT||120),60000))return send(res,429,{error:'Rate limit exceeded'});
  try{
    if(p==='/api/health'){const redis=await redisHealthy();return ok(res,{ok:true,service:'codearena',queue:{pending:queue.pending.length,running:queue.running,redisPending:await redisQueueLength()},database:process.env.DATABASE_URL?'postgresql':'sqlite',docker:process.env.CODEARENA_DOCKER==='1',dockerDaemon:process.env.CODEARENA_DOCKER==='1'?await dockerAvailable():false,production:PRODUCTION,redis,redisRequired:REQUIRE_REDIS,time:now()});}
    if(p==='/api/execute'&&req.method==='POST'){const b=await body(req);return await handleExecuteSubmit(req,res,b);}
    if(p.startsWith('/api/execute/')&&req.method==='GET'){const token=p.split('/')[3];return await handleExecutePoll(req,res,token);}
    if(p==='/api/auth/login'&&req.method==='POST'){const b=await body(req);const user=stmt('SELECT * FROM users WHERE usn=? AND active=1').get(b.usn);if(!user||!verifyPassword(b.password,user.password_hash))throw Object.assign(new Error('Invalid credentials'),{status:401});const token=signToken({sub:user.id,name:user.name,role:user.role,usn:user.usn});audit(user.id,'LOGIN','USER',user.id,{});return ok(res,{token,user:{id:user.id,name:user.name,role:user.role,usn:user.usn}});}
    if(p==='/api/auth/me'){const user=auth(req);return ok(res,{user});}
    if(p==='/api/auth/portal-exchange'&&req.method==='POST'){
      const b=await body(req);
      const assertion=String(b.assertion||'');
      const claims=verifyToken(assertion,process.env.CODEARENA_SSO_JWT_SECRET||'');
      if(!claims || claims.iss!=='unisphere' || !claims.sub) throw Object.assign(new Error('Invalid UniSphere SSO assertion'),{status:401});
      const role=String(claims.role||'STUDENT').toUpperCase();
      const allowed=['SUPER_ADMIN','STUDENT','FACULTY','COORDINATOR','LAB_INSTRUCTOR'];
      if(!allowed.includes(role)) throw Object.assign(new Error('CodeArena role is not permitted'),{status:403});
      const externalId=String(claims.sub);let user=stmt('SELECT id,name,role,usn FROM users WHERE external_id=? AND active=1').get(externalId);
      if(!user){
        const usn=String(claims.usn||claims.employeeId||externalId).slice(0,80);
        const id=`sso-${externalId.replace(/[^a-zA-Z0-9_-]/g,'_')}`;
        stmt('INSERT INTO users(id,name,role,usn,password_hash,active,created_at,external_id) VALUES(?,?,?,?,?,?,?,?)').run(id,String(claims.name||externalId).slice(0,160),role,usn,hashPassword(randomBytes(24).toString('hex')),1,now(),externalId);
        user=stmt('SELECT id,name,role,usn FROM users WHERE id=?').get(id);
      }
      return ok(res,{token:signToken({sub:user.id,name:user.name,role:user.role,usn:user.usn,iss:'codearena'},8*60*60*1000),user});
    }


    // ----------------------------- LMS INTEGRATION -----------------------------
    if(p==='/api/lms/bootstrap'&&req.method==='GET'){
      const user=auth(req);
      const terms=stmt('SELECT * FROM academic_terms ORDER BY starts_at DESC').all();
      const courses=stmt(`SELECT c.*,s.code subject_code,s.name subject_name,s.primary_language,s.faculty_name FROM lms_courses c LEFT JOIN subjects s ON s.id=c.subject_id WHERE c.active=1 ORDER BY c.course_code`).all();
      const sectionScope=LMS_MANAGER_ROLES.includes(user.role)?'1=1':user.role==='STUDENT'?'ls.status=\'ACTIVE\'':`EXISTS(SELECT 1 FROM lms_faculty_assignments fa0 WHERE fa0.section_id=ls.id AND fa0.user_id='${String(user.sub).replaceAll("'","''")}' AND fa0.active=1)`;
      const sections=stmt(`SELECT ls.*,c.course_code,c.title course_title,t.code term_code,t.name term_name,
        (SELECT COUNT(*) FROM lms_enrollments e WHERE e.section_id=ls.id AND e.enrollment_status IN ('ENROLLED','COMPLETED')) enrollment_count
        FROM lms_sections ls JOIN lms_courses c ON c.id=ls.course_id JOIN academic_terms t ON t.id=ls.term_id WHERE ${sectionScope} ORDER BY t.starts_at DESC,c.course_code,ls.section_code`).all();
      const mySections=stmt(`SELECT ls.*,c.course_code,c.title course_title,t.code term_code,t.name term_name,
        CASE WHEN e.id IS NOT NULL THEN 'ENROLLED' ELSE 'NOT_ENROLLED' END my_enrollment,
        CASE WHEN fa.id IS NOT NULL THEN 'TEACHING' ELSE NULL END teaching_role
        FROM lms_sections ls JOIN lms_courses c ON c.id=ls.course_id JOIN academic_terms t ON t.id=ls.term_id
        LEFT JOIN lms_enrollments e ON e.section_id=ls.id AND e.user_id=?
        LEFT JOIN lms_faculty_assignments fa ON fa.section_id=ls.id AND fa.user_id=? AND fa.active=1
        WHERE e.id IS NOT NULL OR fa.id IS NOT NULL ORDER BY t.starts_at DESC,c.course_code`).all(user.sub,user.sub);
      return ok(res,{user,terms,courses,sections,mySections});
    }
    if(p==='/api/lms/terms'&&req.method==='GET'){auth(req);return ok(res,stmt('SELECT * FROM academic_terms ORDER BY starts_at DESC').all());}
    if(p==='/api/lms/courses'&&req.method==='GET'){
      const user=auth(req);const termId=u.searchParams.get('termId');
      const where=termId?'WHERE s.term_id=?':'';const args=termId?[termId]:[];
      const rows=stmt(`SELECT c.*,s.id section_id,s.section_code,s.room,s.schedule_json,s.capacity,s.status section_status,t.code term_code,t.name term_name,
        (SELECT COUNT(*) FROM lms_enrollments e WHERE e.section_id=s.id AND e.enrollment_status IN ('ENROLLED','COMPLETED')) enrollment_count,
        CASE WHEN EXISTS(SELECT 1 FROM lms_enrollments e WHERE e.section_id=s.id AND e.user_id=? AND e.enrollment_status IN ('ENROLLED','COMPLETED')) THEN 1 ELSE 0 END enrolled,
        CASE WHEN EXISTS(SELECT 1 FROM lms_faculty_assignments fa WHERE fa.section_id=s.id AND fa.user_id=? AND fa.active=1) THEN 1 ELSE 0 END teaching
        FROM lms_courses c JOIN lms_sections s ON s.course_id=c.id JOIN academic_terms t ON t.id=s.term_id ${where} ORDER BY t.starts_at DESC,c.course_code,s.section_code`).all(user.sub,user.sub,...args);
      return ok(res,rows);
    }
    if(p==='/api/lms/courses'&&req.method==='POST'){
      const user=auth(req,LMS_MANAGER_ROLES);const b=await body(req);if(!b.courseCode||!b.title)throw Object.assign(new Error('courseCode and title are required'),{status:400});
      const id=b.id||randomUUID();stmt('INSERT INTO lms_courses(id,course_code,title,description,credits,subject_id,department,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,b.courseCode,b.title,b.description||'',Number(b.credits||3),b.subjectId||null,b.department||'',1,now(),now());lmsAudit(user,null,'COURSE_CREATED',id,b);return ok(res,{id});
    }
    if(p.match(/^\/api\/lms\/courses\/[^/]+\/sections$/)&&req.method==='POST'){
      const user=auth(req,LMS_MANAGER_ROLES);const courseId=p.split('/')[4];const b=await body(req);if(!stmt('SELECT 1 FROM lms_courses WHERE id=?').get(courseId))throw Object.assign(new Error('Course not found'),{status:404});
      const id=b.id||randomUUID();stmt('INSERT INTO lms_sections(id,course_id,term_id,section_code,room,schedule_json,capacity,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,courseId,b.termId,b.sectionCode||'A',b.room||'CodeArena Lab',JSON.stringify(b.schedule||{}),Number(b.capacity||60),b.status||'ACTIVE',now());lmsAudit(user,id,'SECTION_CREATED',id,b);return ok(res,{id});
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+$/)&&req.method==='GET'){
      const user=auth(req);const sectionId=p.split('/')[4];const teacher=lmsCanTeach(user,sectionId)||LMS_MANAGER_ROLES.includes(user.role);const section=lmsAssertSection(user,sectionId,teacher);
      const roster=teacher?stmt(`SELECT e.id enrollment_id,e.enrollment_status,e.enrolled_at,u.id user_id,u.name,u.role,u.usn FROM lms_enrollments e JOIN users u ON u.id=e.user_id WHERE e.section_id=? ORDER BY u.name`).all(sectionId):[];
      const faculty=stmt(`SELECT fa.id,u.id user_id,u.name,u.role,u.usn,fa.assignment_role,fa.assigned_at FROM lms_faculty_assignments fa JOIN users u ON u.id=fa.user_id WHERE fa.section_id=? AND fa.active=1`).all(sectionId);
      const problems=stmt(`SELECT cp.*,p.title,p.difficulty,p.points,p.category FROM lms_course_problems cp JOIN problems p ON p.id=cp.problem_id WHERE cp.section_id=? ORDER BY cp.created_at DESC`).all(sectionId);
      const modules=stmt('SELECT * FROM lms_learning_modules WHERE section_id=? AND published=1 ORDER BY position').all(sectionId);
      const gradeRows=stmt(`SELECT g.*,u.name,u.usn FROM gradebook g JOIN lms_enrollments e ON e.user_id=g.user_id AND e.section_id=? JOIN users u ON u.id=g.user_id WHERE g.subject_code=? ORDER BY u.name`).all(sectionId,section.course_code);
      return ok(res,{section,teacher,roster,faculty,problems,modules,gradebook:gradeRows});
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+\/enroll$/)&&req.method==='POST'){
      const user=auth(req);const sectionId=p.split('/')[4];const manager=LMS_MANAGER_ROLES.includes(user.role);const teacher=lmsCanTeach(user,sectionId);const b=await body(req);let targetId=user.sub;
      if((manager||teacher)&&b.userId){targetId=b.userId;}else if((manager||teacher)&&b.usn){const target=stmt('SELECT id FROM users WHERE usn=? OR external_id=?').get(b.usn,b.usn);if(!target)throw Object.assign(new Error('Student not found'),{status:404});targetId=target.id;}else if(user.role!=='STUDENT')throw Object.assign(new Error('Student enrollment requires userId or usn'),{status:400});
      const section=lmsSection(sectionId);if(!section)throw Object.assign(new Error('Section not found'),{status:404});const count=stmt("SELECT COUNT(*) c FROM lms_enrollments WHERE section_id=? AND enrollment_status IN ('ENROLLED','COMPLETED')").get(sectionId).c;if(count>=section.capacity&&!stmt("SELECT 1 FROM lms_enrollments WHERE section_id=? AND user_id=?").get(sectionId,targetId))throw Object.assign(new Error('Section capacity reached'),{status:409});
      const id=randomUUID();stmt('INSERT OR IGNORE INTO lms_enrollments(id,section_id,user_id,enrollment_status,enrolled_at) VALUES(?,?,?,?,?)').run(id,sectionId,targetId,b.status||'ENROLLED',now());lmsAudit(user,sectionId,'ENROLLMENT_CREATED',targetId,{targetId});return ok(res,{ok:true,sectionId,userId:targetId});
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+\/faculty$/)&&req.method==='POST'){
      const user=auth(req,LMS_MANAGER_ROLES);const sectionId=p.split('/')[4];if(!lmsSection(sectionId))throw Object.assign(new Error('Section not found'),{status:404});const b=await body(req);const target=stmt('SELECT id FROM users WHERE (id=? OR external_id=? OR usn=?) AND role IN (\'FACULTY\',\'LAB_INSTRUCTOR\',\'COORDINATOR\')').get(b.userId||'',b.userId||'',b.usn||'');if(!target)throw Object.assign(new Error('Faculty/instructor not found'),{status:404});const id=randomUUID();stmt('INSERT OR IGNORE INTO lms_faculty_assignments(id,section_id,user_id,assignment_role,assigned_at,active) VALUES(?,?,?,?,?,?)').run(id,sectionId,target.id,b.assignmentRole||'FACULTY',now(),1);lmsAudit(user,sectionId,'FACULTY_ASSIGNED',target.id,b);return ok(res,{ok:true,id,userId:target.id});
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+\/problems$/)&&req.method==='GET'){
      const user=auth(req);const sectionId=p.split('/')[4];lmsAssertSection(user,sectionId,false);return ok(res,stmt(`SELECT cp.*,p.title,p.difficulty,p.points,p.category,p.statement,p.starter_codes FROM lms_course_problems cp JOIN problems p ON p.id=cp.problem_id WHERE cp.section_id=? AND cp.published=1 ORDER BY cp.created_at DESC`).all(sectionId));
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+\/problems$/)&&req.method==='POST'){
      const user=auth(req);const sectionId=p.split('/')[4];lmsAssertSection(user,sectionId,true);const b=await body(req);if(!stmt('SELECT 1 FROM problems WHERE id=? AND published=1').get(b.problemId))throw Object.assign(new Error('Published CodeArena problem not found'),{status:404});const id=randomUUID();stmt('INSERT OR IGNORE INTO lms_course_problems(id,section_id,problem_id,assessment_type,available_from,due_at,required,max_attempts,weight,published,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,sectionId,b.problemId,b.assessmentType||'PRACTICE',b.availableFrom||null,b.dueAt||null,b.required?1:0,Number(b.maxAttempts||0),Number(b.weight||1),1,user.sub,now());lmsAudit(user,sectionId,'PROBLEM_ASSIGNED',b.problemId,b);return ok(res,{id});
    }
    if(p.match(/^\/api\/lms\/sections\/[^/]+\/modules$/)&&req.method==='POST'){
      const user=auth(req);const sectionId=p.split('/')[4];lmsAssertSection(user,sectionId,true);const b=await body(req);const id=randomUUID();stmt('INSERT INTO lms_learning_modules(id,section_id,title,topic,position,required_minutes,published,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,sectionId,b.title,b.topic||'',Number(b.position||1),Number(b.requiredMinutes||0),b.published===false?0:1,now());lmsAudit(user,sectionId,'MODULE_CREATED',id,b);return ok(res,{id});
    }
    if(p.match(/^\/api\/lms\/modules\/[^/]+\/progress$/)&&req.method==='POST'){
      const user=auth(req);const moduleId=p.split('/')[4];const mod=stmt('SELECT * FROM lms_learning_modules WHERE id=?').get(moduleId);if(!mod)throw Object.assign(new Error('Learning module not found'),{status:404});lmsAssertSection(user,mod.section_id,false);const b=await body(req);const done=Math.max(0,Number(b.completedMinutes||0));const status=done>=Number(mod.required_minutes||0)?'COMPLETED':done>0?'IN_PROGRESS':'NOT_STARTED';const existingProgress=stmt('SELECT id FROM lms_module_progress WHERE module_id=? AND user_id=?').get(moduleId,user.sub);if(existingProgress)stmt('UPDATE lms_module_progress SET completed_minutes=?,status=?,completed_at=?,updated_at=? WHERE id=?').run(done,status,status==='COMPLETED'?now():null,now(),existingProgress.id);else stmt('INSERT INTO lms_module_progress(id,module_id,user_id,completed_minutes,status,completed_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),moduleId,user.sub,done,status,status==='COMPLETED'?now():null,now());stmt('INSERT INTO learning_events VALUES(?,?,?,?,?,?,?)').run(randomUUID(),user.sub,lmsSection(mod.section_id).course_code,'LMS_MODULE',done,JSON.stringify({moduleId,status}),now());return ok(res,{status,completedMinutes:done});
    }
    if(p==='/api/lms/dashboard'&&req.method==='GET'){
      const user=auth(req);const teaching=LMS_TEACHING_ROLES.includes(user.role)||LMS_MANAGER_ROLES.includes(user.role);
      const enrollments=stmt(`SELECT e.section_id,e.enrollment_status,c.course_code,c.title course_title,t.code term_code,ls.section_code FROM lms_enrollments e JOIN lms_sections ls ON ls.id=e.section_id JOIN lms_courses c ON c.id=ls.course_id JOIN academic_terms t ON t.id=ls.term_id WHERE e.user_id=? ORDER BY t.starts_at DESC`).all(user.sub);
      const teachingSections=teaching?stmt(`SELECT ls.id section_id,c.course_code,c.title course_title,t.code term_code,ls.section_code,(SELECT COUNT(*) FROM lms_enrollments e WHERE e.section_id=ls.id AND e.enrollment_status IN ('ENROLLED','COMPLETED')) enrollment_count FROM lms_sections ls JOIN lms_courses c ON c.id=ls.course_id JOIN academic_terms t ON t.id=ls.term_id WHERE ?=1 AND (EXISTS(SELECT 1 FROM lms_faculty_assignments fa WHERE fa.section_id=ls.id AND fa.user_id=? AND fa.active=1) OR ?=1) ORDER BY t.starts_at DESC,c.course_code`).all(LMS_MANAGER_ROLES.includes(user.role)?1:0,user.sub,LMS_MANAGER_ROLES.includes(user.role)?1:0):[];
      const subjectCodes=[...new Set(enrollments.map(x=>x.course_code))];const learning=subjectCodes.length?stmt(`SELECT subject_code,COALESCE(SUM(minutes),0) minutes,COUNT(*) events FROM learning_events WHERE user_id=? AND subject_code IN (${subjectCodes.map(()=>'?').join(',')}) GROUP BY subject_code`).all(user.sub,...subjectCodes):[];
      return ok(res,{enrollments,teachingSections,learning});
    }
    if(p==='/api/codearena/subjects')return ok(res,stmt('SELECT id,code,name,school,primary_language as primaryLanguage,faculty_name as facultyName,description,requires_coding as requiresCoding FROM subjects').all());
    if(p==='/api/codearena/problems'&&req.method==='GET'){
      const user=auth(req);
      const subjectId=u.searchParams.get('subjectId');
      const privileged=['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR'].includes(user.role);
      let rows;
      if(privileged) {
        rows=subjectId
          ? stmt('SELECT * FROM problems WHERE subject_id=? AND published=1 ORDER BY title').all(subjectId)
          : stmt('SELECT * FROM problems WHERE published=1 ORDER BY title').all();
      } else {
        rows=stmt(`SELECT DISTINCT p.* FROM problems p
          JOIN lms_course_problems cp ON cp.problem_id=p.id AND cp.published=1
          JOIN lms_sections ls ON ls.id=cp.section_id
          JOIN lms_courses c ON c.id=ls.course_id
          JOIN lms_enrollments e ON e.section_id=ls.id
          WHERE p.published=1 AND e.user_id=? AND e.enrollment_status IN ('ENROLLED','COMPLETED')
          ${subjectId ? 'AND p.subject_id=?' : ''}
          ORDER BY p.title`).all(...(subjectId ? [user.sub,subjectId] : [user.sub]));
      }
      return ok(res,rows.map(r=>({...r,starterCodes:safeJson(r.starter_codes),testCases:stmt(privileged
        ? 'SELECT id,test_case_number as testCaseNumber,input,expected_output as expectedOutput,is_hidden as isHidden,weight FROM test_cases WHERE problem_id=? ORDER BY test_case_number'
        : 'SELECT id,test_case_number as testCaseNumber,is_hidden as isHidden,weight FROM test_cases WHERE problem_id=? ORDER BY test_case_number').all(r.id)})));
    }
    if(p==='/api/codearena/problems'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);const id=randomUUID();stmt('INSERT INTO problems(id,subject_id,title,difficulty,category,points,time_limit_ms,memory_limit_mb,statement,sample_input,sample_output,starter_codes,published,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,b.subjectId,b.title,b.difficulty||'EASY',b.category||'General',b.points||100,b.timeLimitMs||2000,b.memoryLimitMb||256,b.statement,b.sampleInput||'',b.sampleOutput||'',JSON.stringify(b.starterCodes||{}),b.published===false?0:1,user.sub,now(),now());
      for(const [index,t] of (Array.isArray(b.testCases)?b.testCases:[]).entries()){const input=String(t.input??'');const expectedOutput=String(t.expectedOutput??t.expected_output??'');if(!expectedOutput && !t.allowEmptyExpected)throw Object.assign(new Error(`Test case ${index+1} expectedOutput is required`),{status:400});stmt('INSERT INTO test_cases(id,problem_id,test_case_number,input,expected_output,is_hidden,weight) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),id,index+1,input,expectedOutput,t.isHidden||t.is_hidden?1:0,Number(t.weight||1));}
      audit(user.sub,'CREATE','PROBLEM',id,{...b,testCasesCount:Array.isArray(b.testCases)?b.testCases.length:0});return ok(res,{id});}
    if(p==='/api/codearena/run'&&req.method==='POST'){const user=auth(req);const b=await body(req);const r=await dockerExecute(b.language,b.sourceCode,b.customInput||'',{time:Number(b.timeLimitMs||3000),memory:Number(b.memoryLimitMb||256)});audit(user.sub,'RUN','CODE',null,{language:b.language});return ok(res,{stdout:r.stdout,stderr:r.stderr,exitCode:r.status==='SUCCESS'?0:1,timeMs:r.timeMs,memoryMb:r.memoryMb,status:r.status});}
    if(p==='/api/codearena/evaluate'&&req.method==='POST'){const user=auth(req);const b=await body(req);const prob=stmt('SELECT * FROM problems WHERE id=?').get(b.problemId);if(!prob)throw Object.assign(new Error('Problem not found'),{status:404});if(user.role==='STUDENT') studentAssignment(user,b.problemId,b.sectionId||null,false);const privileged=['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR'].includes(user.role);const tests=stmt('SELECT * FROM test_cases WHERE problem_id=? ORDER BY test_case_number').all(prob.id);const results=[];for(const t of tests){const r=await dockerExecute(b.language,b.sourceCode,t.input,{time:prob.time_limit_ms,memory:prob.memory_limit_mb});const passed=r.status==='SUCCESS'&&norm(r.stdout)===norm(t.expected_output);const item={testCaseId:t.id,testCaseNumber:t.test_case_number,status:r.status==='SUCCESS'?(passed?'PASSED':'WRONG_ANSWER'):r.status,timeMs:r.timeMs,memoryMb:r.memoryMb,isHidden:Boolean(t.is_hidden)};if(!t.is_hidden||privileged){item.actualOutput=r.stdout;item.expectedOutput=t.expected_output;}else{item.actualOutput=passed?'Hidden (Passed)':'Hidden';item.expectedOutput='Hidden';}results.push(item);}audit(user.sub,'EVALUATE','PROBLEM',prob.id,{count:results.length});return ok(res,{results,quality:quality(b.sourceCode)});}
    if(p==='/api/codearena/submit'&&req.method==='POST'){
      const user=auth(req);const b=await body(req);const prob=stmt('SELECT * FROM problems WHERE id=?').get(b.problemId);
      if(!prob)throw Object.assign(new Error('Problem not found'),{status:404});
      const subjectCode=stmt('SELECT code FROM subjects WHERE id=?').get(prob.subject_id)?.code||'';
      let lmsSectionId=b.sectionId||null;
      let assignment=null;
      if(user.role==='STUDENT'){
        assignment=studentAssignment(user,b.problemId,lmsSectionId);
        lmsSectionId=assignment.section_id;
      }
      const examId=b.examId||null;
      if(examId){
        const ex=stmt('SELECT * FROM exams WHERE id=?').get(examId);
        if(!ex||!ex.published||Date.now()<Date.parse(ex.starts_at)||Date.now()>Date.parse(ex.ends_at))throw Object.assign(new Error('Exam is not active'),{status:409});
        const member=stmt('SELECT 1 FROM exam_problems WHERE exam_id=? AND problem_id=?').get(examId,b.problemId);if(!member)throw Object.assign(new Error('Problem is not part of this exam'),{status:403});
        const session=stmt('SELECT * FROM exam_sessions WHERE exam_id=? AND user_id=? AND locked=0').get(examId,user.sub);if(!session)throw Object.assign(new Error('Active exam session required'),{status:403});
        const elig=stmt("SELECT 1 FROM exam_eligibility WHERE user_id=? AND (subject_code=? OR subject_code='ALL') AND eligible=1 AND approved=1 LIMIT 1").get(user.sub,ex.subject_code);if(user.role==='STUDENT'&&!elig)throw Object.assign(new Error('Exam eligibility has not been approved'),{status:403});
        const count=stmt('SELECT COUNT(*) c FROM exam_submissions WHERE exam_id=? AND user_id=?').get(examId,user.sub).c;if(count>=ex.submission_limit)throw Object.assign(new Error('Submission limit reached'),{status:429});
      }
      if(process.env.CODEARENA_EXTERNAL_WORKER!=='1' && process.env.CODEARENA_DOCKER!=='1') throw Object.assign(new Error('CodeArena execution is unavailable until Docker sandboxing is enabled'),{status:503});
      const id=randomUUID();
      stmt('INSERT INTO submissions(id,user_id,problem_id,language,source_code,verdict,passed,total,runtime_ms,memory_mb,marks,created_at,quality_json,exam_id,lms_section_id,queue_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,user.sub,b.problemId,b.language,b.sourceCode,'PENDING',0,0,0,0,0,now(),JSON.stringify(quality(b.sourceCode)),examId,lmsSectionId,'QUEUED');
      if(process.env.CODEARENA_EXTERNAL_WORKER==='1'){try{await enqueueExternalSubmission(id);}catch(e){stmt("UPDATE submissions SET queue_status='SYSTEM_ERROR',verdict='SYSTEM_ERROR' WHERE id=?").run(id);audit(user.sub,'QUEUE_FAILURE','SUBMISSION',id,{error:e.message});throw e;}}else queue.enqueue(()=>processSubmission(id));
      if(examId)stmt('INSERT INTO exam_submissions VALUES(?,?,?,?)').run(examId,user.sub,id,now());
      lmsAudit(user,lmsSectionId,'CODE_SUBMISSION_CREATED',id,{problemId:b.problemId,examId});
      return ok(res,{submissionId:id,status:'QUEUED',verdict:'PENDING',lmsSectionId});
    }
    if(p.startsWith('/api/codearena/submissions/')&&req.method==='GET'){const user=auth(req);const id=p.split('/').pop();const row=stmt('SELECT * FROM submissions WHERE id=?').get(id);if(!row||row.user_id!==user.sub&&!['FACULTY','SUPER_ADMIN','COORDINATOR'].includes(user.role))throw Object.assign(new Error('Not found'),{status:404});return ok(res,{...row,quality:safeJson(row.quality_json)});}
    if(p==='/api/codearena/drafts'&&req.method==='GET'){const user=auth(req);const row=stmt('SELECT * FROM drafts WHERE user_id=? AND semester=? AND subject_code=? AND problem_id=? AND language=?').get(user.sub,u.searchParams.get('semester'),u.searchParams.get('subjectCode'),u.searchParams.get('problemId')||'',u.searchParams.get('language'));return ok(res,row||null);}
    if(p==='/api/codearena/drafts'&&req.method==='POST'){const user=auth(req);const b=await body(req);const old=stmt('SELECT * FROM drafts WHERE user_id=? AND semester=? AND subject_code=? AND problem_id=? AND language=?').get(user.sub,b.semester,b.subjectCode,b.problemId||'',b.language);const id=old?.id||randomUUID(),version=(old?.version||0)+1;if(old)stmt('UPDATE drafts SET code=?,version=?,updated_at=? WHERE id=?').run(b.code,version,now(),id);else stmt('INSERT INTO drafts(id,user_id,semester,subject_code,problem_id,language,code,version,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,user.sub,b.semester,b.subjectCode,b.problemId||'',b.language,b.code,version,now());stmt('INSERT INTO draft_versions VALUES(?,?,?,?,?)').run(randomUUID(),id,version,b.code,now());return ok(res,{id,version,updatedAt:now()});}
    if(p==='/api/codearena/draft-versions'&&req.method==='GET'){const user=auth(req);const rows=stmt('SELECT dv.* FROM draft_versions dv JOIN drafts d ON d.id=dv.draft_id WHERE d.user_id=? ORDER BY dv.saved_at DESC LIMIT 100').all(user.sub);return ok(res,rows);}
    if(p==='/api/codearena/stations'&&req.method==='GET'){auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR']);return ok(res,stmt('SELECT id,station_number,ip_address,row_name,os,cpu_cores,ram_gb,gpu_model,sandbox_runtime,status,cpu_usage_pct,ram_usage_pct,student_usn,student_name,subject_code,language,current_problem_title,session_minutes,active_minutes,idle_minutes,total_submissions,accepted_submissions,last_heartbeat,incident_notes,hardware_json FROM stations ORDER BY station_number').all());}
    if(p.match(/^\/api\/codearena\/stations\/[^/]+\/heartbeat$/)&&req.method==='POST'){const id=p.split('/')[4];const station=stmt('SELECT agent_token FROM stations WHERE id=?').get(id);if(!station)throw Object.assign(new Error('Station not found'),{status:404});if((req.headers['x-station-token']||'')!==station.agent_token && process.env.CODEARENA_ALLOW_ANONYMOUS_HEARTBEAT!=='1')throw Object.assign(new Error('Station authentication required'),{status:401});const b=await body(req);stmt('UPDATE stations SET status=?,ip_address=?,cpu_usage_pct=?,ram_usage_pct=?,student_usn=?,student_name=?,subject_code=?,language=?,current_problem_title=?,session_minutes=?,active_minutes=?,idle_minutes=?,total_submissions=?,accepted_submissions=?,last_heartbeat=?,hardware_json=? WHERE id=?').run(b.status||'OPERATIONAL',b.ipAddress||'',b.cpuUsagePct||0,b.ramUsagePct||0,b.studentUsn||null,b.studentName||null,b.subjectCode||null,b.language||null,b.currentProblemTitle||null,b.sessionMinutes||0,b.activeMinutes||0,b.idleMinutes||0,b.totalSubmissions||0,b.acceptedSubmissions||0,now(),JSON.stringify(b.hardware||{}),id);return ok(res,{ok:true,stationId:id,lastHeartbeat:now()});}
    if(p.match(/^\/api\/codearena\/stations\/[^/]+\/(reboot|reset)$/)&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','LAB_INSTRUCTOR']);const id=p.split('/')[4];const action=p.split('/').pop();if(!stmt('SELECT 1 FROM stations WHERE id=?').get(id))throw Object.assign(new Error('Station not found'),{status:404});const commandId=randomUUID();stmt('INSERT INTO station_commands VALUES(?,?,?,?,?,?,?)').run(commandId,id,action==='reboot'?'REBOOT':'RESET','QUEUED',now(),null,null);stmt('UPDATE stations SET status=? WHERE id=?').run(action==='reboot'?'REBOOTING':'RESETTING',id);audit(user.sub,'STATION_ACTION','STATION',id,{action,commandId});return ok(res,{ok:true,commandId,status:'QUEUED'});}
    if(p.match(/^\/api\/codearena\/stations\/[^/]+\/agent-credentials$/)&&req.method==='POST'){const user=auth(req,['SUPER_ADMIN']);const id=p.split('/')[4];if(!stmt('SELECT 1 FROM stations WHERE id=?').get(id))throw Object.assign(new Error('Station not found'),{status:404});const token=randomBytes(32).toString('hex');stmt('UPDATE stations SET agent_token=? WHERE id=?').run(token,id);audit(user.sub,'ROTATE_STATION_TOKEN','STATION',id,{});return ok(res,{stationId:id,token});}
    if(p.match(/^\/api\/codearena\/stations\/[^/]+\/commands$/)&&req.method==='GET'){const id=p.split('/')[4];const station=stmt('SELECT agent_token FROM stations WHERE id=?').get(id);if(!station)throw Object.assign(new Error('Station not found'),{status:404});if((req.headers['x-station-token']||'')!==station.agent_token)throw Object.assign(new Error('Station authentication required'),{status:401});return ok(res,stmt("SELECT id,command,created_at FROM station_commands WHERE station_id=? AND status='QUEUED' ORDER BY created_at LIMIT 5").all(id));}
    if(p.match(/^\/api\/codearena\/stations\/[^/]+\/commands\/[^/]+\/ack$/)&&req.method==='POST'){const parts=p.split('/');const stationId=parts[4],commandId=parts[6];const station=stmt('SELECT agent_token FROM stations WHERE id=?').get(stationId);if(!station||req.headers['x-station-token']!==station.agent_token)throw Object.assign(new Error('Station authentication required'),{status:401});const b=await body(req);stmt('UPDATE station_commands SET status=?,acknowledged_at=?,result=? WHERE id=? AND station_id=?').run(b.status==='SUCCESS'?'COMPLETED':'FAILED',now(),b.result||'',commandId,stationId);if(b.status==='SUCCESS')stmt('UPDATE stations SET status=? WHERE id=?').run('OPERATIONAL',stationId);return ok(res,{ok:true});}
    if(p==='/api/codearena/stations/reset'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','LAB_INSTRUCTOR']);stmt('UPDATE stations SET status=CASE WHEN status=\'MAINTENANCE\' THEN status ELSE \'OPERATIONAL\' END,student_usn=NULL,student_name=NULL,current_problem_title=NULL').run();audit(user.sub,'RESET_ALL','STATION','ALL',{});return ok(res,{ok:true});}
    if(p==='/api/codearena/tickets'&&req.method==='GET'){auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR']);return ok(res,stmt('SELECT * FROM tickets ORDER BY reported_at DESC').all());}
    if(p==='/api/codearena/tickets'&&req.method==='POST'){const user=auth(req);const b=await body(req);const id=randomUUID();stmt('INSERT INTO tickets VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,b.stationId,b.category||'OTHER',b.severity||'LOW',b.description,user.sub,now(),'OPEN',null,null);audit(user.sub,'CREATE','TICKET',id,b);return ok(res,{id,status:'OPEN'});}
    if(p.match(/^\/api\/codearena\/tickets\/[^/]+\/(resolve|assign)$/)&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','LAB_INSTRUCTOR']);const id=p.split('/')[4],action=p.split('/').pop(),b=await body(req);stmt('UPDATE tickets SET status=?,assigned_to=?,resolved_at=? WHERE id=?').run(action==='resolve'?'RESOLVED':'ASSIGNED',b.assignedTo||user.sub,action==='resolve'?now():null,id);return ok(res,{ok:true});}
    if(p==='/api/codearena/time-records'){const user=auth(req);const rows=stmt("SELECT * FROM time_records WHERE usn=? OR ? IN ('FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR')").all(user.usn,user.role);return ok(res,rows);}
    if(p==='/api/codearena/time'&&req.method==='POST'){const user=auth(req);const b=await body(req);const existing=stmt('SELECT * FROM time_records WHERE usn=? AND subject_code=?').get(user.usn,b.subjectCode);const minutes=Number(b.minutes||0);if(existing)stmt('UPDATE time_records SET total_hours=total_hours+?,weekly_hours=weekly_hours+?,active_ratio=?,submissions=submissions+?,accuracy=?,last_active=?,status=? WHERE usn=? AND subject_code=?').run(minutes/60,minutes/60,b.activeRatio||existing.active_ratio,b.submissions||0,b.accuracy||existing.accuracy,now(),b.status||'ACTIVE',user.usn,b.subjectCode);else stmt('INSERT INTO time_records VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(user.usn,user.name,b.school||'',b.subjectCode,b.subjectName||'',minutes/60,minutes/60,b.activeRatio||1,b.submissions||0,b.accuracy||0,b.assignedStation||'',now(),b.status||'ACTIVE');stmt('INSERT INTO learning_events VALUES(?,?,?,?,?,?,?)').run(randomUUID(),user.sub,b.subjectCode,'CODING',minutes,JSON.stringify(b),now());return ok(res,{ok:true});}
    if(p==='/api/codearena/plagiarism'){auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);return ok(res,stmt('SELECT pr.*,s.source_code,s.user_id FROM plagiarism_reviews pr JOIN submissions s ON s.id=pr.submission_id ORDER BY pr.similarity DESC').all());}
    if(p==='/api/codearena/plagiarism-audit'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);const subs=stmt(`SELECT * FROM submissions ${b.problemId?'WHERE problem_id=?':''} ORDER BY created_at DESC LIMIT 300`).all(...(b.problemId?[b.problemId]:[]));const out=[];for(let i=0;i<subs.length;i++)for(let j=i+1;j<subs.length;j++){const analysis=analyzePlagiarism(subs[i].source_code,subs[j].source_code);const score=analysis.score;if(score>=55){const id=randomUUID();const evidence={engine:'language-agnostic structural token + Winnowing',hashMatches:analysis.winnowingHashMatchCount,tokensA:analysis.tokensA,tokensB:analysis.tokensB,flaggedLogicClones:analysis.flaggedLogicClones};stmt('INSERT INTO plagiarism_reviews VALUES(?,?,?,?,?,?,?,?)').run(id,subs[i].id,subs[j].id,score,JSON.stringify(evidence),'PENDING',null,null);out.push({id,submissionId:subs[i].id,comparedSubmissionId:subs[j].id,similarity:score,structuralSimilarityPercentage:score,winnowingHashMatchCount:analysis.winnowingHashMatchCount,flaggedLogicClones:analysis.flaggedLogicClones,status:'PENDING',evidence});}}audit(user.sub,'PLAGIARISM_AUDIT','SUBMISSION',b.problemId||'ALL',{pairs:out.length});return ok(res,out);}
    if(p.match(/^\/api\/codearena\/plagiarism-reviews\/[^/]+$/)&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const id=p.split('/').pop(),b=await body(req);stmt('UPDATE plagiarism_reviews SET status=?,reviewed_by=?,reviewed_at=? WHERE id=?').run(b.status||'REVIEWED',user.sub,now(),id);return ok(res,{ok:true});}
    if(p==='/api/codearena/analytics'){auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR']);return ok(res,{submissions:stmt('SELECT COUNT(*) c FROM submissions').get().c,accepted:stmt("SELECT COUNT(*) c FROM submissions WHERE verdict='ACCEPTED'").get().c,students:stmt('SELECT COUNT(DISTINCT user_id) c FROM submissions').get().c,onlineStations:stmt("SELECT COUNT(*) c FROM stations WHERE status NOT IN ('OFFLINE','MAINTENANCE') AND last_heartbeat>datetime('now','-30 seconds')").get().c,queue:queue.pending.length+queue.running,avgMarks:stmt('SELECT COALESCE(AVG(marks),0) v FROM submissions WHERE queue_status=\'COMPLETED\'').get().v});}
    if(p==='/api/codearena/learning-insights'){const user=auth(req);const minHours=Number(process.env.CODEARENA_MIN_LEARNING_HOURS||5);const rows=stmt('SELECT su.code subject_code,COUNT(*) submissions,AVG(s.marks) avgMarks FROM submissions s JOIN problems p ON p.id=s.problem_id JOIN subjects su ON su.id=p.subject_id WHERE s.user_id=? GROUP BY su.code').all(user.sub);const weak=rows.filter(x=>Number(x.avgMarks||0)<60).map(x=>x.subject_code);for(const subjectCode of weak){const exists=stmt('SELECT id FROM remedial_assignments WHERE user_id=? AND subject_code=? AND status!=\'COMPLETED\'').get(user.sub,subjectCode);if(!exists)stmt('INSERT OR IGNORE INTO remedial_assignments VALUES(?,?,?,?,?,?,?,?,?)').run(randomUUID(),user.sub,subjectCode,'Weak-topic remedial practice',30,0,'REQUIRED',now(),null);}const hours=Number(stmt('SELECT COALESCE(SUM(total_hours),0) h FROM time_records WHERE usn=?').get(user.usn)?.h||0);const remedial=stmt('SELECT * FROM remedial_assignments WHERE user_id=? AND status!=\'COMPLETED\'').all(user.sub);const autoEligible=hours>=minHours&&remedial.length===0;const approvals=stmt('SELECT * FROM exam_eligibility WHERE user_id=? ORDER BY updated_at DESC').all(user.sub);const approved=approvals.length?approvals.every(x=>Number(x.approved)===1):false;return ok(res,{hours,minLearningHours:minHours,weakTopics:weak,remedialRequired:remedial.length>0,remedialAssignments:remedial,autoEligible,facultyApproved:approved,approvalRequired:true,examEligible:autoEligible&&approved,subjects:rows});}
    if(p==='/api/codearena/remedial'){const user=auth(req);return ok(res,stmt('SELECT * FROM remedial_assignments WHERE user_id=? ORDER BY created_at DESC').all(user.sub));}
    if(p==='/api/codearena/remedial/complete'&&req.method==='POST'){const user=auth(req);const b=await body(req);const a=stmt('SELECT * FROM remedial_assignments WHERE id=? AND user_id=?').get(b.id,user.sub);if(!a)throw Object.assign(new Error('Remedial assignment not found'),{status:404});const minutes=Math.max(0,Number(b.minutes||a.required_minutes));const done=Math.min(Number(a.required_minutes||30),Number(a.completed_minutes||0)+minutes);const status=done>=Number(a.required_minutes||30)?'COMPLETED':'IN_PROGRESS';stmt('UPDATE remedial_assignments SET completed_minutes=?,status=?,completed_at=? WHERE id=?').run(done,status,status==='COMPLETED'?now():null,a.id);stmt('INSERT INTO learning_events VALUES(?,?,?,?,?,?,?)').run(randomUUID(),user.sub,a.subject_code,'REMEDIAL',minutes,JSON.stringify({assignmentId:a.id}),now());return ok(res,{ok:true,status,completedMinutes:done});}
    if(p==='/api/codearena/eligibility'&&req.method==='GET'){const user=auth(req);return ok(res,stmt('SELECT * FROM exam_eligibility WHERE user_id=? ORDER BY subject_code').all(user.sub));}
    if(p==='/api/codearena/eligibility/approve'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);const target=stmt('SELECT id FROM users WHERE usn=? OR id=?').get(b.usn||'',b.userId||'');if(!target)throw Object.assign(new Error('Student not found'),{status:404});const subject=b.subjectCode||'ALL';const existingEligibility=stmt('SELECT user_id FROM exam_eligibility WHERE user_id=? AND subject_code=?').get(target.id,subject);if(existingEligibility)stmt('UPDATE exam_eligibility SET eligible=1,approved=1,approved_by=?,approved_at=?,reason=?,updated_at=? WHERE user_id=? AND subject_code=?').run(user.sub,now(),b.reason||'Faculty approval',now(),target.id,subject);else stmt('INSERT INTO exam_eligibility VALUES(?,?,?,?,?,?,?,?)').run(target.id,subject,1,1,user.sub,now(),b.reason||'Faculty approval',now());audit(user.sub,'APPROVE_EXAM_ELIGIBILITY','USER',target.id,{subjectCode:subject,reason:b.reason||''});return ok(res,{ok:true,userId:target.id,subjectCode:subject,approvedBy:user.sub});}

    if(p==='/api/codearena/broadcasts'&&req.method==='GET')return ok(res,stmt('SELECT * FROM broadcasts WHERE active=1 ORDER BY created_at DESC').all());
    if(p==='/api/codearena/broadcasts'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','LAB_INSTRUCTOR']);const b=await body(req);const id=randomUUID();stmt('INSERT INTO broadcasts VALUES(?,?,?,?,?,?)').run(id,b.message,b.severity||'INFO',user.sub,now(),1);for(const u of stmt('SELECT id FROM users WHERE active=1').all())notify(u.id,'CodeArena Lab Broadcast',b.message,b.severity||'INFO');return ok(res,{id});}
    if(p==='/api/codearena/notifications'){const user=auth(req);return ok(res,stmt('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(user.sub));}
    if(p.match(/^\/api\/codearena\/notifications\/[^/]+\/read$/)&&req.method==='POST'){const user=auth(req);stmt('UPDATE notifications SET read_at=? WHERE id=? AND user_id=?').run(now(),p.split('/')[4],user.sub);return ok(res,{ok:true});}
    if(p==='/api/codearena/exams'&&req.method==='GET'){auth(req);return ok(res,stmt('SELECT * FROM exams ORDER BY starts_at DESC').all());}
    if(p==='/api/codearena/exams'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);const id=randomUUID();stmt('INSERT INTO exams VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,b.title,b.subjectCode,b.startsAt,b.endsAt,'SCHEDULED',b.submissionLimit||5,b.autoSubmit===false?0:1,b.published?1:0,user.sub,now());for(const pid of b.problemIds||[])stmt('INSERT INTO exam_problems VALUES(?,?,?)').run(id,pid,(b.problemIds||[]).indexOf(pid)+1);audit(user.sub,'CREATE','EXAM',id,b);return ok(res,{id});}
    if(p.match(/^\/api\/codearena\/exams\/[^/]+\/publish$/)&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const id=p.split('/')[4];stmt('UPDATE exams SET published=1,status=\'PUBLISHED\' WHERE id=?').run(id);audit(user.sub,'PUBLISH','EXAM',id,{});return ok(res,{ok:true});}
    if(p.match(/^\/api\/codearena\/exams\/[^/]+\/start$/)&&req.method==='POST'){const user=auth(req);const id=p.split('/')[4],ex=stmt('SELECT * FROM exams WHERE id=? AND published=1').get(id);if(!ex)throw Object.assign(new Error('Exam not found'),{status:404});if(Date.now()<Date.parse(ex.starts_at)||Date.now()>Date.parse(ex.ends_at))throw Object.assign(new Error('Exam is outside its active window'),{status:409});if(user.role==='STUDENT'){const enrolled=stmt("SELECT 1 FROM lms_enrollments e JOIN lms_sections s ON s.id=e.section_id JOIN lms_courses c ON c.id=s.course_id WHERE e.user_id=? AND c.course_code=? AND e.enrollment_status IN ('ENROLLED','COMPLETED') LIMIT 1").get(user.sub,ex.subject_code);if(!enrolled)throw Object.assign(new Error('Active LMS enrollment is required for this course exam'),{status:403});const elig=stmt("SELECT * FROM exam_eligibility WHERE user_id=? AND (subject_code=? OR subject_code='ALL') AND eligible=1 AND approved=1 LIMIT 1").get(user.sub,ex.subject_code);if(!elig)throw Object.assign(new Error('Exam eligibility requires completed learning/remedial criteria and faculty approval'),{status:403});}const existingSession=stmt('SELECT id FROM exam_sessions WHERE exam_id=? AND user_id=?').get(id,user.sub);const sessionId=existingSession?.id||randomUUID();if(existingSession)stmt('UPDATE exam_sessions SET last_seen_at=?,locked=0 WHERE id=?').run(now(),sessionId);else stmt('INSERT INTO exam_sessions VALUES(?,?,?,?,?,?,?)').run(sessionId,id,user.sub,now(),now(),null,0);return ok(res,{sessionId,exam:ex});}
    if(p==='/api/codearena/question-bank'&&req.method==='GET'){auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);return ok(res,stmt('SELECT p.*,COUNT(t.id) testcase_count FROM problems p LEFT JOIN test_cases t ON t.problem_id=p.id GROUP BY p.id ORDER BY p.updated_at DESC').all());}
    if(p==='/api/codearena/gradebook'&&req.method==='GET'){const user=auth(req);const rows=['FACULTY','SUPER_ADMIN','COORDINATOR'].includes(user.role)?stmt('SELECT * FROM gradebook ORDER BY updated_at DESC').all():stmt('SELECT * FROM gradebook WHERE user_id=? ORDER BY updated_at DESC').all(user.sub);return ok(res,rows);}
    if(p==='/api/codearena/gradebook/override'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);stmt('UPDATE gradebook SET marks=?,overridden=1,updated_at=? WHERE id=? AND locked=0').run(b.marks,now(),b.id);audit(user.sub,'GRADE_OVERRIDE','GRADEBOOK',b.id,b);return ok(res,{ok:true});}
    if(p==='/api/codearena/gradebook/lock'&&req.method==='POST'){const user=auth(req,['FACULTY','SUPER_ADMIN','COORDINATOR']);const b=await body(req);stmt('UPDATE gradebook SET locked=1,updated_at=? WHERE id=?').run(now(),b.id);audit(user.sub,'GRADE_LOCK','GRADEBOOK',b.id,{});return ok(res,{ok:true});}
    if(p==='/api/internal/worker/claim'&&req.method==='POST'){
      if((req.headers['x-worker-secret']||'')!=(process.env.CODEARENA_WORKER_SECRET||'change-me-in-production'))throw Object.assign(new Error('Forbidden'),{status:403});
      const b=await body(req);
      const row=b.id?stmt("SELECT s.*,p.title,p.points,p.time_limit_ms,p.memory_limit_mb FROM submissions s JOIN problems p ON p.id=s.problem_id WHERE s.id=? AND s.queue_status='QUEUED'").get(b.id):stmt("SELECT s.*,p.title,p.points,p.time_limit_ms,p.memory_limit_mb FROM submissions s JOIN problems p ON p.id=s.problem_id WHERE s.queue_status='QUEUED' ORDER BY s.created_at LIMIT 1").get();
      if(!row)return ok(res,{job:null});
      const claimed=stmt("UPDATE submissions SET queue_status='RUNNING',queue_started_at=? WHERE id=? AND queue_status='QUEUED'").run(now(),row.id);
      if(!claimed.changes)return ok(res,{job:null});
      const tests=stmt('SELECT id,test_case_number,input,expected_output,is_hidden,weight FROM test_cases WHERE problem_id=? ORDER BY test_case_number').all(row.problem_id);
      return ok(res,{job:{id:row.id,sourceCode:row.source_code,language:row.language,problemId:row.problem_id,points:row.points,timeLimitMs:row.time_limit_ms,memoryLimitMb:row.memory_limit_mb,tests}});
    }
    if(p==='/api/internal/worker/requeue'&&req.method==='POST'){
      if((req.headers['x-worker-secret']||'')!==(process.env.CODEARENA_WORKER_SECRET||'change-me-in-production'))throw Object.assign(new Error('Forbidden'),{status:403});
      const b=await body(req);const id=String(b.id||'');if(!id)throw Object.assign(new Error('Submission id required'),{status:400});
      const changed=stmt("UPDATE submissions SET queue_status='QUEUED',queue_started_at=NULL,verdict='PENDING' WHERE id=? AND queue_status='RUNNING'").run(id);
      if(changed.changes) await enqueueExternalSubmission(id);
      return ok(res,{ok:true,requeued:Boolean(changed.changes)});
    }
    if(p==='/api/internal/worker/complete'&&req.method==='POST'){if((req.headers['x-worker-secret']||'')!==(process.env.CODEARENA_WORKER_SECRET||'change-me-in-production'))throw Object.assign(new Error('Forbidden'),{status:403});const b=await body(req);const row=stmt('SELECT s.*,p.title,p.points,p.subject_id FROM submissions s JOIN problems p ON p.id=s.problem_id WHERE s.id=?').get(b.id);if(!row)throw Object.assign(new Error('Submission not found'),{status:404});const marks=Number(b.marks||0);stmt('UPDATE submissions SET verdict=?,passed=?,total=?,runtime_ms=?,memory_mb=?,marks=?,queue_status=\'COMPLETED\',queue_started_at=NULL WHERE id=?').run(b.verdict,b.passed||0,b.total||0,b.runtimeMs||0,b.memoryMb||0,marks,b.id);const subjectCode=stmt('SELECT code FROM subjects WHERE id=?').get(row.subject_id)?.code||'';const existingGrade=stmt('SELECT id FROM gradebook WHERE user_id=? AND assessment_type=? AND assessment_id=?').get(row.user_id,'CODEARENA',row.problem_id);if(existingGrade)stmt('UPDATE gradebook SET marks=?,max_marks=?,updated_at=? WHERE id=? AND locked=0').run(marks,row.points,now(),existingGrade.id);else stmt('INSERT INTO gradebook VALUES(?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),row.user_id,subjectCode,'CODEARENA',row.problem_id,marks,row.points,0,0,now());notify(row.user_id,'Submission evaluated',`${row.title}: ${b.verdict} (${marks}/${row.points})`,b.verdict==='ACCEPTED'?'SUCCESS':'WARNING');audit(row.user_id,'SUBMIT','SUBMISSION',b.id,{verdict:b.verdict,passed:b.passed,total:b.total,worker:'external'});return ok(res,{ok:true});}
    if(p==='/api/code/session/start'&&req.method==='POST'){
      const user=auth(req); const b=await body(req);
      const sessionId=await startInteractiveDocker(b.language,b.code,b.stdin||'');
      const session=interactiveSessions.get(sessionId); if(session)session.userId=user.sub;
      audit(user.sub,'START','CODE_SESSION',sessionId,{language:b.language});
      return ok(res,{sessionId});
    }
    if(p==='/api/code/session/input'&&req.method==='POST'){
      const user=auth(req); const b=await body(req); const session=interactiveSessions.get(b.id);
      if(!session||session.userId!==user.sub)throw Object.assign(new Error('Interactive session not found'),{status:404});
      if(session.child.stdin.destroyed)throw Object.assign(new Error('Interactive session stdin is closed'),{status:409});
      session.child.stdin.write(String(b.input||''));
      return ok(res,{ok:true});
    }
    if(p==='/api/code/session/kill'&&req.method==='POST'){
      const user=auth(req); const b=await body(req); const session=interactiveSessions.get(b.id);
      if(!session||session.userId!==user.sub)throw Object.assign(new Error('Interactive session not found'),{status:404});
      session.child.kill('SIGKILL'); return ok(res,{ok:true});
    }
    if(p==='/api/code/session/stream'&&req.method==='GET'){
      const token=u.searchParams.get('access_token')||''; const streamUser=verifyToken(token);
      const id=u.searchParams.get('id'); const session=interactiveSessions.get(id);
      if(!streamUser||!session||session.userId!==streamUser.sub)throw Object.assign(new Error('Interactive session not found'),{status:404});
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':process.env.CODEARENA_CORS_ORIGIN||'*'});
      session.subscribers.add(res); res.write(`data: ${JSON.stringify({type:'ready'})}\n\n`);
      if (session.buffer) { for (const msg of session.buffer) { try { res.write(msg); } catch {} } }
      req.on('close',()=>session.subscribers.delete(res)); return;
    }
    if(p==='/api/codearena/stream-token'&&req.method==='POST'){const user=auth(req);const bodyToken=signToken({sub:user.sub,name:user.name,role:user.role,usn:user.usn,scope:'stream'},60*1000);return ok(res,{token:bodyToken,expiresInSeconds:60});}
    if(p==='/api/codearena/stream'){const streamToken=u.searchParams.get('access_token')||'';const streamUser=verifyToken(streamToken);if(!streamUser||streamUser.scope!=='stream')throw Object.assign(new Error('Stream authentication required'),{status:401});const user=streamUser;res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':process.env.CODEARENA_CORS_ORIGIN||'*'});res.write(`event: ready\ndata: ${JSON.stringify({user:user.sub,time:now()})}\n\n`);const timer=setInterval(async()=>{res.write(`event: heartbeat\ndata: ${JSON.stringify({queue:{pending:queue.pending.length,running:queue.running,redisPending:await redisQueueLength()},time:now()})}\n\n`);},5000);req.on('close',()=>clearInterval(timer));return;}
    if(p==='/api/codearena/system-errors'&&req.method==='GET'){auth(req,['SUPER_ADMIN','COORDINATOR']);return ok(res,stmt('SELECT * FROM system_errors ORDER BY created_at DESC LIMIT 500').all());}
    if(p.match(/^\/api\/codearena\/system-errors\/[^/]+\/resolve$/)&&req.method==='POST'){const user=auth(req,['SUPER_ADMIN','COORDINATOR']);const id=p.split('/')[4];stmt('UPDATE system_errors SET resolved=1,resolved_by=?,resolved_at=? WHERE id=?').run(user.sub,now(),id);return ok(res,{ok:true});}
    if(p==='/api/codearena/health/summary'){auth(req,['FACULTY','SUPER_ADMIN','LAB_INSTRUCTOR']);const offline=stmt("SELECT * FROM stations WHERE last_heartbeat<datetime('now','-30 seconds') AND status NOT IN ('MAINTENANCE','OFFLINE')").all();for(const s of offline)stmt('UPDATE stations SET status=\'OFFLINE\' WHERE id=?').run(s.id);return ok(res,{offlineStations:offline.map(s=>s.id),tickets:stmt("SELECT COUNT(*) c FROM tickets WHERE status NOT IN ('RESOLVED','CLOSED')").get().c});}
    return fail(res,Object.assign(new Error('Not found'),{status:404}));
  }catch(e){logSystemError(e,req);return fail(res,e);}
}

setInterval(()=>{try{
  const cutoff=new Date(Date.now()-15*60*1000).toISOString();
  const stale=stmt("SELECT id FROM submissions WHERE queue_status='RUNNING' AND queue_started_at IS NOT NULL AND queue_started_at<?").all(cutoff);
  for(const r of stale){stmt("UPDATE submissions SET queue_status='QUEUED',queue_started_at=NULL,verdict='PENDING' WHERE id=? AND queue_status='RUNNING'").run(r.id);if(process.env.CODEARENA_EXTERNAL_WORKER==='1') void enqueueExternalSubmission(r.id).catch(()=>{});}
}catch{}} ,30000);
setInterval(()=>{try{const rows=stmt("SELECT id FROM stations WHERE last_heartbeat < datetime('now','-30 seconds') AND status NOT IN ('MAINTENANCE','OFFLINE')").all();for(const r of rows)stmt("UPDATE stations SET status='OFFLINE' WHERE id=?").run(r.id);}catch{}},10000);
const startServer = async () => {
  const selectedPort = process.env.CODEARENA_PORT ? Number(process.env.CODEARENA_PORT) : await resolvePort(PORT);
  http.createServer(handle).listen(selectedPort, HOST, () => console.log(`CodeArena API listening on http://${HOST}:${selectedPort}`));
};

void startServer();
