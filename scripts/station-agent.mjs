// CodeArena Lab Station heartbeat agent.
// Run one instance on each lab workstation:
//   node scripts/station-agent.mjs PC-01 http://SERVER:8787
import os from 'node:os';
import { spawn } from 'node:child_process';
const stationId=process.argv[2]; const server=process.argv[3]||'http://localhost:8787'; const token=process.env.CODEARENA_STATION_TOKEN||'';
if(!token){console.error('CODEARENA_STATION_TOKEN is required; predictable station tokens are disabled');process.exit(1)}
if(!stationId){console.error('Usage: node scripts/station-agent.mjs PC-01 http://localhost:8787');process.exit(1)}
async function beat(){
  const cpu=Math.max(1,Math.min(99,Math.round(os.loadavg()[0]*100/Math.max(1,os.cpus().length))));
  const used=Math.round((1-os.freemem()/os.totalmem())*100);
  try{const r=await fetch(`${server}/api/codearena/stations/${encodeURIComponent(stationId)}/heartbeat`,{method:'POST',headers:{'Content-Type':'application/json','X-Station-Agent':'true','X-Station-Token':token},body:JSON.stringify({cpuUsagePct:cpu,ramUsagePct:used,status:'OPERATIONAL',hardware:{hostname:os.hostname(),platform:process.platform,arch:process.arch,cpuCores:os.cpus().length,totalMemoryGb:(os.totalmem()/1073741824).toFixed(1)}})});if(!r.ok)console.error('heartbeat failed',r.status)}catch(e){console.error('heartbeat unavailable',e.message)}
}
async function pollCommands(){
  try{
    const r=await fetch(`${server}/api/codearena/stations/${encodeURIComponent(stationId)}/commands`,{headers:{'X-Station-Token':token}});
    if(!r.ok)return;
    const commands=await r.json();
    for(const command of commands){
      let status='SUCCESS',result='';
      try{
        if(command.command==='REBOOT'){
          const platform=process.platform;
          if(process.env.CODEARENA_MOCK_REBOOT==='1'||process.env.CODEARENA_STATION_AGENT_DRY_RUN==='1'){
            result='Simulated workstation reboot executed successfully (dry run)';
          } else if(platform==='win32') result=await new Promise((resolve,reject)=>{const p=spawn('shutdown',['/r','/t','0','/f'],{windowsHide:true});p.on('error',reject);p.on('close',c=>resolve(`shutdown exit ${c}`));});
          else result=await new Promise((resolve,reject)=>{const p=spawn('systemctl',['reboot']);p.on('error',reject);p.on('close',c=>resolve(`systemctl reboot exit ${c}`));});
        } else if(command.command==='RESET') {
          result='Station reset acknowledged by agent';
        } else result='Unknown command';
      }catch(e){status='FAILED';result=e.message||String(e)}
      await fetch(`${server}/api/codearena/stations/${encodeURIComponent(stationId)}/commands/${encodeURIComponent(command.id)}/ack`,{method:'POST',headers:{'Content-Type':'application/json','X-Station-Token':token},body:JSON.stringify({status,result})}).catch(()=>{});
    }
  }catch(e){console.error('command poll unavailable',e.message)}
}
await beat();setInterval(beat,5000);setInterval(pollCommands,3000);await pollCommands();
