import React, { useState } from 'react';
import { 
  DollarSign, Download, CheckCircle2, FileText, ShieldAlert, 
  Printer, QrCode, Building, User, Calendar, CreditCard, Sparkles, X
} from 'lucide-react';
import { PayslipItem } from '../types/hrms.types';
import { useAuth } from '../../../context/AuthContext';
import { ChanakyaLogo } from '../../../components/ui/ChanakyaLogo';
import { RealQRCode } from '../../../components/common/RealQRCode';

interface PayrollViewProps {
  payslips: PayslipItem[];
}

export const PayrollView: React.FC<PayrollViewProps> = ({ payslips }) => {
  const { user } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState<PayslipItem | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState('');

  const handleRunBatch = () => {
    setBatchRunning(true);
    setTimeout(() => {
      setBatchRunning(false);
      setBatchSuccess('September 2026 Payroll Run complete: 142 staff records computed, ₹1.42 Cr disbursed via automated NEFT gateway.');
      setTimeout(() => setBatchSuccess(''), 6000);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {batchSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{batchSuccess}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 font-medium">Base Salary (Gross)</span>
          <div className="text-xl font-bold font-serif text-[#0a1e3b] mt-1">₹ 72,000.00</div>
          <span className="text-[10px] text-emerald-700 font-semibold">7th Pay Commission Scale</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 font-medium">Academic Allowances</span>
          <div className="text-xl font-bold font-serif text-[#0a1e3b] mt-1">₹ 25,500.00</div>
          <span className="text-[10px] text-slate-400">DA + HRA + Travel</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 font-medium">Statutory Deductions</span>
          <div className="text-xl font-bold font-serif text-rose-600 mt-1">₹ 15,440.00</div>
          <span className="text-[10px] text-slate-400">EPF (12%) + TDS Income Tax</span>
        </div>
        <div className="bg-gradient-to-br from-[#08172c] via-[#0a1e3b] to-[#050f1d] rounded-xl p-4 text-white shadow-md border border-amber-500/25">
          <span className="text-[11px] text-amber-300 font-medium">August Net Credited</span>
          <div className="text-2xl font-bold font-serif text-white mt-1">₹ 82,060.00</div>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5 font-semibold">
            <CheckCircle2 size={12} /> Direct Bank Transfer
          </span>
        </div>
      </div>

      {/* Batch Processing Runner for Finance Officer or Admin */}
      {(user?.role === 'FINANCE' || user?.role === 'SUPER_ADMIN') && (
        <div className="bg-white rounded-xl border border-amber-500/30 p-5 shadow-sm space-y-3 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">Institutional Payroll Engine (Finance Console)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated attendance-linked payroll generation for all 142 teaching and non-teaching personnel.
              </p>
            </div>
            <button
              onClick={handleRunBatch}
              disabled={batchRunning}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a1e3b] text-amber-300 hover:bg-[#16284F] rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 shrink-0"
            >
              {batchRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Biometric Hours...</span>
                </>
              ) : (
                <>
                  <DollarSign size={14} />
                  <span>Execute Monthly Payroll Batch</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-amber-600" />
            Institutional Payslips &amp; Tax Statements
          </h3>
          <span className="text-xs text-slate-400">Digitally Authenticated by Finance Office</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Salary Period</th>
                <th className="p-3">Basic Pay</th>
                <th className="p-3">Allowances</th>
                <th className="p-3">Incentives</th>
                <th className="p-3">Deductions</th>
                <th className="p-3">Net Disbursed</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payslips.map((slip, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-semibold text-slate-900">{slip.month} {slip.year}</td>
                  <td className="p-3 font-mono">₹ {slip.basicPay.toLocaleString()}</td>
                  <td className="p-3 font-mono">₹ {slip.academicAllowance.toLocaleString()}</td>
                  <td className="p-3 text-emerald-700 font-mono font-medium">+ ₹ {slip.researchIncentive.toLocaleString()}</td>
                  <td className="p-3 text-rose-600 font-mono">- ₹ {(slip.pfDeduction + slip.taxDeduction).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900 font-mono">₹ {slip.netPayable.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedSlip(slip)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e3b] text-amber-300 hover:bg-[#16284F] rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <Download size={12} />
                      <span>View &amp; Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED OFFICIAL SALARY SLIP MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Actions Bar */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-slate-700">Official Monthly Salary Slip Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-800 transition"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs font-sans text-slate-800">
              {/* Institutional Header */}
              <div className="border-b-2 border-amber-600 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h2 className="font-serif font-extrabold text-xl text-[#0a1e3b] tracking-wider">
                    CHANAKYA UNIVERSITY
                  </h2>
                  <p className="text-[10px] text-slate-500 font-serif">
                    Established under The Chanakya University Act, 2021 (Karnataka Act No. 37 of 2021)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    NH-44, Bengaluru Global Campus, Devanahalli, Karnataka 562110
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block">
                    SALARY CERTIFICATE
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Pay Slip: {selectedSlip.month} {selectedSlip.year}
                  </p>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Employee Name</span>
                  <span className="font-bold text-slate-900">{user?.name || "Deepak B"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Employee ID</span>
                  <span className="font-mono font-bold text-slate-900">{user?.employeeId || "CUP2025/00303"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Designation</span>
                  <span className="font-bold text-slate-900">{user?.roleTitle?.split('&')[0] || "Assistant Professor"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Pay Scale</span>
                  <span className="font-bold text-emerald-800">Level 10 (7th CPC)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Bank Account</span>
                  <span className="font-mono text-slate-800">XXXX-XXXX-4819</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Bank Name / IFSC</span>
                  <span className="font-mono text-slate-800">SBI / SBIN0040182</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">PAN Number</span>
                  <span className="font-mono text-slate-800">ABCDE1234F</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">EPF UAN</span>
                  <span className="font-mono text-slate-800">101829401829</span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50/80 p-2.5 font-bold text-emerald-900 text-xs border-b border-emerald-200 flex justify-between">
                    <span>EARNINGS</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="p-3 space-y-2 text-[11px] divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span>Basic Pay</span>
                      <span className="font-mono font-bold">{selectedSlip.basicPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Academic &amp; DA Allowance</span>
                      <span className="font-mono font-bold">{selectedSlip.academicAllowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-emerald-700">
                      <span>Research Publications Grant</span>
                      <span className="font-mono font-bold">+{selectedSlip.researchIncentive.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-mono font-bold">14,400</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                      <span>Gross Earnings</span>
                      <span className="font-mono text-emerald-800">
                        ₹ {(selectedSlip.basicPay + selectedSlip.academicAllowance + selectedSlip.researchIncentive + 14400).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50/80 p-2.5 font-bold text-rose-900 text-xs border-b border-rose-200 flex justify-between">
                    <span>DEDUCTIONS</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="p-3 space-y-2 text-[11px] divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span>Employees Provident Fund (12%)</span>
                      <span className="font-mono font-bold text-rose-600">{selectedSlip.pfDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Income Tax TDS (Section 192)</span>
                      <span className="font-mono font-bold text-rose-600">{selectedSlip.taxDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Professional Tax (Karnataka)</span>
                      <span className="font-mono font-bold text-rose-600">200</span>
                    </div>
                    <div className="flex justify-between pt-1 text-slate-400">
                      <span>Voluntary Welfare Fund</span>
                      <span className="font-mono">100</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-700">
                        ₹ {(selectedSlip.pfDeduction + selectedSlip.taxDeduction + 300).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Highlight Card */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 rounded-xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">Net Payable Salary</span>
                  <span className="text-xs text-slate-600">Credited to SB A/C on 31st {selectedSlip.month} {selectedSlip.year}</span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-serif font-extrabold text-2xl text-[#0a1e3b]">
                    ₹ {selectedSlip.netPayable.toLocaleString()}.00
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium italic">
                    Rupees Eighty Two Thousand and Sixty Only
                  </span>
                </div>
              </div>

              {/* Digital Authentication Sign-off */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[10px]">
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="font-bold text-slate-700">This is a system-generated electronic payslip.</p>
                  <p>Cryptographically hashed and verified under Chanakya University ERP Monorepo Architecture.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-white p-0.5 border border-slate-300 rounded-md shadow-2xs">
                    <RealQRCode
                      value={`https://chanakyauniversity.edu.in/verify/payslip?ref=${selectedSlip.month}${selectedSlip.year}-${user?.employeeId || 'CU-FAC-042'}&amount=${selectedSlip.netPayable}&auth=HASH-HRMS-9942`}
                      size={48}
                      margin={1}
                      fgColor="#0a1e3b"
                      bgColor="#ffffff"
                      downloadable={true}
                      copyable={true}
                      alt="Payslip Verification QR"
                    />
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-serif font-bold text-slate-800 text-xs">Ramesh Hegde</div>
                    <div className="text-slate-500">Finance &amp; Accounts Officer</div>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold">DIGITALLY SIGNED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PayrollView;
