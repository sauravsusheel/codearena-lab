import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, CheckCircle2, Download, Filter, 
  Search, Lock, Unlock, AlertTriangle, ShieldCheck, 
  BarChart2, Save, FileSpreadsheet, Sparkles, RefreshCw
} from 'lucide-react';
import { unifiedAcademicService, SyncedLabSubmission } from '../../../services/unifiedAcademicService';

export interface StudentMarkRecord {
  id: string;
  usn: string;
  name: string;
  fa1: number; // max 15
  midTerm: number; // max 20
  fa2: number; // max 15
  presentation: number; // max 10
  summative: number; // max 40
}

interface CourseGradingMeta {
  code: string;
  name: string;
  department: string;
  facultyName: string;
  credits: number;
}

const COURSES: CourseGradingMeta[] = [
  { code: 'CS301', name: 'Data Structures & Algorithms', department: 'School of Computer Science', facultyName: 'Dr. Rajesh Sharma', credits: 4 },
  { code: 'AI402', name: 'Deep Learning & Neural Architectures', department: 'School of Computer Science', facultyName: 'Prof. Ananya Iyer', credits: 4 },
  { code: 'CS205', name: 'Object-Oriented Programming (Java)', department: 'School of Computer Science', facultyName: 'Dr. Rajesh Sharma', credits: 4 },
  { code: 'MAT101', name: 'Discrete Mathematics & Linear Algebra', department: 'School of Arts & Sciences', facultyName: 'Dr. Vikram Rao', credits: 4 }
];

const INITIAL_RECORDS: Record<string, StudentMarkRecord[]> = {
  CS301: [
    { id: '1', usn: '1CU23CS001', name: 'Aarav Sharma', fa1: 14, midTerm: 18, fa2: 14, presentation: 9, summative: 36 },
    { id: '2', usn: '1CU23CS002', name: 'Ananya Deshmukh', fa1: 15, midTerm: 19, fa2: 15, presentation: 10, summative: 38 },
    { id: '3', usn: '1CU23CS003', name: 'Arjun Kumar', fa1: 11, midTerm: 13, fa2: 10, presentation: 7, summative: 24 },
    { id: '4', usn: '1CU23CS004', name: 'Bhavya Nair', fa1: 14, midTerm: 17, fa2: 14, presentation: 9, summative: 35 },
    { id: '5', usn: '1CU23CS005', name: 'Chetan Rao', fa1: 9, midTerm: 11, fa2: 8, presentation: 6, summative: 18 },
    { id: '6', usn: '1CU23CS006', name: 'Divya Iyer', fa1: 15, midTerm: 20, fa2: 15, presentation: 10, summative: 39 },
    { id: '7', usn: '1CU23CS007', name: 'Gautam Menon', fa1: 8, midTerm: 10, fa2: 7, presentation: 5, summative: 15 },
    { id: '8', usn: '1CU23CS008', name: 'Ishita Joshi', fa1: 13, midTerm: 16, fa2: 13, presentation: 8, summative: 32 },
    { id: '9', usn: '1CU23CS009', name: 'Karthik Raman', fa1: 12, midTerm: 15, fa2: 12, presentation: 8, summative: 30 },
    { id: '10', usn: '1CU23CS010', name: 'Lavanya Sundaram', fa1: 15, midTerm: 19, fa2: 15, presentation: 9, summative: 37 }
  ],
  AI402: [
    { id: '11', usn: '1CU21CS045', name: 'Manoj Hegde', fa1: 14, midTerm: 17, fa2: 14, presentation: 9, summative: 34 },
    { id: '12', usn: '1CU21CS052', name: 'Neha Varma', fa1: 13, midTerm: 18, fa2: 14, presentation: 9, summative: 35 },
    { id: '13', usn: '1CU21CS061', name: 'Pranav Kulkarni', fa1: 9, midTerm: 12, fa2: 10, presentation: 6, summative: 20 },
    { id: '14', usn: '1CU21CS077', name: 'Pooja Reddy', fa1: 15, midTerm: 19, fa2: 15, presentation: 10, summative: 38 },
    { id: '15', usn: '1CU21CS089', name: 'Rahul Sen', fa1: 10, midTerm: 14, fa2: 11, presentation: 7, summative: 22 }
  ],
  CS205: [
    { id: '16', usn: '1CU23CS021', name: 'Rohan Patil', fa1: 14, midTerm: 18, fa2: 13, presentation: 9, summative: 35 },
    { id: '17', usn: '1CU23CS022', name: 'Sanjana Bhat', fa1: 15, midTerm: 19, fa2: 14, presentation: 10, summative: 37 },
    { id: '18', usn: '1CU23CS023', name: 'Siddharth Roy', fa1: 11, midTerm: 12, fa2: 10, presentation: 7, summative: 21 },
    { id: '19', usn: '1CU23CS024', name: 'Tanvi Pillai', fa1: 15, midTerm: 20, fa2: 15, presentation: 10, summative: 39 }
  ],
  MAT101: [
    { id: '20', usn: '1CU24CS001', name: 'Varun Swamy', fa1: 10, midTerm: 13, fa2: 11, presentation: 7, summative: 24 },
    { id: '21', usn: '1CU24CS002', name: 'Vidya Murthy', fa1: 15, midTerm: 19, fa2: 15, presentation: 10, summative: 38 },
    { id: '22', usn: '1CU24CS003', name: 'Yashaswini K', fa1: 12, midTerm: 15, fa2: 12, presentation: 8, summative: 29 }
  ]
};

