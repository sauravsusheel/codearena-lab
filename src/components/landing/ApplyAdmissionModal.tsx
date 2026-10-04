import React, { useState } from 'react';
import { 
  X, CheckCircle, GraduationCap, FileText, User, 
  BookOpen, Award, ArrowRight, ArrowLeft, Send, 
  Paperclip, Download, Printer, ShieldCheck
} from 'lucide-react';
import { admissionService, AdmissionLevel } from '../../services/admissionService';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';

interface ApplyAdmissionModalProps {
  isOpen: boolean;
  initialLevel?: AdmissionLevel;
  onClose: () => void;
}

const PROGRAM_OPTIONS = {
  UG: [
    { school: 'School of Engineering', name: 'B.Tech in Computer Science & Engineering' },
    { school: 'School of Engineering', name: 'B.Tech in Artificial Intelligence & Data Science' },
    { school: 'School of Engineering', name: 'Bachelor of Computer Applications (BCA - Cybersecurity)' },
    { school: 'School of Management Sciences', name: 'Bachelor of Business Administration (BBA - Global Business)' },
    { school: 'School of Management Sciences', name: 'B.Com (Honours in FinTech & Corporate Accounting)' },
    { school: 'School of Law, Governance & Public Policy', name: 'B.A. LL.B. (Honours - 5 Year Integrated)' },
    { school: 'School of Law, Governance & Public Policy', name: 'B.B.A. LL.B. (Honours - 5 Year Integrated)' },
    { school: 'School of Biosciences', name: 'B.Sc. (Honours) in Genetics & Molecular Biology' }
  ],
  PG: [
    { school: 'School of Engineering', name: 'Master of Computer Applications (MCA - Cloud Architecture & AI)' },
    { school: 'School of Management Sciences', name: 'Master of Business Administration (MBA - Business Analytics)' },
    { school: 'School of Management Sciences', name: 'Master of Business Administration (MBA - FinTech & Financial Markets)' },
    { school: 'School of Law, Governance & Public Policy', name: 'Master of Public Policy (MPP)' },
    { school: 'School of Biosciences', name: 'M.Sc. in Biotechnology & Computational Biology' }
  ]
};

