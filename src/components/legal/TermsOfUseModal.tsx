import React from 'react';
import { BookOpen, X, Scale, CheckCircle2, ShieldAlert, Cpu, Award } from 'lucide-react';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-cu-border flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-of-use-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-cu-navy text-white flex items-center justify-between border-b border-cu-navylight flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Scale className="w-5 h-5 text-cu-gold" />
            </div>
            <div>
              <h2 id="terms-of-use-title" className="text-lg font-bold font-serif">
                Chanakya University Terms of Academic Use
              </h2>
              <p className="text-xs text-slate-300">
                Institutional User Agreement, Code of Conduct &amp; Digital Ethics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Acceptance */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cu-saffron" />
              1. Preamble &amp; Institutional Authority
            </h3>
            <p>
              By accessing or authenticating into the Chanakya University Unified Autonomous Academic Platform (&ldquo;UniSphere&rdquo;), you formally agree to be bound by these Terms of Academic Use, the Chanakya University Act, 2021, and the Statues of Academic Governance. Authorized access is restricted strictly to matriculated students, accredited faculty members, administrative coordinators, and recognized statutory personnel.
            </p>
          </section>

          {/* Section 2: Integrity & Malpractice */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cu-navy" />
              2. Academic Integrity, Examination Conduct &amp; Malpractice
            </h3>
            <p>
              The integrity of university assessments is paramount. All users entering the Examination Proctoring Studio or CodeArena are subject to automated behavioral forensics and biometric verification:
            </p>
            <div className="space-y-2 text-xs text-slate-600 pl-2 border-l-2 border-cu-navy">
              <p><strong>Lockdown Enforcement:</strong> Any intentional disruption of browser fullscreen confinement, activation of secondary display adapters, or background virtual machine execution during proctored examinations constitutes an automatic Disciplinary Referral.</p>
              <p><strong>Generative AI &amp; Code Plagiarism:</strong> Unauthorized injection of external AI synthesis during closed-book evaluations is forbidden. All programming submissions are subjected to AST token normalization and n-gram similarity scoring against global academic corpora.</p>
              <p><strong>Proxy Authentication:</strong> Fabricating or spoofing attendance check-ins using relay proxies, virtual GPS drivers, or static photo presentations before the biometric kiosk will lead to immediate cancellation of semester attendance credits.</p>
            </div>
          </section>

          {/* Section 3: Intellectual Property */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-cu-saffron" />
              3. Intellectual Property Rights &amp; Research Dissemination
            </h3>
            <p>
              Course curricula, lecture dossiers, examination question banks, and algorithmic grading benchmarks are the exclusive intellectual property of Chanakya University. 
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Student research preprints, capstone engineering repos, and thesis manuscripts deposited in UniHub are governed under open academic attribution licenses while reserving institutional non-exclusive dissemination rights.</li>
              <li>Unauthorized commercial redistribution or scraping of courseware, grading rubrics, or proprietary software compilers is strictly actionable under the Indian Copyright Act, 1957.</li>
            </ul>
          </section>

          {/* Section 4: Sandbox Usage & Cyber Defense */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cu-navy" />
              4. Computational Sandbox &amp; Systems Security Policy
            </h3>
            <p>
              The algorithmic execution engine (CodeArena) allocates sandboxed Linux microVMs with deterministic CPU quotas and seccomp system-call filtering. Attempting any of the following activities constitutes a severe cyber breach:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Executing container breakout primitives, kernel exploit payloads, or memory corruption routines.</li>
              <li>Exhausting server resources via unbounded fork-bombs or memory over-commitment attacks.</li>
              <li>Probing internal cluster networks, metadata services, or bypassing isolated storage boundaries.</li>
            </ul>
          </section>

          {/* Disciplinary Penalties */}
          <section className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cu-saffron" />
              5. Statutory Sanctions &amp; Disciplinary Jurisdiction
            </h3>
            <p className="text-xs leading-relaxed">
              Infractions of these terms shall be adjudicated by the Controller of Examinations and the Dean of Academic Affairs. Sanctions may range from point deductions and course disqualification to academic debarment and statutory reporting in accordance with the Karnataka State Universities Framework.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-cu-border flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Academic Year 2026-2027 &bull; Chanakya University Senate Approved
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cu-navy hover:bg-cu-navylight text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
