import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { LeaveRequest } from '../types/hrms.types';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  onSubmitLeave: (req: { type: string; start: string; end: string; days: number; reason: string }) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ leaves, onSubmitLeave }) => {
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-09-12');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLeave({
      type: leaveType,
      start: startDate,
      end: endDate,
      days: 3,
      reason: reason || 'Academic engagement'
    });
    setSuccessMsg('Leave application forwarded to Department Head (HOD) for digital authorization.');
    setReason('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <FileText size={16} />
            Apply for Academic Leave
          </h3>
          <form onSubmit={handleApply} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Leave Category</label>
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
                <label className="block text-gray-700 font-semibold mb-1">Commencing</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Concluding</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Official Justification</label>
              <textarea
                rows={3}
                placeholder="Specify academic conference, medical cause, or personal reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#002561] hover:bg-[#0E1B38] text-white py-2 rounded-md font-semibold transition"
            >
              Submit to HOD Chain
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
              <Clock size={16} />
              Hierarchical Leave Approval Audit Trail
            </h3>
            <span className="text-xs text-gray-400">AY 2026-27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Chain Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-cu-navy">{req.type}</td>
                    <td className="p-3 text-gray-600">
                      {req.start} to {req.end} ({req.days}d)
                    </td>
                    <td className="p-3 text-gray-500 max-w-[200px] truncate">{req.reason}</td>
                    <td className="p-3">
                      {req.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : req.status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <XCircle size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <Clock size={12} /> Pending HOD
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{req.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
