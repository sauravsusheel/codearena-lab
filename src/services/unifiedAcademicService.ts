// Chanakya University - Unified Cross-Module Academic Bus
// Bridges CodeArena Lab Submissions -> 60:40 Gradebook (FA-2)
// Bridges Attendance Registers -> Exam Eligibility Gate (75% Rule)
// Bridges Approvals Queue -> Calendar & Dossier Status

import { IsolatedStorage } from '../core/resilience/IsolatedStorage';
import { CampusEventBus } from '../core/resilience/EventBus';

export interface SyncedLabSubmission {
  id: string;
  usn: string;
  studentName: string;
  courseCode: string;
  problemTitle: string;
  awardedMarks: number; // max 10
  timestamp: string;
}

export interface SyncedAttendanceSummary {
  usn: string;
  courseCode: string;
  totalHeld: number;
  attended: number;
  percentage: number;
  isDebarred: boolean;
  condonationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const storage = new IsolatedStorage('chanakya_unified_academic_bus');

class UnifiedAcademicService {
  // Save lab submission and notify event bus
  public recordLabSubmission(sub: SyncedLabSubmission) {
    const list = storage.getItem<SyncedLabSubmission[]>('lab_submissions', []);
    const updated = [sub, ...list.filter(item => !(item.usn === sub.usn && item.courseCode === sub.courseCode))];
    storage.setItem('lab_submissions', updated);

    CampusEventBus.publish('EVENT_TRIGGERED', 'codearena', { action: 'LAB_SCORE_RECORDED', submission: sub });
  }

  public getLabSubmissions(): SyncedLabSubmission[] {
    return storage.getItem<SyncedLabSubmission[]>('lab_submissions', [
      { id: 'sub-1', usn: '1CU23CS001', studentName: 'Aarav Sharma', courseCode: 'CS301', problemTitle: 'Array Range Sum Query', awardedMarks: 10, timestamp: '2026-09-06 09:30 AM' },
      { id: 'sub-2', usn: '1CU23CS002', studentName: 'Ananya Deshmukh', courseCode: 'CS301', problemTitle: 'Array Range Sum Query', awardedMarks: 10, timestamp: '2026-09-06 09:45 AM' },
      { id: 'sub-3', usn: '1CU23CS003', studentName: 'Arjun Kumar', courseCode: 'CS301', problemTitle: 'Array Range Sum Query', awardedMarks: 7.5, timestamp: '2026-09-06 10:05 AM' },
    ]);
  }

  // Update attendance and debarment flag
  public updateStudentAttendance(summary: SyncedAttendanceSummary) {
    const list = storage.getItem<SyncedAttendanceSummary[]>('attendance_summaries', []);
    const updated = [summary, ...list.filter(item => !(item.usn === summary.usn && item.courseCode === summary.courseCode))];
    storage.setItem('attendance_summaries', updated);

    CampusEventBus.publish('EVENT_TRIGGERED', 'academics', { action: 'ATTENDANCE_EVALUATED', summary });
  }

  public getAttendanceSummaries(): SyncedAttendanceSummary[] {
    return storage.getItem<SyncedAttendanceSummary[]>('attendance_summaries', [
      { usn: '1CU23CS001', courseCode: 'CS301', totalHeld: 32, attended: 30, percentage: 93.8, isDebarred: false },
      { usn: '1CU23CS002', courseCode: 'CS301', totalHeld: 32, attended: 29, percentage: 90.6, isDebarred: false },
      { usn: '1CU23CS003', courseCode: 'CS301', totalHeld: 32, attended: 21, percentage: 65.6, isDebarred: true, condonationStatus: 'PENDING' },
      { usn: '1CU23CS005', courseCode: 'CS301', totalHeld: 32, attended: 22, percentage: 68.8, isDebarred: true },
      { usn: '1CU23CS007', courseCode: 'CS301', totalHeld: 32, attended: 20, percentage: 62.5, isDebarred: true },
    ]);
  }
}

export const unifiedAcademicService = new UnifiedAcademicService();
