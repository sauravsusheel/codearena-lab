import React, { useState } from 'react';
import { 
  DollarSign, CreditCard, Download, AlertCircle, CheckCircle2, 
  Clock, Search, Receipt, Send, ShieldCheck, FileSpreadsheet, 
  X, Filter, ChevronRight, ArrowUpRight, Check, Award,
  Lock, Printer, Building, FileText, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RealQRCode } from '../common/RealQRCode';

interface StudentFeeRecord {
  id: string;
  usn: string;
  name: string;
  program: string;
  semester: string;
  totalDemand: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  status: 'CLEARED' | 'PARTIAL' | 'OVERDUE';
  financialClearance: boolean;
  lastPaymentRef?: string;
}

const INITIAL_FEE_RECORDS: StudentFeeRecord[] = [
  {
    id: 'fee_01',
    usn: 'CU2024MCA001',
    name: 'Aarav Sharma',
    program: 'Master of Computer Applications',
    semester: 'Sem 3',
    totalDemand: 165000,
    paidAmount: 165000,
    balanceDue: 0,
    dueDate: '2026-08-31',
    status: 'CLEARED',
    financialClearance: true,
    lastPaymentRef: 'TXN-HDFC-994821',
  },
  {
    id: 'fee_02',
    usn: 'CU2024MCA002',
    name: 'Bhavna Patel',
    program: 'Master of Computer Applications',
    semester: 'Sem 3',
    totalDemand: 165000,
    paidAmount: 120000,
    balanceDue: 45000,
    dueDate: '2026-09-15',
    status: 'PARTIAL',
    financialClearance: true,
    lastPaymentRef: 'TXN-UPI-481920',
  },
  {
    id: 'fee_03',
    usn: 'CU2024MCA003',
    name: 'Chetan Kumar',
    program: 'Master of Computer Applications',
    semester: 'Sem 3',
    totalDemand: 165000,
    paidAmount: 80000,
    balanceDue: 85000,
    dueDate: '2026-08-15',
    status: 'OVERDUE',
    financialClearance: false,
    lastPaymentRef: 'TXN-SBI-102934',
  },
  {
    id: 'fee_04',
    usn: 'CU2024MCA004',
    name: 'Deepika Iyer',
    program: 'Master of Computer Applications',
    semester: 'Sem 3',
    totalDemand: 165000,
    paidAmount: 165000,
    balanceDue: 0,
    dueDate: '2026-08-31',
    status: 'CLEARED',
    financialClearance: true,
    lastPaymentRef: 'TXN-RAZOR-661209',
  },
  {
    id: 'fee_05',
    usn: 'CU2024MCA005',
    name: 'Eshan Roy',
    program: 'Master of Computer Applications',
    semester: 'Sem 3',
    totalDemand: 165000,
    paidAmount: 0,
    balanceDue: 165000,
    dueDate: '2026-08-10',
    status: 'OVERDUE',
    financialClearance: false,
  },
  {
    id: 'fee_06',
    usn: 'CU2024CS012',
    name: 'Farhan Akhtar',
    program: 'B.Tech Computer Science',
    semester: 'Sem 5',
    totalDemand: 195000,
    paidAmount: 195000,
    balanceDue: 0,
    dueDate: '2026-08-31',
    status: 'CLEARED',
    financialClearance: true,
    lastPaymentRef: 'TXN-ICICI-883719',
  },
  {
    id: 'fee_07',
    usn: 'CU2024CS045',
    name: 'Gitanjali Rao',
    program: 'B.Tech Computer Science',
    semester: 'Sem 5',
    totalDemand: 195000,
    paidAmount: 150000,
    balanceDue: 45000,
    dueDate: '2026-09-10',
    status: 'PARTIAL',
    financialClearance: true,
    lastPaymentRef: 'TXN-UPI-330192',
  },
];

