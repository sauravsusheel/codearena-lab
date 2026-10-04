import React, { useState } from 'react';
import { 
  Layers, Clock, Users, BookOpen, AlertCircle, Plus, 
  CheckCircle2, AlertTriangle, Download, Trash2, Filter, 
  Search, Award, School, ChevronDown, ChevronUp, UserCheck, X
} from 'lucide-react';
import { WorkloadItem } from '../types/hrms.types';
import { useAuth } from '../../../context/AuthContext';

interface WorkloadAllocatorProps {
  workload: WorkloadItem[];
}

interface FacultyWorkloadProfile {
  id: string;
  name: string;
  employeeId: string;
  designation: 'Assistant Professor' | 'Associate Professor' | 'Professor' | 'Professor of Practice';
  school: string;
  ugcMaxHours: number; // 16 for Asst Prof, 14 for Assoc, 12 for Prof
  courses: WorkloadItem[];
}

const INITIAL_FACULTY_ROSTER: FacultyWorkloadProfile[] = [
  {
    id: 'fac-1',
    name: 'Dr. Rajesh Sharma',
    employeeId: 'CU-FAC-0102',
    designation: 'Associate Professor',
    school: 'School of Computer Science',
    ugcMaxHours: 14,
    courses: [
      { id: 'c-1', courseCode: 'CS301', courseName: 'Data Structures & Algorithms', credits: 4, type: 'Lecture', hoursPerWeek: 4, studentsEnrolled: 64 },
      { id: 'c-2', courseCode: 'CS301L', courseName: 'Data Structures Lab (Batch A)', credits: 2, type: 'Lab', hoursPerWeek: 4, studentsEnrolled: 32 },
      { id: 'c-3', courseCode: 'CS490', courseName: 'Senior Capstone Mentorship', credits: 3, type: 'Project Mentorship', hoursPerWeek: 3, studentsEnrolled: 12 }
    ]
  },
  {
    id: 'fac-2',
    name: 'Prof. Ananya Iyer',
    employeeId: 'CU-FAC-0145',
    designation: 'Assistant Professor',
    school: 'School of Computer Science',
    ugcMaxHours: 16,
    courses: [
      { id: 'c-4', courseCode: 'AI402', courseName: 'Deep Learning & Neural Architectures', credits: 4, type: 'Lecture', hoursPerWeek: 4, studentsEnrolled: 58 },
      { id: 'c-5', courseCode: 'AI402L', courseName: 'Deep Learning GPU Lab', credits: 2, type: 'Lab', hoursPerWeek: 4, studentsEnrolled: 29 },
      { id: 'c-6', courseCode: 'CS205', courseName: 'Object-Oriented Programming (Java)', credits: 4, type: 'Lecture', hoursPerWeek: 4, studentsEnrolled: 62 },
      { id: 'c-7', courseCode: 'CS205L', courseName: 'Java Programming Lab', credits: 2, type: 'Lab', hoursPerWeek: 3, studentsEnrolled: 31 }
    ]
  },
  {
    id: 'fac-3',
    name: 'Dr. Vikram Rao',
    employeeId: 'CU-FAC-0089',
    designation: 'Professor',
    school: 'School of Computer Science',
    ugcMaxHours: 12,
    courses: [
      { id: 'c-8', courseCode: 'CS501', courseName: 'Advanced Computer Networks', credits: 4, type: 'Lecture', hoursPerWeek: 4, studentsEnrolled: 42 },
      { id: 'c-9', courseCode: 'CS699', courseName: 'Doctoral Seminar & Research Methods', credits: 4, type: 'Tutorial', hoursPerWeek: 4, studentsEnrolled: 15 }
    ]
  },
  {
    id: 'fac-4',
    name: 'Dr. Sneha Patel',
    employeeId: 'CU-FAC-0210',
    designation: 'Assistant Professor',
    school: 'School of Management',
    ugcMaxHours: 16,
    courses: [
      { id: 'c-10', courseCode: 'MGT201', courseName: 'Organizational Behavior & Leadership', credits: 3, type: 'Lecture', hoursPerWeek: 3, studentsEnrolled: 55 },
      { id: 'c-11', courseCode: 'MGT305', courseName: 'Strategic Management & Ethics', credits: 3, type: 'Lecture', hoursPerWeek: 3, studentsEnrolled: 48 }
    ]
  },
  {
    id: 'fac-5',
    name: 'Prof. K. Venkatesh',
    employeeId: 'CU-FAC-0167',
    designation: 'Assistant Professor',
    school: 'School of Humanities & Social Sciences',
    ugcMaxHours: 16,
    courses: [
      { id: 'c-12', courseCode: 'ENG101', courseName: 'Academic Writing & Rhetoric', credits: 3, type: 'Lecture', hoursPerWeek: 3, studentsEnrolled: 70 },
      { id: 'c-13', courseCode: 'PHIL202', courseName: 'Ethics in Science & Technology', credits: 3, type: 'Lecture', hoursPerWeek: 3, studentsEnrolled: 65 },
      { id: 'c-14', courseCode: 'ENG101T', courseName: 'Writing Studio Lab', credits: 2, type: 'Tutorial', hoursPerWeek: 4, studentsEnrolled: 35 }
    ]
  }
];

