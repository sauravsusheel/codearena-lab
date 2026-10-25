import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

export const SANDBOX_IMAGES = {
  python: 'python:3.12-alpine', javascript: 'node:20-alpine', typescript: 'codearena/typescript:5.9',
  cpp: 'gcc:13', c: 'gcc:13', java: 'eclipse-temurin:21-jdk', go: 'golang:1.22-alpine',
  rust: 'rust:1.89-slim-bookworm', csharp: 'mcr.microsoft.com/dotnet/sdk:8.0-alpine', php: 'php:8.3-cli-alpine',
  ruby: 'ruby:3.3-alpine', kotlin: 'zenika/kotlin:2.0-jdk21', swift: 'swift:6.0-jammy', dart: 'dart:stable',
  r: 'r-base:4.4-bookworm', bash: 'bash:5.2-alpine', lua: 'lua:5.4-alpine', sql: 'python:3.12-alpine',
  html: 'python:3.12-alpine', css: 'python:3.12-alpine'
};

export const LANGUAGE_FILES = {
  python:'main.py', javascript:'main.js', typescript:'main.ts', cpp:'main.cpp', c:'main.c', java:'Solution.java',
  go:'main.go', rust:'main.rs', csharp:'Program.cs', php:'main.php', ruby:'main.rb', kotlin:'Main.kt', swift:'main.swift',
  dart:'main.dart', r:'main.R', bash:'main.sh', lua:'main.lua', sql:'main.sql', html:'index.html', css:'style.css'
};

const compileRun = {
  python: 'python3 /work/main.py', javascript: 'node /work/main.js',
  typescript: 'tsc --target ES2022 --module commonjs --strict false --outDir /work/out /work/main.ts && node /work/out/main.js',
  cpp: 'mkdir -p /work/bin && g++ -std=c++20 -O2 -pipe /work/main.cpp -o /work/bin/main && /work/bin/main',
  c: 'mkdir -p /work/bin && gcc -std=c17 -O2 -pipe /work/main.c -o /work/bin/main && /work/bin/main',
  java: 'javac /work/Solution.java && java -cp /work Solution',
  go: 'mkdir -p /work/bin && GOCACHE=/tmp/go-cache go build -o /work/bin/main /work/main.go && /work/bin/main',
  rust: 'mkdir -p /work/bin && rustc -O /work/main.rs -o /work/bin/main && /work/bin/main',
  csharp: 'mkdir -p /work/out && printf "%s\\n" "<Project Sdk=\"Microsoft.NET.Sdk\"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup></Project>" > /work/CodeArena.csproj && dotnet build /work/CodeArena.csproj -c Release -o /work/out --nologo --ignore-failed-sources && dotnet /work/out/CodeArena.dll',
  php: 'php /work/main.php', ruby: 'ruby /work/main.rb',
  kotlin: 'mkdir -p /work/bin && kotlinc /work/Main.kt -include-runtime -d /work/bin/main.jar && java -jar /work/bin/main.jar',
  swift: 'mkdir -p /work/bin && swiftc /work/main.swift -o /work/bin/main && /work/bin/main',
  dart: 'dart /work/main.dart', r: 'Rscript /work/main.R', bash: 'bash /work/main.sh', lua: 'lua /work/main.lua',
  sql: `python3 /work/sql_runner.py`,
  html: `python3 /work/markup_validator.py html`,
  css: `python3 /work/markup_validator.py css`
};

