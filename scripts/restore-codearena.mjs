import { copyFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
const source=process.argv[2];
if(!source) throw new Error('Usage: node scripts/restore-codearena.mjs <backup.sql|backup.sqlite>');
await access(source);
if(process.env.DATABASE_URL){
  const r=spawnSync('psql',[process.env.DATABASE_URL,'-X','-v','ON_ERROR_STOP=1','-f',source],{encoding:'utf8'});
  if(r.status!==0)throw new Error((r.stderr||'psql restore failed').trim());
  console.log(`PostgreSQL database restored from ${source}`);
}else{
  const target=path.join(root,'server','data','codearena.sqlite');
  await copyFile(source,target);
  console.log(`SQLite database restored to ${target}`);
}
