import React, { useState } from 'react';
import { 
  Calendar, Users, Clock, MapPin, ExternalLink, 
  SlidersHorizontal, Save, QrCode, CheckCircle2, 
  BookOpen, Code2, Video, GitBranch, FolderKanban, 
  Bot, AlertTriangle, ArrowUpRight, Sparkles, DollarSign, 
  CheckSquare, FileSpreadsheet, Terminal, Layers, Award, GraduationCap, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentTranscriptModal } from './StudentTranscriptModal';
import { DigitalHallTicketModal } from './DigitalHallTicketModal';
import { RealQRCode } from '../common/RealQRCode';

interface DashboardOverviewProps {
  onNavigateModule: (moduleKey: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateModule }) => {
  const { user } = useAuth();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [hallTicketModalOpen, setHallTicketModalOpen] = useState(false);
  const [leaveApprovals, setLeaveApprovals] = useState([
    { id: 'lv_1', name: 'Dr. Anand Joshi', dept: 'Computer Science', type: 'Duty Leave (DL)', dates: 'Sep 10 - Sep 12', days: 3, reason: 'AI Conference presentation' },
    { id: 'lv_2', name: 'Sunita Rao', dept: 'Management', type: 'Casual Leave (CL)', dates: 'Sep 08', days: 1, reason: 'Personal work' },
  ]);

  const handleApprove = (id: string) => {
    setLeaveApprovals(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>{user?.roleTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Good afternoon, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {user?.role === 'STUDENT'
              ? 'Welcome to the Student Academic Portal. Here is your schedule, attendance, and exam progress.'
              : user?.role === 'FACULTY'
              ? 'Welcome to the Faculty Portal. Manage attendance, grading, research dossier, and capstone mentorships.'
              : user?.role === 'DEAN'
              ? 'Welcome to the Dean\'s Executive Portal. Oversee faculty APARs, academic performance, and school governance.'
              : user?.role === 'EXAMINATION_CONTROLLER'
              ? 'Welcome to the Examination Governance Portal. Manage exam schedules, hall tickets, invigilation, and results.'
              : user?.role === 'PLACEMENT_OFFICER'
              ? 'Welcome to the Placement & Industry Cell Portal. Track internships, industry drives, and student placements.'
              : user?.role === 'HR_ADMIN'
              ? 'Welcome to the HRMS Executive Portal. Manage staff onboarding, leave workflows, and compliance.'
              : user?.role === 'FINANCE'
              ? 'Welcome to the Finance & Accounts Portal. Manage payroll runs, tax deductions, and disbursements.'
              : user?.role === 'LIBRARIAN'
              ? 'Welcome to the Central Library Portal. Manage research paper archives, digital books, and circulation.'
              : user?.role === 'LAB_INSTRUCTOR'
              ? 'Welcome to the Systems Lab Portal. Monitor gVisor sandboxes, hardware stations, and lab attendance.'
              : user?.role === 'COORDINATOR'
              ? 'Welcome to the Academic Coordination Portal. Oversee capstone milestones, evaluations, and approvals.'
              : user?.role === 'COURSE_UPDATOR'
              ? 'Welcome to the Curriculum Planning Portal. Manage syllabus revisions, course codes, and prerequisites.'
              : user?.role === 'COURSE_ALLOCATOR'
              ? 'Welcome to the Workload Allocation Portal. Balance faculty loads, assign courses, and manage timetables.'
              : user?.role === 'WEBSITE_CONTROLLER'
              ? 'Welcome to the Media & Outreach Portal. Manage public website content, events, and announcements.'
              : user?.role === 'ADMISSION_OFFICER'
              ? 'Welcome to the Admissions Directorate Portal. Manage applicant pipelines, offers, and enrolment operations.'
              : user?.role === 'STAFF'
              ? 'Welcome to the Administrative Staff Portal. Manage departmental tasks, correspondence, and approvals.'
              : 'Welcome to the UniSphere Institutional Portal. Here is your workspace overview for today.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-cu-border shadow-sm transition flex items-center gap-1.5"
          >
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span>Dashboard settings</span>
          </button>
          <button 
            type="button"
            disabled
            className="bg-gray-200 text-gray-400 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-none cursor-not-allowed flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Save changes</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROLE VIEW 1: FACULTY DASHBOARD (EXACT SCREENSHOT LAYOUT)
         ===================================================================== */}
      {user?.role === 'FACULTY' && (
        <>
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500">Classes today</div>
                <div className="text-2xl sm:text-3xl font-bold text-cu-navy mt-1">1</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cu-pill flex items-center justify-center text-cu-navy">
                <Calendar size={20} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500">Attendance records (month)</div>
                <div className="text-2xl sm:text-3xl font-bold text-cu-navy mt-1">1</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cu-pill flex items-center justify-center text-cu-navy">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500">Active MCA Projects</div>
                <div className="text-2xl sm:text-3xl font-bold text-cu-saffron mt-1">4</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cu-saffron/10 flex items-center justify-center text-cu-saffron">
                <FolderKanban size={20} />
              </div>
            </div>

            <div 
              onClick={() => onNavigateModule('codearena')}
              className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition group"
              title="View live lab stations & time spent coding by students"
            >
              <div>
                <div className="text-xs font-medium text-gray-500">Student Coding Time</div>
                <div className="text-2xl sm:text-3xl font-bold text-cu-gold mt-1">108.0 <span className="text-xs font-normal text-slate-500">hrs</span></div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">8 Stations Active (Python/Java)</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cu-gold/10 group-hover:bg-amber-500/20 flex items-center justify-center text-cu-gold transition">
                <Code2 size={20} />
              </div>
            </div>
          </div>

          {/* Academics Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-cu-navy tracking-tight">Academics</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Today's teaching schedule and attendance marking for your classes.
                </p>
              </div>
              <button 
                onClick={() => onNavigateModule('academics')}
                className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition flex items-center gap-1.5"
              >
                <span>Timetable</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Today's Classes Card (Matching user screenshot) */}
            <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm max-w-xl">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-cu-navy">Today's classes</h4>
                <p className="text-xs text-gray-500">Swipe through your sessions for today</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-medium text-gray-600">Tuesday, Sep 1</span>
                    <div className="text-[11px] text-gray-400 font-semibold">1 class today</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-3">
                  <div className="w-1 self-stretch bg-cu-navy rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      PRG301 • A
                    </div>
                    <div className="text-base font-bold text-cu-navy">
                      Programming III
                    </div>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-semibold">
                      Lecture
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-cu-navy" />
                        <span>2:15 PM – 4:15 PM</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-cu-saffron" />
                        <span>Room 1A-59</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setQrModalOpen(true)}
                      className="bg-cu-navy hover:bg-cu-navylight text-white p-2 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                      title="Generate Session QR Code"
                    >
                      <QrCode size={15} />
                      <span className="hidden sm:inline">Mark Attendance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HRMS Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-cu-navy tracking-tight">HRMS</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Leave balance available (after applied) and this month's attendance marks.
                </p>
              </div>
              <button 
                onClick={() => onNavigateModule('hrms')}
                className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition flex items-center gap-1.5"
              >
                <span>HRMS</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Casual Leave (CL)</span>
                  <div className="text-xl font-bold text-cu-navy mt-1">8 Days</div>
                  <span className="text-[10px] text-green-600 font-semibold">Available for Semester 3</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-cu-pill flex items-center justify-center text-cu-navy text-xs font-bold">
                  CL
                </div>
              </div>

              <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Medical Leave (ML)</span>
                  <div className="text-xl font-bold text-cu-navy mt-1">10 Days</div>
                  <span className="text-[10px] text-green-600 font-semibold">Accumulated</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-cu-pill flex items-center justify-center text-cu-navy text-xs font-bold">
                  ML
                </div>
              </div>

              <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Duty Leave (DL)</span>
                  <div className="text-xl font-bold text-cu-navy mt-1">5 Days</div>
                  <span className="text-[10px] text-blue-600 font-semibold">Research & Conference</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-cu-pill flex items-center justify-center text-cu-navy text-xs font-bold">
                  DL
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          ROLE VIEW 2: HR ADMIN DASHBOARD
         ===================================================================== */}
      {user?.role === 'HR_ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Total Staff & Faculty</div>
              <div className="text-3xl font-bold text-cu-navy mt-1">142</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">100% Active Profiles</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Pending Leave Approvals</div>
              <div className="text-3xl font-bold text-cu-saffron mt-1">{leaveApprovals.length + 6}</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">HOD Escalation in 24h</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Tenure Confirmations Due</div>
              <div className="text-3xl font-bold text-cu-gold mt-1">5</div>
              <div className="text-[10px] text-gray-500 mt-1">Probation Review Scheduled</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Biometric Sync Status</div>
              <div className="text-3xl font-bold text-green-700 mt-1">98.4%</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Synced with attend_db</div>
            </div>
          </div>

          {/* Pending Approvals Action Queue */}
          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-cu-navy">Priority Leave Approval Queue (hrms_leave_requests)</h3>
              <span className="text-xs text-gray-500">Multi-Tier HOD/HR State Machine</span>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {leaveApprovals.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-cu-navy">{req.name} <span className="font-normal text-gray-500">({req.dept})</span></div>
                    <div className="text-gray-500 text-[11px]">{req.type} • {req.dates} ({req.days} days) • Reason: {req.reason}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 3: FINANCE & PAYROLL DASHBOARD
         ===================================================================== */}
      {user?.role === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Monthly Payroll Budget</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">₹ 1.42 Cr</div>
              <div className="text-[10px] text-gray-500 mt-1">August 2026 Cycle</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Disbursed Payslips</div>
              <div className="text-2xl font-bold text-green-700 mt-1">142 / 142</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Watermarked PDFs Stored in S3</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">TDS & PF Statutory Remittance</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">₹ 18.6 Lakhs</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Due on Sep 7</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Student Fee Collections</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">₹ 3.88 Cr</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Semester 3 (98% Cleared)</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-cu-navy">Payroll Engine Batch Runner (hrms_payroll_records)</h3>
              <button className="bg-cu-navy text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-cu-navylight transition">
                Execute September 2026 Payroll Run
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Automated formula calculates: Basic Pay + HRA (30%) + DA (15%) - PF (12%) - TDS (Slab) = Net Pay. Generates pre-signed MinIO PDF payslip URLs.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
      {/* =====================================================================
          ROLE VIEW 4: STUDENT DASHBOARD
         ===================================================================== */}
      {user?.role === 'STUDENT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Today's Class</div>
              <div className="text-xl font-bold text-cu-navy mt-1">CS301 (2:15 PM)</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Room 1A-59 &bull; Lecture</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Overall Attendance</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">92.4%</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Safely above 75% threshold</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">CodeArena Rating</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">1,640 pts</div>
              <div className="text-[10px] text-cu-navy font-semibold mt-1">Rank #4 in MCA Batch</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Semester GPA (SGPA)</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">9.28 / 10</div>
              <div className="text-[10px] text-purple-600 font-semibold mt-1">First Class with Distinction</div>
            </div>
          </div>

          {/* Student Academic Action Toolbar */}
          <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-cu-navy">Student Credentials &amp; Examination Passes</h4>
              <p className="text-xs text-gray-500">Official university verifiable transcripts and proctored hall tickets.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTranscriptModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-bold transition shadow-xs"
              >
                <Award size={14} className="text-cu-gold" />
                <span>View Semester Transcript</span>
              </button>

              <button
                onClick={() => setHallTicketModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cu-navy text-white hover:bg-cu-navy-light text-xs font-bold transition shadow-sm"
              >
                <GraduationCap size={14} />
                <span>Download Exam Hall Ticket</span>
              </button>
            </div>
          </div>

          {/* Enrolled Courses & 60:40 Continuous Evaluation Progress */}
          <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                <BookOpen size={16} className="text-cu-gold" />
                Enrolled Courses &amp; 60:40 Continuous Internal Evaluation (CIE)
              </h3>
              <span className="text-xs text-gray-400">Odd Semester 2026-27</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cu-navy bg-white px-2 py-0.5 rounded border border-gray-200">CS301</span>
                  <span className="font-bold text-emerald-700">93.8% Att.</span>
                </div>
                <div className="font-bold text-gray-800">Data Structures &amp; Algorithms</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span className="text-gray-500">CIE Internals:</span>
                  <span className="font-bold text-cu-navy font-mono">55 / 60 M</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cu-navy bg-white px-2 py-0.5 rounded border border-gray-200">AI402</span>
                  <span className="font-bold text-emerald-700">90.6% Att.</span>
                </div>
                <div className="font-bold text-gray-800">Deep Learning &amp; AI</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span className="text-gray-500">CIE Internals:</span>
                  <span className="font-bold text-cu-navy font-mono">59 / 60 M</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cu-navy bg-white px-2 py-0.5 rounded border border-gray-200">CS205</span>
                  <span className="font-bold text-emerald-700">89.2% Att.</span>
                </div>
                <div className="font-bold text-gray-800">Object-Oriented Java</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span className="text-gray-500">CIE Internals:</span>
                  <span className="font-bold text-cu-navy font-mono">54 / 60 M</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cu-navy bg-white px-2 py-0.5 rounded border border-gray-200">MAT101</span>
                  <span className="font-bold text-sky-700">78.5% Att.</span>
                </div>
                <div className="font-bold text-gray-800">Discrete Mathematics</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span className="text-gray-500">CIE Internals:</span>
                  <span className="font-bold text-cu-navy font-mono">51 / 60 M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-cu-navy">Upcoming Exam Notification: CS301 Data Structures</h3>
              <p className="text-xs text-gray-500 mt-0.5">Scheduled for Sep 08, 2026 (09:30 AM). AI proctored via ExamShield.</p>
            </div>
            <button 
              onClick={() => onNavigateModule('exams')}
              className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Enter Exam Shell
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 5: LIBRARIAN DASHBOARD
         ===================================================================== */}
      {user?.role === 'LIBRARIAN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Catalogued Volumes</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">34,500</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">RFID Tracked</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">UniHub Research Papers</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">1,240</div>
              <div className="text-[10px] text-cu-navy font-semibold mt-1">Full-Text pg_trgm Indexed</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Today's Circulations</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">68</div>
              <div className="text-[10px] text-gray-500 mt-1">Checkouts & Returns</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Overdue Returns</div>
              <div className="text-2xl font-bold text-red-600 mt-1">14</div>
              <div className="text-[10px] text-red-500 font-semibold mt-1">Reminder Alerts Dispatched</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 6: LAB INSTRUCTOR DASHBOARD
         ===================================================================== */}
      {user?.role === 'LAB_INSTRUCTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Active Lab Sessions</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">2 Labs</div>
              <div className="text-[10px] text-cu-saffron font-semibold mt-1">Room 1A-59 (Programming III)</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Secure Docker / gVisor Sandboxes</div>
              <div className="text-2xl font-bold text-green-700 mt-1">18 Active</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Zero Network Leakage</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Hardware Workstations</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">60 / 60</div>
              <div className="text-[10px] text-gray-500 mt-1">All Terminals Operational</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Docker Host Health</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">99.8%</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Ports 5432-5439 Online</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 7: COURSE DETAILS UPDATOR DASHBOARD
         ===================================================================== */}
      {user?.role === 'COURSE_UPDATOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Active Catalog Courses</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">48 Courses</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">MCA, BCA & B.Tech</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Syllabi Version Control</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">45 / 48</div>
              <div className="text-[10px] text-cu-navy font-semibold mt-1">NEP-2020 Compliant</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Credit Allocations Pending</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">3 Courses</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Board of Studies Review</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Prerequisite Mapping</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">100%</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Enforced in exam_papers</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW: ACADEMIC & CAPSTONE PROJECT COORDINATOR
         ===================================================================== */}
      {user?.role === 'COORDINATOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Batch Capstone Projects</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">18 Projects</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">MCA Batch 2024-26</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Milestone 3 Submissions</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">14 / 18</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">4 Pending Guide Review</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Plagiarism Alerts</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">2 Flagged</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1">AST Winnowing &gt; 80% Match</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Corporate Internships</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">42 Placed</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Weekly Logs Verified</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                  <FolderKanban size={16} /> Batch Milestone Due Dates
                </h4>
                <button
                  onClick={() => onNavigateModule('trackit')}
                  className="text-xs text-cu-navy font-semibold hover:underline"
                >
                  Manage TrackIt
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-lg flex justify-between items-center text-emerald-900 border border-emerald-200">
                  <span>M1: Project Proposal & Synopsis</span>
                  <strong>100% Completed</strong>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg flex justify-between items-center text-emerald-900 border border-emerald-200">
                  <span>M2: SRS & Architectural Design</span>
                  <strong>100% Completed</strong>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg flex justify-between items-center text-amber-900 border border-amber-200">
                  <span>M3: Prototype & Testing (Due Sep 15)</span>
                  <strong>78% In Review</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                  <Code2 size={16} /> Code Arena Plagiarism Watch
                </h4>
                <button
                  onClick={() => onNavigateModule('codearena')}
                  className="text-xs text-cu-navy font-semibold hover:underline"
                >
                  Inspect AST Judge
                </button>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                <div className="font-bold">Flagged Match: Team 04 Sandbox Submission</div>
                <p className="text-[11px] text-rose-700">
                  24MCA018 and 24MCA022 share 94.2% identical AST control flow logic with variable renaming.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW: COURSE ALLOCATOR DASHBOARD
         ===================================================================== */}
      {(user?.role === 'COURSE_ALLOCATOR' || user?.role === 'COURSE_UPDATOR') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Catalog Courses</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">48 Courses</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Odd Semester 2026-27</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Faculty Allocated</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">38 / 40</div>
              <div className="text-[10px] text-cu-navy font-semibold mt-1">2 Adjunct Openings</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Credit Balance Health</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">96.5%</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">UGC 16 Credits/Wk Compliant</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Syllabi Version Control</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">v2.5</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Board of Studies Approved</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                <Layers size={16} /> Faculty Teaching Workload Allocator Actions
              </h4>
              <button
                onClick={() => onNavigateModule('hrms')}
                className="bg-cu-navy text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-cu-navylight transition"
              >
                Open Workload Allocator
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Ensure teaching load is balanced: Senior professors (14-16 credits), Assistant professors (16 credits), Lab instructors (20 contact hours).
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 8: SUPER ADMIN / REGISTRAR DASHBOARD
         ===================================================================== */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Total University Accounts</div>
              <div className="text-2xl font-bold text-cu-navy mt-1">2,450</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Faculty, Students & Staff</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Active Microservices</div>
              <div className="text-2xl font-bold text-green-700 mt-1">8 / 8 Online</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">Fault-Isolation Layer Healthy</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Campus Attendance Rate</div>
              <div className="text-2xl font-bold text-cu-saffron mt-1">91.8%</div>
              <div className="text-[10px] text-cu-navy font-semibold mt-1">5s Rotating QR Verified</div>
            </div>
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">Security Audits (24h)</div>
              <div className="text-2xl font-bold text-cu-gold mt-1">0 Breach Alerts</div>
              <div className="text-[10px] text-green-600 font-semibold mt-1">All JWT & CSRF Tokens Valid</div>
            </div>
          </div>

          {/* Quick Jumpers to All 8 Autonomous Modules for Super Admin */}
          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-cu-navy">University Master Governance: Access All 8 Subsystems</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => onNavigateModule('hrms')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduHRMS (Team 01)</div>
                <div className="text-[10px] text-gray-500">Personnel & Payroll</div>
              </button>
              <button
                onClick={() => onNavigateModule('academics')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduAttend AI (Team 02)</div>
                <div className="text-[10px] text-gray-500">Attendance & 75% Gate</div>
              </button>
              <button
                onClick={() => onNavigateModule('exams')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduExam AI (Team 03)</div>
                <div className="text-[10px] text-gray-500">Lockdown Proctoring</div>
              </button>
              <button
                onClick={() => onNavigateModule('codearena')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduCode Judge (Team 04)</div>
                <div className="text-[10px] text-gray-500">Sandbox & Plagiarism</div>
              </button>
              <button
                onClick={() => onNavigateModule('presentation')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduPresent AI (Team 05)</div>
                <div className="text-[10px] text-gray-500">Viva & Speech Audio</div>
              </button>
              <button
                onClick={() => onNavigateModule('bot')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">EduAssist AI (Team 06)</div>
                <div className="text-[10px] text-gray-500">CampusBot RAG Engine</div>
              </button>
              <button
                onClick={() => onNavigateModule('unihub')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">UniHub (Team 07)</div>
                <div className="text-[10px] text-gray-500">Git & Research Archive</div>
              </button>
              <button
                onClick={() => onNavigateModule('trackit')}
                className="p-3 rounded-lg border border-cu-border hover:bg-cu-pill/50 text-left transition space-y-1"
              >
                <div className="font-bold text-cu-navy">TrackIt (Team 08)</div>
                <div className="text-[10px] text-gray-500">Projects & Internships</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Attendance Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center border border-cu-border shadow-2xl relative">
            <h4 className="text-base font-bold text-cu-navy">Class Session QR Code</h4>
            <p className="text-xs text-gray-500 mt-0.5">PRG301 Programming III • Valid for 90 seconds</p>

            <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl inline-flex flex-col items-center shadow-inner">
              <RealQRCode
                value={`https://chanakyauniversity.edu.in/portal/attendance/scan?course=PRG301&session=SES-PRG301-20260906&room=1A-59&faculty=${encodeURIComponent(user?.name || 'Deepak B')}&token=CU-ATT-${Date.now()}`}
                size={168}
                fgColor="#002561"
                bgColor="#ffffff"
                level="H"
                centerLogo="CU"
                downloadable={true}
                copyable={true}
                caption="PRG301: Programming III (Lab)"
                alt="Chanakya University Class Session Attendance QR"
              />
              <div className="text-[10px] text-cu-navy font-mono font-bold tracking-wider mt-2 px-2 py-0.5 rounded bg-cu-pill border border-cu-border">
                HMAC-SHA256 ROTATING TOKEN
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-4 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-cu-saffron" />
              <span>GPS Geofence active within 50m of Room 1A-59</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setQrModalOpen(false)}
                className="flex-1 bg-cu-navy text-white hover:bg-cu-navylight py-2 rounded-lg text-xs font-semibold transition"
              >
                Done / Close Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Transcripts and Hall Ticket Modals */}
      <StudentTranscriptModal 
        isOpen={transcriptModalOpen} 
        onClose={() => setTranscriptModalOpen(false)} 
      />
      <DigitalHallTicketModal 
        isOpen={hallTicketModalOpen} 
        onClose={() => setHallTicketModalOpen(false)} 
      />
    </div>
  );
};
export default DashboardOverview;