const StudentSelfServiceFeeView: React.FC<{ user: any }> = ({ user }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  const feeData = {
    usn: user?.employeeId || 'CU2024MCA003',
    name: user?.name || 'Arjun Kumar',
    program: 'Master of Computer Applications (MCA)',
    term: 'Semester 3 (Odd 2026-27)',
    totalDemand: 165000,
    paidAmount: 165000,
    balanceDue: 0,
    status: 'CLEARED' as const,
    examClearance: true,
    breakdown: [
      { category: 'Tuition & Academic Pedagogy', amount: 120000, desc: 'Faculty instruction, smart classroom infrastructure, digital syllabus & course materials' },
      { category: 'Cloud Infrastructure & High-Performance GPU Lab', amount: 25000, desc: 'Sandboxed terminal instances, container clusters, AWS/Azure educational allocations' },
      { category: 'Central Examination, Evaluation & PKI Grade Card', amount: 5000, desc: 'Digitally watermarked Hall Tickets, AI theory evaluation, tamper-proof blockchain transcripts' },
      { category: 'Library Digital Commons & Campus Facilities', amount: 15000, desc: 'IEEE Xplore, SpringerLink, ACM digital library access, sports complex & campus WiFi' }
    ],
    receipts: [
      { receiptNo: 'CU/FIN/2026/0892', date: '2026-08-31', ref: 'TXN-HDFC-994821', amount: 165000, mode: 'HDFC SmartHub NetBanking', status: 'SUCCESS' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {paySuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-cu-navy text-white text-xs font-semibold shadow-2xl border border-cu-gold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>DPDP 2023 Compliant • Student Self-Service Finance Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Term Fee Account &amp; Digital Clearance Slip
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Candidate: <span className="font-semibold text-gray-800">{feeData.name}</span> &bull; USN: <span className="font-mono font-bold text-cu-navy">{feeData.usn}</span> &bull; Program: <span className="font-medium text-gray-700">{feeData.program}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cu-navy text-white hover:bg-cu-navy-light rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Printer size={14} className="text-cu-gold" />
            <span>Download Official Fee Receipt Slip</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Total Semester Demand</div>
          <div className="text-2xl font-bold text-cu-navy mt-1">₹ {feeData.totalDemand.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-gray-500 mt-1">{feeData.term}</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Realized Payments</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">₹ {feeData.paidAmount.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">100% Demand Discharged</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Outstanding Balance</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">₹ 0.00</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Zero Pending Dues</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Exam Gate Financial Clearance</div>
          <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-base mt-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck size={16} /> Certified Eligible
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Digital Hall Ticket Unlocked</div>
        </div>
      </div>

      {/* Itemized Fee Structure */}
      <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <Receipt size={16} className="text-cu-gold" />
              <span>Approved Fee Components Breakdown</span>
            </h3>
            <p className="text-xs text-gray-500">Statutory schedule approved by Academic Council for Odd Semester 2026-27.</p>
          </div>
          <span className="text-xs font-mono font-bold text-cu-navy bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            Total: ₹ {feeData.totalDemand.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeData.breakdown.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-cu-border bg-gray-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cu-navy">{item.category}</span>
                <span className="font-mono font-bold text-xs text-gray-900">₹ {item.amount.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-gray-500">{item.desc}</p>
              <div className="pt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> <span>Paid &bull; Verified in Account</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Receipts Ledger */}
      <div className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-cu-navy">Verified Payment Transactions &amp; Bank Receipts</h3>
            <p className="text-xs text-gray-500">Digital acknowledgments issued by Chanakya University Finance Office.</p>
          </div>
          <span className="text-[11px] font-mono text-gray-500">Gateway: HDFC SmartHub / Razorpay Core</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Bank Gateway Ref</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Receipt Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feeData.receipts.map((rec, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-cu-navy">{rec.receiptNo}</td>
                  <td className="py-3 px-4 text-gray-700">{rec.date}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{rec.ref}</td>
                  <td className="py-3 px-4 text-gray-700">{rec.mode}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹ {rec.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 size={10} /> Confirmed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg border border-cu-border hover:bg-white text-cu-navy font-semibold text-xs transition inline-flex items-center gap-1"
                    >
                      <Printer size={12} className="text-cu-gold" />
                      <span>Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Fee Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-cu-border max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>Statutory University Receipt</span>
                </div>
                <h3 className="text-base font-bold text-cu-navy mt-1">Official Fee Payment Acknowledgment Slip</h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 bg-amber-50/20 rounded-2xl border border-amber-200/60 space-y-5 font-sans text-xs text-gray-800 shadow-inner">
              <div className="text-center pb-3 border-b border-gray-300">
                <div className="text-sm font-black text-cu-navy tracking-wider uppercase">Chanakya University Bengaluru</div>
                <div className="text-[11px] text-gray-600 font-semibold">Directorate of Finance &amp; Bursar Services &bull; Vidyaranya Global Campus</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Statutory Academic Fee Payment Acknowledgment &amp; Exam Clearance Slip</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] bg-white p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px]">Student Full Name:</span>
                  <span className="font-bold text-cu-navy text-xs">{feeData.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">University Roll No / USN:</span>
                  <span className="font-mono font-bold text-cu-navy text-xs">{feeData.usn}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Enrolled Degree Program:</span>
                  <span className="font-semibold text-gray-800">{feeData.program}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Academic Term:</span>
                  <span className="font-semibold text-gray-800">{feeData.term}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-cu-navy uppercase tracking-wider">Fee Receipt Particulars</div>
                <table className="w-full text-left border-collapse border border-gray-300 bg-white text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase">
                      <th className="border border-gray-300 p-2">Item</th>
                      <th className="border border-gray-300 p-2 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.breakdown.map((b, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2">{b.category}</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-semibold">₹ {b.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-300 p-2 text-cu-navy">Total Term Demand Paid</td>
                      <td className="border border-gray-300 p-2 text-right font-mono text-emerald-800">₹ {feeData.totalDemand.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] space-y-1 bg-white p-3 rounded-xl border border-gray-200">
                <div><span className="text-gray-500">Amount in Words:</span> <span className="font-bold text-gray-800">Rupees One Lakh Sixty-Five Thousand Only</span></div>
                <div><span className="text-gray-500">Bank Gateway Transaction Ref:</span> <span className="font-mono font-bold text-cu-navy">TXN-HDFC-994821</span></div>
                <div><span className="text-gray-500">Date of Realization:</span> <span className="font-semibold text-gray-800">31-August-2026 14:32 IST</span></div>
                <div><span className="text-gray-500">Statutory Clearance:</span> <span className="font-bold text-emerald-700">Financial Clearance Granted &bull; Eligible for Semester End Exams</span></div>
              </div>

              <div className="flex justify-between items-end pt-3 border-t border-gray-300 text-[10px] text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-white p-0.5 border border-gray-300 rounded-md shadow-2xs">
                    <RealQRCode
                      value={`https://chanakyauniversity.edu.in/verify/fee-receipt?rec=REC-2026-08912&usn=24MCA003&amount=165000&clearance=GRANTED&date=2026-08-31`}
                      size={54}
                      margin={1}
                      fgColor="#002561"
                      bgColor="#ffffff"
                      downloadable={true}
                      copyable={true}
                      alt="Fee Receipt Clearance Verification QR"
                    />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-cu-navy">REC-2026-08912</div>
                    <div>Digital Seal: SHA256:4C89A021F97B003D9E82 &bull; Verified Record</div>
                    <div>Chanakya University Autonomous Enterprise ERP</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold italic text-gray-700">Ramesh Hegde</div>
                  <div className="border-t border-gray-400 pt-0.5">Finance Officer &amp; Bursar</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-cu-navy text-white rounded-xl text-xs font-bold hover:bg-cu-navy-light shadow-sm flex items-center gap-1.5"
              >
                <Printer size={14} className="text-cu-gold" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StudentFeeFinanceView: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'STUDENT') {
    return <StudentSelfServiceFeeView user={user} />;
  }

  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>(INITIAL_FEE_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CLEARED' | 'PARTIAL' | 'OVERDUE'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [txnRef, setTxnRef] = useState('');
  const [noticeSentId, setNoticeSentId] = useState<string | null>(null);

  // Stats
  const totalDemand = feeRecords.reduce((acc, r) => acc + r.totalDemand, 0);
  const totalCollected = feeRecords.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalReceivable = feeRecords.reduce((acc, r) => acc + r.balanceDue, 0);
  const clearedCount = feeRecords.filter(r => r.status === 'CLEARED').length;
  const overdueCount = feeRecords.filter(r => r.status === 'OVERDUE').length;

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpenPayment = (record: StudentFeeRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(record.balanceDue.toString());
    setTxnRef(`TXN-${Date.now().toString().slice(-6)}`);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedRecord) return;
    const payAmt = Number(paymentAmount) || 0;
    if (payAmt <= 0) return;

    setFeeRecords(prev => prev.map(rec => {
      if (rec.id !== selectedRecord.id) return rec;
      const newPaid = rec.paidAmount + payAmt;
      const newBalance = Math.max(0, rec.totalDemand - newPaid);
      const newStatus = newBalance === 0 ? 'CLEARED' : 'PARTIAL';
      return {
        ...rec,
        paidAmount: newPaid,
        balanceDue: newBalance,
        status: newStatus,
        financialClearance: true,
        lastPaymentRef: txnRef || `TXN-POS-${Date.now().toString().slice(-6)}`
      };
    }));

    setPaymentModalOpen(false);
    setSelectedRecord(null);
  };

  const handleToggleClearance = (id: string) => {
    setFeeRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;
      return { ...rec, financialClearance: !rec.financialClearance };
    }));
  };

  const handleSendNotice = (id: string) => {
    setNoticeSentId(id);
    setTimeout(() => {
      setNoticeSentId(null);
    }, 2500);
  };

  const exportLedgerCSV = () => {
    const headers = 'USN,Student Name,Program,Semester,Total Demand (INR),Paid Amount (INR),Balance Due (INR),Status,Financial Clearance\n';
    const rows = feeRecords.map(r => 
      `"${r.usn}","${r.name}","${r.program}","${r.semester}",${r.totalDemand},${r.paidAmount},${r.balanceDue},"${r.status}","${r.financialClearance ? 'APPROVED' : 'ON HOLD'}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Chanakya_University_Fee_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-bold uppercase tracking-wider mb-1">
            <DollarSign size={12} className="text-cu-gold" />
            <span>Finance &amp; Bursar Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Student Fee Accounts &amp; Clearance Console
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Audit term tuition collections, manage balance dues, issue receipts, and grant Hall Ticket financial clearance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportLedgerCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-cu-border rounded-xl text-xs font-semibold text-cu-navy shadow-sm transition"
          >
            <Download size={14} />
            <span>Export Gazette CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Semester Demand</div>
          <div className="text-2xl font-bold text-cu-navy mt-1">₹ {(totalDemand / 100000).toFixed(2)} L</div>
          <div className="text-[10px] text-gray-500 mt-1">Across 7 Sample Batches</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Realized Collections</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">₹ {(totalCollected / 100000).toFixed(2)} L</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {((totalCollected / totalDemand) * 100).toFixed(1)}% Realization Rate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Outstanding Receivables</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">₹ {(totalReceivable / 100000).toFixed(2)} L</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">{overdueCount} Critical Overdue Students</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Exam Gate Financial Cleared</div>
          <div className="text-2xl font-bold text-cu-gold mt-1">
            {feeRecords.filter(r => r.financialClearance).length} / {feeRecords.length}
          </div>
          <div className="text-[10px] text-cu-navy font-semibold mt-1">Hall Tickets Authorized</div>
        </div>
      </div>

      {/* Fee Category Allocation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-xs">
          <div className="text-xs font-semibold text-gray-600">Tuition &amp; Academics</div>
          <div className="text-lg font-bold text-cu-navy mt-1">₹ 1,20,000 / sem</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Faculty, smart labs &amp; curriculum</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-xs">
          <div className="text-xs font-semibold text-gray-600">High Performance Lab &amp; GPU</div>
          <div className="text-lg font-bold text-cu-navy mt-1">₹ 25,000 / sem</div>
          <div className="text-[11px] text-gray-400 mt-0.5">AI Workstations &amp; Cloud Sandbox</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-xs">
          <div className="text-xs font-semibold text-gray-600">Semester Exam &amp; Valuation</div>
          <div className="text-lg font-bold text-cu-navy mt-1">₹ 5,000 / sem</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Proctoring &amp; PKI Grade Cards</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-xs">
          <div className="text-xs font-semibold text-gray-600">Campus Amenity &amp; Library</div>
          <div className="text-lg font-bold text-cu-navy mt-1">₹ 15,000 / sem</div>
          <div className="text-[11px] text-gray-400 mt-0.5">IEEE/Springer access &amp; sports</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student USN, full name, or program..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cu-navy"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'CLEARED', 'PARTIAL', 'OVERDUE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === tab
                  ? 'bg-cu-navy text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'ALL' ? 'All Records' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Student Fee Ledger Table */}
      <div className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-cu-navy">Student Fee Accounts Roster</h3>
            <p className="text-xs text-gray-500">Showing {filteredRecords.length} accounts</p>
          </div>
          <span className="text-[11px] font-mono text-gray-500">Table: finance_fee_records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-4">Student &amp; USN</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Total Demand</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Exam Clearance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No matching student fee records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{record.name}</div>
                      <div className="font-mono text-[11px] text-cu-navy">{record.usn}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div>{record.program}</div>
                      <div className="text-[10px] text-gray-400">{record.semester}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                      ₹ {record.totalDemand.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                      ₹ {record.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {record.balanceDue > 0 ? (
                        <span className="text-rose-600">₹ {record.balanceDue.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-700">₹ 0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">
                      {record.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {record.status === 'CLEARED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          <Check size={11} /> Cleared
                        </span>
                      )}
                      {record.status === 'PARTIAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                          <Clock size={11} /> Partial
                        </span>
                      )}
                      {record.status === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                          <AlertCircle size={11} /> Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleClearance(record.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                          record.financialClearance
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle financial clearance for Digital Hall Ticket"
                      >
                        <ShieldCheck size={12} />
                        <span>{record.financialClearance ? 'Authorized' : 'On Hold'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.balanceDue > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(record)}
                            className="px-2.5 py-1 rounded-lg bg-cu-navy text-white hover:bg-cu-navy-light text-[11px] font-semibold transition"
                          >
                            Collect Fee
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-gray-400 px-2 py-1">
                            {record.lastPaymentRef || 'Settled'}
                          </span>
                        )}

                        {record.balanceDue > 0 && (
                          <button
                            onClick={() => handleSendNotice(record.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-cu-navy transition"
                            title="Send SMS/Email payment reminder"
                          >
                            {noticeSentId === record.id ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scholarship & Endowments Section */}
      <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <Award size={16} className="text-cu-gold" />
              Institutional &amp; Government Scholarship Disbursal Ledger
            </h3>
            <p className="text-xs text-gray-500">Verified through State Scholarship Portal (SSP) &amp; Chanakya Endowment Fund</p>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Total Disbursed: ₹ 24,50,000
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Merit-Cum-Means Grant</span>
              <span className="text-[10px] font-mono text-cu-navy font-semibold">CU-SCH-01</span>
            </div>
            <div className="text-gray-500 text-[11px]">32 Scholars receiving 50% tuition waiver based on CGPA &gt; 9.0</div>
            <div className="font-bold text-emerald-700">₹ 14,00,000 Disbursed</div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Women in STEM Fellowship</span>
              <span className="text-[10px] font-mono text-cu-navy font-semibold">CU-SCH-02</span>
            </div>
            <div className="text-gray-500 text-[11px]">18 M.Tech &amp; MCA female candidates with research stipends</div>
            <div className="font-bold text-emerald-700">₹ 6,50,000 Disbursed</div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">National Sports Excellence</span>
              <span className="text-[10px] font-mono text-cu-navy font-semibold">CU-SCH-03</span>
            </div>
            <div className="text-gray-500 text-[11px]">8 University Athletes with 100% hostel &amp; sports equipment fee waiver</div>
            <div className="font-bold text-emerald-700">₹ 4,00,000 Disbursed</div>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {paymentModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-cu-border shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cu-pill flex items-center justify-center text-cu-navy">
                <Receipt size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cu-navy">Record Student Fee Payment</h4>
                <p className="text-xs text-gray-500">{selectedRecord.name} ({selectedRecord.usn})</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Program:</span>
                <span className="font-semibold text-gray-800">{selectedRecord.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding Balance:</span>
                <span className="font-bold text-rose-600 font-mono">₹ {selectedRecord.balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Amount to Collect (INR):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Payment Mode:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                >
                  <option value="UPI">UPI / QR Transfer (Instant)</option>
                  <option value="NEFT">NEFT / RTGS Bank Transfer</option>
                  <option value="CARD">Credit / Debit POS Terminal</option>
                  <option value="CHALLAN">Bank Demand Draft / Cash Challan</option>
                </select>
              </div>

              {paymentMode === 'UPI' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                  <div className="bg-white p-1 border border-gray-300 rounded-lg shrink-0 shadow-2xs">
                    <RealQRCode
                      value={`upi://pay?pa=chanakyafees@hdfcbank&pn=Chanakya%20University&am=${paymentAmount || '50000'}&cu=INR&tn=${encodeURIComponent(selectedRecord ? `Fee_${selectedRecord.usn}` : 'CU_Academic_Fees')}`}
                      size={80}
                      margin={1}
                      fgColor="#002561"
                      bgColor="#ffffff"
                      centerLogo="UPI"
                      downloadable={true}
                      copyable={true}
                      alt="Chanakya University Official Fee Collection UPI QR"
                    />
                  </div>
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="font-bold text-cu-navy">Instant Institutional UPI Gateway</div>
                    <div className="text-[10px] text-gray-500">Scan using GPay, PhonePe, Paytm, or BHIM</div>
                    <div className="font-mono text-[9px] text-cu-saffron font-bold">VPA: chanakyafees@hdfcbank</div>
                    <div className="text-[9px] text-emerald-700 font-semibold">Auto-reconciliation active</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Transaction Reference / UTR Number:</label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  placeholder="e.g. UTR-9988123"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2 rounded-xl bg-cu-navy text-white text-xs font-semibold hover:bg-cu-navy-light transition shadow-sm"
              >
                Confirm &amp; Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentFeeFinanceView;
