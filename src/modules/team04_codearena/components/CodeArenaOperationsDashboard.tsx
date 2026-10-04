import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BookOpen, Database, FileCheck2, LockKeyhole, Radio, Server, ShieldCheck, Trophy } from 'lucide-react';
import { codeArenaApi } from '../services/codeArenaApi';
import { useAuth } from '../../../context/AuthContext';

export const CodeArenaOperationsDashboard: React.FC = () => {
  const { user } = useAuth();
  const faculty = ['FACULTY','SUPER_ADMIN','COORDINATOR','LAB_INSTRUCTOR'].includes(user?.role || '');
  const [analytics,setAnalytics]=useState<any>(); const [stations,setStations]=useState<any[]>([]); const [exams,setExams]=useState<any[]>([]); const [grades,setGrades]=useState<any[]>([]); const [notifs,setNotifs]=useState<any[]>([]); const [bank,setBank]=useState<any[]>([]); const [live,setLive]=useState(false); const [broadcast,setBroadcast]=useState(''); const [toast,setToast]=useState('');
  const refresh=async()=>{try{const [a,s,e,g,n]=await Promise.all([codeArenaApi.analytics(),codeArenaApi.stations(),codeArenaApi.exams(),codeArenaApi.gradebook(),codeArenaApi.notifications()]);setAnalytics(a);setStations(s);setExams(e);setGrades(g);setNotifs(n);if(faculty)setBank(await codeArenaApi.questionBank());}catch(e:any){setToast(e.message)}};
  useEffect(()=>{refresh();const id=window.setInterval(refresh,10000);return()=>window.clearInterval(id)},[]);
  useEffect(()=>{let es:EventSource|undefined; let disposed=false; codeArenaApi.streamUrl().then(url=>{if(disposed)return; es=new EventSource(url); es.onopen=()=>setLive(true); es.onerror=()=>setLive(false)}).catch(()=>setLive(false)); return()=>{disposed=true;es?.close()}},[]);
  const online=useMemo(()=>stations.filter(s=>s.status!=='OFFLINE'&&s.status!=='MAINTENANCE').length,[stations]);
  const sendBroadcast=async()=>{if(!broadcast.trim())return;await codeArenaApi.createBroadcast({message:broadcast,severity:'INFO'});setBroadcast('');setToast('Broadcast sent to all active CodeArena users');refresh()};
  return <div className="space-y-5">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{[
      ['Submissions',analytics?.submissions||0,Database],['Accepted',analytics?.accepted||0,Trophy],['Stations',`${online}/60`,Server],['Queue',analytics?.queue||0,Activity],['Live',live?'ON':'OFF',Radio]
    ].map(([label,value,Icon]:any)=><div key={label} className="bg-white border border-cu-border rounded-xl p-4"><div className="flex justify-between text-gray-500 text-xs"><span>{label}</span><Icon size={15}/></div><div className="text-2xl font-bold text-cu-navy mt-1">{value}</div></div>)}</div>
    {toast&&<div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">{toast}</div>}
    <div className="grid lg:grid-cols-2 gap-5">
      <section className="bg-white border rounded-xl p-5"><h3 className="font-bold text-cu-navy flex gap-2 items-center"><LockKeyhole size={17}/> Secure execution & queue</h3><p className="text-sm text-gray-600 mt-2">Submissions are persisted first, queued, evaluated by bounded workers, and written back as authoritative verdicts. Docker isolation can be enabled with <code>CODEARENA_DOCKER=1</code>.</p><div className="mt-3 text-xs text-gray-500">Average marks: {Number(analytics?.avgMarks||0).toFixed(1)} · Worker capacity: 4</div></section>
      <section className="bg-white border rounded-xl p-5"><h3 className="font-bold text-cu-navy flex gap-2 items-center"><ShieldCheck size={17}/> Security controls</h3><ul className="text-sm text-gray-600 mt-2 list-disc pl-5 space-y-1"><li>Signed 8-hour access tokens and server-side RBAC.</li><li>Rate limiting, payload limits and security headers.</li><li>No-network Docker execution with CPU/RAM/PID limits when enabled.</li><li>Audit records for grading, station, exam and plagiarism actions.</li></ul></section>
    </div>
    {faculty&&<>
      <section className="bg-white border rounded-xl p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-cu-navy flex gap-2"><Radio size={17}/> Lab broadcast</h3><span className="text-xs text-gray-500">{notifs.filter(n=>!n.read_at).length} unread notifications</span></div><div className="flex gap-2 mt-3"><input value={broadcast} onChange={e=>setBroadcast(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Emergency lab message or exam announcement"/><button onClick={sendBroadcast} className="px-4 py-2 rounded-lg bg-cu-navy text-white text-sm">Broadcast</button></div></section>
      <section className="bg-white border rounded-xl p-5"><h3 className="font-bold text-cu-navy flex gap-2"><BookOpen size={17}/> Question bank</h3><div className="grid md:grid-cols-3 gap-2 mt-3">{bank.slice(0,6).map(p=><div key={p.id} className="border rounded-lg p-3"><div className="font-semibold text-sm">{p.title}</div><div className="text-xs text-gray-500">{p.difficulty} · {p.testcase_count} test cases · {p.points} marks</div></div>)}</div></section>
      <section className="bg-white border rounded-xl p-5"><h3 className="font-bold text-cu-navy flex gap-2"><FileCheck2 size={17}/> Exam control</h3><div className="space-y-2 mt-3">{exams.slice(0,5).map(e=><div key={e.id} className="flex items-center justify-between border rounded-lg p-3 text-sm"><div><b>{e.title}</b><div className="text-xs text-gray-500">{e.starts_at} → {e.ends_at} · limit {e.submission_limit}</div></div><span className="px-2 py-1 rounded bg-gray-100 text-xs">{e.status}</span></div>)}{!exams.length&&<p className="text-sm text-gray-500">No exams scheduled yet.</p>}</div></section>
      <section className="bg-white border rounded-xl p-5"><h3 className="font-bold text-cu-navy flex gap-2"><Bell size={17}/> Gradebook synchronization</h3><p className="text-sm text-gray-600 mt-2">{grades.length} persistent grade records are available. Faculty can override and lock grades through the API without changing the original submission.</p></section>
    </>}
  </div>;
};