function sqlRunner() {
  return `import sqlite3,sys
p='/work/main.sql'
s=open(p,encoding='utf8').read()
db=sqlite3.connect(':memory:')
try:
    cur=db.cursor(); cur.executescript(s)
    rows=[]
    # Report the final SELECT/result-producing statement without exposing the DB host.
    parts=[x.strip() for x in s.split(';') if x.strip()]
    for q in reversed(parts):
        if q.lower().startswith(('select','with','pragma','explain')):
            cur.execute(q); rows=cur.fetchall();
            for r in rows: print('\t'.join('' if v is None else str(v) for v in r))
            break
    print('SQL execution completed', file=sys.stderr)
finally: db.close()`;
}
function markupValidator() {
  return `from pathlib import Path
import sys,re
kind=sys.argv[1]; p=Path('/work/index.html' if kind=='html' else '/work/style.css'); s=p.read_text(encoding='utf8')
if kind=='html':
    ok=bool(re.search(r'<html\\b[^>]*>.*</html\\s*>',s,re.I|re.S)) and bool(re.search(r'<body\\b',s,re.I))
    print('HTML validation passed' if ok else 'HTML validation failed')
    raise SystemExit(0 if ok else 1)
print('CSS validation passed' if s.strip() else 'CSS validation failed')
raise SystemExit(0 if s.strip() else 1)`;
}

export function commandFor(language) {
  if (!SANDBOX_IMAGES[language] || !LANGUAGE_FILES[language]) throw new Error(`Unsupported language: ${language}`);
  return { image: SANDBOX_IMAGES[language], file: LANGUAGE_FILES[language], script: compileRun[language] };
}

function spawnProcess(cmd,args,{input='',timeoutMs=5000,maxOutput=1000000,onStart=()=>{},onStdout=()=>{},onStderr=()=>{}}={}) {
  return new Promise(resolve=>{
    const started=Date.now(); let out='',err='',timedOut=false,outputLimit=false;
    let p;
    try {
      p=spawn(cmd,args,{stdio:['pipe','pipe','pipe']});
    } catch(e) {
      return resolve({code:-1,stdout:'',stderr:e.message,timeMs:0,timedOut:false,outputLimit:false,processError:true});
    }
    onStart(p);
    const kill=()=>{try{p.kill('SIGKILL')}catch{}};
    const timer=setTimeout(()=>{timedOut=true;kill()},timeoutMs);
    const take=(target,chunk,fn)=>{const s=chunk.toString(); if(target==='out')out+=s; else err+=s; fn(s); if(out.length+err.length>maxOutput&&!outputLimit){outputLimit=true;kill()}};
    p.stdout?.on('data',d=>take('out',d,onStdout)); p.stderr?.on('data',d=>take('err',d,onStderr));
    p.on('error',e=>{clearTimeout(timer);resolve({code:-1,stdout:out,stderr:e.message,timeMs:Date.now()-started,timedOut,outputLimit,processError:true})});
    p.on('close',code=>{clearTimeout(timer);resolve({code,stdout:out,stderr:err,timeMs:Date.now()-started,timedOut,outputLimit})});
    if(input && p.stdin) { try { p.stdin.write(input); p.stdin.end(); } catch {} }
  });
}

function parseMemoryUsage(text){const m=String(text||'').match(/([0-9.]+)\s*(B|KiB|MiB|GiB|KB|MB|GB)/i);if(!m)return 0;const n=Number(m[1]),u=m[2].toUpperCase();const mult=u==='B'?1:['KIB','KB'].includes(u)?1024:['MIB','MB'].includes(u)?1024**2:1024**3;return n*mult/1024/1024;}
async function dockerMemoryMb(name){const r=await spawnProcess('docker',['stats','--no-stream','--format','{{.MemUsage}}',name],{timeoutMs:1500,maxOutput:2000});return r.code===0?parseMemoryUsage(r.stdout.split('/')[0]):0;}

async function dockerInspectState(name) {
  const r=await spawnProcess('docker',['inspect','--format','{{json .State}}',name],{timeoutMs:3000,maxOutput:20000});
  if(r.code!==0) return null;
  try{return JSON.parse(r.stdout.trim())}catch{return null}
}

