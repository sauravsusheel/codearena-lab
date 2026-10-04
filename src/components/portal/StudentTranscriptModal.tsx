import React from 'react';
import { Award, Download, Printer, CheckCircle2, ShieldCheck, X, FileText } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';

interface StudentTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentUsn?: string;
}

interface TranscriptCourse {
  code: string;
  title: string;
  credits: number;
  fa1: number; // /15
  midTerm: number; // /20
  fa2: number; // /15
  viva: number; // /10
  cieTotal: number; // /60
  seeFinal: number; // /40
  total: number; // /100
  grade: string;
  gradePoint: number;
}

const TRANSCRIPT_COURSES: TranscriptCourse[] = [
  { code: 'CS301', title: 'Data Structures & Algorithms', credits: 4, fa1: 14, midTerm: 18, fa2: 14, viva: 9, cieTotal: 55, seeFinal: 36, total: 91, grade: 'O', gradePoint: 10.0 },
  { code: 'AI402', title: 'Deep Learning & Neural Architectures', credits: 4, fa1: 15, midTerm: 19, fa2: 15, viva: 10, cieTotal: 59, seeFinal: 38, total: 97, grade: 'O', gradePoint: 10.0 },
  { code: 'CS205', title: 'Object-Oriented Programming (Java)', credits: 4, fa1: 14, midTerm: 18, fa2: 13, viva: 9, cieTotal: 54, seeFinal: 35, total: 89, grade: 'A+', gradePoint: 9.0 },
  { code: 'MAT101', title: 'Discrete Mathematics & Linear Algebra', credits: 4, fa1: 13, midTerm: 16, fa2: 14, viva: 8, cieTotal: 51, seeFinal: 33, total: 84, grade: 'A+', gradePoint: 9.0 },
  { code: 'PRG301L', title: 'Advanced Cloud Systems Lab', credits: 2, fa1: 15, midTerm: 19, fa2: 15, viva: 10, cieTotal: 59, seeFinal: 39, total: 98, grade: 'O', gradePoint: 10.0 },
  { code: 'ENG201', title: 'Technical Writing & Seminar Defense', credits: 2, fa1: 14, midTerm: 17, fa2: 14, viva: 9, cieTotal: 54, seeFinal: 34, total: 88, grade: 'A+', gradePoint: 9.0 }
];

