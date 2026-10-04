import { StudentLeaveApplication, LeaveStatus } from '../types/attendance.types';
import { attendanceService } from './attendanceService';

const STORAGE_KEY = 'chanakya_student_leaves_v1';

const INITIAL_LEAVES: StudentLeaveApplication[] = [
  {
    id: 'lv_001',
    studentRoll: '24MCA003',
    studentName: 'Arjun Kumar',
    batch: 'MCA 3rd Sem',
    type: 'CLASS_WISE',
    startDate: '2026-09-06',
    endDate: '2026-09-06',
    classSlotIds: ['tt_mca3_fri_03'],
    classSlotSummaries: ['MCA306: Technical Viva & Presentation Clinic (14:00 - 16:00)'],
    reasonCategory: 'Capstone / Hackathon',
    detailedReason: 'Selected for Smart India Hackathon internal university jury defense round in Block C.',
    documentName: 'sih_jury_nomination_letter.pdf',
    documentUrl: '#',
    approvingFaculty: 'Deepak B',
    status: 'PENDING',
    submittedAt: '2026-09-06 08:30 AM',
    updatedAt: '2026-09-06 08:30 AM'
  },
  {
    id: 'lv_002',
    studentRoll: '24MCA001',
    studentName: 'Aarav Sharma',
    batch: 'MCA 3rd Sem',
    type: 'FULL_DAY',
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    reasonCategory: 'Medical',
    detailedReason: 'Severe viral fever and clinical consultation at Chanakya Health Center.',
    documentName: 'campus_clinic_prescription.pdf',
    documentUrl: '#',
    approvingFaculty: 'Deepak B',
    status: 'APPROVED',
    facultyRemarks: 'Verified with University Health Center records. Approved as On-Duty/Medical condonation.',
    submittedAt: '2026-09-05 07:45 AM',
    updatedAt: '2026-09-05 09:15 AM'
  },
  {
    id: 'lv_003',
    studentRoll: '24MCA004',
    studentName: 'Bhavna Patel',
    batch: 'MCA 3rd Sem',
    type: 'MULTI_DAY',
    startDate: '2026-09-08',
    endDate: '2026-09-10',
    reasonCategory: 'Conference / Sports',
    detailedReason: 'Representing university at Karnataka Inter-University Badminton Championship.',
    documentName: 'sports_board_selection.pdf',
    documentUrl: '#',
    approvingFaculty: 'Dr. Anita Desai',
    status: 'RESEND_REQUESTED',
    facultyRemarks: 'Please attach the physical education director endorsement seal on the certificate before approval.',
    submittedAt: '2026-09-04 03:20 PM',
    updatedAt: '2026-09-05 11:00 AM'
  }
];

class StudentLeaveService {
  private getStored(): StudentLeaveApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.save(INITIAL_LEAVES);
    return INITIAL_LEAVES;
  }

  private save(leaves: StudentLeaveApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
    } catch (e) {
      console.error('Failed to save student leaves', e);
    }
  }

  public getAllLeaves(): StudentLeaveApplication[] {
    return this.getStored();
  }

  public getLeavesForStudent(roll: string): StudentLeaveApplication[] {
    return this.getStored().filter(l => l.studentRoll === roll);
  }

  public getLeavesForFaculty(facultyName: string): StudentLeaveApplication[] {
    return this.getStored().filter(l => 
      l.approvingFaculty.toLowerCase().includes(facultyName.toLowerCase()) ||
      facultyName.toLowerCase().includes(l.approvingFaculty.toLowerCase())
    );
  }

  public applyLeave(applicationData: Omit<StudentLeaveApplication, 'id' | 'status' | 'submittedAt' | 'updatedAt'>): StudentLeaveApplication {
    const newLeave: StudentLeaveApplication = {
      ...applicationData,
      id: `lv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    const list = [newLeave, ...this.getStored()];
    this.save(list);
    return newLeave;
  }

  public async updateLeaveStatus(
    leaveId: string, 
    status: LeaveStatus, 
    facultyRemarks?: string
  ): Promise<{ success: boolean; leave?: StudentLeaveApplication }> {
    const list = this.getStored();
    const index = list.findIndex(l => l.id === leaveId);
    if (index === -1) return { success: false };

    const targetLeave = list[index];
    const updatedLeave: StudentLeaveApplication = {
      ...targetLeave,
      status,
      facultyRemarks: facultyRemarks || targetLeave.facultyRemarks,
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    list[index] = updatedLeave;
    this.save(list);

    // DIRECT ATTENDANCE REFLECTION MANDATE:
    // If approved, automatically update live attendance record and credit course eligibility
    if (status === 'APPROVED') {
      await attendanceService.reflectApprovedLeave({
        studentRoll: updatedLeave.studentRoll,
        studentName: updatedLeave.studentName,
        reasonCategory: updatedLeave.reasonCategory,
        detailedReason: updatedLeave.detailedReason,
        classSlotSummaries: updatedLeave.classSlotSummaries
      });
    }

    return { success: true, leave: updatedLeave };
  }

  public resubmitEditedLeave(
    leaveId: string,
    updates: Partial<Omit<StudentLeaveApplication, 'id' | 'studentRoll' | 'studentName' | 'submittedAt'>>
  ): { success: boolean; leave?: StudentLeaveApplication } {
    const list = this.getStored();
    const index = list.findIndex(l => l.id === leaveId);
    if (index === -1) return { success: false };

    const existing = list[index];
    const updated: StudentLeaveApplication = {
      ...existing,
      ...updates,
      status: 'PENDING', // Reset back to pending for faculty review
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    list[index] = updated;
    this.save(list);
    return { success: true, leave: updated };
  }
}

export const studentLeaveService = new StudentLeaveService();
