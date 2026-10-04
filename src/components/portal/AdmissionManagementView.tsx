import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, CheckCircle, Clock, Search, Filter, 
  FileText, Download, Printer, User, Award, Calendar, 
  ArrowRight, ShieldCheck, XCircle, Mail, Phone, ExternalLink,
  ChevronRight, Sparkles, RefreshCw, Send
} from 'lucide-react';
import { 
  admissionService, 
  AdmissionApplication, 
  AdmissionStatus, 
  AdmissionLevel 
} from '../../services/admissionService';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';

export const AdmissionManagementView: React.FC = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'UG' | 'PG'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdmissionStatus>('ALL');

  // Action Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDateInput, setInterviewDateInput] = useState('2026-09-10 11:00 AM');
  const [scholarshipInput, setScholarshipInput] = useState('Chanakya Merit Scholarship (25% Tuition Concession)');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    const list = admissionService.getApplications();
    setApplications(list);
    if (!selectedAppId && list.length > 0) {
      setSelectedAppId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleNew = () => loadData();
    window.addEventListener('chanakya_admission_new_application', handleNew);
    return () => window.removeEventListener('chanakya_admission_new_application', handleNew);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  const handleVerifyDocs = (id: string) => {
    admissionService.updateStatus(id, 'DOCS_VERIFIED');
    loadData();
    showToast('Applicant academic marksheets and credentials verified.');
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    admissionService.updateStatus(selectedApp.id, 'INTERVIEW_SCHEDULED', {
      interviewDate: interviewDateInput
    });
    setIsInterviewModalOpen(false);
    loadData();
    showToast(`Interview panel scheduled on ${interviewDateInput}. Invitation dispatched.`);
  };

  const handleIssueOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    admissionService.updateStatus(selectedApp.id, 'OFFER_ISSUED', {
      scholarshipAwarded: scholarshipInput,
      offerLetterIssuedAt: new Date().toLocaleDateString()
    });
    setIsOfferModalOpen(false);
    loadData();
    showToast(`Provisional Admission Offer Letter generated & issued to ${selectedApp.fullName}.`);
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to decline this application?')) {
      admissionService.updateStatus(id, 'REJECTED');
      loadData();
      showToast('Application marked as declined.');
    }
  };

  // Filtered List
  const filteredApps = applications.filter(a => {
    if (levelFilter !== 'ALL' && a.level !== levelFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.fullName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.program.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Metrics
  const totalApps = applications.length;
  const verifiedCount = applications.filter(a => a.status === 'DOCS_VERIFIED').length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
  const offersCount = applications.filter(a => a.status === 'OFFER_ISSUED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          {toastMsg}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <GraduationCap size={13} />
              Directorate of University Admissions
            </span>
            <span className="text-xs text-gray-400 font-mono">Academic Cycle 2026-27</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">
            Student Admissions &amp; Enrolment Operations Console
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Audit applicant credentials, conduct digital panel interviews, evaluate entrance scores, and issue formal Provisional Offer Letters.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition self-start sm:self-center"
        >
          <RefreshCw size={13} />
          Sync Pipeline
        </button>
      </div>

      {/* Pipeline KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-cu-border rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Received</div>
          <div className="text-2xl font-extrabold font-mono text-cu-navy mt-1">{totalApps}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">UG &amp; PG Dossiers Logged</div>
        </div>
        <div className="bg-white border border-cu-border rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Documents Verified</div>
          <div className="text-2xl font-extrabold font-mono text-blue-600 mt-1">{verifiedCount}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Marksheets &amp; Ranks Screened</div>
        </div>
        <div className="bg-white border border-cu-border rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Interviews Active</div>
          <div className="text-2xl font-extrabold font-mono text-amber-600 mt-1">{interviewCount}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Faculty Viva Panels Scheduled</div>
        </div>
        <div className="bg-white border border-cu-border rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Offer Letters Issued</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">{offersCount}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Provisional Enrolments Dispatched</div>
        </div>
      </div>

      {/* Main Workspace: Applicant Table (Left) & Detailed Dossier / Offer Generator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applicant Master Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-cu-border shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3.5 border-b border-cu-border bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or program..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                >
                  <option value="ALL">All Levels</option>
                  <option value="UG">UG Only</option>
                  <option value="PG">PG Only</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="DOCS_VERIFIED">Docs Verified</option>
                  <option value="INTERVIEW_SCHEDULED">Interview</option>
                  <option value="OFFER_ISSUED">Offer Issued</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 max-h-[580px] overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No applicants match current filter criteria.
                </div>
              ) : (
                filteredApps.map(app => {
                  const isSelected = app.id === selectedApp?.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-4 cursor-pointer transition flex items-start justify-between gap-3 text-xs ${
                        isSelected 
                          ? 'bg-cu-pill/80 border-l-4 border-l-cu-navy shadow-xs' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{app.fullName}</h4>
                          <span className="font-mono text-[10px] font-bold text-cu-navy bg-white border border-gray-200 px-1.5 py-0.2 rounded">
                            {app.id}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {app.level}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs truncate max-w-xs">{app.program}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>{app.email}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-emerald-700">{app.percentageCgpa}% Aggregate</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === 'OFFER_ISSUED' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : app.status === 'INTERVIEW_SCHEDULED'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : app.status === 'DOCS_VERIFIED'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] text-gray-400">{app.submittedAt.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Applicant Dossier & Action Console */}
        <div className="lg:col-span-6 space-y-4">
          {selectedApp ? (
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-5 text-xs">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cu-pill text-cu-navy flex items-center justify-center font-bold text-sm">
                    <User size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900">{selectedApp.fullName}</h3>
                      <span className="font-mono text-xs font-bold text-cu-navy bg-slate-100 px-2 py-0.5 rounded">
                        {selectedApp.id}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{selectedApp.program}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    selectedApp.status === 'OFFER_ISSUED' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Applicant Credentials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Category &amp; Gender</span>
                  <span className="font-semibold text-gray-800">{selectedApp.category} &bull; {selectedApp.gender}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Qualifying Marks</span>
                  <span className="font-mono font-bold text-cu-navy text-sm">{selectedApp.percentageCgpa}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                  <span className="font-medium text-gray-800">{selectedApp.dob}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Prior Education / School</span>
                  <span className="font-medium text-gray-800">{selectedApp.previousEducation}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Entrance Exam</span>
                  <span className="font-medium text-gray-800">{selectedApp.entranceExam || 'Direct Merit'}</span>
                </div>
              </div>

              {/* Statement of Purpose */}
              <div>
                <span className="font-bold text-gray-700 block mb-1">Statement of Purpose (SOP):</span>
                <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed italic text-[11px]">
                  &quot;{selectedApp.sop}&quot;
                </p>
              </div>

              {/* Uploaded Verification Documents */}
              <div>
                <span className="font-bold text-gray-700 block mb-1">Attached Verification Credentials:</span>
                <div className="space-y-1.5">
                  {selectedApp.documentNames.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                      <span className="flex items-center gap-2">
                        <FileText size={13} className="text-emerald-600" />
                        {doc}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarship or Interview Notification if active */}
              {selectedApp.interviewDate && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900">
                  <Calendar size={16} className="text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold block">Digital Admission Interview Scheduled:</span>
                    <span className="font-mono text-[11px]">{selectedApp.interviewDate}</span>
                  </div>
                </div>
              )}

              {selectedApp.scholarshipAwarded && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-900">
                  <Award size={16} className="text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold block">Sanctioned Merit Scholarship:</span>
                    <span className="text-[11px]">{selectedApp.scholarshipAwarded}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(selectedApp.id)}
                  className="px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition"
                >
                  Decline
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedApp.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyDocs(selectedApp.id)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <ShieldCheck size={14} />
                      Verify Credentials
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsInterviewModalOpen(true)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Calendar size={14} />
                    Schedule Interview
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cu-navy to-slate-900 hover:opacity-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Award size={14} className="text-cu-gold" />
                    Issue Offer Letter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-cu-border p-12 text-center text-gray-400">
              Select an applicant dossier to review.
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isInterviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-cu-border text-xs animate-scale-in">
            <h3 className="font-bold text-sm text-cu-navy mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-cu-gold" />
              Schedule Online Admission Interview
            </h3>
            <p className="text-gray-500 mb-4">
              Panel viva for <strong>{selectedApp.fullName}</strong> for {selectedApp.program}.
            </p>

            <form onSubmit={handleScheduleInterview} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Interview Date, Time &amp; Panel</label>
                <input
                  type="text"
                  required
                  value={interviewDateInput}
                  onChange={e => setInterviewDateInput(e.target.value)}
                  placeholder="e.g. 2026-09-10 11:00 AM (Online Panel A)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold shadow"
                >
                  Confirm &amp; Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE FORMAL PROVISIONAL OFFER LETTER MODAL */}
      {isOfferModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-cu-border text-xs space-y-4 my-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <ChanakyaLogo variant="emblem" size="sm" height={28} />
                <div>
                  <h3 className="font-bold text-sm text-cu-navy">
                    Formal Provisional Admission Offer Letter
                  </h3>
                  <span className="text-[10px] text-gray-500">Chanakya University Directorate of Enrolment</span>
                </div>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                Close
              </button>
            </div>

            {/* Formal Letter Preview */}
            <div className="border border-cu-border p-5 rounded-xl bg-slate-50/70 space-y-3 font-serif leading-relaxed text-gray-800 text-[11px]">
              <div className="text-center pb-2 border-b border-gray-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-cu-navy font-sans">
                  Chanakya University, Bengaluru
                </h4>
                <p className="text-[9px] text-gray-500 font-sans">
                  NH-44, Vidyaranya Global Campus, Devanahalli, Bengaluru 562110
                </p>
              </div>

              <div>
                <strong>Reference:</strong> CU/ADM/2026/OFFER/{selectedApp.id}<br />
                <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                <strong>To:</strong> {selectedApp.fullName} ({selectedApp.email})
              </div>

              <p>
                Dear <strong>{selectedApp.fullName}</strong>,
              </p>

              <p>
                Congratulations! We are delighted to inform you that following your academic credential audit and performance in qualifying evaluations, the Admissions Board of Chanakya University has granted you <strong>Provisional Admission</strong> into the following program:
              </p>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-sans text-xs">
                <strong>Program:</strong> {selectedApp.program}<br />
                <strong>School:</strong> {selectedApp.school}<br />
                <strong>Session:</strong> Academic Year 2026-27 (Commencing August 2026)
              </div>

              <div>
                <label className="block font-sans font-bold text-gray-700 mb-1">
                  Sanctioned Institutional Fellowship / Scholarship:
                </label>
                <input
                  type="text"
                  value={scholarshipInput}
                  onChange={e => setScholarshipInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-sans focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between font-sans text-[10px] text-gray-500">
                <span>Registrar, Chanakya University</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} /> Official Electronic Dispatch
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 border border-gray-300 rounded-xl font-bold flex items-center gap-1.5 hover:bg-gray-50 text-gray-700"
              >
                <Printer size={13} />
                Print Letter
              </button>
              <button
                type="button"
                onClick={handleIssueOffer}
                className="px-5 py-2 bg-gradient-to-r from-cu-navy to-slate-900 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
              >
                <Send size={13} />
                Confirm &amp; Issue Offer Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionManagementView;
