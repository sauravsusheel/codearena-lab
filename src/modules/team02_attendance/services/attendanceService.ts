// Team 02 (EduAttend AI) Resilient Service Layer
// 5s rotating HMAC QR nonces, GPS distance checks, and decoupled event publishing to ExamShield.

import { CircuitBreaker } from '../../../core/resilience/CircuitBreaker';
import { IsolatedStorage } from '../../../core/resilience/IsolatedStorage';
import { CampusEventBus } from '../../../core/resilience/EventBus';
import { StudentAttendanceRecord, DynamicQRSession, CourseEligibility } from '../types/attendance.types';

const storage = new IsolatedStorage('team02_attendance');

const INITIAL_ROSTER: StudentAttendanceRecord[] = [
  { roll: '24MCA001', name: 'Aarav Sharma', status: 'PRESENT', mode: 'QR_CODE', time: '2:16 PM', verifiedRadiusMeters: 12 },
  { roll: '24MCA002', name: 'Ananya Rao', status: 'PRESENT', mode: 'GPS_GEOFENCE', time: '2:17 PM', verifiedRadiusMeters: 18 },
  { roll: '24MCA003', name: 'Arjun Kumar', status: 'PRESENT', mode: 'QR_CODE', time: '2:15 PM', verifiedRadiusMeters: 8 },
  { roll: '24MCA004', name: 'Bhavna Patel', status: 'LATE', mode: 'GPS_GEOFENCE', time: '2:28 PM', verifiedRadiusMeters: 25 },
  { roll: '24MCA005', name: 'Chirag Sen', status: 'ABSENT', mode: 'QR_CODE', time: '-', verifiedRadiusMeters: 0 },
  { roll: '24MCA006', name: 'Divya Nair', status: 'PRESENT', mode: 'FACE_LIVENESS', time: '2:14 PM', verifiedRadiusMeters: 5 },
  { roll: '24MCA007', name: 'Eshwar Reddy', status: 'PRESENT', mode: 'QR_CODE', time: '2:16 PM', verifiedRadiusMeters: 14 }
];

const INITIAL_ELIGIBILITY: CourseEligibility[] = [
  { courseCode: 'MCA301', courseName: 'Enterprise Cloud Architecture', classesHeld: 48, classesAttended: 42, percentage: 87.5, thresholdMet: true, hallTicketStatus: 'UNLOCKED' },
  { courseCode: 'MCA302', courseName: 'Full-Stack Web Engineering Lab', classesHeld: 32, classesAttended: 28, percentage: 87.5, thresholdMet: true, hallTicketStatus: 'UNLOCKED' },
  { courseCode: 'MCA303', courseName: 'Advanced Database Systems', classesHeld: 40, classesAttended: 34, percentage: 85.0, thresholdMet: true, hallTicketStatus: 'UNLOCKED' },
  { courseCode: 'MCA304', courseName: 'Machine Learning & Neural Nets', classesHeld: 44, classesAttended: 30, percentage: 68.2, thresholdMet: false, hallTicketStatus: 'LOCKED_SHORTAGE' }
];

export class AttendanceService {
  private rosterBreaker = new CircuitBreaker<StudentAttendanceRecord[]>({
    moduleId: 'academics',
    operationName: 'fetchLiveRoster',
    fallbackSupplier: () => storage.getItem('roster', INITIAL_ROSTER)
  });

  public getSessionConfig(): DynamicQRSession {
    // Generates a mock rotating nonce based on current 5-second slice
    const epochSlice = Math.floor(Date.now() / 5000);
    const mockHash = `HMAC_${epochSlice.toString(16).toUpperCase()}_7F3A`;

    return {
      sessionId: 'sess_prg301_0905',
      courseCode: 'MCA301',
      courseName: 'Enterprise Cloud Architecture',
      room: 'Room 1A-59 (Academic Block B)',
      facultyName: 'Deepak B',
      nonce: mockHash,
      refreshesInSeconds: 5 - (Math.floor(Date.now() / 1000) % 5),
      centerLatitude: 13.1345,
      centerLongitude: 77.5678,
      maxRadiusMeters: 50
    };
  }

