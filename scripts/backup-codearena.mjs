import { mkdir, copyFile, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { db } from '../server/db.mjs';

const root=process.cwd();
const out=process.env.CODEARENA_BACKUP_DIR||path.join(root,'server','backups');
await mkdir(out,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
let target,kind,size=0,checksum='';
if(process.env.DATABASE_URL){
  target=path.join(out,`codearena-${stamp}.sql`);kind='POSTGRESQL';
  const r=spawnSync('pg_dump',[process.env.DATABASE_URL,'--format=plain','--no-owner','--file',target],{encoding:'utf8'});
  if(r.status!==0)throw new Error((r.stderr||'pg_dump failed').trim());
}else{
  const source=path.join(root,'server','data','codearena.sqlite');
  target=path.join(out,`codearena-${stamp}.sqlite`);kind='SQLITE';
  await copyFile(source,target);
}
const st=await stat(target);size=st.size;
const crypto=await import('node:fs');
const data=await crypto.promises.readFile(target);checksum=createHash('sha256').update(data).digest('hex');
try{db.prepare('INSERT INTO backups VALUES(?,?,?,?,?,?,?)').run(randomUUID(),kind,target,size,checksum,new Date().toISOString(),'COMPLETED');}catch{}
if (process.env.CODEARENA_BACKUP_S3_URI) {
  const uri = String(process.env.CODEARENA_BACKUP_S3_URI).replace(/\/$/, '');
  const { spawnSync } = await import('node:child_process');
  const dest = `${uri}/${path.basename(target)}`;
  const upload = spawnSync('aws', ['s3','cp',target,dest,'--only-show-errors'], { encoding: 'utf8' });
  if (upload.status !== 0) throw new Error((upload.stderr || upload.stdout || 'S3 backup upload failed').trim());
  try { db.prepare('UPDATE backups SET location=? WHERE checksum=?').run(dest,checksum); } catch {}
  console.log(JSON.stringify({ok:true,kind,target,size,sha256:checksum,s3:dest}));
} else {
  console.log(JSON.stringify({ok:true,kind,target,size,sha256:checksum}));
}