export async function runDocker(language, source, input='', limits={time:2000,memory:256}, options={}) {
  const spec=commandFor(language);
  const id=randomUUID(), name=`codearena-${id}`;
  const sourceFiles=new Map([[spec.file,source]]);
  if(language==='sql') sourceFiles.set('sql_runner.py',sqlRunner());
  if(language==='html'||language==='css') sourceFiles.set('markup_validator.py',markupValidator());
  const extraFiles=[...sourceFiles.keys()];
  const stage=extraFiles.map(f=>`cp /tmp/${f} /work/${f}`).join(' && ');
  const runtimeScript=`mkdir -p /work && ${stage} && ${spec.script}`;
  const args=['create','--name',name,'--network','none','--read-only','--pids-limit','64','--cpus',String(Math.max(0.1,Number(limits.cpu||1))),'--memory',`${Math.max(16,Number(limits.memory||256))}m`,'--memory-swap',`${Math.max(16,Number(limits.memory||256))}m`,'--cap-drop','ALL','--security-opt','no-new-privileges','--user','1000:1000','--ulimit','nofile=256:256','--ulimit','nproc=64:64','--tmpfs','/tmp:rw,noexec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777','--tmpfs','/work:rw,exec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777','-w','/work','-e','HOME=/tmp','-e','TMPDIR=/tmp',spec.image,'sh','-lc','sleep 600'];
  if(process.env.CODEARENA_SANDBOX_RUNTIME) { const idx=args.indexOf(spec.image); args.splice(idx,0,'--runtime',process.env.CODEARENA_SANDBOX_RUNTIME); }
  try {
    const created=await spawnProcess('docker',args,{timeoutMs:10000,maxOutput:20000});
    if(created.code!==0) return {status:'SYSTEM_ERROR',stdout:'',stderr:created.stderr||created.stdout,timeMs:created.timeMs,memoryMb:0,oomKilled:false};
    const started=await spawnProcess('docker',['start',name],{timeoutMs:10000,maxOutput:20000});
    if(started.code!==0) return {status:'SYSTEM_ERROR',stdout:'',stderr:started.stderr||started.stdout,timeMs:started.timeMs,memoryMb:0,oomKilled:false};
    for(const file of extraFiles) {
      const staged=await spawnProcess('docker',['exec','-i',name,'sh','-c',`cat > /tmp/${file}`],{input:sourceFiles.get(file),timeoutMs:10000,maxOutput:20000});
      if(staged.code!==0) return {status:'SYSTEM_ERROR',stdout:'',stderr:staged.stderr||staged.stdout,timeMs:created.timeMs+staged.timeMs,memoryMb:0,oomKilled:false};
    }
    let peakMemoryMb=0; let sampling=true;
    const sampler=(async()=>{while(sampling){peakMemoryMb=Math.max(peakMemoryMb,await dockerMemoryMb(name));await new Promise(r=>setTimeout(r,100));}})();
    const r=await spawnProcess('docker',['exec','-i',name,'sh','-lc',runtimeScript],{input,timeoutMs:Number(limits.time||2000)+5000,maxOutput:Number(limits.maxOutput||1000000)});
    sampling=false; await sampler.catch(()=>{});
    if(r.timedOut) await spawnProcess('docker',['kill',name],{timeoutMs:2000,maxOutput:1000});
    const state=await dockerInspectState(name);
    const oom=Boolean(state?.OOMKilled) || r.code===137;
    let status='SUCCESS';
    if(r.outputLimit) status='OUTPUT_LIMIT_EXCEEDED';
    else if(r.timedOut) status='TIME_LIMIT_EXCEEDED';
    else if(oom) status='MEMORY_LIMIT_EXCEEDED';
    else if(r.code===0) status='SUCCESS';
    else if(r.processError) status='SYSTEM_ERROR';
    else if(['typescript','csharp','rust','cpp','c','go','java','kotlin','swift'].includes(language)) status=(r.stderr||'').match(/error:|error CS|compilation failed|could not find|unresolved reference/i)?'COMPILATION_ERROR':'RUNTIME_ERROR';
    else status='RUNTIME_ERROR';
    return {status,stdout:r.stdout,stderr:r.stderr,timeMs:r.timeMs,memoryMb:Math.round(peakMemoryMb || Number(options.peakMemoryMb||0)),oomKilled:oom};
  } catch(e) {
    return {status:'SYSTEM_ERROR',stdout:'',stderr:e.message||'Sandbox unavailable',timeMs:0,memoryMb:0,oomKilled:false};
  } finally {
    await spawnProcess('docker',['rm','-f',name],{timeoutMs:3000,maxOutput:2000}).catch(()=>{});
  }
}