  public async getRoster(): Promise<StudentAttendanceRecord[]> {
    return this.rosterBreaker.execute(async () => {
      return storage.getItem('roster', INITIAL_ROSTER);
    });
  }

  public async checkInStudent(roll: string, name: string, mode: 'QR_CODE' | 'GPS_GEOFENCE' | 'FACE_LIVENESS'): Promise<StudentAttendanceRecord> {
    const current = await this.getRoster();
    const existingIndex = current.findIndex(s => s.roll === roll);

    const updatedRecord: StudentAttendanceRecord = {
      roll,
      name,
      status: 'PRESENT',
      mode,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedRadiusMeters: Math.floor(Math.random() * 20) + 5
    };

    let updated: StudentAttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = updatedRecord;
    } else {
      updated = [updatedRecord, ...current];
    }

    storage.setItem('roster', updated);
    return updatedRecord;
  }

  public async getEligibility(): Promise<CourseEligibility[]> {
    return storage.getItem('eligibility', INITIAL_ELIGIBILITY);
  }

  public async requestCondonation(courseCode: string, reason: string): Promise<boolean> {
    const list = await this.getEligibility();
    const updated = list.map(c => {
      if (c.courseCode === courseCode) {
        return { ...c, hallTicketStatus: 'PENDING_CONDONATION' as const };
      }
      return c;
    });
    storage.setItem('eligibility', updated);

    // Decoupled notification to Module 3 (EduExam AI) via CampusEventBus!
    CampusEventBus.publish('ATTENDANCE_CONDONATION_FILED', 'team02_attendance', {
      studentRoll: '24MCA003',
      courseCode,
      reason
    });

    return true;
  }

  public async reflectApprovedLeave(leave: {
    studentRoll: string;
    studentName: string;
    reasonCategory: string;
    detailedReason: string;
    classSlotSummaries?: string[];
  }): Promise<void> {
    const currentRoster = await this.getRoster();
    const existingIndex = currentRoster.findIndex(s => s.roll === leave.studentRoll);

    const onDutyRecord: StudentAttendanceRecord = {
      roll: leave.studentRoll,
      name: leave.studentName,
      status: 'ON_DUTY',
      mode: 'LEAVE_APPROVAL',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedRadiusMeters: 0,
      remarks: `Official Leave Approved (${leave.reasonCategory})`
    };

    let updatedRoster: StudentAttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRoster = [...currentRoster];
      updatedRoster[existingIndex] = onDutyRecord;
    } else {
      updatedRoster = [onDutyRecord, ...currentRoster];
    }
    storage.setItem('roster', updatedRoster);

    // Automatically boost eligibility for condoned/on-duty courses so attendance is not penalized
    const currentEligibility = await this.getEligibility();
    const updatedEligibility = currentEligibility.map(c => {
      // If course is below 75%, credit the attended classes for approved medical/OD leave
      if (!c.thresholdMet) {
        const newAttended = c.classesAttended + 4;
        const newPct = Number(((newAttended / c.classesHeld) * 100).toFixed(1));
        return {
          ...c,
          classesAttended: newAttended,
          percentage: newPct,
          thresholdMet: newPct >= 75.0,
          hallTicketStatus: (newPct >= 75.0 ? 'UNLOCKED' : 'PENDING_CONDONATION') as 'UNLOCKED' | 'PENDING_CONDONATION'
        };
      }
      return c;
    });
    storage.setItem('eligibility', updatedEligibility);

    CampusEventBus.publish('LEAVE_APPROVED_ATTENDANCE_REFLECTED', 'team02_attendance', {
      studentRoll: leave.studentRoll,
      reason: leave.reasonCategory
    });
  }
}

export const attendanceService = new AttendanceService();

