import React from 'react';
import { Shield, Lock, Eye, Database, FileCheck, AlertCircle, CheckCircle, Printer } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-cu-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cu-navy text-cu-gold rounded-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
              <CheckCircle className="w-3 h-3" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-cu-navy">
              Institutional Privacy Policy &amp; Data Protection Framework
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statutory Data Governance Document &bull; Chanakya University Directorate of IT &bull; Ref: CU/POL/DPO/2026-04
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-cu-navy border border-cu-border rounded-lg hover:bg-slate-50 transition self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Print Policy</span>
        </button>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-cu-navy flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">Data Minimization</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Only telemetry strictly necessary for academic evaluation, degree conferral, and attendance validation is processed.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-cu-saffron flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">End-to-End Cryptography</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Storage volumes are encrypted via AES-256-GCM. Client-server transit enforces TLS 1.3 with SHA-256 integrity checks.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-cu-navy">Zero Raw-Video Storage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Facial recognition and blink liveness telemetry run locally on client devices; raw video streams are never persisted on disk.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white rounded-xl border border-cu-border shadow-sm p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-cu-navy font-serif flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cu-saffron" />
            1. Preamble &amp; Institutional Governance
          </h2>
          <p>
            Chanakya University (established under Karnataka Act No. 24 of 2021) prioritizes the fundamental right to privacy of students, faculty, researchers, and administrative personnel. This document specifies the parameters under which digital personal data is gathered, verified, securely stored, and disposed of within the Unified Autonomous Academic Platform (&ldquo;UniSphere&rdquo;).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-cu-navy font-serif">
            2. Scope of Academic Data Processing
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-cu-navy font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200">Data Category</th>
                  <th className="p-3 border-b border-slate-200">Subsystem</th>
                  <th className="p-3 border-b border-slate-200">Legal Purpose</th>
                  <th className="p-3 border-b border-slate-200">Retention Horizon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold">Student Dossier &amp; Marks</td>
                  <td className="p-3">HRMS &amp; ExamShield</td>
                  <td className="p-3">Statutory degree audit &amp; UGC grade transcripts</td>
                  <td className="p-3">Permanent academic archive</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Geofence GPS Fixes</td>
                  <td className="p-3">Smart Attendance</td>
                  <td className="p-3">Session coordinate validation within 250m radius</td>
                  <td className="p-3">Discarded immediately post-session</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Biometric Facial Vectors</td>
                  <td className="p-3">Attendance &amp; ExamShield</td>
                  <td className="p-3">Liveness verification and impersonation defense</td>
                  <td className="p-3">Ephemeral client memory only</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Compiler Execution Traces</td>
                  <td className="p-3">CodeArena</td>
                  <td className="p-3">Automated grading and AST similarity indexing</td>
                  <td className="p-3">Academic semester term + 60 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-cu-navy font-serif">
            3. Data Principal Rights &amp; Redressal Procedures
          </h2>
          <p>
            Students and employees may inspect their processing logs at any time. If an erroneous record is identified (such as a false attendance anomaly or misattributed grade slip), a formal rectification ticket may be logged with the Academic Registry.
          </p>
        </section>

        <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cu-navy flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-cu-navy">University Data Protection Officer Contact:</span>
            <p className="text-slate-600 mt-0.5">
              Office of Information Governance, Chanakya University Campus, Brigade Orchards, Devanahalli, Bengaluru 562110 &bull; Email: <span className="font-mono text-cu-navy">dpo@chanakya.edu</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
export default PrivacyPolicyView;
