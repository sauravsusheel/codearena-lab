import { TimetableSlot, DayOfWeek } from '../types/attendance.types';

const STORAGE_KEY = 'chanakya_timetable_slots_v1';

export const CAMPUS_ROOMS_AND_LABS = [
  'LH-101 (Academic Block A)',
  'LH-102 (Academic Block A)',
  'LH-204 (Academic Block B)',
  'LH-205 (Academic Block B)',
  'LH-301 (Auditorium Wing)',
  'Lab 01 (HPC & AI Lab)',
  'Lab 02 (Cloud & Systems Lab)',
  'Lab 03 (IoT & Robotics Lab)',
  'Lab 04 (Advanced Software Studio)'
];

export const CAMPUS_BATCHES = [
  'MCA 3rd Sem',
  'MCA 1st Sem',
  'B.Tech CSE 5th Sem',
  'B.Tech AI & DS 3rd Sem',
  'BCA 3rd Sem',
  'M.Tech Cloud 1st Sem'
];

export const FACULTY_MEMBERS = [
  { name: 'Deepak B', empId: 'CUP2025/00303', dept: 'School of Computer Science' },
  { name: 'Dr. Anita Desai', empId: 'CUP2022/00084', dept: 'School of Computer Science' },
  { name: 'Kavitha Murthy', empId: 'CUP2024/00078', dept: 'Board of Studies' },
  { name: 'Vinay Varma', empId: 'CUP2024/00112', dept: 'Systems & IoT Lab' },
  { name: 'Dr. Ramesh Hegde', empId: 'CUP2022/00018', dept: 'Management & Computational Finance' },
  { name: 'Dr. Sushant Joshi', empId: 'CUA2021/00002', dept: 'Office of Registrar' }
];

