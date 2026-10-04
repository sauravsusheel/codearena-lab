import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Clock, Users, CheckCircle2, XCircle, 
  AlertTriangle, Save, Download, Filter, Search, UserCheck, 
  MapPin, FileText, ChevronRight, BarChart3, ShieldAlert, Check,
  Upload, ShieldCheck, FileSpreadsheet, Lock, X, Award, QrCode
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { RealQRCode } from '../../../components/common/RealQRCode';

export interface CourseStudentItem {
  id: string;
  usn: string;
  name: string;
  email: string;
  totalClassesHeld: number;
  attendedClasses: number;
  currentStatus: 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'LATE';
  remarks?: string;
}

export interface AcademicCourseMeta {
  code: string;
  name: string;
  school: string;
  credits: number;
  facultyName: string;
  totalSessionsHeld: number;
  averageAttendancePct: number;
  students: CourseStudentItem[];
}

const COURSES_DATA: AcademicCourseMeta[] = [
  {
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    school: 'School of Computer Science',
    credits: 4,
    facultyName: 'Dr. Rajesh Sharma',
    totalSessionsHeld: 32,
    averageAttendancePct: 86.4,
    students: [
      { id: 's1', usn: '1CU23CS001', name: 'Aarav Sharma', email: 'aarav.s@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 30, currentStatus: 'PRESENT' },
      { id: 's2', usn: '1CU23CS002', name: 'Ananya Deshmukh', email: 'ananya.d@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 29, currentStatus: 'PRESENT' },
      { id: 's3', usn: '1CU23CS003', name: 'Arjun Kumar', email: 'arjun.k@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 21, currentStatus: 'ABSENT', remarks: 'Medical leave certificate pending' },
      { id: 's4', usn: '1CU23CS004', name: 'Bhavya Nair', email: 'bhavya.n@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 31, currentStatus: 'PRESENT' },
      { id: 's5', usn: '1CU23CS005', name: 'Chetan Rao', email: 'chetan.r@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 22, currentStatus: 'PRESENT' },
      { id: 's6', usn: '1CU23CS006', name: 'Divya Iyer', email: 'divya.i@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 32, currentStatus: 'PRESENT' },
      { id: 's7', usn: '1CU23CS007', name: 'Gautam Menon', email: 'gautam.m@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 20, currentStatus: 'ABSENT' },
      { id: 's8', usn: '1CU23CS008', name: 'Ishita Joshi', email: 'ishita.j@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 28, currentStatus: 'PRESENT' },
      { id: 's9', usn: '1CU23CS009', name: 'Karthik Raman', email: 'karthik.r@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 27, currentStatus: 'ON_DUTY', remarks: 'Inter-University Hackathon' },
      { id: 's10', usn: '1CU23CS010', name: 'Lavanya Sundaram', email: 'lavanya.s@chanakya.edu.in', totalClassesHeld: 32, attendedClasses: 31, currentStatus: 'PRESENT' }
    ]
  },
  {
    code: 'AI402',
    name: 'Deep Learning & Neural Architectures',
    school: 'School of Computer Science',
    credits: 4,
    facultyName: 'Prof. Ananya Iyer',
    totalSessionsHeld: 28,
    averageAttendancePct: 82.1,
    students: [
      { id: 's11', usn: '1CU21CS045', name: 'Manoj Hegde', email: 'manoj.h@chanakya.edu.in', totalClassesHeld: 28, attendedClasses: 26, currentStatus: 'PRESENT' },
      { id: 's12', usn: '1CU21CS052', name: 'Neha Varma', email: 'neha.v@chanakya.edu.in', totalClassesHeld: 28, attendedClasses: 25, currentStatus: 'PRESENT' },
      { id: 's13', usn: '1CU21CS061', name: 'Pranav Kulkarni', email: 'pranav.k@chanakya.edu.in', totalClassesHeld: 28, attendedClasses: 19, currentStatus: 'ABSENT' },
      { id: 's14', usn: '1CU21CS077', name: 'Pooja Reddy', email: 'pooja.r@chanakya.edu.in', totalClassesHeld: 28, attendedClasses: 27, currentStatus: 'PRESENT' },
      { id: 's15', usn: '1CU21CS089', name: 'Rahul Sen', email: 'rahul.s@chanakya.edu.in', totalClassesHeld: 28, attendedClasses: 20, currentStatus: 'PRESENT' }
    ]
  },
  {
    code: 'CS205',
    name: 'Object-Oriented Programming (Java)',
    school: 'School of Computer Science',
    credits: 4,
    facultyName: 'Dr. Rajesh Sharma',
    totalSessionsHeld: 30,
    averageAttendancePct: 89.2,
    students: [
      { id: 's16', usn: '1CU23CS021', name: 'Rohan Patil', email: 'rohan.p@chanakya.edu.in', totalClassesHeld: 30, attendedClasses: 28, currentStatus: 'PRESENT' },
      { id: 's17', usn: '1CU23CS022', name: 'Sanjana Bhat', email: 'sanjana.b@chanakya.edu.in', totalClassesHeld: 30, attendedClasses: 29, currentStatus: 'PRESENT' },
      { id: 's18', usn: '1CU23CS023', name: 'Siddharth Roy', email: 'siddharth.r@chanakya.edu.in', totalClassesHeld: 30, attendedClasses: 22, currentStatus: 'LATE', remarks: 'Bus breakdown' },
      { id: 's19', usn: '1CU23CS024', name: 'Tanvi Pillai', email: 'tanvi.p@chanakya.edu.in', totalClassesHeld: 30, attendedClasses: 30, currentStatus: 'PRESENT' }
    ]
  },
  {
    code: 'MAT101',
    name: 'Discrete Mathematics & Linear Algebra',
    school: 'School of Arts & Sciences',
    credits: 4,
    facultyName: 'Dr. Vikram Rao',
    totalSessionsHeld: 34,
    averageAttendancePct: 78.5,
    students: [
      { id: 's20', usn: '1CU24CS001', name: 'Varun Swamy', email: 'varun.s@chanakya.edu.in', totalClassesHeld: 34, attendedClasses: 24, currentStatus: 'ABSENT' },
      { id: 's21', usn: '1CU24CS002', name: 'Vidya Murthy', email: 'vidya.m@chanakya.edu.in', totalClassesHeld: 34, attendedClasses: 32, currentStatus: 'PRESENT' },
      { id: 's22', usn: '1CU24CS003', name: 'Yashaswini K', email: 'yashaswini.k@chanakya.edu.in', totalClassesHeld: 34, attendedClasses: 25, currentStatus: 'PRESENT' }
    ]
  },
  {
    code: 'MGT201',
    name: 'Organizational Behavior & Leadership',
    school: 'School of Management',
    credits: 3,
    facultyName: 'Dr. Sneha Patel',
    totalSessionsHeld: 24,
    averageAttendancePct: 91.0,
    students: [
      { id: 's23', usn: '1CU23MB008', name: 'Aditya Birla', email: 'aditya.b@chanakya.edu.in', totalClassesHeld: 24, attendedClasses: 22, currentStatus: 'PRESENT' },
      { id: 's24', usn: '1CU23MB015', name: 'Deepa Narayan', email: 'deepa.n@chanakya.edu.in', totalClassesHeld: 24, attendedClasses: 24, currentStatus: 'PRESENT' }
    ]
  },
  {
    code: 'LAW302',
    name: 'Cyber Law & IPR Jurisprudence',
    school: 'School of Law',
    credits: 3,
    facultyName: 'Prof. K. Venkatesh',
    totalSessionsHeld: 26,
    averageAttendancePct: 88.0,
    students: [
      { id: 's25', usn: '1CU22LW012', name: 'Harish Chandra', email: 'harish.c@chanakya.edu.in', totalClassesHeld: 26, attendedClasses: 24, currentStatus: 'PRESENT' },
      { id: 's26', usn: '1CU22LW019', name: 'Meera Nambiar', email: 'meera.n@chanakya.edu.in', totalClassesHeld: 26, attendedClasses: 23, currentStatus: 'PRESENT' }
    ]
  }
];

export const CourseManualAttendance: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<AcademicCourseMeta[]>(COURSES_DATA);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS301');
  const [activeTab, setActiveTab] = useState<'register' | 'courseDashboard'>('register');
  
  // Session Form State
  const [sessionDate, setSessionDate] = useState<string>('2026-09-06');
  const [sessionSlot, setSessionSlot] = useState<string>('Slot 2: 10:00 AM - 11:00 AM');
  const [sessionRoom, setSessionRoom] = useState<string>('Academic Block 2 - Hall 304');
  const [sessionTopic, setSessionTopic] = useState<string>('Binary Search Trees: In-Order Traversal and AVL Self-Balancing');
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DEFAULTERS' | 'ABSENT'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hardware Biometric CSV Batch Import State
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [rawBiometricText, setRawBiometricText] = useState('');
  const [studentPassModalOpen, setStudentPassModalOpen] = useState(false);

  const currentCourse = courses.find(c => c.code === selectedCourseCode) || courses[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student Status Handlers
  const handleSetStudentStatus = (studentId: string, status: CourseStudentItem['currentStatus']) => {
    setCourses(prev => prev.map(c => {
      if (c.code === selectedCourseCode) {
        return {
          ...c,
          students: c.students.map(s => s.id === studentId ? { ...s, currentStatus: status } : s)
        };
      }
      return c;
    }));
  };

  const handleUpdateRemarks = (studentId: string, remarks: string) => {
    setCourses(prev => prev.map(c => {
      if (c.code === selectedCourseCode) {
        return {
          ...c,
          students: c.students.map(s => s.id === studentId ? { ...s, remarks } : s)
        };
      }
      return c;
    }));
  };

  const handleBulkStatus = (status: CourseStudentItem['currentStatus']) => {
    setCourses(prev => prev.map(c => {
      if (c.code === selectedCourseCode) {
        return {
          ...c,
          students: c.students.map(s => ({ ...s, currentStatus: status }))
        };
      }
      return c;
    }));
    showToast(`Bulk updated all students to ${status}.`);
  };

  const handleCommitBiometricImport = () => {
    if (!rawBiometricText.trim()) {
      showToast('Please upload or paste biometric punch records.');
      return;
    }

    const lines = rawBiometricText.trim().split('\n');
    let matchedCount = 0;
    const updates: Record<string, CourseStudentItem['currentStatus']> = {};

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim().replace(/['"]/g, ''));
      if (parts.length >= 2) {
        const usn = parts[0].toUpperCase();
        let status: CourseStudentItem['currentStatus'] = 'PRESENT';
        const rawStatus = parts[1].toUpperCase();
        if (rawStatus.includes('ABSENT')) status = 'ABSENT';
        else if (rawStatus.includes('DUTY') || rawStatus.includes('OD')) status = 'ON_DUTY';
        else if (rawStatus.includes('LATE')) status = 'LATE';
        else status = 'PRESENT';

        updates[usn] = status;
      }
    });

    setCourses(prev => prev.map(c => {
      if (c.code === selectedCourseCode) {
        const updatedStudents = c.students.map(s => {
          if (updates[s.usn.toUpperCase()]) {
            matchedCount++;
            return { ...s, currentStatus: updates[s.usn.toUpperCase()] };
          }
          return s;
        });
        return { ...c, students: updatedStudents };
      }
      return c;
    }));

    setIsBiometricModalOpen(false);
    showToast(`Successfully matched & imported ${matchedCount} biometric punch records for ${currentCourse.code}.`);
  };

  const handleSaveAttendance = () => {
    // Commit attendance session into cumulative counters
    setCourses(prev => prev.map(c => {
      if (c.code === selectedCourseCode) {
        const updatedStudents = c.students.map(s => {
          const isPresentOrOD = s.currentStatus === 'PRESENT' || s.currentStatus === 'ON_DUTY';
          return {
            ...s,
            totalClassesHeld: s.totalClassesHeld + 1,
            attendedClasses: isPresentOrOD ? s.attendedClasses + 1 : s.attendedClasses
          };
        });
        const totalAttended = updatedStudents.reduce((acc, s) => acc + (s.attendedClasses / s.totalClassesHeld), 0);
        const newAvg = Math.round((totalAttended / updatedStudents.length) * 1000) / 10;

        return {
          ...c,
          totalSessionsHeld: c.totalSessionsHeld + 1,
          averageAttendancePct: newAvg,
          students: updatedStudents
        };
      }
      return c;
    }));

    showToast(`Attendance for ${currentCourse.code} (${sessionSlot}) officially signed and saved to university records.`);
  };

  const handleExportCourseCSV = () => {
    const headers = 'USN,Student Name,Email,Course Code,Course Name,Classes Held,Classes Attended,Cumulative %,Today Status,Excuse Remarks\n';
    const rows = currentCourse.students.map(s => {
      const pct = Math.round((s.attendedClasses / s.totalClassesHeld) * 1000) / 10;
      return `"${s.usn}","${s.name}","${s.email}","${currentCourse.code}","${currentCourse.name}",${s.totalClassesHeld},${s.attendedClasses},${pct}%,"${s.currentStatus}","${s.remarks || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chanakya_Manual_Attendance_${currentCourse.code}_${sessionDate}.csv`;
    a.click();
  };

  // Filtered Students
  const filteredStudents = currentCourse.students.filter(s => {
    const pct = (s.attendedClasses / s.totalClassesHeld) * 100;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.usn.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterMode === 'DEFAULTERS') return pct < 75;
    if (filterMode === 'ABSENT') return s.currentStatus === 'ABSENT';
    return true;
  });

  // Current Session Stats
  const presentCount = currentCourse.students.filter(s => s.currentStatus === 'PRESENT').length;
  const odCount = currentCourse.students.filter(s => s.currentStatus === 'ON_DUTY').length;
  const lateCount = currentCourse.students.filter(s => s.currentStatus === 'LATE').length;
  const absentCount = currentCourse.students.filter(s => s.currentStatus === 'ABSENT').length;
  const sessionTotal = currentCourse.students.length;
  const sessionPct = Math.round(((presentCount + odCount) / sessionTotal) * 100);
  const defaultersCount = currentCourse.students.filter(s => (s.attendedClasses / s.totalClassesHeld) * 100 < 75).length;

  // STRICT DPDP ACT & ACADEMIC POLICY GUARD:
  // If the logged-in user is a STUDENT, render the confidential Personal Course Attendance Ledger.
  // Students must NEVER see peer records, class rosters, or master timetable matrices.
  if (user?.role === 'STUDENT') {
    const studentEnrolledCourses = [
      {
        code: 'MCA301',
        name: 'Enterprise Cloud Architecture',
        school: 'School of Computer Science & IT',
        credits: 4,
        facultyName: 'Deepak B',
        totalClassesHeld: 32,
        attendedClasses: 29,
        odClasses: 2,
        recentLectures: [
          { date: '2026-09-05', slot: '09:00 - 10:00', topic: 'Microservices & Distributed Consensus Raft', mode: 'Dynamic QR Check-in', status: 'PRESENT' },
          { date: '2026-09-03', slot: '09:00 - 10:00', topic: 'Kubernetes Pod Scheduling & CNI Ingress', mode: 'GPS Geofence Radar', status: 'PRESENT' },
          { date: '2026-09-01', slot: '09:00 - 10:00', topic: 'Serverless Functions Cold Start Optimization', mode: 'On-Duty Leave Sanctioned', status: 'ON_DUTY' },
          { date: '2026-08-28', slot: '09:00 - 10:00', topic: 'AWS IAM Role Policies & STS AssumeRole', mode: 'Face Liveness Kiosk', status: 'PRESENT' },
        ]
      },
      {
        code: 'MCA302',
        name: 'Full-Stack Web Engineering Lab',
        school: 'School of Computer Science & IT',
        credits: 3,
        facultyName: 'Vinay Varma',
        totalClassesHeld: 24,
        attendedClasses: 22,
        odClasses: 1,
        recentLectures: [
          { date: '2026-09-04', slot: '11:30 - 13:30', topic: 'React 19 Concurrency & Server Components Lab', mode: 'Dynamic QR Check-in', status: 'PRESENT' },
          { date: '2026-08-28', slot: '11:30 - 13:30', topic: 'GraphQL Subscriptions & WebSocket Relay', mode: 'Face Liveness Kiosk', status: 'PRESENT' },
          { date: '2026-08-21', slot: '11:30 - 13:30', topic: 'Tailwind CSS Modern Design Systems Lab', mode: 'GPS Geofence Radar', status: 'PRESENT' },
        ]
      },
      {
        code: 'MCA303',
        name: 'Advanced Database Systems',
        school: 'School of Computer Science & IT',
        credits: 4,
        facultyName: 'Dr. Anita Desai',
        totalClassesHeld: 30,
        attendedClasses: 26,
        odClasses: 2,
        recentLectures: [
          { date: '2026-09-04', slot: '10:15 - 11:15', topic: 'B-Tree Index Concurrency & WAL Logging', mode: 'Dynamic QR Check-in', status: 'PRESENT' },
          { date: '2026-09-02', slot: '10:15 - 11:15', topic: 'ACID Multi-Version Concurrency Control (MVCC)', mode: 'Face Liveness Kiosk', status: 'PRESENT' },
          { date: '2026-08-31', slot: '10:15 - 11:15', topic: 'Query Plan Optimization & Cost Estimation', mode: 'On-Duty Leave Sanctioned', status: 'ON_DUTY' },
        ]
      },
      {
        code: 'MCA304',
        name: 'Machine Learning & Neural Networks',
        school: 'School of Computer Science & IT',
        credits: 4,
        facultyName: 'Deepak B',
        totalClassesHeld: 28,
        attendedClasses: 24,
        odClasses: 1,
        recentLectures: [
          { date: '2026-09-05', slot: '14:30 - 16:00', topic: 'Transformer Attention Mechanism & Self-Attention', mode: 'Dynamic QR Check-in', status: 'PRESENT' },
          { date: '2026-09-02', slot: '14:30 - 16:00', topic: 'Gradient Descent Optimizers: Adam vs RMSProp', mode: 'GPS Geofence Radar', status: 'PRESENT' },
          { date: '2026-08-26', slot: '14:30 - 16:00', topic: 'Backpropagation Mathematical Formulation', mode: 'Face Liveness Kiosk', status: 'PRESENT' },
        ]
      },
      {
        code: 'MCA305',
        name: 'Cyber Law & Digital Ethics',
        school: 'School of Law & Governance',
        credits: 2,
        facultyName: 'Prof. K. Venkatesh',
        totalClassesHeld: 18,
        attendedClasses: 16,
        odClasses: 0,
        recentLectures: [
          { date: '2026-09-03', slot: '15:30 - 16:30', topic: 'India Digital Personal Data Protection Act 2023', mode: 'Dynamic QR Check-in', status: 'PRESENT' },
          { date: '2026-08-27', slot: '15:30 - 16:30', topic: 'IT Act 2000 Section 66A & Intermediary Guidelines', mode: 'Face Liveness Kiosk', status: 'PRESENT' },
        ]
      }
    ];

    const totalHeld = studentEnrolledCourses.reduce((acc, c) => acc + c.totalClassesHeld, 0);
    const totalAttended = studentEnrolledCourses.reduce((acc, c) => acc + c.attendedClasses, 0);
    const overallPct = Math.round((totalAttended / totalHeld) * 1000) / 10;
    const clearedCount = studentEnrolledCourses.filter(c => (c.attendedClasses / c.totalClassesHeld) * 100 >= 75).length;

    return (
      <div className="space-y-6">
        {/* DPDP Compliance & Student Scoping Banner */}
        <div className="bg-white rounded-2xl border border-cu-border p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Confidential • Student Scoped Attendance Ledger</span>
            </div>
            <h3 className="text-lg font-bold text-cu-navy">
              Enrolled Course Register &amp; Statutory 75% Gate Compliance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Candidate: <span className="font-semibold text-gray-800">{user.name}</span> &bull; USN: <span className="font-mono font-bold text-cu-navy">{user.employeeId || '24MCA003'}</span> &bull; Program: <span className="font-medium text-gray-700">Master of Computer Applications (Sem 3)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setStudentPassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-cu-navy hover:bg-cu-navylight text-white rounded-xl text-xs font-bold transition shadow-xs"
              title="Open verified student identity pass and biometric gate QR"
            >
              <QrCode size={14} className="text-cu-gold" />
              <span>Digital Student QR Pass</span>
            </button>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-600">
              <Lock size={14} className="text-cu-gold shrink-0" />
              <span className="text-[11px] leading-tight">Peer rosters strictly restricted.</span>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-gray-500">Cumulative Attendance</div>
            <div className={`text-2xl font-black mt-1 ${overallPct >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {overallPct}%
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{totalAttended} of {totalHeld} lectures attended</div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-gray-500">Exam Gate Clearance</div>
            <div className="text-2xl font-black text-cu-navy mt-1">
              {clearedCount} / {studentEnrolledCourses.length}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Courses &gt;= 75% NEP threshold</div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-gray-500">On-Duty (OD) Credited</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">
              {studentEnrolledCourses.reduce((acc, c) => acc + c.odClasses, 0)} Sessions
            </div>
            <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Approved medical / hackathons</div>
          </div>

          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-gray-500">Overall Hall Ticket Status</div>
            <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm mt-2 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 size={14} /> Eligible
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Ready for End-Semester Exam</div>
          </div>
        </div>

        {/* Detailed Enrolled Course Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <BookOpen size={16} className="text-cu-gold" />
              <span>Enrolled Courses Attendance Breakdown</span>
            </h4>
            <span className="text-xs text-gray-500">Odd Semester 2026-27</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentEnrolledCourses.map(course => {
              const pct = Math.round((course.attendedClasses / course.totalClassesHeld) * 1000) / 10;
              const isEligible = pct >= 75;
              const safeMargin = Math.floor((course.attendedClasses - 0.75 * course.totalClassesHeld) / 0.75);

              return (
                <div key={course.code} className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4 hover:border-cu-navy/40 transition">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cu-navy text-white">
                          {course.code}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">{course.credits} Credits</span>
                      </div>
                      <h5 className="font-bold text-sm text-cu-navy mt-1">{course.name}</h5>
                      <span className="text-[11px] text-gray-500">Instructor: {course.facultyName}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-xl font-black ${isEligible ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {pct}%
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isEligible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {isEligible ? 'Exam Eligible' : 'Deficit Risk'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>{course.attendedClasses} attended of {course.totalClassesHeld} lectures held</span>
                      <span className="font-medium text-gray-700">75% required</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                      {/* 75% threshold marker */}
                      <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-gray-400" title="75% Statutory Gate" />
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between pt-0.5">
                      <span>{course.odClasses > 0 ? `${course.odClasses} On-Duty (OD) sessions credited` : 'Regular attendance'}</span>
                      <span className={safeMargin > 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                        {safeMargin > 0 ? `Safe to miss: ${safeMargin} classes` : 'Attend all upcoming classes'}
                      </span>
                    </div>
                  </div>

                  {/* Recent Verified Lecture Sessions */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                      <Clock size={12} className="text-cu-gold" />
                      <span>Recent Verified Class Check-Ins</span>
                    </div>
                    <div className="space-y-1.5">
                      {course.recentLectures.map((lec, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="truncate pr-2">
                            <span className="text-[10px] text-gray-400 font-mono block">{lec.date} &bull; {lec.slot}</span>
                            <span className="font-medium text-gray-800 text-[11px] truncate block">{lec.topic}</span>
                            <span className="text-[9px] text-gray-400">{lec.mode}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            lec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            lec.status === 'ON_DUTY' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {lec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Digital Identity & Biometric Gate Pass Modal */}
        {studentPassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-cu-border shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cu-navy text-cu-gold font-serif font-black flex items-center justify-center text-xs">
                    CU
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-cu-navy">Student Digital ID &amp; QR Pass</h4>
                    <span className="text-[10px] text-gray-400">Vidyaranya Global Campus</span>
                  </div>
                </div>
                <button
                  onClick={() => setStudentPassModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-gradient-to-b from-slate-50 to-amber-50/40 p-4 rounded-xl border border-amber-200/60 flex flex-col items-center text-center space-y-3">
                <div className="text-xs">
                  <div className="font-bold text-sm text-cu-navy">{user.name}</div>
                  <div className="font-mono text-xs font-bold text-cu-saffron mt-0.5">{user.employeeId || '24MCA003'}</div>
                  <div className="text-[10px] text-gray-500">Master of Computer Applications (2024-2026)</div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm inline-flex flex-col items-center">
                  <RealQRCode
                    value={`https://chanakyauniversity.edu.in/verify/student-pass?usn=${user.employeeId || '24MCA003'}&name=${encodeURIComponent(user.name)}&prog=MCA&validTill=2026-06-30&status=ACTIVE`}
                    size={160}
                    margin={1}
                    fgColor="#002561"
                    bgColor="#ffffff"
                    level="H"
                    centerLogo="CU"
                    downloadable={true}
                    copyable={true}
                    caption="Biometric Gate & Turnstile Token"
                    alt="Official Student Digital ID QR Pass"
                  />
                </div>

                <div className="text-[10px] text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                    <ShieldCheck size={12} />
                    <span>Statutory Status: Active Student (Full Privileges)</span>
                  </div>
                  <div>Valid across Central Library, Computer Labs, &amp; Smart Turnstiles.</div>
                </div>
              </div>

              <button
                onClick={() => setStudentPassModalOpen(false)}
                className="w-full py-2 bg-cu-navy hover:bg-cu-navylight text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-cu-navy text-white text-xs font-semibold shadow-2xl border border-cu-gold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navigation & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cu-navy">
            <BookOpen size={15} className="text-cu-gold" />
            <span>Select Course:</span>
          </div>

          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="bg-gray-50 border border-cu-border text-xs font-bold text-cu-navy rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cu-gold cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name} ({c.credits} Credits)
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-500 font-medium hidden lg:inline">
            {currentCourse.school} &bull; Instructor: {currentCourse.facultyName}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'register' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
            }`}
          >
            <UserCheck size={13} />
            <span>Daily Manual Register</span>
          </button>
          <button
            onClick={() => setActiveTab('courseDashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'courseDashboard' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
            }`}
          >
            <BarChart3 size={13} />
            <span>Course Attendance Dashboard</span>
          </button>
        </div>
      </div>

      {activeTab === 'register' ? (
        <div className="space-y-5">
          {/* Top Session Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <Users size={12} className="text-cu-navy" /> Total Enrolled
              </span>
              <div className="text-xl font-black text-cu-navy mt-1">{sessionTotal} Students</div>
              <span className="text-[10px] text-gray-400">Class Cohort</span>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" /> Present Today
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">{presentCount}</div>
              <span className="text-[10px] text-emerald-600 font-medium">In Physical Class</span>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <XCircle size={12} className="text-rose-600" /> Absent Today
              </span>
              <div className="text-xl font-black text-rose-700 mt-1">{absentCount}</div>
              <span className="text-[10px] text-rose-600 font-medium">Unexcused</span>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <UserCheck size={12} className="text-sky-600" /> On Official Duty
              </span>
              <div className="text-xl font-black text-sky-700 mt-1">{odCount} OD</div>
              <span className="text-[10px] text-sky-600 font-medium">Credited Attendance</span>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <BarChart3 size={12} className="text-cu-navy" /> Session Turnout
              </span>
              <div className="text-xl font-black text-cu-navy mt-1">{sessionPct}%</div>
              <span className="text-[10px] text-cu-gold font-bold">This Lecture</span>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                <ShieldAlert size={12} className="text-amber-600" /> At Risk (&lt;75%)
              </span>
              <div className="text-xl font-black text-amber-700 mt-1">{defaultersCount} Students</div>
              <span className="text-[10px] text-amber-600 font-medium">Exam Gate Danger</span>
            </div>
          </div>

          {/* Session Metadata Card */}
          <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                <Calendar size={16} className="text-cu-gold" />
                Lecture Session Details &amp; Classroom Location
              </h3>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                Session #{currentCourse.totalSessionsHeld + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 mb-1">Lecture Period / Slot</label>
                <select
                  value={sessionSlot}
                  onChange={(e) => setSessionSlot(e.target.value)}
                  className="w-full p-2 rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-semibold"
                >
                  <option value="Slot 1: 09:00 AM - 10:00 AM">Slot 1: 09:00 AM - 10:00 AM</option>
                  <option value="Slot 2: 10:00 AM - 11:00 AM">Slot 2: 10:00 AM - 11:00 AM</option>
                  <option value="Slot 3: 11:15 AM - 12:15 PM">Slot 3: 11:15 AM - 12:15 PM</option>
                  <option value="Slot 4: 01:15 PM - 02:15 PM">Slot 4: 01:15 PM - 02:15 PM</option>
                  <option value="Slot 5: 02:15 PM - 03:15 PM">Slot 5: 02:15 PM - 03:15 PM</option>
                  <option value="Slot 6: 03:30 PM - 04:30 PM">Slot 6: 03:30 PM - 04:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 mb-1">Venue / Classroom</label>
                <input
                  type="text"
                  value={sessionRoom}
                  onChange={(e) => setSessionRoom(e.target.value)}
                  className="w-full p-2 rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 mb-1">Curriculum Topic Taught</label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full p-2 rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Student Roster Table Controls */}
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
                  <option value="ALL">All Students ({currentCourse.students.length})</option>
                  <option value="DEFAULTERS">Defaulters &lt;75% ({defaultersCount})</option>
                  <option value="ABSENT">Marked Absent ({absentCount})</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setRawBiometricText(
                    `1CU23CS001, PRESENT\n1CU23CS002, PRESENT\n1CU23CS003, ON_DUTY\n1CU23CS004, PRESENT\n1CU23CS005, PRESENT\n1CU23CS006, PRESENT\n1CU23CS007, ABSENT\n1CU23CS008, PRESENT\n1CU23CS009, ON_DUTY\n1CU23CS010, PRESENT`
                  );
                  setIsBiometricModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-indigo-50 text-indigo-800 text-xs font-bold hover:bg-indigo-100 transition shadow-xs flex items-center gap-1"
              >
                <Upload size={13} /> Import Biometric CSV
              </button>

              <button
                onClick={() => handleBulkStatus('PRESENT')}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-xs flex items-center gap-1"
              >
                <Check size={13} /> Mark All Present
              </button>

              <button
                onClick={() => handleBulkStatus('ABSENT')}
                className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold hover:bg-rose-100 transition shadow-xs flex items-center gap-1"
              >
                <XCircle size={13} /> Mark All Absent
              </button>

              <button
                onClick={handleExportCourseCSV}
                className="px-3 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition shadow-xs flex items-center gap-1"
              >
                <Download size={13} /> Export CSV
              </button>

              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 rounded-xl bg-cu-navy text-white text-xs font-bold hover:bg-cu-navy-light transition shadow-sm flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>Save Session Register</span>
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3">USN / Roll</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Cumulative Attendance</th>
                    <th className="p-3">Today Status</th>
                    <th className="p-3">Excuse / Absence Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                        No students match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const pct = Math.round((student.attendedClasses / student.totalClassesHeld) * 1000) / 10;
                      const isAtRisk = pct < 75;

                      return (
                        <tr key={student.id} className="hover:bg-blue-50/20 transition">
                          <td className="p-3 font-mono font-bold text-cu-navy">{student.usn}</td>
                          <td className="p-3">
                            <div className="font-semibold text-gray-800">{student.name}</div>
                            <div className="text-[10px] text-gray-400">{student.email}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    pct >= 85 ? 'bg-emerald-500' : pct >= 75 ? 'bg-sky-500' : 'bg-rose-500'
                                  }`} 
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className={`font-mono font-bold text-xs ${isAtRisk ? 'text-rose-600' : 'text-gray-700'}`}>
                                {pct}%
                              </span>
                              {isAtRisk && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                  Debarred Risk
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {student.attendedClasses} / {student.totalClassesHeld} sessions
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                                  student.currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                                  student.currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'ON_DUTY')}
                                title="On Duty / Official Representation"
                                className={`px-2 py-1 rounded-lg font-bold text-xs transition ${
                                  student.currentStatus === 'ON_DUTY'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                                }`}
                              >
                                OD
                              </button>
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'LATE')}
                                title="Late / Excused Entry"
                                className={`px-2 py-1 rounded-lg font-bold text-xs transition ${
                                  student.currentStatus === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                              >
                                L
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Add reason for absence or OD..."
                              value={student.remarks || ''}
                              onChange={(e) => handleUpdateRemarks(student.id, e.target.value)}
                              className="w-full max-w-xs p-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-cu-gold outline-none"
                            />
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
      ) : (
        /* Course-Wise Dashboard Overview */
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-cu-border p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-cu-navy flex items-center gap-2">
                  <BarChart3 size={18} className="text-cu-gold" />
                  Course-Wise Attendance Analytics &amp; Semester Trends
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Institutional compliance monitor across all academic courses for Odd Semester 2026-27.
                </p>
              </div>

              <button
                onClick={handleExportCourseCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition"
              >
                <Download size={13} />
                <span>Export All Courses Summary</span>
              </button>
            </div>

            {/* Courses Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => {
                const totalStudents = c.students.length;
                const defCount = c.students.filter(s => (s.attendedClasses / s.totalClassesHeld) * 100 < 75).length;
                const isSelected = c.code === selectedCourseCode;

                return (
                  <div
                    key={c.code}
                    onClick={() => {
                      setSelectedCourseCode(c.code);
                      setActiveTab('register');
                    }}
                    className={`bg-gray-50/70 rounded-xl border p-4 cursor-pointer transition hover:shadow-md ${
                      isSelected ? 'border-cu-gold ring-1 ring-cu-gold bg-white' : 'border-cu-border hover:border-cu-navy/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cu-navy text-white">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-sm text-cu-navy mt-1.5">{c.name}</h4>
                        <span className="text-[11px] text-gray-500">{c.school}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-black ${
                          c.averageAttendancePct >= 85 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {c.averageAttendancePct}%
                        </div>
                        <span className="text-[10px] text-gray-400">Class Average</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="font-bold text-cu-navy">{c.totalSessionsHeld}</div>
                        <div className="text-[10px] text-gray-400">Sessions</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="font-bold text-cu-navy">{totalStudents}</div>
                        <div className="text-[10px] text-gray-400">Students</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className={`font-bold ${defCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {defCount}
                        </div>
                        <div className="text-[10px] text-gray-400">&lt;75% Risk</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-cu-navy font-semibold pt-1">
                      <span>Take Attendance</span>
                      <ChevronRight size={14} className="text-cu-gold" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hardware Biometric / Lab Punch CSV Importer Modal */}
      {isBiometricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-cu-border max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                  <FileSpreadsheet size={12} />
                  <span>Hardware Attendance Synchronization</span>
                </div>
                <h3 className="text-base font-bold text-cu-navy mt-1">Import Biometric Laboratory Punch Logs</h3>
                <p className="text-xs text-gray-500">
                  Upload or paste punch records from laboratory biometric machines (Format: USN, Status/Timestamp).
                </p>
              </div>
              <button
                onClick={() => setIsBiometricModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>Biometric Raw Punch Records (CSV or Text)</span>
                <label className="cursor-pointer text-cu-navy hover:underline flex items-center gap-1">
                  <Upload size={12} />
                  <span>Choose .csv file</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setRawBiometricText(event.target?.result as string || '');
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                rows={6}
                value={rawBiometricText}
                onChange={(e) => setRawBiometricText(e.target.value)}
                placeholder="1CU23CS001, PRESENT&#10;1CU23CS002, PRESENT&#10;1CU23CS003, ON_DUTY&#10;1CU23CS004, PRESENT"
                className="w-full p-3 font-mono text-xs rounded-xl border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none"
              />
              <p className="text-[11px] text-gray-400">
                Supported formats: <code className="font-mono text-cu-navy">USN, STATUS</code> (e.g. PRESENT, ABSENT, ON_DUTY, LATE) or <code className="font-mono text-cu-navy">USN, TIMESTAMP</code>.
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-gray-400">Sample quick fill:</span>
              <button
                type="button"
                onClick={() => {
                  setRawBiometricText(
                    currentCourse.students.map((s, idx) => `${s.usn}, ${idx % 7 === 2 ? 'ON_DUTY' : idx % 5 === 4 ? 'ABSENT' : 'PRESENT'}`).join('\n')
                  );
                }}
                className="text-[11px] text-indigo-600 hover:underline font-medium"
              >
                Populate all {currentCourse.students.length} students in {currentCourse.code}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsBiometricModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-cu-border text-gray-600 hover:bg-gray-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitBiometricImport}
                className="px-4 py-2 rounded-xl bg-cu-navy text-white text-xs font-bold hover:bg-cu-navy-light shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Commit &amp; Sync to Course Register</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