export async function startDockerInteractive(language, source, options = {}) {
  const spec = commandFor(language);
  const id = randomUUID();
  const name = `codearena-interactive-${id}`;
  const sourceFiles = new Map([[spec.file, source]]);
  if (language === 'sql') sourceFiles.set('sql_runner.py', sqlRunner());
  if (language === 'html' || language === 'css') sourceFiles.set('markup_validator.py', markupValidator());
  const extraFiles = [...sourceFiles.keys()];
  const stage = extraFiles.map(f => `cp /tmp/${f} /work/${f}`).join(' && ');
  const runtimeScript = `mkdir -p /work && ${stage} && ${spec.script}`;
  const memory = Math.max(16, Number(options.memory || 512));
  const cpu = Math.max(0.1, Number(options.cpu || 1));
  const args = [
    'create', '--name', name, '--network', 'none', '--read-only',
    '--pids-limit', '64', '--cpus', String(cpu),
    '--memory', `${memory}m`, '--memory-swap', `${memory}m`,
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--user', '1000:1000',
    '--ulimit', 'nofile=256:256', '--ulimit', 'nproc=64:64',
    '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777',
    '--tmpfs', '/work:rw,exec,nosuid,nodev,size=64m,uid=1000,gid=1000,mode=1777',
    '-w', '/work', '-e', 'HOME=/tmp', '-e', 'TMPDIR=/tmp',
    spec.image, 'sh', '-lc', 'sleep 600'
  ];
  if (process.env.CODEARENA_SANDBOX_RUNTIME) {
    const idx = args.indexOf(spec.image);
    args.splice(idx, 0, '--runtime', process.env.CODEARENA_SANDBOX_RUNTIME);
  }

  const cleanup = async () => {
    await spawnProcess('docker', ['rm', '-f', name], { timeoutMs: 3000, maxOutput: 2000 }).catch(() => {});
  };

  try {
    const created = await spawnProcess('docker', args, { timeoutMs: 10000, maxOutput: 20000 });
    if (created.code !== 0) throw new Error(created.stderr || created.stdout || 'Failed to create sandbox container');
    const started = await spawnProcess('docker', ['start', name], { timeoutMs: 10000, maxOutput: 20000 });
    if (started.code !== 0) throw new Error(started.stderr || started.stdout || 'Failed to start sandbox container');

    for (const file of extraFiles) {
      const staged = await spawnProcess(
        'docker', ['exec', '-i', name, 'sh', '-c', `cat > /tmp/${file}`],
        { input: sourceFiles.get(file), timeoutMs: 10000, maxOutput: 20000 }
      );
      if (staged.code !== 0) throw new Error(staged.stderr || staged.stdout || `Failed to stage ${file}`);
    }

    const child = spawn('docker', ['exec', '-i', name, 'sh', '-lc', runtimeScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const timeout = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
      void cleanup();
    }, Number(options.timeoutMs || 10 * 60 * 1000));

    child.once('close', () => {
      clearTimeout(timeout);
      void cleanup();
    });
    child.once('error', () => {
      clearTimeout(timeout);
      void cleanup();
    });

    return { id, name, dir, child, cleanup, timeout };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export async function dockerAvailable(){
  const r=await spawnProcess('docker',['info','--format','{{.ServerVersion}}'],{timeoutMs:20000,maxOutput:1000});
  return r.code===0 && Boolean(r.stdout.trim());
}
