import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, QrCode, Radio, ShieldCheck, Camera, Users, 
  Calendar, FileText, CheckCircle2 
} from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { attendanceService } from './services/attendanceService';
import { DynamicQRConsole } from './components/DynamicQRConsole';
import { GeofenceRadar } from './components/GeofenceRadar';
import { EligibilityGateView } from './components/EligibilityGateView';
import { FaceLivenessKiosk } from './components/FaceLivenessKiosk';
import { CourseManualAttendance } from './components/CourseManualAttendance';
import { TimetableManager } from './components/TimetableManager';
import { StudentLeavePortal } from './components/StudentLeavePortal';
import { StudentAttendanceRecord, CourseEligibility } from './types/attendance.types';
import { useAuth } from '../../context/AuthContext';

const AttendanceModuleContent: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const isAllocator = user?.role === 'COURSE_ALLOCATOR';
  const studentRoll = user?.employeeId || '24MCA003';
  const studentName = user?.name || 'Arjun Kumar';

  const [activeTab, setActiveTab] = useState<'manual' | 'timetable' | 'leaves' | 'qr' | 'geofence' | 'eligibility' | 'kiosk'>(
    isAllocator ? 'timetable' : 'manual'
  );
  const [roster, setRoster] = useState<StudentAttendanceRecord[]>([]);
  const [eligibility, setEligibility] = useState<CourseEligibility[]>([]);

  const loadData = () => {
    attendanceService.getRoster().then(setRoster);
    attendanceService.getEligibility().then(setEligibility);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSimulateScan = async () => {
    const updated = await attendanceService.checkInStudent(studentRoll, studentName, 'QR_CODE');
    setRoster(prev => [updated, ...prev.filter(r => r.roll !== studentRoll)]);
  };

  const handleCheckInGPS = async () => {
    const updated = await attendanceService.checkInStudent(studentRoll, studentName, 'GPS_GEOFENCE');
    setRoster(prev => [updated, ...prev.filter(r => r.roll !== studentRoll)]);
  };

  const handleFaceVerified = async () => {
    const updated = await attendanceService.checkInStudent(studentRoll, studentName, 'FACE_LIVENESS');
    setRoster(prev => [updated, ...prev.filter(r => r.roll !== studentRoll)]);
  };

  const handleRequestCondonation = async (courseCode: string, reason: string) => {
    await attendanceService.requestCondonation(courseCode, reason);
    attendanceService.getEligibility().then(setEligibility);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <GraduationCap size={13} />
              EduAttend AI Module 02
            </span>
            <FaultSimulatorButton moduleName="EduAttend AI (Team 02)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">
            {isStudent ? 'Smart Student Attendance & Leave Portal' : 'Smart Student Attendance, Timetable & Leave Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isStudent
              ? 'Real-time personal attendance verification, enrolled course registers, class-wise On-Duty leave approvals, and 75% exam gate.'
              : 'Timetable slot & lab allocation with clash detection, class-wise student leave workflow with direct attendance reflection, and 75% exam gate.'}
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'manual' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            {isStudent ? 'My Course Attendance' : 'Course Register'}
          </button>
          {!isStudent && (
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${activeTab === 'timetable' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
            >
              <Calendar size={13} />
              Timetable &amp; Labs
            </button>
          )}
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${activeTab === 'leaves' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <FileText size={13} />
            {isStudent ? 'Apply Leave (OD)' : 'Student Leave Approvals'}
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'qr' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Dynamic QR
          </button>
          <button
            onClick={() => setActiveTab('geofence')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'geofence' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            GPS Fence
          </button>
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'kiosk' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Face Kiosk
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'eligibility' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            75% Exam Gate
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'manual' && <CourseManualAttendance />}
      {activeTab === 'timetable' && !isStudent && <TimetableManager />}
      {activeTab === 'leaves' && <StudentLeavePortal />}
      {activeTab === 'qr' && <DynamicQRConsole onSimulateScan={handleSimulateScan} />}
      {activeTab === 'geofence' && <GeofenceRadar onCheckInGPS={handleCheckInGPS} />}
      {activeTab === 'kiosk' && <FaceLivenessKiosk onFaceVerified={handleFaceVerified} />}
      {activeTab === 'eligibility' && (
        <EligibilityGateView
          eligibility={eligibility}
          onRequestCondonation={handleRequestCondonation}
        />
      )}

      {/* Live Headcount & Stream (Role-Protected: Students only see their own verification) */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
              <Users size={16} className="text-cu-gold" />
              {isStudent ? 'My Attendance Verification Stream' : 'Live Headcount & Verification Stream'}
            </h3>
            {isStudent ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Confidential &bull; Your Record Only ({studentRoll})
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Faculty / Proctor Class View ({roster.length} enrolled)
              </span>
            )}
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Verification Mode</th>
                <th className="p-3">GPS Proximity</th>
                <th className="p-3">Check-In Time</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isStudent 
                ? (roster.filter(st => st.roll === studentRoll || st.name.toLowerCase() === studentName.toLowerCase()).length > 0
                    ? roster.filter(st => st.roll === studentRoll || st.name.toLowerCase() === studentName.toLowerCase())
                    : [{ roll: studentRoll, name: studentName, status: 'PRESENT' as const, mode: 'QR_CODE' as const, time: '10:50 PM', verifiedRadiusMeters: 12 }])
                : roster
              ).map((st) => (
                <tr key={st.roll} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-bold text-cu-navy">{st.roll}</td>
                  <td className="p-3 font-semibold text-gray-800">{st.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.status === 'ON_DUTY'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : st.status === 'CONDONED'
                          ? 'bg-teal-100 text-teal-800'
                          : st.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 font-medium">{st.mode}</td>
                  <td className="p-3 text-gray-500 font-mono">
                    {st.verifiedRadiusMeters > 0 ? `${st.verifiedRadiusMeters} meters` : '—'}
                  </td>
                  <td className="p-3 text-gray-600">{st.time}</td>
                  <td className="p-3 text-gray-500 text-[11px]">
                    {st.remarks || (st.status === 'PRESENT' ? 'Normal Attendance' : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AttendanceModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="academics"
      moduleName="EduAttend AI (Smart Student Attendance)"
      teamName="Team 02"
    >
      <AttendanceModuleContent />
    </ModuleErrorBoundary>
  );
};

export default AttendanceModule;
