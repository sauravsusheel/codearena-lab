import { createHash } from 'node:crypto';

const KEYWORDS = new Set(['if','else','for','while','do','switch','case','break','continue','return','class','struct','interface','extends','implements','public','private','protected','static','final','const','let','var','function','def','func','package','import','from','new','try','catch','finally','throw','throws','async','await','go','range','map','filter','reduce','true','false','null','None','True','False']);
function stripComments(s){return String(s).replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\/\/.*$/gm,' ').replace(/(^|\s)#.*$/gm,'$1 ');}
export function structuralTokens(source){
  const s=stripComments(source).replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g,' STR ');
  const raw=s.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|==={0,1}|!==?|<=|>=|&&|\|\||\+\+|--|=>|\+=|-=|\*=|\/=|%=?|<<|>>|[{}()[\];,.:?+\-*\/%<>=!&|^~]/g)||[];
  return raw.map(t=>KEYWORDS.has(t)?t:/^\d/.test(t)?'NUM':/^[A-Za-z_]/.test(t)?'ID':t);
}
function hash(x){return createHash('sha1').update(x).digest('hex').slice(0,12);}
export function fingerprints(source, k=5, window=4){
  const t=structuralTokens(source); const shingles=[];
  for(let i=0;i<=t.length-k;i++) shingles.push({i,h:hash(t.slice(i,i+k).join(' '))});
  const selected=new Map();
  for(let i=0;i<shingles.length;i++){
    const end=Math.min(i+window,shingles.length);let min=shingles[i];
    for(let j=i;j<end;j++) if(shingles[j].h<min.h) min=shingles[j];
    selected.set(min.h,min.i);
  }
  return {tokens:t, hashes:selected};
}
export function analyze(a,b){
  const A=fingerprints(a),B=fingerprints(b); const ah=new Set(A.hashes.keys()),bh=new Set(B.hashes.keys());
  let common=0;for(const x of ah)if(bh.has(x))common++;
  const union=new Set([...ah,...bh]).size; const jaccard=union?common/union:0;
  const tokenA=new Set(A.tokens), tokenB=new Set(B.tokens); let tc=0;for(const x of tokenA)if(tokenB.has(x))tc++;
  const tokenUnion=new Set([...tokenA,...tokenB]).size; const tokenJ=tokenUnion?tc/tokenUnion:0;
  const score=Math.round((0.7*jaccard+0.3*tokenJ)*10000)/100;
  const clones=[];
  if(score>=55) clones.push('Matching control-flow / expression token shingles detected');
  if(common>=8) clones.push(`${common} identical structural fingerprints matched`);
  if(tokenJ>=0.75) clones.push('High normalized identifier/operator vocabulary overlap');
  return {score,winnowingHashMatchCount:common,flaggedLogicClones:clones,tokensA:A.tokens.length,tokensB:B.tokens.length};
}