export const StudentTranscriptModal: React.FC<StudentTranscriptModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Aarav Sharma',
  studentUsn = '1CU23CS001'
}) => {
  if (!isOpen) return null;

  const totalCredits = TRANSCRIPT_COURSES.reduce((acc, c) => acc + c.credits, 0);
  const totalWeightedPoints = TRANSCRIPT_COURSES.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
  const sgpa = (totalWeightedPoints / totalCredits).toFixed(2);
  const cgpa = '9.28';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-cu-border animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-cu-navy font-bold text-sm">
            <Award size={18} className="text-cu-gold" />
            <span>Official Academic Transcript &bull; NEP 2020 Continuous Evaluation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Container */}
        <div className="border-2 border-cu-navy/20 p-6 sm:p-8 rounded-xl space-y-6 bg-white shadow-xs">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-cu-gold pb-5">
            <div>
              <div className="font-serif font-black text-2xl text-cu-navy tracking-tight">
                CHANAKYA UNIVERSITY
              </div>
              <div className="text-[11px] font-bold text-cu-gold tracking-wider uppercase mt-0.5">
                Leadership &bull; Knowledge &bull; Character
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Established under Karnataka Act No. 24 of 2021 &bull; Autonomous Academic Senate
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                PROVISIONAL GRADE CARD
              </span>
              <div className="text-xs font-mono text-gray-500 mt-1">Ref: CU/EXAM/2026/TR-9821</div>
              <div className="text-xs text-gray-400">Date of Issue: Sep 06, 2026</div>
            </div>
          </div>

          {/* Student Profile Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-xl text-xs border border-gray-100">
            <div>
              <span className="text-gray-400 font-medium">Candidate Name:</span>
              <div className="font-bold text-cu-navy mt-0.5">{studentName}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">University Seat No (USN):</span>
              <div className="font-mono font-bold text-cu-navy mt-0.5">{studentUsn}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Program / Degree:</span>
              <div className="font-bold text-cu-navy mt-0.5">Master of Computer Applications (MCA)</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Academic Session:</span>
              <div className="font-bold text-cu-navy mt-0.5">Odd Semester 2026-27 (Sem 3)</div>
            </div>
          </div>

          {/* 60:40 Course Evaluation Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cu-navy text-white font-semibold">
                <tr>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Course Title</th>
                  <th className="p-2.5 text-center">Credits</th>
                  <th className="p-2.5 text-center bg-blue-900/60">FA-1 (15)</th>
                  <th className="p-2.5 text-center bg-blue-900/60">Mid (20)</th>
                  <th className="p-2.5 text-center bg-blue-900/60">FA-2 (15)</th>
                  <th className="p-2.5 text-center bg-blue-900/60">Viva (10)</th>
                  <th className="p-2.5 text-center font-bold">CIE (60)</th>
                  <th className="p-2.5 text-center bg-amber-900/60">SEE (40)</th>
                  <th className="p-2.5 text-center font-black">Total (100)</th>
                  <th className="p-2.5 text-center">Grade</th>
                  <th className="p-2.5 text-center">GP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {TRANSCRIPT_COURSES.map((c) => (
                  <tr key={c.code} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono font-bold text-cu-navy">{c.code}</td>
                    <td className="p-2.5 font-semibold text-gray-800">{c.title}</td>
                    <td className="p-2.5 text-center font-bold text-gray-700">{c.credits}</td>
                    <td className="p-2.5 text-center text-gray-600">{c.fa1}</td>
                    <td className="p-2.5 text-center text-gray-600">{c.midTerm}</td>
                    <td className="p-2.5 text-center text-gray-600">{c.fa2}</td>
                    <td className="p-2.5 text-center text-gray-600">{c.viva}</td>
                    <td className="p-2.5 text-center font-bold text-sky-800">{c.cieTotal}</td>
                    <td className="p-2.5 text-center font-bold text-amber-800">{c.seeFinal}</td>
                    <td className="p-2.5 text-center font-black text-cu-navy">{c.total}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200">
                        {c.grade}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-gray-800">{c.gradePoint.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Semester Summary & GPA Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cu-pill/50 p-4 rounded-xl text-center border border-cu-border">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Total Credits Registered</div>
              <div className="text-xl font-bold text-cu-navy mt-1">{totalCredits} Credits</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Total Credits Earned</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{totalCredits} Credits</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Semester GPA (SGPA)</div>
              <div className="text-2xl font-black text-cu-navy mt-1">{sgpa} / 10.0</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Cumulative GPA (CGPA)</div>
              <div className="text-2xl font-black text-cu-gold mt-1">{cgpa} / 10.0</div>
            </div>
          </div>

          {/* Authentication & Signature Verification Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="shrink-0 bg-white border border-gray-300 rounded-lg p-0.5 shadow-2xs">
                <RealQRCode
                  value={`https://chanakyauniversity.edu.in/verify/transcript?student=${encodeURIComponent(studentName || 'Arjun Kumar')}&usn=${studentUsn || '24MCA003'}&hash=8b7d91e3f841c7b049e29a882e3410dc937a09bf&sgpa=9.25&cgpa=9.18&status=CONFERRED`}
                  size={54}
                  margin={1}
                  fgColor="#0a1e3b"
                  bgColor="#ffffff"
                  downloadable={true}
                  copyable={true}
                  alt="Student Transcript Verification QR"
                />
              </div>
              <div>
                <div className="font-bold text-cu-navy">Digital Verification Hash</div>
                <div className="font-mono text-[9px] text-gray-400 max-w-xs break-all">
                  SHA256: 8b7d91e3f841c7b049e29a882e3410dc937a09bf
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={11} /> DigiLocker Verified Record
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="font-serif italic font-bold text-cu-navy text-sm">
                Dr. R. K. Bhattacharya
              </div>
              <div className="text-xs font-bold text-gray-700">Controller of Examinations (CoE)</div>
              <div className="text-[10px] text-gray-400">Chanakya University Academic Senate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
