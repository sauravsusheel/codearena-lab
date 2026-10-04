import React from 'react';
import { GraduationCap, Printer, ShieldCheck, X, Calendar, AlertCircle } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';

interface DigitalHallTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentUsn?: string;
}

interface ExamPaperEntry {
  courseCode: string;
  courseTitle: string;
  date: string;
  timeSlot: string;
  seatNumber: string;
  roomHall: string;
}

const REGISTERED_PAPERS: ExamPaperEntry[] = [
  { courseCode: 'CS301', courseTitle: 'Data Structures & Algorithms', date: 'Sep 08, 2026', timeSlot: '09:30 AM – 12:30 PM', seatNumber: 'H2-B14', roomHall: 'Exam Hall 304' },
  { courseCode: 'AI402', courseTitle: 'Deep Learning & Neural Architectures', date: 'Sep 11, 2026', timeSlot: '09:30 AM – 12:30 PM', seatNumber: 'H2-B14', roomHall: 'Exam Hall 304' },
  { courseCode: 'CS205', courseTitle: 'Object-Oriented Programming (Java)', date: 'Sep 15, 2026', timeSlot: '09:30 AM – 12:30 PM', seatNumber: 'H2-B14', roomHall: 'Exam Hall 304' },
  { courseCode: 'MAT101', courseTitle: 'Discrete Mathematics & Linear Algebra', date: 'Sep 18, 2026', timeSlot: '09:30 AM – 12:30 PM', seatNumber: 'H2-B14', roomHall: 'Exam Hall 304' },
  { courseCode: 'PRG301L', courseTitle: 'Advanced Cloud Systems Lab Practical', date: 'Sep 21, 2026', timeSlot: '02:00 PM – 05:00 PM', seatNumber: 'PC-18', roomHall: 'Computing Lab Alpha' }
];

export const DigitalHallTicketModal: React.FC<DigitalHallTicketModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Aarav Sharma',
  studentUsn = '1CU23CS001'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-cu-border animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-cu-navy font-bold text-sm">
            <GraduationCap size={18} className="text-cu-gold" />
            <span>Digital Examination Hall Ticket &bull; Odd Semester 2026-27</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition"
            >
              <Printer size={13} />
              <span>Print Hall Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Hall Ticket Pass */}
        <div className="border-2 border-cu-navy p-6 sm:p-8 rounded-xl space-y-6 bg-white shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-cu-navy pb-4">
            <div>
              <div className="font-serif font-black text-xl text-cu-navy tracking-tight">
                CHANAKYA UNIVERSITY
              </div>
              <div className="text-[10px] font-bold text-cu-gold tracking-widest uppercase">
                Autonomous Controller of Examinations &bull; Hall Ticket
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                End-Semester Degree Examinations &bull; Odd Semester 2026-27
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    ATTENDANCE CLEARED: 92.4%
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-300">
                    FINANCE CLEARED: NIL DUE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Seat # H2-B14 &bull; Roll 1CU23CS001</div>
              </div>
              <div className="w-12 h-12 bg-cu-navy text-white rounded-xl flex items-center justify-center font-bold text-sm">
                CU
              </div>
            </div>
          </div>

          {/* Candidate Profile Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs border border-gray-200">
            <div>
              <span className="text-gray-400 font-medium">Candidate Name:</span>
              <div className="font-bold text-cu-navy mt-0.5">{studentName}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">USN / Roll Number:</span>
              <div className="font-mono font-bold text-cu-navy mt-0.5">{studentUsn}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Program / Branch:</span>
              <div className="font-bold text-cu-navy mt-0.5">MCA (Computer Science)</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Exam Center:</span>
              <div className="font-bold text-cu-navy mt-0.5">Campus Academic Block 2</div>
            </div>
          </div>

          {/* Registered Examination Papers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cu-navy text-white font-semibold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time Slot</th>
                  <th className="p-2.5">Course Code</th>
                  <th className="p-2.5">Subject Title</th>
                  <th className="p-2.5">Venue</th>
                  <th className="p-2.5 text-center">Invigilator Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {REGISTERED_PAPERS.map((p) => (
                  <tr key={p.courseCode} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-bold text-gray-800">{p.date}</td>
                    <td className="p-2.5 font-mono text-[11px] text-gray-600">{p.timeSlot}</td>
                    <td className="p-2.5 font-mono font-bold text-cu-navy">{p.courseCode}</td>
                    <td className="p-2.5 font-semibold text-gray-800">{p.courseTitle}</td>
                    <td className="p-2.5 text-gray-600">{p.roomHall} ({p.seatNumber})</td>
                    <td className="p-2.5 border-l border-gray-100 w-24"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mandatory Instructions & QR Token */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="shrink-0 bg-white border border-gray-300 rounded-lg p-0.5 shadow-2xs">
                <RealQRCode
                  value={`https://chanakyauniversity.edu.in/verify/hallticket?usn=${studentUsn || '24MCA003'}&seat=1A-04&exam=DEC2026&token=7FA9-823B-9810-CU26&status=VERIFIED`}
                  size={54}
                  margin={1}
                  fgColor="#0a1e3b"
                  bgColor="#ffffff"
                  downloadable={true}
                  copyable={true}
                  alt="Biometric Gate Token QR"
                />
              </div>
              <div>
                <div className="font-bold text-cu-navy">Biometric Gate Token</div>
                <div className="text-[10px] text-gray-500">Scan at Hall Entrance with Smart QR</div>
                <div className="font-mono text-[9px] text-gray-400">HASH: 7FA9-823B-9810-CU26</div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 max-w-sm space-y-1">
              <div className="font-bold text-gray-700">Exam Rules:</div>
              <div>&bull; Candidates must be seated 15 minutes before scheduled commencement.</div>
              <div>&bull; No unauthorized smart devices, programmable watches, or loose paper.</div>
              <div>&bull; 75% attendance threshold verified and locked by Controller of Exams.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
