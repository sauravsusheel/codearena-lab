// Team 02 (EduAttend AI) Domain Types
// Aligned with PostgreSQL 16 schema: attend_sessions, attend_records, attend_eligibility_locks, timetable_slots, student_leaves

export type AttendanceMode = 'QR_CODE' | 'GPS_GEOFENCE' | 'BLE_BEACON' | 'FACE_LIVENESS' | 'LEAVE_APPROVAL';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'CONDONED' | 'ON_DUTY';

export interface StudentAttendanceRecord {
  roll: string;
  name: string;
  status: AttendanceStatus;
  mode: AttendanceMode;
  time: string;
  verifiedRadiusMeters: number;
  remarks?: string;
}

export interface DynamicQRSession {
  sessionId: string;
  courseCode: string;
  courseName: string;
  room: string;
  facultyName: string;
  nonce: string;
  refreshesInSeconds: number;
  centerLatitude: number;
  centerLongitude: number;
  maxRadiusMeters: number;
}

export interface CourseEligibility {
  courseCode: string;
  courseName: string;
  classesHeld: number;
  classesAttended: number;
  percentage: number;
  thresholdMet: boolean; // >= 75%
  hallTicketStatus: 'UNLOCKED' | 'LOCKED_SHORTAGE' | 'PENDING_CONDONATION';
}

export interface CondonationRequest {
  id: string;
  studentRoll: string;
  studentName: string;
  courseCode: string;
  hospitalReason: string;
  documentUrl: string;
  status: 'PENDING_HOD' | 'APPROVED' | 'REJECTED';
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. '09:00'
  endTime: string;   // e.g. '10:00'
  courseCode: string;
  courseName: string;
  facultyName: string;
  facultyEmpId: string;
  roomLab: string; // e.g. 'LH-101 (Block A)', 'Lab 01 (HPC & AI Lab)'
  type: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR';
  batch: string; // e.g. 'MCA 3rd Sem', 'B.Tech CSE 5th Sem'
}

export type LeaveType = 'CLASS_WISE' | 'FULL_DAY' | 'MULTI_DAY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESEND_REQUESTED';
export type LeaveCategory = 'Medical' | 'Capstone / Hackathon' | 'Family Emergency' | 'Conference / Sports' | 'Academic On-Duty';

export interface StudentLeaveApplication {
  id: string;
  studentRoll: string;
  studentName: string;
  batch: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  classSlotIds?: string[]; // IDs of specific timetable slots
  classSlotSummaries?: string[]; // Human readable summaries e.g. "MCA301 (09:00 - 10:00)"
  reasonCategory: LeaveCategory;
  detailedReason: string;
  documentName?: string;
  documentUrl?: string;
  approvingFaculty: string;
  status: LeaveStatus;
  facultyRemarks?: string;
  submittedAt: string;
  updatedAt: string;
}
