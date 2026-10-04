import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, GraduationCap, Users, Link2, Clock3, ShieldCheck, RefreshCw } from 'lucide-react';
import { codeArenaApi } from '../services/codeArenaApi';
import { useAuth } from '../../../context/AuthContext';

const managerRoles = ['SUPER_ADMIN','COORDINATOR'];
const teachingRoles = ['FACULTY','LAB_INSTRUCTOR','SUPER_ADMIN','COORDINATOR'];

export const LMSCourseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data,setData] = useState<any>({terms:[],courses:[],sections:[],mySections:[]});
  const [selected,setSelected] = useState<any>(null);
  const [section,setSection] = useState<any>(null);
  const [toast,setToast] = useState('');
  const [loading,setLoading] = useState(false);
  const canTeach = teachingRoles.includes(user?.role || '');
  const canManage = managerRoles.includes(user?.role || '');

  const load = async () => {
    setLoading(true);
    try { const result = await codeArenaApi.lmsBootstrap(); setData(result); }
    catch(e:any){ setToast(e.message || 'LMS service unavailable'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);

  const mySections = useMemo(()=>data.mySections || [],[data]);
  const openSection = async (s:any) => {
    try { setSelected(s); setSection(await codeArenaApi.lmsSection(s.id || s.section_id)); }
    catch(e:any){setToast(e.message || 'Unable to load section');}
  };
  const enroll = async (s:any) => {
    try { await codeArenaApi.lmsEnroll(s.id || s.section_id); setToast(`Enrolled in ${s.course_code} — Section ${s.section_code}`); await load(); }
    catch(e:any){setToast(e.message || 'Enrollment failed');}
  };
  const assignProblem = async () => {
    if(!section) return;
    const available=(data.courses || []).length;
    const problemId=window.prompt('Enter the CodeArena problem ID to assign:');
    if(!problemId) return;
    try { await codeArenaApi.lmsAssignProblem(section.section.id,{problemId,assessmentType:'PRACTICE',required:true}); setToast('CodeArena problem linked to this LMS section'); await openSection(section.section); }
    catch(e:any){setToast(e.message || 'Problem assignment failed');}
  };

  return <div className="space-y-5">
    <div className="flex items-center justify-between bg-white border border-cu-border rounded-xl p-5">
      <div><div className="inline-flex items-center gap-2 text-xs font-bold text-cu-navy"><GraduationCap size={16}/> University LMS ↔ CodeArena</div><h3 className="text-xl font-bold text-cu-navy mt-1">Courses, Sections, Enrollments &amp; Assessments</h3><p className="text-xs text-gray-500 mt-1">CodeArena problems, learning activity and grades are scoped to official LMS course sections.</p></div>
      <button onClick={load} disabled={loading} className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50"><RefreshCw size={16} className={loading?'animate-spin':''}/></button>
    </div>
    {toast && <div className="rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm p-3">{toast}</div>}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Academic terms</div><div className="text-2xl font-bold text-cu-navy">{data.terms?.length || 0}</div></div>
      <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Course catalog</div><div className="text-2xl font-bold text-cu-navy">{data.courses?.length || 0}</div></div>
      <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">My LMS sections</div><div className="text-2xl font-bold text-cu-navy">{mySections.length}</div></div>
      <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Role</div><div className="text-lg font-bold text-cu-navy">{user?.role || '—'}</div></div>
    </div>

    <div className="grid lg:grid-cols-3 gap-5">
      <section className="lg:col-span-2 bg-white border rounded-xl p-5">
        <div className="flex justify-between items-center"><h4 className="font-bold text-cu-navy flex items-center gap-2"><BookOpen size={17}/> My courses &amp; teaching sections</h4><span className="text-xs text-gray-500">{mySections.length} linked</span></div>
        <div className="mt-3 space-y-2">
          {mySections.map((s:any)=><button key={s.id} onClick={()=>openSection(s)} className="w-full text-left border rounded-lg p-3 hover:border-cu-navy hover:bg-slate-50 transition">
            <div className="flex items-center justify-between"><div><div className="font-semibold text-sm text-cu-navy">{s.course_code} — {s.course_title}</div><div className="text-xs text-gray-500 mt-1">{s.term_name} · Section {s.section_code} · {s.my_enrollment || s.teaching_role}</div></div><Link2 size={15} className="text-gray-400"/></div>
          </button>)}
          {!mySections.length && <div className="p-5 text-sm text-gray-500 border border-dashed rounded-lg">No linked LMS sections yet.</div>}
        </div>
      </section>

      <section className="bg-white border rounded-xl p-5">
        <h4 className="font-bold text-cu-navy flex items-center gap-2"><ShieldCheck size={17}/> LMS controls</h4>
        <ul className="mt-3 space-y-2 text-xs text-gray-600">
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-600"/> Official term and section scope</li>
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-600"/> Student enrollment / roster isolation</li>
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-600"/> Faculty teaching assignment checks</li>
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-600"/> CodeArena problem-to-course linking</li>
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-600"/> Learning progress events and gradebook scope</li>
        </ul>
      </section>
    </div>

    {(canTeach || canManage) && <section className="bg-white border rounded-xl p-5">
      <h4 className="font-bold text-cu-navy flex items-center gap-2"><Users size={17}/> Available LMS sections</h4>
      <div className="overflow-auto mt-3"><table className="min-w-full text-xs"><thead><tr className="text-left border-b text-gray-500"><th className="py-2 pr-4">Course</th><th className="py-2 pr-4">Term</th><th className="py-2 pr-4">Section</th><th className="py-2 pr-4">Students</th><th className="py-2">Action</th></tr></thead><tbody>
        {(data.sections || []).map((s:any)=><tr key={s.id} className="border-b last:border-0"><td className="py-2 pr-4 font-semibold">{s.course_code} — {s.course_title}</td><td className="py-2 pr-4">{s.term_code}</td><td className="py-2 pr-4">{s.section_code}</td><td className="py-2 pr-4">{s.enrollment_count}/{s.capacity}</td><td className="py-2"><button onClick={()=>openSection(s)} className="px-2 py-1 border rounded">Manage</button></td></tr>)}
      </tbody></table></div>
    </section>}

    {user?.role === 'STUDENT' && <section className="bg-white border rounded-xl p-5">
      <h4 className="font-bold text-cu-navy">Enroll in an available section</h4>
      <div className="grid md:grid-cols-2 gap-2 mt-3">{(data.sections || []).filter((s:any)=>!s.enrolled).map((s:any)=><div key={s.id} className="border rounded-lg p-3"><div className="font-semibold text-sm">{s.course_code} — {s.course_title}</div><div className="text-xs text-gray-500 mt-1">{s.term_name} · Section {s.section_code} · {s.enrollment_count}/{s.capacity}</div><button onClick={()=>enroll(s)} className="mt-2 px-3 py-1.5 rounded bg-cu-navy text-white text-xs">Enroll</button></div>)}</div>
    </section>}

    {section && <section className="bg-white border rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h4 className="font-bold text-cu-navy">{section.section.course_code} — {section.section.course_title}</h4><div className="text-xs text-gray-500 mt-1">{section.section.term_name} · Section {section.section.section_code} · {section.section.room}</div></div>{section.teacher && <button onClick={assignProblem} className="px-3 py-2 rounded-lg bg-cu-navy text-white text-xs">Link CodeArena Problem</button>}</div>
      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div className="border rounded-lg p-3"><div className="text-xs text-gray-500">Roster</div><div className="text-xl font-bold">{section.roster?.length || 0}</div></div>
        <div className="border rounded-lg p-3"><div className="text-xs text-gray-500">Assigned problems</div><div className="text-xl font-bold">{section.problems?.length || 0}</div></div>
        <div className="border rounded-lg p-3"><div className="text-xs text-gray-500">Grade records</div><div className="text-xl font-bold">{section.gradebook?.length || 0}</div></div>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div><h5 className="font-semibold text-sm text-cu-navy mb-2">CodeArena assignments</h5>{(section.problems||[]).map((p:any)=><div key={p.id} className="border rounded p-2 text-xs mb-1 flex justify-between"><span>{p.title}</span><span className="text-gray-500">{p.assessment_type} · {p.points} marks</span></div>)}{!section.problems?.length&&<div className="text-xs text-gray-500">No problems linked.</div>}</div>
        <div><h5 className="font-semibold text-sm text-cu-navy mb-2">Faculty / instructor</h5>{(section.faculty||[]).map((f:any)=><div key={f.id} className="border rounded p-2 text-xs mb-1">{f.name} · {f.role} · {f.assignment_role}</div>)}</div>
      </div>
    </section>}

    <div className="text-[11px] text-gray-400 flex items-center gap-2"><Clock3 size={13}/> LMS enrollment is authoritative for CodeArena course scope; direct CodeArena problem access remains server-authorized.</div>
  </div>;
};
export default LMSCourseDashboard;