const INITIAL_TIMETABLE: TimetableSlot[] = [
  {
    id: 'tt_mca3_mon_01',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    courseCode: 'MCA301',
    courseName: 'Enterprise Cloud Architecture',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_mon_02',
    day: 'Monday',
    startTime: '10:15',
    endTime: '11:15',
    courseCode: 'MCA303',
    courseName: 'Advanced Database Systems',
    facultyName: 'Dr. Anita Desai',
    facultyEmpId: 'CUP2022/00084',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_mon_03',
    day: 'Monday',
    startTime: '11:30',
    endTime: '13:30',
    courseCode: 'MCA302',
    courseName: 'Full-Stack Web Engineering Lab',
    facultyName: 'Vinay Varma',
    facultyEmpId: 'CUP2024/00112',
    roomLab: 'Lab 02 (Cloud & Systems Lab)',
    type: 'LAB',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_mon_04',
    day: 'Monday',
    startTime: '14:30',
    endTime: '16:00',
    courseCode: 'MCA304',
    courseName: 'Machine Learning & Neural Nets',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-204 (Academic Block B)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  // Tuesday
  {
    id: 'tt_mca3_tue_01',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    courseCode: 'MCA304',
    courseName: 'Machine Learning & Neural Nets',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_tue_02',
    day: 'Tuesday',
    startTime: '10:15',
    endTime: '12:15',
    courseCode: 'MCA305',
    courseName: 'High Performance Computing Lab',
    facultyName: 'Vinay Varma',
    facultyEmpId: 'CUP2024/00112',
    roomLab: 'Lab 01 (HPC & AI Lab)',
    type: 'LAB',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_tue_03',
    day: 'Tuesday',
    startTime: '13:30',
    endTime: '14:30',
    courseCode: 'MCA301',
    courseName: 'Enterprise Cloud Architecture',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-102 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  // Wednesday
  {
    id: 'tt_mca3_wed_01',
    day: 'Wednesday',
    startTime: '09:30',
    endTime: '11:00',
    courseCode: 'MCA303',
    courseName: 'Advanced Database Systems',
    facultyName: 'Dr. Anita Desai',
    facultyEmpId: 'CUP2022/00084',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_wed_02',
    day: 'Wednesday',
    startTime: '11:15',
    endTime: '12:45',
    courseCode: 'MCA306',
    courseName: 'Capstone Project Work & Seminar',
    facultyName: 'Dr. Anita Desai',
    facultyEmpId: 'CUP2022/00084',
    roomLab: 'LH-301 (Auditorium Wing)',
    type: 'SEMINAR',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_wed_03',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '16:00',
    courseCode: 'MCA302',
    courseName: 'Full-Stack Web Engineering Lab',
    facultyName: 'Vinay Varma',
    facultyEmpId: 'CUP2024/00112',
    roomLab: 'Lab 02 (Cloud & Systems Lab)',
    type: 'LAB',
    batch: 'MCA 3rd Sem'
  },
  // Thursday
  {
    id: 'tt_mca3_thu_01',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '10:30',
    courseCode: 'MCA301',
    courseName: 'Enterprise Cloud Architecture',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-204 (Academic Block B)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_thu_02',
    day: 'Thursday',
    startTime: '11:00',
    endTime: '13:00',
    courseCode: 'MCA307',
    courseName: 'AI & Deep Learning Studio',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'Lab 01 (HPC & AI Lab)',
    type: 'LAB',
    batch: 'MCA 3rd Sem'
  },
  // Friday
  {
    id: 'tt_mca3_fri_01',
    day: 'Friday',
    startTime: '09:30',
    endTime: '11:00',
    courseCode: 'MCA304',
    courseName: 'Machine Learning & Neural Nets',
    facultyName: 'Deepak B',
    facultyEmpId: 'CUP2025/00303',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_fri_02',
    day: 'Friday',
    startTime: '11:30',
    endTime: '13:00',
    courseCode: 'MCA303',
    courseName: 'Advanced Database Systems',
    facultyName: 'Dr. Anita Desai',
    facultyEmpId: 'CUP2022/00084',
    roomLab: 'LH-101 (Academic Block A)',
    type: 'LECTURE',
    batch: 'MCA 3rd Sem'
  },
  {
    id: 'tt_mca3_fri_03',
    day: 'Friday',
    startTime: '14:00',
    endTime: '16:00',
    courseCode: 'MCA306',
    courseName: 'Technical Viva & Presentation Clinic',
    facultyName: 'Dr. Anita Desai',
    facultyEmpId: 'CUP2022/00084',
    roomLab: 'LH-301 (Auditorium Wing)',
    type: 'SEMINAR',
    batch: 'MCA 3rd Sem'
  }
];

// Helper to convert '09:30' into minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

class TimetableService {
  private getStored(): TimetableSlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.save(INITIAL_TIMETABLE);
    return INITIAL_TIMETABLE;
  }

  private save(slots: TimetableSlot[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch (e) {
      console.error('Failed to save timetable', e);
    }
  }

  public getSlots(): TimetableSlot[] {
    return this.getStored();
  }

  public getSlotsForBatch(batch: string): TimetableSlot[] {
    return this.getStored().filter(s => s.batch.toLowerCase() === batch.toLowerCase());
  }

  public getSlotsForFaculty(facultyName: string): TimetableSlot[] {
    return this.getStored().filter(s => s.facultyName.toLowerCase().includes(facultyName.toLowerCase()));
  }

  public getSlotsForDay(day: DayOfWeek, batch?: string): TimetableSlot[] {
    let slots = this.getStored().filter(s => s.day === day);
    if (batch) {
      slots = slots.filter(s => s.batch.toLowerCase() === batch.toLowerCase());
    }
    return slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }

  /**
   * Check for clash / conflict with existing slots:
   * 1. Room conflict: same day, overlapping time, same roomLab.
   * 2. Faculty conflict: same day, overlapping time, same faculty.
   * 3. Batch conflict: same day, overlapping time, same batch.
   */
  public checkConflict(candidate: Omit<TimetableSlot, 'id'>, excludeId?: string): { hasConflict: boolean; reason?: string } {
    const slots = this.getStored().filter(s => s.id !== excludeId);

    for (const slot of slots) {
      if (slot.day !== candidate.day) continue;

      if (timesOverlap(candidate.startTime, candidate.endTime, slot.startTime, slot.endTime)) {
        if (slot.roomLab === candidate.roomLab) {
          return {
            hasConflict: true,
            reason: `Room Conflict: ${candidate.roomLab} is already booked on ${candidate.day} (${slot.startTime}-${slot.endTime}) for ${slot.courseCode} (${slot.batch}) taught by ${slot.facultyName}.`
          };
        }

        if (slot.facultyName === candidate.facultyName) {
          return {
            hasConflict: true,
            reason: `Faculty Conflict: Faculty ${candidate.facultyName} is already assigned on ${candidate.day} (${slot.startTime}-${slot.endTime}) for ${slot.courseCode} (${slot.batch}) in ${slot.roomLab}.`
          };
        }

        if (slot.batch === candidate.batch) {
          return {
            hasConflict: true,
            reason: `Batch Schedule Conflict: Batch ${candidate.batch} already has ${slot.courseCode} (${slot.courseName}) on ${candidate.day} from ${slot.startTime} to ${slot.endTime}.`
          };
        }
      }
    }

    return { hasConflict: false };
  }

  public addSlot(newSlotData: Omit<TimetableSlot, 'id'>): { success: boolean; slot?: TimetableSlot; error?: string } {
    const conflict = this.checkConflict(newSlotData);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason };
    }

    const newSlot: TimetableSlot = {
      ...newSlotData,
      id: `tt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };

    const slots = [...this.getStored(), newSlot];
    this.save(slots);
    return { success: true, slot: newSlot };
  }

  public updateSlot(slot: TimetableSlot): { success: boolean; error?: string } {
    const conflict = this.checkConflict(slot, slot.id);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason };
    }

    const slots = this.getStored().map(s => s.id === slot.id ? slot : s);
    this.save(slots);
    return { success: true };
  }

  public deleteSlot(id: string): boolean {
    const slots = this.getStored().filter(s => s.id !== id);
    this.save(slots);
    return true;
  }

  public autoGenerateBatchSchedule(batch: string): { success: boolean; count: number; error?: string } {
    // Clear existing slots for this batch to ensure fresh conflict-free layout
    const otherSlots = this.getStored().filter(s => s.batch !== batch);
    this.save(otherSlots);

    const generated: TimetableSlot[] = [];
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const curriculum = [
      { code: 'MCA301', name: 'Enterprise Cloud Architecture', facultyName: 'Deepak B', empId: 'CUP2025/00303', room: 'LH-101 (Academic Block A)', type: 'LECTURE' as const },
      { code: 'MCA303', name: 'Advanced Database Systems', facultyName: 'Dr. Anita Desai', empId: 'CUP2022/00084', room: 'LH-101 (Academic Block A)', type: 'LECTURE' as const },
      { code: 'MCA302', name: 'Full-Stack Web Engineering Lab', facultyName: 'Vinay Varma', empId: 'CUP2024/00112', room: 'Lab 02 (Cloud & Systems Lab)', type: 'LAB' as const },
      { code: 'MCA304', name: 'Machine Learning & Neural Nets', facultyName: 'Deepak B', empId: 'CUP2025/00303', room: 'LH-204 (Academic Block B)', type: 'LECTURE' as const },
      { code: 'MCA305', name: 'Cyber Law & Digital Ethics', facultyName: 'Kavitha Murthy', empId: 'CUP2024/00078', room: 'LH-205 (Academic Block B)', type: 'LECTURE' as const }
    ];

    const standardTimeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:15', end: '11:15' },
      { start: '11:30', end: '13:30' },
      { start: '14:30', end: '16:00' }
    ];

    days.forEach((day, dIdx) => {
      standardTimeSlots.forEach((slot, sIdx) => {
        const itemIdx = (dIdx + sIdx) % curriculum.length;
        const item = curriculum[itemIdx];

        const candidate: Omit<TimetableSlot, 'id'> = {
          day,
          startTime: slot.start,
          endTime: slot.end,
          courseCode: item.code,
          courseName: item.name,
          facultyName: item.facultyName,
          facultyEmpId: item.empId,
          roomLab: slot.start === '11:30' ? 'Lab 02 (Cloud & Systems Lab)' : item.room,
          type: slot.start === '11:30' ? 'LAB' : item.type,
          batch
        };

        const conflict = this.checkConflict(candidate);
        if (!conflict.hasConflict) {
          const newSlot: TimetableSlot = {
            ...candidate,
            id: `tt_${batch.replace(/\s+/g, '').toLowerCase()}_${day.toLowerCase()}_0${sIdx + 1}`
          };
          this.save([...this.getStored(), newSlot]);
          generated.push(newSlot);
        }
      });
    });

    return { success: true, count: generated.length };
  }

  public resetToDefaults(): void {
    this.save(INITIAL_TIMETABLE);
  }
}

export const timetableService = new TimetableService();
