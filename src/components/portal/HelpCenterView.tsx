import React, { useState } from 'react';
import { 
  HelpCircle, Search, LifeBuoy, FileText, Phone, Mail, 
  ChevronDown, ChevronRight, Send, CheckCircle2, Clock, 
  ShieldAlert, BookOpen, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HelpCenterView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'EXAMINATIONS',
    subject: '',
    description: '',
    urgency: 'MEDIUM'
  });

  const faqs = [
    {
      category: 'EXAMINATIONS',
      q: 'How does the ExamShield browser lockdown behave during transient network drops?',
      a: 'ExamShield utilizes an offline delta-autosave cache. All responses are locally encrypted with SHA-256 state signatures in the client storage. If connectivity drops, your timer continues deterministically, and answers sync automatically once reconnection is verified.'
    },
    {
      category: 'ATTENDANCE',
      q: 'What is the minimum attendance required to obtain an examination hall ticket?',
      a: 'In accordance with Chanakya University Academic Regulations (Sec 14.2), students must maintain a minimum of 75% verified presence in each registered course. Attendance below 75% triggers an automated debarment flag in the SmartAttendance subsystem.'
    },
    {
      category: 'CODEARENA',
      q: 'Why did my submission result in Time Limit Exceeded (TLE) in CodeArena?',
      a: 'CodeArena evaluates code in isolated gVisor microVMs with a hard cap of 1000ms CPU execution time and 256MB RAM per testcase. Ensure your algorithmic time complexity is optimal (typically O(N log N) or O(N)) for N up to 10^5.'
    },
    {
      category: 'HRMS',
      q: 'What is the approval workflow for On-Duty (OD) Academic Leaves?',
      a: 'On-Duty leave requests submitted through EduHRMS follow a sequential two-tier approval workflow: First reviewed by the Head of Department (HoD), followed by final sanction by the Dean of Academic Affairs.'
    },
    {
      category: 'CAPSTONE',
      q: 'What are the deliverable requirements for Capstone Milestone M2?',
      a: 'Milestone M2 requires the submission of the Architectural Blueprint, Entity-Relationship (ER) models, API endpoint specifications, and git repository initialization with branch protection policies.'
    }
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setShowTicketModal(false);
      setTicketSubmitted(false);
      setTicketForm({ category: 'EXAMINATIONS', subject: '', description: '', urgency: 'MEDIUM' });
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#08172c] via-[#0a1e3b] to-[#16284F] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-400/25 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 text-xs font-bold">
            <LifeBuoy size={14} />
            <span>Chanakya University Student &amp; Faculty Helpdesk</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Campus Knowledge Base &amp; Support Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Search university regulations, examination bye-laws, IT guidelines, or raise a priority ticket to the academic administration.
          </p>

          <div className="pt-2 max-w-xl relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search policies, examination rules, attendance criteria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-gray-300 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:border-amber-400 transition shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-amber-900/15 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
            <LifeBuoy size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-900">Raise Administrative Ticket</h3>
            <p className="text-xs text-slate-500 mt-1">Submit inquiries regarding attendance regularization or grade corrections.</p>
          </div>
          <button 
            onClick={() => setShowTicketModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1e3b] font-bold text-xs py-2 rounded-lg shadow transition hover:opacity-90"
          >
            Create Ticket &rarr;
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-900/15 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <Phone size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-900">Emergency &amp; Helpline Numbers</h3>
            <p className="text-xs text-slate-500 mt-1">Campus Security Control Room &amp; 24x7 Ambulance dispatch.</p>
          </div>
          <div className="text-xs space-y-1 font-mono text-slate-700">
            <div>Security: <span className="font-bold text-slate-900">+91 80 2990 0100</span></div>
            <div>Health Center: <span className="font-bold text-slate-900">+91 80 2990 0108</span></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-900/15 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-900">Statutory Student Grievances</h3>
            <p className="text-xs text-slate-500 mt-1">Anti-Ragging Squad &amp; Internal Complaints Committee (ICC).</p>
          </div>
          <a 
            href="mailto:grievance@chanakya.edu"
            className="block text-center w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-lg transition"
          >
            Contact Grievance Officer
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-xl border border-amber-900/15 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Frequently Addressed Inquiries</h2>
            <p className="text-xs text-slate-500">Official academic statutes and operational workflows.</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'EXAMINATIONS', 'ATTENDANCE', 'CODEARENA', 'HRMS', 'CAPSTONE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#0a1e3b] text-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <span className="font-semibold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                    <BookOpen size={15} className="text-amber-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} 
                  />
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-900/20 max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="p-5 bg-[#0a1e3b] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-amber-300">Raise Administrative Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-gray-300 hover:text-white">&times;</button>
            </div>

            {ticketSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">Ticket Dispatched Successfully</h4>
                <p className="text-xs text-slate-500">
                  Ticket reference <span className="font-mono font-bold text-amber-600">#CU-TKT-2026-{Math.floor(1000 + Math.random() * 9000)}</span> has been routed to the Academic Registrar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none"
                  >
                    <option value="EXAMINATIONS">Examinations &amp; Hall Tickets</option>
                    <option value="ATTENDANCE">Attendance Regularization</option>
                    <option value="LAB">CodeArena &amp; Lab Access</option>
                    <option value="HRMS">HRMS &amp; Leave Approvals</option>
                    <option value="CAPSTONE">Capstone Project Review</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <input 
                    type="text"
                    required
                    placeholder="Brief description of inquiry..."
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Detailed Explanation</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Provide roll numbers, course codes, and timestamps..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1e3b] font-bold rounded-lg shadow"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default HelpCenterView;