export const WorkloadAllocator: React.FC<WorkloadAllocatorProps> = ({ workload: initialWorkload }) => {
  const { user } = useAuth();
  const isAllocatorRole = user?.role === 'COURSE_ALLOCATOR' || user?.role === 'SUPER_ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'HR_ADMIN';

  const [facultyRoster, setFacultyRoster] = useState<FacultyWorkloadProfile[]>(INITIAL_FACULTY_ROSTER);
  const [selectedSchool, setSelectedSchool] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFacultyId, setExpandedFacultyId] = useState<string | null>('fac-1');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFacultyId, setModalFacultyId] = useState<string>(INITIAL_FACULTY_ROSTER[0].id);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseType, setCourseType] = useState<WorkloadItem['type']>('Lecture');
  const [credits, setCredits] = useState<number>(3);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(3);
  const [studentsEnrolled, setStudentsEnrolled] = useState<number>(45);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Compute Total Metrics across Roster
  const filteredFaculty = facultyRoster.filter(f => {
    const matchesSchool = selectedSchool === 'ALL' || f.school === selectedSchool;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.courses.some(c => c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || c.courseName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSchool && matchesSearch;
  });

  const totalAllocatedCourses = facultyRoster.reduce((sum, f) => sum + f.courses.length, 0);
  const totalFacultyCount = facultyRoster.length;
  
  // UGC Compliance Stats
  const compliantFaculty = facultyRoster.filter(f => {
    const totalHours = f.courses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
    return totalHours <= f.ugcMaxHours && totalHours >= (f.ugcMaxHours - 4);
  }).length;

  const overburdenedFaculty = facultyRoster.filter(f => {
    const totalHours = f.courses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
    return totalHours > f.ugcMaxHours;
  }).length;

  const handleOpenAllocateModal = (facultyId?: string) => {
    if (facultyId) setModalFacultyId(facultyId);
    setCourseCode('');
    setCourseName('');
    setCourseType('Lecture');
    setCredits(3);
    setHoursPerWeek(3);
    setStudentsEnrolled(45);
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  const handleAllocateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const targetFaculty = facultyRoster.find(f => f.id === modalFacultyId);
    if (!targetFaculty) return;

    const currentHours = targetFaculty.courses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
    const newTotalHours = currentHours + Number(hoursPerWeek);

    const newCourse: WorkloadItem = {
      id: `c-${Date.now()}`,
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      type: courseType,
      credits: Number(credits),
      hoursPerWeek: Number(hoursPerWeek),
      studentsEnrolled: Number(studentsEnrolled)
    };

    setFacultyRoster(prev => prev.map(f => {
      if (f.id === modalFacultyId) {
        return {
          ...f,
          courses: [...f.courses, newCourse]
        };
      }
      return f;
    }));

    if (newTotalHours > targetFaculty.ugcMaxHours) {
      setFeedbackMsg({
        text: `Allocated with Warning: ${targetFaculty.name} will exceed UGC weekly limit (${newTotalHours}/${targetFaculty.ugcMaxHours} hrs).`,
        type: 'warning'
      });
    } else {
      setFeedbackMsg({
        text: `Course ${newCourse.courseCode} successfully allocated to ${targetFaculty.name}. Total hours: ${newTotalHours} hrs/wk.`,
        type: 'success'
      });
    }

    setTimeout(() => {
      setIsModalOpen(false);
      setFeedbackMsg(null);
    }, 1500);
  };

  const handleRemoveCourse = (facultyId: string, courseId: string) => {
    setFacultyRoster(prev => prev.map(f => {
      if (f.id === facultyId) {
        return {
          ...f,
          courses: f.courses.filter(c => c.id !== courseId)
        };
      }
      return f;
    }));
  };

  const handleExportMatrixCSV = () => {
    const headers = 'Employee ID,Faculty Name,Designation,School,Course Code,Course Name,Format,Credits,Hours/Week,Enrolled Students,UGC Cap,Status\n';
    const rows: string[] = [];
    facultyRoster.forEach(f => {
      const totalHours = f.courses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
      const status = totalHours > f.ugcMaxHours ? 'OVERBURDENED' : totalHours < (f.ugcMaxHours - 4) ? 'UNDERALLOCATED' : 'OPTIMAL';
      f.courses.forEach(c => {
        rows.push(`"${f.employeeId}","${f.name}","${f.designation}","${f.school}","${c.courseCode}","${c.courseName}","${c.type}",${c.credits},${c.hoursPerWeek},${c.studentsEnrolled},${f.ugcMaxHours},"${status}"`);
      });
    });

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chanakya_University_UGC_Workload_Matrix_2026_27.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Users size={14} className="text-cu-navy" /> Total Faculty In Pool
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Odd Sem 26-27
            </span>
          </div>
          <div className="text-2xl font-black text-cu-navy mt-2">{totalFacultyCount} Members</div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <School size={12} /> Across 5 University Schools
          </div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <BookOpen size={14} className="text-cu-gold" /> Total Active Courses
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
              Allocated
            </span>
          </div>
          <div className="text-2xl font-black text-cu-navy mt-2">{totalAllocatedCourses} Sections</div>
          <div className="text-[11px] text-gray-400 mt-1">Lecture, Lab &amp; Mentorship</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> UGC Compliant
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
              Norms Met
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {Math.round((compliantFaculty / totalFacultyCount) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {compliantFaculty} of {totalFacultyCount} Faculty in Ideal Band
          </div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-rose-600" /> Overload Warning
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800">
              Attention
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{overburdenedFaculty} Faculty</div>
          <div className="text-[11px] text-rose-500 mt-1 font-medium">
            Exceeding UGC Direct Hours limit
          </div>
        </div>
      </div>

      {/* Control Bar & Actions */}
      <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search faculty name, course code, USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold focus:border-cu-gold outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-cu-border">
            <Filter size={12} className="text-cu-navy" />
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              aria-label="Filter courses by university school"
              className="bg-transparent font-medium text-cu-navy outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All University Schools</option>
              <option value="School of Computer Science">School of Computer Science</option>
              <option value="School of Management">School of Management</option>
              <option value="School of Humanities & Social Sciences">School of Humanities &amp; Social Sciences</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMatrixCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition shadow-sm"
          >
            <Download size={13} />
            <span>Export UGC Audit CSV</span>
          </button>

          {isAllocatorRole && (
            <button
              onClick={() => handleOpenAllocateModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cu-navy text-white hover:bg-cu-navy-light text-xs font-bold transition shadow-sm"
            >
              <Plus size={14} />
              <span>Allocate New Course</span>
            </button>
          )}
        </div>
      </div>

      {/* UGC Norms Reference Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Award size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-950">UGC &amp; AICTE Statutory Norms (Regulation 2018/2024):</span>
          <p className="text-[11px] text-amber-800">
            Assistant Professors: 16 Direct Teaching Hours/Wk • Associate Professors: 14 Direct Teaching Hours/Wk • Professors: 12 Direct Teaching Hours/Wk. Maximum workload including tutorials must not exceed 20 hours/wk.
          </p>
        </div>
      </div>

      {/* Faculty Workload Matrix Cards */}
      <div className="space-y-4">
        {filteredFaculty.map((faculty) => {
          const totalCredits = faculty.courses.reduce((sum, c) => sum + c.credits, 0);
          const totalHours = faculty.courses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
          const isOverloaded = totalHours > faculty.ugcMaxHours;
          const isUnderloaded = totalHours < (faculty.ugcMaxHours - 4);
          const isExpanded = expandedFacultyId === faculty.id;

          return (
            <div 
              key={faculty.id} 
              className={`bg-white rounded-xl border transition shadow-sm overflow-hidden ${
                isOverloaded ? 'border-rose-300' : isUnderloaded ? 'border-amber-300' : 'border-cu-border'
              }`}
            >
              {/* Card Header Summary */}
              <div 
                onClick={() => setExpandedFacultyId(isExpanded ? null : faculty.id)}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cu-navy/10 text-cu-navy font-black text-sm flex items-center justify-center shrink-0">
                    {faculty.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-cu-navy">{faculty.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {faculty.employeeId}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {faculty.designation}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{faculty.school}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Hours & Credits Pill */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-cu-navy text-sm">
                        {totalHours} / {faculty.ugcMaxHours} hrs
                      </div>
                      <span className="text-[10px] text-gray-400">Direct Teaching/Wk</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-cu-navy text-sm">{totalCredits} Credits</div>
                      <span className="text-[10px] text-gray-400">{faculty.courses.length} Courses</span>
                    </div>
                  </div>

                  {/* UGC Status Badge */}
                  <div>
                    {isOverloaded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle size={12} /> Over UGC Cap (+{totalHours - faculty.ugcMaxHours}h)
                      </span>
                    ) : isUnderloaded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle size={12} /> Underallocated ({faculty.ugcMaxHours - totalHours}h open)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Optimal UGC Load
                      </span>
                    )}
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2">
                    {isAllocatorRole && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAllocateModal(faculty.id);
                        }}
                        className="px-2.5 py-1 rounded-md bg-cu-navy text-white text-xs font-semibold hover:bg-cu-navy-light transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={12} /> Add Course
                      </button>
                    )}

                    <div className="text-gray-400 p-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Course Breakdown Table */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/40 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">Course Code</th>
                          <th className="p-2.5">Course Name</th>
                          <th className="p-2.5">Instruction Format</th>
                          <th className="p-2.5">Credits</th>
                          <th className="p-2.5">Hours/Wk</th>
                          <th className="p-2.5">Cohort Size</th>
                          {isAllocatorRole && <th className="p-2.5 text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {faculty.courses.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-400 italic">
                              No courses assigned yet. Click 'Add Course' to allocate teaching assignments.
                            </td>
                          </tr>
                        ) : (
                          faculty.courses.map((course) => (
                            <tr key={course.id} className="hover:bg-blue-50/30 transition">
                              <td className="p-2.5 font-mono font-bold text-cu-navy">{course.courseCode}</td>
                              <td className="p-2.5 font-semibold text-gray-800">{course.courseName}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  course.type === 'Lab' 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                    : course.type === 'Lecture' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {course.type}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-cu-navy">{course.credits}</td>
                              <td className="p-2.5 text-gray-700 font-medium">{course.hoursPerWeek} hrs</td>
                              <td className="p-2.5 text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Users size={12} /> {course.studentsEnrolled} Students
                                </span>
                              </td>
                              {isAllocatorRole && (
                                <td className="p-2.5 text-right">
                                  <button
                                    onClick={() => handleRemoveCourse(faculty.id, course.id)}
                                    title="Revoke Course Allocation"
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Allocate New Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-cu-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-cu-navy flex items-center gap-2">
                  <BookOpen size={18} className="text-cu-gold" />
                  Allocate Course Assignment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Odd Semester 2026-27 Academic Schedule</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {feedbackMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                feedbackMsg.type === 'warning' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}>
                {feedbackMsg.type === 'warning' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAllocateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Faculty Member</label>
                <select
                  value={modalFacultyId}
                  onChange={(e) => setModalFacultyId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-medium"
                >
                  {facultyRoster.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation} - {f.courses.reduce((s, c) => s + c.hoursPerWeek, 0)}/{f.ugcMaxHours} hrs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS401"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none font-mono uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Teaching Format</label>
                  <select
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Laboratory / Hands-on</option>
                    <option value="Tutorial">Tutorial / Studio</option>
                    <option value="Project Mentorship">Project Mentorship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Computing"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Direct Hours/Wk</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cohort Students</label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    required
                    value={studentsEnrolled}
                    onChange={(e) => setStudentsEnrolled(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cu-navy text-white font-bold hover:bg-cu-navy-light transition shadow-sm"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
