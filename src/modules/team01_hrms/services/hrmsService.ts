// Team 01 (EduHRMS) Resilient Service Layer
// Incorporates Circuit Breaker & Isolated Storage to ensure zero cascading failures.

import { CircuitBreaker } from '../../../core/resilience/CircuitBreaker';
import { IsolatedStorage } from '../../../core/resilience/IsolatedStorage';
import { LeaveRequest, FacultyProfileData, WorkloadItem, PayslipItem } from '../types/hrms.types';

const storage = new IsolatedStorage('team01_hrms');

const INITIAL_PROFILE: FacultyProfileData = {
  id: 'usr_fac_01',
  name: 'Deepak B',
  employeeId: 'CUP2025/00303',
  designation: 'Assistant Professor & MCA Project Lead',
  department: 'School of Computer Science & Applications',
  email: 'deepak.b@chanakyauniversity.edu.in',
  phone: '+91 98450 12345',
  joiningDate: '15 July 2024',
  tenureStatus: 'CONFIRMED',
  qualifications: ['M.Tech in Computer Science', 'B.E. in Information Science', 'PhD Candidate (AI Systems)'],
  maxTeachingCredits: 16,
  currentWorkloadCredits: 14,
  hIndex: 6,
  totalPublications: 11,
  fundedGrants: '₹ 8.5 Lakhs (AICTE Research Grant)'
};

const INITIAL_LEAVES: LeaveRequest[] = [
  { id: '1', type: 'Duty Leave (DL)', start: '2026-08-20', end: '2026-08-22', days: 3, reason: 'ACM SIGCSE Faculty Development Conference', status: 'APPROVED', approver: 'Dr. R. Sharma (Dean)' },
  { id: '2', type: 'Casual Leave (CL)', start: '2026-07-14', end: '2026-07-14', days: 1, reason: 'Family Function', status: 'APPROVED', approver: 'HOD Computer Science' },
  { id: '3', type: 'Casual Leave (CL)', start: '2026-09-18', end: '2026-09-19', days: 2, reason: 'Personal errands', status: 'PENDING_HOD', approver: 'Under Review' },
];

const INITIAL_WORKLOAD: WorkloadItem[] = [
  { id: 'w1', courseCode: 'MCA301', courseName: 'Enterprise Cloud Architecture', credits: 4, type: 'Lecture', hoursPerWeek: 4, studentsEnrolled: 64 },
  { id: 'w2', courseCode: 'MCA302', courseName: 'Full-Stack Web Engineering Lab', credits: 2, type: 'Lab', hoursPerWeek: 4, studentsEnrolled: 64 },
  { id: 'w3', courseCode: 'MCA305', courseName: 'Distributed Systems Seminar', credits: 2, type: 'Tutorial', hoursPerWeek: 2, studentsEnrolled: 32 },
  { id: 'w4', courseCode: 'MCA399', courseName: 'Major Capstone Project Mentorship', credits: 6, type: 'Project Mentorship', hoursPerWeek: 6, studentsEnrolled: 18 }
];

const INITIAL_PAYSLIPS: PayslipItem[] = [
  { month: 'August', year: 2026, basicPay: 72000, academicAllowance: 18000, researchIncentive: 7500, pfDeduction: 8640, taxDeduction: 6800, netPayable: 82060, pdfUrl: '#' },
  { month: 'July', year: 2026, basicPay: 72000, academicAllowance: 18000, researchIncentive: 5000, pfDeduction: 8640, taxDeduction: 6800, netPayable: 79560, pdfUrl: '#' },
  { month: 'June', year: 2026, basicPay: 72000, academicAllowance: 18000, researchIncentive: 5000, pfDeduction: 8640, taxDeduction: 6800, netPayable: 79560, pdfUrl: '#' }
];

export class HrmsService {
  private leaveBreaker = new CircuitBreaker<LeaveRequest[]>({
    moduleId: 'hrms',
    operationName: 'fetchLeaveRequests',
    fallbackSupplier: () => storage.getItem('leaves', INITIAL_LEAVES)
  });

  public async getProfile(): Promise<FacultyProfileData> {
    return storage.getItem('faculty_profile', INITIAL_PROFILE);
  }

  public async getLeaves(): Promise<LeaveRequest[]> {
    return this.leaveBreaker.execute(async () => {
      return storage.getItem('leaves', INITIAL_LEAVES);
    });
  }

  public async submitLeave(request: Omit<LeaveRequest, 'id' | 'status' | 'approver'>): Promise<LeaveRequest> {
    const current = await this.getLeaves();
    const newEntry: LeaveRequest = {
      ...request,
      id: `leave_${Date.now()}`,
      status: 'PENDING_HOD',
      approver: 'Pending HOD Approval'
    };
    const updated = [newEntry, ...current];
    storage.setItem('leaves', updated);
    return newEntry;
  }

  public async getWorkload(): Promise<WorkloadItem[]> {
    return storage.getItem('workload', INITIAL_WORKLOAD);
  }

  public async getPayslips(): Promise<PayslipItem[]> {
    return storage.getItem('payslips', INITIAL_PAYSLIPS);
  }
}

export const hrmsService = new HrmsService();