export const ApplyAdmissionModal: React.FC<ApplyAdmissionModalProps> = ({
  isOpen,
  initialLevel = 'UG',
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [level, setLevel] = useState<AdmissionLevel>(initialLevel);
  const [selectedProgram, setSelectedProgram] = useState(PROGRAM_OPTIONS[initialLevel][0]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2006-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [category, setCategory] = useState<'General' | 'OBC' | 'SC/ST' | 'EWS' | 'International'>('General');
  const [previousEducation, setPreviousEducation] = useState('');
  const [percentageCgpa, setPercentageCgpa] = useState<number>(85);
  const [entranceExam, setEntranceExam] = useState('CUET / State CET');
  const [sop, setSop] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<string[]>(['10th_12th_marksheets.pdf']);

  // Final confirmation receipt state
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLevelChange = (newLevel: AdmissionLevel) => {
    setLevel(newLevel);
    setSelectedProgram(PROGRAM_OPTIONS[newLevel][0]);
  };

  const handleAddMockDoc = () => {
    const docName = `academic_credential_${Date.now().toString().slice(-4)}.pdf`;
    setAttachedDocs(prev => [...prev, docName]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = admissionService.submitApplication({
      level,
      school: selectedProgram.school,
      program: selectedProgram.name,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      gender,
      category,
      previousEducation: previousEducation.trim() || (level === 'UG' ? '12th Standard / Pre-University' : 'Bachelor Degree'),
      percentageCgpa,
      entranceExam: entranceExam.trim(),
      sop: sop.trim() || 'Aspiring to excel in Chanakya University multidisciplinary research ecosystem.',
      documentNames: attachedDocs
    });

    setSubmittedAppId(created.id);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-cu-border overflow-hidden my-6 animate-scale-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cu-navy via-[#0f244a] to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-cu-gold/20">
          <div className="flex items-center gap-3">
            <ChanakyaLogo variant="emblem" size="sm" height={32} />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Admissions 2026-27</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cu-gold text-cu-navy">
                  Application Portal
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">
                116-Acre Global Campus &bull; Bengaluru, India
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Step Indicator (Only for steps 1-3) */}
        {step !== 4 && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 1 ? 'bg-cu-navy text-white' : 'bg-emerald-600 text-white'}`}>
                1
              </span>
              <span className={step === 1 ? 'font-bold text-cu-navy' : 'text-gray-500'}>Program</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 2 ? 'bg-cu-navy text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </span>
              <span className={step === 2 ? 'font-bold text-cu-navy' : 'text-gray-500'}>Personal &amp; Marks</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 3 ? 'bg-cu-navy text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </span>
              <span className={step === 3 ? 'font-bold text-cu-navy' : 'text-gray-500'}>Documents &amp; Review</span>
            </div>
          </div>
        )}

        {/* STEP 1: PROGRAM SELECTION */}
        {step === 1 && (
          <div className="p-6 space-y-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Select Degree Level</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLevelChange('UG')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    level === 'UG' 
                      ? 'bg-cu-pill border-cu-navy text-cu-navy shadow-xs ring-1 ring-cu-navy' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <GraduationCap size={20} className="text-cu-gold" />
                  <div>
                    <div className="font-bold text-xs">Undergraduate (UG)</div>
                    <div className="text-[10px] text-gray-500">B.Tech, BCA, BBA, B.Com, BA-LLB, B.Sc</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLevelChange('PG')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    level === 'PG' 
                      ? 'bg-cu-pill border-cu-navy text-cu-navy shadow-xs ring-1 ring-cu-navy' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen size={20} className="text-cu-gold" />
                  <div>
                    <div className="font-bold text-xs">Postgraduate (PG)</div>
                    <div className="text-[10px] text-gray-500">MCA, MBA, MPP, M.Sc, Research</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Choose Academic Program &amp; School</label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {PROGRAM_OPTIONS[level].map((prog, idx) => {
                  const isSelected = selectedProgram.name === prog.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedProgram(prog)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected 
                          ? 'bg-white border-cu-navy shadow-xs ring-2 ring-cu-navy/20' 
                          : 'bg-gray-50/70 border-gray-200 hover:bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">{prog.name}</span>
                        <span className="text-[10px] text-gray-500">{prog.school}</span>
                      </div>
                      {isSelected && <CheckCircle size={16} className="text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-cu-navy hover:bg-cu-navy/90 text-white rounded-xl font-bold flex items-center gap-2 shadow transition"
              >
                <span>Continue to Personal Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL & MARKS */}
        {step === 2 && (
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="As on 10th / School Marksheet"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC</option>
                  <option value="SC/ST">SC / ST</option>
                  <option value="EWS">EWS</option>
                  <option value="International">International Student</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  {level === 'UG' ? '12th / Pre-University Institution & Board' : 'Graduation Degree & University'}
                </label>
                <input
                  type="text"
                  required
                  value={previousEducation}
                  onChange={e => setPreviousEducation(e.target.value)}
                  placeholder={level === 'UG' ? 'e.g. DPS Bangalore / CBSE Science' : 'e.g. B.Sc Computer Science, Bangalore Univ'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Aggregate % or CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min={40}
                  max={100}
                  required
                  value={percentageCgpa}
                  onChange={e => setPercentageCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Entrance Examination Score / Rank</label>
              <input
                type="text"
                value={entranceExam}
                onChange={e => setEntranceExam(e.target.value)}
                placeholder="e.g. CUET 2026 (Score: 780), JEE Main, KCET, PGCET, or 'Direct / Chanakya Scholar Test'"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cu-gold"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim() || !email.trim()) {
                    alert('Please enter your full name and email address.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-5 py-2.5 bg-cu-navy hover:bg-cu-navy/90 text-white rounded-xl font-bold flex items-center gap-2 shadow transition"
              >
                <span>Continue to Documents</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOP & DOCUMENTS */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Summary Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Applying For</span>
                <div className="font-bold text-xs text-cu-navy">{selectedProgram.name}</div>
                <div className="text-[10px] text-gray-500">{fullName} &bull; {email}</div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cu-gold/30 text-cu-navy font-mono">
                {level} 2026-27
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Statement of Purpose (SOP) &amp; Career Vision
              </label>
              <textarea
                value={sop}
                onChange={e => setSop(e.target.value)}
                rows={3}
                required
                placeholder="Briefly describe your academic interests, projects, and why you are seeking admission at Chanakya University..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Attached Credential Marksheets &amp; Proofs</label>
              <div className="space-y-1.5 mb-2">
                {attachedDocs.map((doc, idx) => (
                  <div key={idx} className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                    <span className="flex items-center gap-2">
                      <Paperclip size={13} className="text-emerald-600" />
                      {doc}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Verified Upload</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddMockDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition"
              >
                <Paperclip size={13} />
                <span>Attach Additional Certificate / ID Proof</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p>
                By submitting, you certify that the marks and credentials provided are authentic. Your application is securely processed under Chanakya University Admissions Regulation 2026.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cu-navy to-slate-900 hover:from-cu-navy/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition"
              >
                <Send size={14} />
                <span>Submit Official Application</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: OFFICIAL ACKNOWLEDGEMENT SLIP */}
        {step === 4 && (
          <div className="p-6 space-y-5 text-xs text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle size={32} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Application Successfully Logged
              </span>
              <h3 className="text-xl font-bold text-cu-navy mt-2">
                Provisional Enrolment Registration Complete
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your admission dossier has been forwarded to the <strong>Directorate of Admissions &amp; Enrolment</strong>.
              </p>
            </div>

            {/* Formal Slip Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3 font-mono text-[11px] shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">Application Reference No</div>
                  <div className="text-sm font-extrabold text-cu-navy">{submittedAppId}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-400 uppercase">Session</div>
                  <div className="font-bold text-gray-700">2026 - 2027 Academic Year</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div><strong>Candidate:</strong> {fullName}</div>
                <div><strong>Email:</strong> {email}</div>
                <div><strong>Program:</strong> {selectedProgram.name}</div>
                <div><strong>Level:</strong> {level} Degree</div>
                <div><strong>Marks / CGPA:</strong> {percentageCgpa}%</div>
                <div><strong>Entrance:</strong> {entranceExam}</div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-gray-500 font-sans">
                <span>Director of Admissions, Chanakya University</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> Digital Verification Seal
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition"
              >
                <Printer size={14} />
                <span>Print Official Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-cu-navy text-white rounded-xl font-bold shadow hover:bg-cu-navy/90 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
