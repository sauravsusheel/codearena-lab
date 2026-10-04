import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Check, X, Clock, AlertCircle, FileText, 
  User, Calendar, Filter, Search, Award, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CampusEventBus } from '../../core/resilience/EventBus';
import { IsolatedStorage } from '../../core/resilience/IsolatedStorage';

interface ApprovalItem {
  id: string;
  type: 'LEAVE_REQUEST' | 'CAPSTONE_MILESTONE' | 'ATTENDANCE_REGULARIZATION' | 'EXAM_MODERATION';
  applicantName: string;
  applicantRole: string;
  applicantCode: string;
  title: string;
  details: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
}

const approvalsStorage = new IsolatedStorage('approvals');

export const ApprovalsView: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initial items
  const initialItems: ApprovalItem[] = [
    {
      id: 'app-001',
      type: 'LEAVE_REQUEST',
      applicantName: 'Dr. Ramesh Hegde',
      applicantRole: 'Associate Professor',
      applicantCode: 'CUP2024/00112',
      title: 'Casual Leave (CL) Application — 3 Days',
      details: 'Attending IEEE International Conference on Cyber Architecture in New Delhi. Substitute faculty assigned for PRG301.',
      submittedAt: '2026-09-04T10:30:00Z',
      status: 'PENDING',
      priority: 'NORMAL'
    },
    {
      id: 'app-002',
      type: 'CAPSTONE_MILESTONE',
      applicantName: 'Arjun Kumar & Team (MCA)',
      applicantRole: 'Final Year Student Team',
      applicantCode: '24MCA003',
      title: 'Milestone M2 Architecture & ER Blueprint Sign-off',
      details: 'Comprehensive database DDL with 14 normalized tables and OpenAPI 3.0 YAML specifications for Campus Health platform.',
      submittedAt: '2026-09-05T08:15:00Z',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: 'app-003',
      type: 'ATTENDANCE_REGULARIZATION',
      applicantName: 'Sneha Patel',
      applicantRole: 'B.Tech CSE 5th Sem',
      applicantCode: '22BTCSE042',
      title: 'Biometric Attendance Exemption Request',
      details: 'University inter-collegiate basketball tournament participation on 2026-09-02. Sports directorate endorsement attached.',
      submittedAt: '2026-09-03T14:20:00Z',
      status: 'PENDING',
      priority: 'NORMAL'
    },
    {
      id: 'app-004',
      type: 'EXAM_MODERATION',
      applicantName: 'Board of Examiners (MCA)',
      applicantRole: 'Subject Matter Committee',
      applicantCode: 'BOE-MCA-2026',
      title: 'End-Semester Question Paper Bank Moderation (PRG301)',
      details: 'Review of 40 Bloom-taxonomized items across Apply, Analyze, and Evaluate cognitive dimensions.',
      submittedAt: '2026-09-02T16:00:00Z',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: 'app-005',
      type: 'LEAVE_REQUEST',
      applicantName: 'Kavitha Murthy',
      applicantRole: 'Assistant Professor',
      applicantCode: 'CUP2025/00204',
      title: 'Medical Leave (ML) — 2 Days',
      details: 'Medical certification submitted for outpatient recovery.',
      submittedAt: '2026-09-01T09:00:00Z',
      status: 'APPROVED',
      priority: 'LOW'
    }
  ];

  const [items, setItems] = useState<ApprovalItem[]>(() => {
    return approvalsStorage.getItem<ApprovalItem[]>('items_queue', initialItems);
  });

  useEffect(() => {
    approvalsStorage.setItem('items_queue', items);
  }, [items]);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setItems(updated);
    CampusEventBus.publish('APPROVAL_STATUS_CHANGED', 'approvals', { id, status: newStatus, actor: user?.email });
  };

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.applicantCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const pendingCount = items.filter(i => i.status === 'PENDING').length;
  const approvedCount = items.filter(i => i.status === 'APPROVED').length;
  const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-amber-900/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-400/40 mb-1">
            <CheckSquare size={13} />
            <span>Institutional Governance Workflow</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Administrative &amp; Academic Approvals Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, endorse, or request revisions for faculty leave, capstone milestones, and exam moderation.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'PENDING' 
                ? 'bg-[#0a1e3b] text-amber-300 border-[#0a1e3b]' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Clock size={13} />
            <span>{pendingCount} Pending</span>
          </button>
          <button 
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'APPROVED' 
                ? 'bg-[#0a1e3b] text-amber-300 border-[#0a1e3b]' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <Check size={13} />
            <span>{approvedCount} Approved</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search applicant, code, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
            />
          </div>

          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
          >
            <option value="ALL">All Categories</option>
            <option value="LEAVE_REQUEST">Leave Requests</option>
            <option value="CAPSTONE_MILESTONE">Capstone Milestones</option>
            <option value="ATTENDANCE_REGULARIZATION">Attendance Regularization</option>
            <option value="EXAM_MODERATION">Exam Moderation</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>Active Role:</span>
          <span className="font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Approvals Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <CheckSquare size={36} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">No Approvals Pending in this Filter</h3>
            <p className="text-xs text-slate-400">All submissions in this category have been processed.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-300 shadow-sm transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a1e3b] text-amber-300 flex items-center justify-center font-bold text-xs">
                    {item.applicantName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.priority === 'HIGH' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Priority
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-700">{item.applicantName}</span>
                      <span>&bull;</span>
                      <span>{item.applicantRole}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-600">{item.applicantCode}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {item.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Clock size={12} /> Pending Review
                    </span>
                  )}
                  {item.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Check size={12} /> Endorsed &amp; Approved
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full">
                      <X size={12} /> Rejected / Revision Req
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {item.details}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Submitted on {new Date(item.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>

                {item.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(item.id, 'REJECTED')}
                      className="px-3.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-lg transition"
                    >
                      Reject / Revision
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'APPROVED')}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1e3b] font-bold rounded-lg shadow hover:opacity-90 transition"
                    >
                      Endorse &amp; Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ApprovalsView;
