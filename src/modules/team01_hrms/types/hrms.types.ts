// Team 01 (EduHRMS) Domain Types
// Aligned with PostgreSQL 16 schema: hrms_faculty_profiles, hrms_leave_requests, hrms_workload_allocations

export type LeaveType = 'Casual Leave (CL)' | 'Medical Leave (ML)' | 'Duty Leave (DL)' | 'Sabbatical Leave';
export type LeaveStatus = 'PENDING_HOD' | 'PENDING_DEAN' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  type: LeaveType | string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approver: string;
}

export interface FacultyProfileData {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  tenureStatus: 'CONFIRMED' | 'PROBATION' | 'CONTRACT';
  qualifications: string[];
  maxTeachingCredits: number;
  currentWorkloadCredits: number;
  hIndex: number;
  totalPublications: number;
  fundedGrants: string;
}

export interface WorkloadItem {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Project Mentorship';
  hoursPerWeek: number;
  studentsEnrolled: number;
}

export interface PayslipItem {
  month: string;
  year: number;
  basicPay: number;
  academicAllowance: number;
  researchIncentive: number;
  pfDeduction: number;
  taxDeduction: number;
  netPayable: number;
  pdfUrl: string;
}
