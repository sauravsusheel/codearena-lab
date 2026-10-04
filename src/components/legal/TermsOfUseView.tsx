import React from 'react';
import { Scale, BookOpen, ShieldAlert, Cpu, Award, Printer, CheckCircle2 } from 'lucide-react';

export const TermsOfUseView: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-cu-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cu-navy text-cu-gold rounded-xl">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-cu-navy border border-blue-200 mb-1">
              <Award className="w-3 h-3" />
              <span>Chanakya University Academic Senate Approved</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-cu-navy">
              Terms of Academic Use &amp; Digital Honor Code
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Institutional User Agreement &bull; Applicable across all 8 Autonomous Subsystems &bull; Ref: CU/SEN/REG/2026-11
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-cu-navy border border-cu-border rounded-lg hover:bg-slate-50 transition self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Print Terms</span>
        </button>
      </div>

      {/* Honor Code Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-cu-navy flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">Strict Authenticity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All submitted source code, dissertation milestones, and exam responses must reflect original intellectual effort.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">Zero Malpractice</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Attempts to circumvent browser lockdown, use secondary screens, or spoof biometric kiosks lead to immediate debarment.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">Ethical Sandbox Use</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Code execution in CodeArena is restricted to academic problem solving. Malicious probes or fork bombs are logged as cyber violations.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white rounded-xl border border-cu-border shadow-sm p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-cu-navy font-serif">
            1. Authorized User Accounts &amp; Access Controls
          </h2>
          <p>
            Access to UniSphere is strictly granted under institutional single sign-on credentials. Sharing credentials, delegating biometric verification, or attempting privilege escalation beyond one&rsquo;s assigned role (Student, Faculty, Coordinator, HR, Allocator, Librarian, Lab Instructor, Finance, Super Admin) is punishable under Section 43 of the Information Technology Act.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-cu-navy font-serif">
            2. Autonomous Examination Integrity Rules
          </h2>
          <p>
            During active examination sessions in the ExamShield subsystem:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Candidates must maintain an uninterrupted camera feed and forward-looking eye gaze.</li>
            <li>Browser fullscreen mode must not be exited; alt-tab switching or keystroke injection will trigger automatic session suspension.</li>
            <li>Use of secondary monitors, virtual displays, or unapproved peripheral devices is strictly prohibited.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-cu-navy font-serif">
            3. Intellectual Property of Academic Artifacts
          </h2>
          <p>
            Lecture dossiers, examination questions, course syllabi, and administrative forms are proprietary institutional property of Chanakya University. Student projects published to UniHub remain credited to student authors under university open-science dissemination standards.
          </p>
        </section>

        <section className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">Institutional Governing Council:</span>
            <p className="mt-0.5">
              Any dispute regarding grading integrity or system abuse shall be resolved by the Controller of Examinations and the Dean of Academic Affairs, Chanakya University.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
export default TermsOfUseView;
