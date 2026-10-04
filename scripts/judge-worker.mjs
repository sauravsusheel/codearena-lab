import { runDocker, dockerAvailable } from '../server/sandbox.mjs';
import { redisCommand, redisPop } from '../server/redisQueue.mjs';
const API=process.env.CODEARENA_API_URL||'http://127.0.0.1:8787';
const SECRET=process.env.CODEARENA_WORKER_SECRET||'change-me-in-production';
const REDIS=process.env.CODEARENA_REDIS_URL||'redis://redis:6379/0';
const KEY=process.env.CODEARENA_REDIS_QUEUE_KEY||'codearena:submissions';
const poll=Number(process.env.CODEARENA_WORKER_POLL_MS||250);
const ROOT=process.env.CODEARENA_WORKER_TMP||'/tmp/codearena-worker';
const RUNTIME=process.env.CODEARENA_SANDBOX_RUNTIME||'';
const PRODUCTION=process.env.CODEARENA_PRODUCTION==='1'||process.env.NODE_ENV==='production';
if(PRODUCTION && !process.env.CODEARENA_DOCKER) process.env.CODEARENA_DOCKER='1';
if(PRODUCTION && !(await dockerAvailable())) throw new Error('Docker daemon is required for the CodeArena judge worker');
async function execute(job,input){
  return runDocker(job.language,job.sourceCode,input,{time:job.timeLimitMs||2000,memory:job.memoryLimitMb||256,maxOutput:1000000},{root:ROOT});
}

async function tick(){
  let claimedId=null;
  try{
    const id=await redisPop(REDIS,KEY); if(!id)return;
    const claimResponse=await fetch(`${API}/api/internal/worker/claim`,{method:'POST',headers:{'Content-Type':'application/json','X-Worker-Secret':SECRET},body:JSON.stringify({id})});
    if(!claimResponse.ok) throw new Error(`claim failed ${claimResponse.status}`);
    const claim=await claimResponse.json();
    if(!claim.job){ await redisCommand(REDIS,['LPUSH',KEY,id]); return; }
    claimedId=claim.job.id;
    const j=claim.job;let passed=0,max=0,peakMemoryMb=0,verdict='ACCEPTED';
    for(const t of j.tests){
      const r=await execute(j.language,j.sourceCode,t.input);
      max=Math.max(max,r.timeMs||0);peakMemoryMb=Math.max(peakMemoryMb,r.memoryMb||0);
      if(r.status!=='SUCCESS'){verdict=r.status;break;}
      if(r.stdout.trim().replace(/\s+/g,' ')!==t.expected_output.trim().replace(/\s+/g,' ')){verdict='WRONG_ANSWER';break;}
      passed++;
    }
    const total=j.tests.length;const marks=Math.round(passed/Math.max(total,1)*j.points*100)/100;
    await fetch(`${API}/api/internal/worker/complete`,{method:'POST',headers:{'Content-Type':'application/json','X-Worker-Secret':SECRET},body:JSON.stringify({id:j.id,verdict,passed,total,runtimeMs:max,memoryMb:peakMemoryMb,marks})});
  }catch(e){
    console.error('judge worker:',e.message);
    if(claimedId){
      try{
        const r=await fetch(`${API}/api/internal/worker/requeue`,{method:'POST',headers:{'Content-Type':'application/json','X-Worker-Secret':SECRET},body:JSON.stringify({id:claimedId})});
        if(!r.ok) await redisCommand(REDIS,['LPUSH',KEY,claimedId]);
      }catch{ try{ await redisCommand(REDIS,['LPUSH',KEY,claimedId]); }catch{} }
    }
  }
}
console.log(`CodeArena sandboxed judge worker: ${API} / Redis ${KEY}`);setInterval(tick,poll);tick();
