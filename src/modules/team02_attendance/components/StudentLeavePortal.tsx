import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Send, RefreshCw, Paperclip, User, MessageSquare, Check, X, 
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { studentLeaveService } from '../services/studentLeaveService';
import { timetableService, FACULTY_MEMBERS } from '../services/timetableService';
import { 
  StudentLeaveApplication, 
  LeaveType, 
  LeaveCategory, 
  DayOfWeek 
} from '../types/attendance.types';

export const StudentLeavePortal: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const studentRoll = user?.employeeId || '24MCA003';
  const studentName = user?.name || 'Arjun Kumar';
  const userFacultyName = user?.name || 'Deepak B';

  const [leaves, setLeaves] = useState<StudentLeaveApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'my_leaves' | 'apply' | 'approvals'>(
    isStudent ? 'my_leaves' : 'approvals'
  );

  // Form State for Student
  const [leaveType, setLeaveType] = useState<LeaveType>('CLASS_WISE');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [reasonCategory, setReasonCategory] = useState<LeaveCategory>('Medical');
  const [detailedReason, setDetailedReason] = useState<string>('');
  const [approvingFaculty, setApprovingFaculty] = useState<string>(FACULTY_MEMBERS[0].name);
  const [documentName, setDocumentName] = useState<string>('');

  // Editing / Resubmit State
  const [resubmittingLeave, setResubmittingLeave] = useState<StudentLeaveApplication | null>(null);

  // Faculty Review State
  const [reviewingLeave, setReviewingLeave] = useState<StudentLeaveApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'RESEND'>('APPROVE');
  const [facultyRemarks, setFacultyRemarks] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadLeaves = () => {
    setLeaves(studentLeaveService.getAllLeaves());
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compute day of week from selected date
  const getDayOfWeekFromDate = (dateStr: string): DayOfWeek => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as any;
    const d = new Date(dateStr);
    const day = days[d.getDay()];
    return (day === ('Sunday' as any) ? 'Monday' : day) as DayOfWeek;
  };

  const dayOfWeek = getDayOfWeekFromDate(startDate);
  const availableClassesForDay = timetableService.getSlotsForDay(dayOfWeek, 'MCA 3rd Sem');

  const handleClassToggle = (slotId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
    );
  };

  const handleMockUpload = () => {
    const defaultDoc = `${reasonCategory.toLowerCase().replace(/[\s/]+/g, '_')}_proof_${Date.now().toString().slice(-4)}.pdf`;
    setDocumentName(defaultDoc);
    showToast(`Attached document: ${defaultDoc}`);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailedReason.trim()) {
      alert('Please provide a detailed reason for the leave application.');
      return;
    }

    const summaries: string[] = [];
    if (leaveType === 'CLASS_WISE') {
      availableClassesForDay.forEach(slot => {
        if (selectedClassIds.includes(slot.id)) {
          summaries.push(`${slot.courseCode}: ${slot.courseName} (${slot.startTime} - ${slot.endTime})`);
        }
      });
      if (summaries.length === 0) {
        alert('Please select at least one class slot to apply for class-wise leave.');
        return;
      }
    }

    if (resubmittingLeave) {
      // Resubmit edited leave
      studentLeaveService.resubmitEditedLeave(resubmittingLeave.id, {
        type: leaveType,
        startDate,
        endDate,
        classSlotIds: selectedClassIds,
        classSlotSummaries: summaries,
        reasonCategory,
        detailedReason,
        approvingFaculty,
        documentName: documentName || resubmittingLeave.documentName
      });
      showToast('Leave application revised and resubmitted for faculty approval.');
      setResubmittingLeave(null);
    } else {
      // New Application
      studentLeaveService.applyLeave({
        studentRoll,
        studentName,
        batch: 'MCA 3rd Sem',
        type: leaveType,
        startDate,
        endDate: leaveType === 'CLASS_WISE' ? startDate : endDate,
        classSlotIds: selectedClassIds,
        classSlotSummaries: summaries,
        reasonCategory,
        detailedReason,
        documentName: documentName || `${reasonCategory.toLowerCase().replace(/[\s/]+/g, '_')}_document.pdf`,
        documentUrl: '#',
        approvingFaculty
      });
      showToast('Leave application submitted successfully to faculty mentor.');
    }

    // Reset Form
    setDetailedReason('');
    setSelectedClassIds([]);
    setDocumentName('');
    loadLeaves();
    setActiveTab('my_leaves');
  };

  const handleStartResubmit = (leave: StudentLeaveApplication) => {
    setResubmittingLeave(leave);
    setLeaveType(leave.type);
    setStartDate(leave.startDate);
    setEndDate(leave.endDate);
    setSelectedClassIds(leave.classSlotIds || []);
    setReasonCategory(leave.reasonCategory);
    setDetailedReason(leave.detailedReason);
    setApprovingFaculty(leave.approvingFaculty);
    setDocumentName(leave.documentName || '');
    setActiveTab('apply');
  };

  const handleOpenReviewModal = (leave: StudentLeaveApplication, action: 'APPROVE' | 'REJECT' | 'RESEND') => {
    setReviewingLeave(leave);
    setActionType(action);
    setFacultyRemarks(
      action === 'APPROVE' 
        ? 'Approved. On-Duty attendance credited to student record.' 
        : action === 'RESEND'
        ? 'Please attach official medical certificate / HOD endorsement before approval.'
        : 'Application does not meet minimal institutional criteria.'
    );
  };

  const handleExecuteFacultyAction = async () => {
    if (!reviewingLeave) return;

    let targetStatus: 'APPROVED' | 'REJECTED' | 'RESEND_REQUESTED' = 'APPROVED';
    if (actionType === 'REJECT') targetStatus = 'REJECTED';
    if (actionType === 'RESEND') targetStatus = 'RESEND_REQUESTED';

    await studentLeaveService.updateLeaveStatus(reviewingLeave.id, targetStatus, facultyRemarks);
    
    if (targetStatus === 'APPROVED') {
      showToast(`Leave approved! Directly reflected in ${reviewingLeave.studentName}'s attendance (ON_DUTY).`);
    } else if (targetStatus === 'RESEND_REQUESTED') {
      showToast(`Sent back to ${reviewingLeave.studentName} for revision.`);
    } else {
      showToast(`Leave application rejected.`);
    }

    setReviewingLeave(null);
    loadLeaves();
  };

  // Student specific or faculty specific filter
  const myStudentLeaves = leaves.filter(l => l.studentRoll === studentRoll);
  const facultyPendingLeaves = leaves.filter(l => 
    l.status === 'PENDING' && (
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'COORDINATOR' ||
      l.approvingFaculty.toLowerCase().includes(userFacultyName.toLowerCase()) ||
      userFacultyName.toLowerCase().includes(l.approvingFaculty.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cu-border pb-3">
        <div className="flex items-center gap-2">
          {isStudent && (
            <>
              <button
                onClick={() => { setResubmittingLeave(null); setActiveTab('my_leaves'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'my_leaves' ? 'bg-cu-navy text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                My Leave Records ({myStudentLeaves.length})
              </button>
              <button
                onClick={() => { setResubmittingLeave(null); setActiveTab('apply'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'apply' ? 'bg-cu-navy text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Send size={13} />
                {resubmittingLeave ? 'Edit & Resubmit Application' : 'Apply for Leave'}
              </button>
            </>
          )}

          {!isStudent && (
            <>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'approvals' ? 'bg-cu-navy text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ShieldCheck size={13} />
                Student Leave Approvals
                {facultyPendingLeaves.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-cu-navy text-[10px] font-extrabold">
                    {facultyPendingLeaves.length} Pending
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('my_leaves')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'my_leaves' ? 'bg-cu-navy text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Campus Leave Archive ({leaves.length})
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={13} className="text-cu-gold" />
          <span>Automatic Attendance Reflection: <strong className="text-emerald-700">ACTIVE</strong></span>
        </div>
      </div>

      {/* VIEW 1: APPLY / EDIT LEAVE (STUDENT) */}
      {activeTab === 'apply' && (
        <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                <FileText size={16} className="text-cu-gold" />
                {resubmittingLeave ? `Revise Leave Application (${resubmittingLeave.id})` : 'New Student Leave Application'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Leaves approved by faculty are directly marked as <strong>ON_DUTY</strong> in your live attendance stream.
              </p>
            </div>
            {resubmittingLeave && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Responding to Faculty Feedback
              </span>
            )}
          </div>

          {resubmittingLeave?.facultyRemarks && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle size={15} />
                <span>Faculty Review Remarks:</span>
              </div>
              <p className="text-amber-800 italic pl-5">&quot;{resubmittingLeave.facultyRemarks}&quot;</p>
            </div>
          )}

          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            {/* Applicant Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-gray-500 block text-[11px]">Applicant Name</span>
                <span className="font-bold text-gray-800">{studentName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Roll Number</span>
                <span className="font-mono font-bold text-cu-navy">{studentRoll}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Current Batch</span>
                <span className="font-medium text-gray-700">MCA 3rd Sem</span>
              </div>
            </div>

            {/* Leave Type Toggle */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Leave Scope</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'CLASS_WISE', label: 'Class-Wise Leave', desc: 'Select individual periods' },
                  { key: 'FULL_DAY', label: 'Full-Day Leave', desc: 'Entire academic day' },
                  { key: 'MULTI_DAY', label: 'Multi-Day Leave', desc: 'Consecutive date range' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setLeaveType(opt.key as LeaveType)}
                    className={`p-2.5 text-left rounded-lg border transition ${
                      leaveType === opt.key 
                        ? 'bg-cu-navy text-white border-cu-navy shadow-sm' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 ${leaveType === opt.key ? 'text-gray-200' : 'text-gray-500'}`}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {leaveType === 'MULTI_DAY' ? 'Start Date' : 'Date of Absence'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                />
              </div>

              {leaveType === 'MULTI_DAY' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    min={startDate}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  />
                </div>
              )}
            </div>

            {/* Class-Wise Timetable Selection */}
            {leaveType === 'CLASS_WISE' && (
              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-sky-700" />
                    Scheduled Classes on {dayOfWeek} ({startDate}):
                  </span>
                  <span className="text-[10px] text-sky-700">Check periods you will miss</span>
                </div>

                {availableClassesForDay.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">
                    No classes scheduled for {dayOfWeek} in the master timetable.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {availableClassesForDay.map(slot => {
                      const isChecked = selectedClassIds.includes(slot.id);
                      return (
                        <label 
                          key={slot.id}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                            isChecked 
                              ? 'bg-white border-cu-navy text-cu-navy shadow-xs' 
                              : 'bg-white/60 border-gray-200 text-gray-700 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleClassToggle(slot.id)}
                              className="rounded text-cu-navy focus:ring-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-xs mr-2">{slot.courseCode}</span>
                              <span className="font-semibold text-xs text-gray-900">{slot.courseName}</span>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {slot.roomLab} &bull; Faculty: {slot.facultyName}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Category & Faculty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason Classification</label>
                <select
                  value={reasonCategory}
                  onChange={e => setReasonCategory(e.target.value as LeaveCategory)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                >
                  <option value="Medical">Medical / Health Consultation</option>
                  <option value="Capstone / Hackathon">Capstone Project / Hackathon / Defense</option>
                  <option value="Academic On-Duty">Academic On-Duty / Department Seminar</option>
                  <option value="Conference / Sports">Conference / Inter-University Sports</option>
                  <option value="Family Emergency">Family Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Approving Faculty Mentor</label>
                <select
                  value={approvingFaculty}
                  onChange={e => setApprovingFaculty(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                >
                  {FACULTY_MEMBERS.map(f => (
                    <option key={f.empId} value={f.name}>{f.name} ({f.dept})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detailed Reason */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Detailed Justification &amp; Notes
              </label>
              <textarea
                value={detailedReason}
                onChange={e => setDetailedReason(e.target.value)}
                rows={3}
                required
                placeholder="Explain the necessity of the leave in detail (e.g., medical prescription attached, hackathon schedule, etc.)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
              />
            </div>

            {/* Document Proof Attachment */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Proof Document / Certificate</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMockUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  <Paperclip size={14} />
                  {documentName ? 'Change Attached Document' : 'Attach Medical Note / OD Proof'}
                </button>
                {documentName && (
                  <span className="font-mono text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    {documentName}
                  </span>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setResubmittingLeave(null); setActiveTab('my_leaves'); }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cu-navy hover:bg-cu-navy/90 text-white rounded-lg font-bold shadow flex items-center gap-1.5 transition"
              >
                <Send size={13} />
                {resubmittingLeave ? 'Resubmit Revised Application' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: MY LEAVES (STUDENT) OR ALL ARCHIVE */}
      {activeTab === 'my_leaves' && (
        <div className="bg-white rounded-xl border border-cu-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-cu-border bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
              <FileText size={16} className="text-cu-gold" />
              {isStudent ? 'My Leave Applications & Attendance Link' : 'Comprehensive University Leave Roster'}
            </h3>
            <span className="text-xs text-gray-500">
              {(isStudent ? myStudentLeaves : leaves).length} records logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3">App ID</th>
                  {!isStudent && <th className="p-3">Student</th>}
                  <th className="p-3">Scope / Type</th>
                  <th className="p-3">Dates &amp; Classes</th>
                  <th className="p-3">Reason Category</th>
                  <th className="p-3">Approving Faculty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(isStudent ? myStudentLeaves : leaves).map(leave => (
                  <tr key={leave.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-mono font-bold text-cu-navy">{leave.id}</td>
                    {!isStudent && (
                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{leave.studentName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{leave.studentRoll}</div>
                      </td>
                    )}
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {leave.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">
                        {leave.startDate} {leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ''}
                      </div>
                      {leave.classSlotSummaries && leave.classSlotSummaries.length > 0 && (
                        <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                          {leave.classSlotSummaries.map((cls, idx) => (
                            <div key={idx} className="truncate max-w-xs">&bull; {cls}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{leave.reasonCategory}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-xs">{leave.detailedReason}</div>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.approvingFaculty}
                    </td>
                    <td className="p-3">
                      {leave.status === 'APPROVED' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle size={12} />
                            APPROVED (ON_DUTY)
                          </span>
                          <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                            Reflected in Attendance
                          </div>
                        </div>
                      )}
                      {leave.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={12} />
                          PENDING FACULTY REVIEW
                        </span>
                      )}
                      {leave.status === 'RESEND_REQUESTED' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <RefreshCw size={11} />
                            RESEND TO EDIT
                          </span>
                          {leave.facultyRemarks && (
                            <div className="text-[10px] text-rose-700 mt-0.5 italic max-w-xs">
                              &quot;{leave.facultyRemarks}&quot;
                            </div>
                          )}
                        </div>
                      )}
                      {leave.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                          <XCircle size={12} />
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isStudent && leave.status === 'RESEND_REQUESTED' && (
                        <button
                          onClick={() => handleStartResubmit(leave)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 transition shadow-xs"
                        >
                          <RefreshCw size={12} />
                          Edit &amp; Resubmit
                        </button>
                      )}
                      {!isStudent && leave.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'APPROVE')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Approve Leave"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'RESEND')}
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                            title="Request Resend / Edit"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'REJECT')}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: FACULTY / COORDINATOR APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cu-gold" />
                  Pending Student Leave Approvals
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Approving a request directly registers <strong>ON_DUTY</strong> in the student&apos;s attendance ledger and protects their 75% exam gate.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {facultyPendingLeaves.length} Awaiting Decision
              </span>
            </div>
          </div>

          {facultyPendingLeaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-cu-border p-12 text-center text-gray-400">
              <CheckCircle size={36} className="mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-xs font-semibold text-gray-600">All student leave requests have been reviewed!</p>
              <p className="text-xs text-gray-400 mt-0.5">No pending leaves currently assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {facultyPendingLeaves.map(leave => (
                <div 
                  key={leave.id} 
                  className="bg-white rounded-xl border border-cu-border p-5 shadow-sm hover:border-cu-navy/30 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cu-pill text-cu-navy flex items-center justify-center font-bold text-xs">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900">{leave.studentName}</h4>
                          <span className="font-mono text-xs text-cu-navy bg-slate-100 px-2 py-0.5 rounded font-bold">
                            {leave.studentRoll}
                          </span>
                          <span className="text-[10px] text-gray-500">({leave.batch})</span>
                        </div>
                        <p className="text-[11px] text-gray-400">Applied on {leave.submittedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                        {leave.reasonCategory}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {leave.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Scope & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 space-y-1.5">
                      <span className="font-semibold text-gray-700 block">Absence Timeframe &amp; Classes:</span>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                        <div className="font-medium text-gray-800">
                          <strong>Date:</strong> {leave.startDate} {leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ''}
                        </div>
                        {leave.classSlotSummaries && leave.classSlotSummaries.length > 0 && (
                          <div className="text-[11px] text-gray-600 mt-1">
                            <strong>Specific Classes:</strong>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                              {leave.classSlotSummaries.map((cls, idx) => (
                                <li key={idx}>{cls}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className="font-semibold text-gray-700 block">Student Justification:</span>
                        <p className="text-gray-700 text-xs mt-0.5 italic bg-slate-50 p-2 rounded border border-slate-200">
                          &quot;{leave.detailedReason}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700 block mb-1">Attached Verification Document:</span>
                        {leave.documentName ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-[11px] text-emerald-800 font-mono">
                            <Paperclip size={14} className="text-emerald-600" />
                            <span className="truncate">{leave.documentName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No external attachment</span>
                        )}
                      </div>

                      {/* Decision Action Buttons */}
                      <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                        <button
                          onClick={() => handleOpenReviewModal(leave, 'APPROVE')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <CheckCircle size={14} />
                          Approve (Reflect in Attendance)
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'RESEND')}
                            className="py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition"
                          >
                            <RefreshCw size={12} />
                            Request Edit / Resend
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'REJECT')}
                            className="py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FACULTY ACTION CONFIRMATION MODAL */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-cu-border animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-cu-navy flex items-center gap-2">
                {actionType === 'APPROVE' && <CheckCircle size={18} className="text-emerald-600" />}
                {actionType === 'RESEND' && <RefreshCw size={18} className="text-amber-500" />}
                {actionType === 'REJECT' && <XCircle size={18} className="text-rose-600" />}
                {actionType === 'APPROVE' ? 'Confirm Approval & Attendance Reflection' : actionType === 'RESEND' ? 'Request Student Revision' : 'Confirm Rejection'}
              </h3>
              <button
                onClick={() => setReviewingLeave(null)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <p className="text-gray-600">
                Action for <strong>{reviewingLeave.studentName}</strong> ({reviewingLeave.studentRoll}) for <strong>{reviewingLeave.reasonCategory}</strong> leave.
              </p>

              {actionType === 'APPROVE' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Approving will automatically mark the student as <strong>ON_DUTY</strong> in the live roster, credit class hours, and prevent exam hall ticket lock.
                  </p>
                </div>
              )}

              {actionType === 'RESEND' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    The student will be prompted to edit the details (dates, periods, or attach missing certificates) and resubmit.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Faculty Remarks / Notes for Student:
                </label>
                <textarea
                  value={facultyRemarks}
                  onChange={e => setFacultyRemarks(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter remarks or required modifications..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewingLeave(null)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteFacultyAction}
                className={`px-4 py-2 rounded-lg font-bold text-white text-xs shadow transition ${
                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionType === 'RESEND' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType === 'APPROVE' ? 'Approval' : actionType === 'RESEND' ? 'Send for Revision' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
