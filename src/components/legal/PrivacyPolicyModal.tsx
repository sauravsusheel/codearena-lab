import React from 'react';
import { Shield, X, Lock, Eye, Database, FileCheck, AlertCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-cu-border flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-cu-navy text-white flex items-center justify-between border-b border-cu-navylight flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-cu-gold" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-lg font-bold font-serif">
                Chanakya University Privacy Policy
              </h2>
              <p className="text-xs text-slate-300">
                Institutional Data Protection &amp; Privacy Governance Standard &bull; DPDP Act 2023 Compliant
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
          {/* Executive Summary */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cu-saffron" />
              1. Institutional Mandate &amp; Scope
            </h3>
            <p>
              Chanakya University (&ldquo;University&rdquo;, &ldquo;Institution&rdquo;) is committed to upholding the highest standards of data governance, confidentiality, and integrity. This Privacy Policy governs the processing of personal and academic data within the Unified Autonomous Academic Platform (&ldquo;UniSphere&rdquo;), encompassing all eight functional subsystems. This policy strictly complies with the Digital Personal Data Protection Act (DPDP) 2023 (India), UGC Guidelines on Student Data Governance, and the Information Technology (Reasonable Security Practices and Procedures) Rules.
            </p>
          </section>

          {/* Categories of Data Processed */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cu-navy" />
              2. Categories of Personal and Institutional Data Collected
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-cu-navy mb-1">Academic &amp; Profile Telemetry</h4>
                <p className="text-xs text-slate-600">
                  Student roll numbers, institutional email identifiers, enrolled program transcripts, biometric-authenticated attendance records, grade histories, and faculty workload allocations.
                </p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-cu-navy mb-1">Assessment &amp; Proctoring Signals</h4>
                <p className="text-xs text-slate-600">
                  Client-side facial mesh descriptors, blink velocity vectors, gaze deviation metrics, and browser lockdown telemetry. Raw video streams are processed on edge devices and are never permanently persisted.
                </p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-cu-navy mb-1">Geographic Verification Data</h4>
                <p className="text-xs text-slate-600">
                  Ephemeral high-precision GPS coordinates captured solely during session check-ins to validate presence within the designated campus geofence (Radius: 250m). Coordinates are immediately discarded post-validation.
                </p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-cu-navy mb-1">Code Submission &amp; Research Artifacts</h4>
                <p className="text-xs text-slate-600">
                  Program source code, compiler execution logs within isolated gVisor containers, AST plagiarism hashes, research preprints, and capstone milestone deliverables.
                </p>
              </div>
            </div>
          </section>

          {/* Cryptographic Standards */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-cu-saffron" />
              3. Cryptographic Controls &amp; Data Storage Security
            </h3>
            <p>
              UniSphere applies defense-in-depth architectural safeguards to protect institutional records against unauthorized disclosure, alteration, or interception:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Encryption at Rest:</strong> All database volumes, backups, and user dossiers are encrypted using AES-256-GCM.</li>
              <li><strong>Encryption in Transit:</strong> Mandatory TLS 1.3 transport security with HSTS enforcement across all endpoints.</li>
              <li><strong>Zero-Trust RBAC:</strong> Granular privilege isolation restricting data visibility strictly to authorized roles (Admin, Faculty, Student, Coordinator, HR, Allocator, Librarian, Lab Instructor, Finance).</li>
              <li><strong>Sandboxed Execution:</strong> Student code execution runs in ephemeral, unprivileged Linux namespaces with zero external network connectivity.</li>
            </ul>
          </section>

          {/* Data Principal Rights */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-cu-navy uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-cu-navy" />
              4. Rights of Data Principals (Students, Faculty, and Staff)
            </h3>
            <p>
              Under the DPDP Act 2023, data principals within Chanakya University possess the following institutional rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Right to Summary of Processing:</strong> Access an itemized audit trail of how your academic and attendance telemetry has been computed.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal or academic details through official departmental approval workflows.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit formal inquiries regarding data handling to the University Data Protection Officer.</li>
            </ul>
          </section>

          {/* Contact Officer */}
          <div className="p-4 bg-cu-canvas border border-slate-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cu-navy flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-cu-navy">Institutional Data Protection Officer (DPO)</h4>
              <p className="text-xs text-slate-600 mt-1">
                Directorate of IT Infrastructure &amp; Academic Governance<br />
                Chanakya University Campus, Brigade Orchards, Devanahalli, Bengaluru, Karnataka 562110<br />
                Inquiries: <span className="font-mono text-cu-navy">dpo@chanakya.edu</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-cu-border flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Version 3.2 &bull; Effective September 2026 &bull; Chanakya University Legal Council
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cu-navy hover:bg-cu-navylight text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