// UGC 10-Point Grading Scale Helper
export const computeGrade = (total: number): { letter: string; gpa: number; status: 'DISTINCTION' | 'PASS' | 'FAIL'; color: string } => {
  if (total >= 90) return { letter: 'O', gpa: 10.0, status: 'DISTINCTION', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  if (total >= 80) return { letter: 'A+', gpa: 9.0, status: 'DISTINCTION', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (total >= 70) return { letter: 'A', gpa: 8.0, status: 'PASS', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (total >= 60) return { letter: 'B+', gpa: 7.0, status: 'PASS', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
  if (total >= 55) return { letter: 'B', gpa: 6.0, status: 'PASS', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  if (total >= 50) return { letter: 'C', gpa: 5.0, status: 'PASS', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (total >= 40) return { letter: 'P', gpa: 4.0, status: 'PASS', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  return { letter: 'F', gpa: 0.0, status: 'FAIL', color: 'text-rose-700 bg-rose-50 border-rose-200' };
};

export const GradingEvaluationStudio: React.FC = () => {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS301');
  const [recordsMap, setRecordsMap] = useState<Record<string, StudentMarkRecord[]>>(INITIAL_RECORDS);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DISTINCTION' | 'FAIL'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentCourse = COURSES.find(c => c.code === selectedCourseCode) || COURSES[0];
  const currentRecords = recordsMap[selectedCourseCode] || [];

  useEffect(() => {
    const subs = unifiedAcademicService.getLabSubmissions();
    if (subs.length > 0) {
      setRecordsMap(prev => {
        const courseRecords = prev[selectedCourseCode];
        if (!courseRecords) return prev;

        const updated = courseRecords.map(r => {
          const match = subs.find((s: SyncedLabSubmission) => s.usn === r.usn && s.courseCode === selectedCourseCode);
          if (match) {
            const scaledFa2 = Math.min(15, Math.round((match.awardedMarks / 10) * 15));
            return { ...r, fa2: scaledFa2 };
          }
          return r;
        });

        return { ...prev, [selectedCourseCode]: updated };
      });
    }
  }, [selectedCourseCode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateMark = (studentId: string, field: keyof Omit<StudentMarkRecord, 'id' | 'usn' | 'name'>, value: number) => {
    if (isLocked) return;

    // Boundary constraints
    let capped = Math.max(0, value);
    if (field === 'fa1' || field === 'fa2') capped = Math.min(15, capped);
    if (field === 'midTerm') capped = Math.min(20, capped);
    if (field === 'presentation') capped = Math.min(10, capped);
    if (field === 'summative') capped = Math.min(40, capped);

    setRecordsMap(prev => ({
      ...prev,
      [selectedCourseCode]: prev[selectedCourseCode].map(r => r.id === studentId ? { ...r, [field]: capped } : r)
    }));
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
    showToast(isLocked ? 'Marksheet unlocked for academic revisions.' : 'Marksheet digitally signed & locked under Controller of Exams (CoE) protocol.');
  };

  const handleTogglePublish = () => {
    setIsPublished(!isPublished);
    showToast(!isPublished ? 'Grades officially published to Student ERP Portal & DigiLocker.' : 'Grades unpublished from Student Portal.');
  };

  const handleExportCSV = () => {
    const headers = 'USN,Student Name,FA-1 (15),Mid-Term (20),FA-2/Lab (15),Presentation (10),Total Internals (60),Summative Exam (40),Grand Total (100),Letter Grade,Grade Point,Academic Status\n';
    const rows = currentRecords.map(r => {
      const internals = r.fa1 + r.midTerm + r.fa2 + r.presentation;
      const total = internals + r.summative;
      const grade = computeGrade(total);
      return `"${r.usn}","${r.name}",${r.fa1},${r.midTerm},${r.fa2},${r.presentation},${internals},${r.summative},${total},"${grade.letter}",${grade.gpa},"${grade.status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chanakya_University_60_40_Grade_Gazette_${currentCourse.code}.csv`;
    a.click();
  };

  // Filtered Students
  const filteredRecords = currentRecords.filter(r => {
    const internals = r.fa1 + r.midTerm + r.fa2 + r.presentation;
    const total = internals + r.summative;
    const grade = computeGrade(total);

    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.usn.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'DISTINCTION') return grade.status === 'DISTINCTION';
    if (filterMode === 'FAIL') return grade.status === 'FAIL';
    return true;
  });

  // Class Statistics
  const totalCount = currentRecords.length;
  const avgInternals = Math.round((currentRecords.reduce((sum, r) => sum + r.fa1 + r.midTerm + r.fa2 + r.presentation, 0) / (totalCount || 1)) * 10) / 10;
  const avgSummative = Math.round((currentRecords.reduce((sum, r) => sum + r.summative, 0) / (totalCount || 1)) * 10) / 10;
  const avgTotal = Math.round((avgInternals + avgSummative) * 10) / 10;
  const passCount = currentRecords.filter(r => (r.fa1 + r.midTerm + r.fa2 + r.presentation + r.summative) >= 40).length;
  const passRate = Math.round((passCount / (totalCount || 1)) * 100);
  const distinctionCount = currentRecords.filter(r => (r.fa1 + r.midTerm + r.fa2 + r.presentation + r.summative) >= 80).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-cu-navy text-white text-xs font-semibold shadow-2xl border border-cu-gold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Statutory 60:40 NEP Policy Card */}
      <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                NEP 2020 Statutory Rule
              </span>
              <span className="text-xs text-gray-500 font-mono">UGC Autonomous Regulation 2024</span>
            </div>
            <h3 className="font-bold text-lg text-cu-navy flex items-center gap-2">
              <Award size={20} className="text-cu-gold" />
              Continuous Assessment &amp; Semester Grading Studio (60:40 Split)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              60% Continuous Internal Evaluation (CIE) + 40% Semester End Examination (SEE) &bull; 10-Point Relative Scale.
            </p>
          </div>

          {/* Course Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Course:</span>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="bg-gray-50 border border-cu-border text-xs font-bold text-cu-navy rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cu-gold cursor-pointer"
            >
              {COURSES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 60:40 Schema Diagram Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 60% CIE Box */}
          <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold text-sky-950">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                60% Continuous Internal Evaluation (CIE)
              </span>
              <span className="font-mono text-sky-800 text-sm">Max: 60 Marks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">FA-1 Unit Test</div>
                <div className="text-sm font-bold text-cu-navy">15 M</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">Mid-Term Exam</div>
                <div className="text-sm font-bold text-cu-navy">20 M</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">FA-2 / Lab Code</div>
                <div className="text-sm font-bold text-cu-navy">15 M</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">Presentation</div>
                <div className="text-sm font-bold text-cu-navy">10 M</div>
              </div>
            </div>
          </div>

          {/* 40% SEE Box */}
          <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                40% Semester End Examination (SEE)
              </span>
              <span className="font-mono text-amber-800 text-sm">Max: 40 Marks</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
              <div className="bg-white p-2 rounded-lg border border-amber-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">Final Proctored Paper</div>
                <div className="text-sm font-bold text-cu-navy">40 Marks</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-amber-100">
                <div className="text-[10px] text-gray-500 font-sans font-medium">Min Qualifying (40%)</div>
                <div className="text-sm font-bold text-emerald-700">16 Marks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Class Enrolled</span>
          <div className="text-xl font-black text-cu-navy mt-1">{totalCount} Students</div>
          <span className="text-[10px] text-gray-400 font-mono">{currentCourse.code}</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Avg Internals (/60)</span>
          <div className="text-xl font-black text-sky-700 mt-1">{avgInternals}</div>
          <span className="text-[10px] text-sky-600 font-medium">CIE Performance</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Avg Summative (/40)</span>
          <div className="text-xl font-black text-amber-700 mt-1">{avgSummative}</div>
          <span className="text-[10px] text-amber-600 font-medium">SEE Proctored</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Avg Total (/100)</span>
          <div className="text-xl font-black text-cu-navy mt-1">{avgTotal}</div>
          <span className="text-[10px] text-cu-gold font-bold">Grade Average</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Pass Percentage</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{passRate}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">{passCount} of {totalCount} Passed</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500">Distinctions (O / A+)</span>
          <div className="text-xl font-black text-purple-700 mt-1">{distinctionCount}</div>
          <span className="text-[10px] text-purple-600 font-medium">&gt;= 80 Marks</span>
        </div>
      </div>

      {/* Gradebook Actions & Control Bar */}
      <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student name or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-cu-border text-xs">
            <Filter size={12} className="text-cu-navy" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="bg-transparent font-semibold text-cu-navy outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Cohort ({totalCount})</option>
              <option value="DISTINCTION">Distinctions Only ({distinctionCount})</option>
              <option value="FAIL">Failing &lt;40 ({totalCount - passCount})</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> Export Gazette CSV
          </button>

          <button
            onClick={handleToggleLock}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              isLocked 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
                : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{isLocked ? 'Marksheet Locked' : 'Lock Marksheet'}</span>
          </button>

          <button
            onClick={handleTogglePublish}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isPublished
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-cu-navy text-white hover:bg-cu-navy-light'
            }`}
          >
            <ShieldCheck size={14} />
            <span>{isPublished ? 'Published to ERP' : 'Publish Grades'}</span>
          </button>
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">USN / Roll</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 bg-sky-50/50 text-sky-900">FA-1 (15)</th>
                <th className="p-3 bg-sky-50/50 text-sky-900">Mid-Sem (20)</th>
                <th className="p-3 bg-sky-50/50 text-sky-900">FA-2/Lab (15)</th>
                <th className="p-3 bg-sky-50/50 text-sky-900">Viva/Pres (10)</th>
                <th className="p-3 bg-sky-100/70 font-bold text-sky-950">CIE Total (60)</th>
                <th className="p-3 bg-amber-50/70 text-amber-950">SEE Final (40)</th>
                <th className="p-3 font-black text-cu-navy">Grand Total (100)</th>
                <th className="p-3 text-center">Letter Grade</th>
                <th className="p-3 text-center">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-gray-400 italic">
                    No student marks found for current search.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const internals = r.fa1 + r.midTerm + r.fa2 + r.presentation;
                  const total = internals + r.summative;
                  const grade = computeGrade(total);

                  return (
                    <tr key={r.id} className="hover:bg-blue-50/20 transition">
                      <td className="p-3 font-mono font-bold text-cu-navy">{r.usn}</td>
                      <td className="p-3 font-semibold text-gray-800">{r.name}</td>
                      
                      {/* Editable FA-1 (max 15) */}
                      <td className="p-2.5 bg-sky-50/30">
                        <input
                          type="number"
                          min={0}
                          max={15}
                          disabled={isLocked}
                          value={r.fa1}
                          onChange={(e) => handleUpdateMark(r.id, 'fa1', Number(e.target.value))}
                          className="w-14 p-1 rounded border border-sky-200 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-cu-gold outline-none disabled:bg-gray-100"
                        />
                      </td>

                      {/* Editable Mid-Term (max 20) */}
                      <td className="p-2.5 bg-sky-50/30">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          disabled={isLocked}
                          value={r.midTerm}
                          onChange={(e) => handleUpdateMark(r.id, 'midTerm', Number(e.target.value))}
                          className="w-14 p-1 rounded border border-sky-200 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-cu-gold outline-none disabled:bg-gray-100"
                        />
                      </td>

                      {/* Editable FA-2 (max 15) */}
                      <td className="p-2.5 bg-sky-50/30">
                        <input
                          type="number"
                          min={0}
                          max={15}
                          disabled={isLocked}
                          value={r.fa2}
                          onChange={(e) => handleUpdateMark(r.id, 'fa2', Number(e.target.value))}
                          className="w-14 p-1 rounded border border-sky-200 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-cu-gold outline-none disabled:bg-gray-100"
                        />
                      </td>

                      {/* Editable Presentation (max 10) */}
                      <td className="p-2.5 bg-sky-50/30">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          disabled={isLocked}
                          value={r.presentation}
                          onChange={(e) => handleUpdateMark(r.id, 'presentation', Number(e.target.value))}
                          className="w-14 p-1 rounded border border-sky-200 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-cu-gold outline-none disabled:bg-gray-100"
                        />
                      </td>

                      {/* Computed CIE Internals (out of 60) */}
                      <td className="p-3 bg-sky-100/50 font-mono font-black text-sky-950 text-sm">
                        {internals} / 60
                      </td>

                      {/* Editable Summative SEE (max 40) */}
                      <td className="p-2.5 bg-amber-50/40">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          disabled={isLocked}
                          value={r.summative}
                          onChange={(e) => handleUpdateMark(r.id, 'summative', Number(e.target.value))}
                          className="w-14 p-1 rounded border border-amber-200 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-cu-gold outline-none disabled:bg-gray-100"
                        />
                      </td>

                      {/* Grand Total (out of 100) */}
                      <td className="p-3 font-mono font-black text-cu-navy text-sm">
                        {total}
                      </td>

                      {/* Letter Grade */}
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${grade.color}`}>
                          {grade.letter}
                        </span>
                      </td>

                      {/* GPA Point */}
                      <td className="p-3 text-center font-mono font-bold text-gray-700">
                        {grade.gpa.toFixed(1)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
