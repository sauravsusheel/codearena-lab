import React, { useState } from 'react';
import { Users, FileText, CheckCircle2, XCircle, Clock, Download, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HrmsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'leaves' | 'payroll'>('leaves');
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-09-12');
  const [reason, setReason] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  const [leaveRequests, setLeaveRequests] = useState([
    { id: '1', type: 'Duty Leave (DL)', start: '2026-08-20', end: '2026-08-22', days: 3, reason: 'ACM SIGCSE Faculty Development Conference', status: 'APPROVED', approver: 'Dr. R. Sharma (Dean)' },
    { id: '2', type: 'Casual Leave (CL)', start: '2026-07-14', end: '2026-07-14', days: 1, reason: 'Family Function', status: 'APPROVED', approver: 'HOD Computer Science' },
    { id: '3', type: 'Casual Leave (CL)', start: '2026-09-18', end: '2026-09-19', days: 2, reason: 'Personal errands', status: 'PENDING_HOD', approver: 'Under Review' },
  ]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: String(Date.now()),
      type: leaveType,
      start: startDate,
      end: endDate,
      days: 3,
      reason: reason || 'Academic engagement',
      status: 'PENDING_HOD',
      approver: 'Pending HOD Approval'
    };
    setLeaveRequests([newReq, ...leaveRequests]);
    setSubmittedMessage('Leave request successfully submitted to HOD approval chain.');
    setReason('');
    setTimeout(() => setSubmittedMessage(''), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <Users size={13} />
            <span>EduHRMS Module 01</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Human Resource Management System</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Faculty profile, tenure track, digital leave workflow, workload allocation, and payroll slips.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('leaves')} 
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'leaves' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Leave Management
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'profile' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Faculty Profile
          </button>
          <button 
            onClick={() => setActiveTab('payroll')} 
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'payroll' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Salary & Payslips
          </button>
        </div>
      </div>

      {submittedMessage && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Tab 1: Leaves */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply Leave Form */}
          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-cu-navy">Apply for Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
                >
                  <option>Casual Leave (CL) - 8 Days Available</option>
                  <option>Medical Leave (ML) - 10 Days Available</option>
                  <option>Duty Leave (DL) - 5 Days Available</option>
                  <option>Sabbatical Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Reason / Purpose</label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide academic or personal explanation..."
                  className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-cu-navy hover:bg-cu-navylight text-white font-semibold py-2.5 rounded-lg shadow transition"
              >
                Submit Application to HOD
              </button>
            </form>
          </div>

          {/* Leave History Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-cu-border p-5 shadow-sm">
            <h3 className="font-bold text-sm text-cu-navy mb-3">Recent Leave Applications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-cu-border">
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold">Dates</th>
                    <th className="p-2.5 font-semibold">Duration</th>
                    <th className="p-2.5 font-semibold">Reason</th>
                    <th className="p-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/80">
                      <td className="p-2.5 font-bold text-cu-navy">{req.type}</td>
                      <td className="p-2.5 text-gray-600">{req.start} to {req.end}</td>
                      <td className="p-2.5 text-gray-600">{req.days} days</td>
                      <td className="p-2.5 text-gray-700 max-w-xs truncate">{req.reason}</td>
                      <td className="p-2.5">
                        {req.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            <Clock size={11} /> Pending HOD
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Faculty Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm max-w-3xl space-y-4 text-xs">
          <h3 className="font-bold text-base text-cu-navy">Faculty Digital Dossier</h3>
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div><span className="text-gray-500">Full Name:</span> <strong className="text-gray-800 block text-sm">{user?.name}</strong></div>
            <div><span className="text-gray-500">Employee ID:</span> <strong className="text-gray-800 block text-sm">{user?.employeeId}</strong></div>
            <div><span className="text-gray-500">Academic Department:</span> <strong className="text-gray-800 block">{user?.department}</strong></div>
            <div><span className="text-gray-500">Designation:</span> <strong className="text-gray-800 block">Assistant Professor & Project Lead</strong></div>
            <div><span className="text-gray-500">Tenure Status:</span> <strong className="text-gray-800 block text-cu-navy">Confirmed Faculty</strong></div>
            <div><span className="text-gray-500">Teaching Allotment Cap:</span> <strong className="text-gray-800 block">16 Credits / Semester</strong></div>
          </div>
        </div>
      )}

      {/* Tab 3: Payroll */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-cu-navy">Monthly Salary Payslips (PostgreSQL `hrms_payroll_records`)</h3>
          <div className="divide-y divide-gray-100 text-xs">
            {[
              { month: 'August 2026', basic: '₹ 85,000', hra: '₹ 25,500', da: '₹ 12,750', deductions: '₹ 14,200', net: '₹ 1,09,050', status: 'Disbursed' },
              { month: 'July 2026', basic: '₹ 85,000', hra: '₹ 25,500', da: '₹ 12,750', deductions: '₹ 14,200', net: '₹ 1,09,050', status: 'Disbursed' },
              { month: 'June 2026', basic: '₹ 85,000', hra: '₹ 25,500', da: '₹ 12,750', deductions: '₹ 14,200', net: '₹ 1,09,050', status: 'Disbursed' },
            ].map((pay, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-cu-navy text-sm">{pay.month}</div>
                  <div className="text-gray-500 text-[11px]">Basic: {pay.basic} | HRA: {pay.hra} | DA: {pay.da}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700 text-sm">{pay.net}</div>
                  <span className="text-[10px] text-gray-500 font-medium">Net Disbursed</span>
                </div>
                <button className="bg-gray-50 hover:bg-cu-navy hover:text-white text-gray-700 px-3 py-1.5 rounded border border-cu-border transition flex items-center gap-1 text-xs">
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default HrmsView;
