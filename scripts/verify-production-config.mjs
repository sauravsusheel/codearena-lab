import { execFileSync } from 'node:child_process';

const required=['DATABASE_URL','CODEARENA_REDIS_URL','CODEARENA_JWT_SECRET','CODEARENA_WORKER_SECRET'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length) throw new Error(`Missing production variables: ${missing.join(', ')}`);
if(process.env.CODEARENA_PRODUCTION==='1' && process.env.CODEARENA_DOCKER!=='1') throw new Error('Production requires CODEARENA_DOCKER=1');
for(const bin of ['psql','pg_dump','docker']){
  try{execFileSync('sh',['-lc',`command -v ${bin}`],{stdio:'ignore'});}catch{throw new Error(`Required executable not found: ${bin}`);}
}
console.log('Production prerequisites are present. Redis URL and PostgreSQL URL are configured; Docker is installed.');
