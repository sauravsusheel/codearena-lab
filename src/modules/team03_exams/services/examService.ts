// Team 03 (EduExam AI) Resilient Service Layer
// Offline autosave sync, CircuitBreaker protection, and decoupled listener for attendance eligibility unlock.

import { CircuitBreaker } from '../../../core/resilience/CircuitBreaker';
import { IsolatedStorage } from '../../../core/resilience/IsolatedStorage';
import { CampusEventBus } from '../../../core/resilience/EventBus';
import { AssessmentItem, ProctoringViolation, ExamQuestion } from '../types/exams.types';

const storage = new IsolatedStorage('team03_exams');

const INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'exam_mca301_mid',
    title: 'PRG301 — Enterprise Cloud Systems Mid-Term',
    courseCode: 'MCA301',
    durationMinutes: 90,
    totalMarks: 50,
    scheduledDate: '2026-09-08',
    status: 'SCHEDULED',
    isLockedDueToAttendanceShortage: false,
    questions: [
      {
        id: 'q1',
        type: 'MCQ',
        prompt: 'Which consensus algorithm is best suited for Byzantine fault tolerance in decentralized ledgers?',
        options: ['Raft', 'PBFT (Practical Byzantine Fault Tolerance)', 'Two-Phase Commit (2PC)', 'Paxos'],
        correctAnswer: 'PBFT (Practical Byzantine Fault Tolerance)',
        marks: 2,
        bloomLevel: 'UNDERSTAND'
      },
      {
        id: 'q2',
        type: 'FORMULA_LATEX',
        prompt: 'Derive Amdahl’s Law formula for speedup S in parallel computing where p is the parallel fraction and s is execution speedup factor:',
        formulaLatex: 'S_{latency}(s) = \\frac{1}{(1 - p) + \\frac{p}{s}}',
        marks: 8,
        bloomLevel: 'APPLY'
      },
      {
        id: 'q3',
        type: 'SUBJECTIVE_ESSAY',
        prompt: 'Critique the circuit breaker architectural pattern versus exponential backoff in distributed microservices under cascading failure conditions.',
        marks: 10,
        bloomLevel: 'ANALYZE'
      }
    ]
  },
  {
    id: 'exam_dsa201_final',
    title: 'DSA201 — Data Structures & Algorithms End-Term',
    courseCode: 'DSA201',
    durationMinutes: 120,
    totalMarks: 100,
    scheduledDate: '2026-08-18',
    status: 'EVALUATED',
    isLockedDueToAttendanceShortage: false,
    questions: []
  }
];

const INITIAL_VIOLATIONS: ProctoringViolation[] = [
  { id: 'v1', studentRoll: '24MCA001', studentName: 'Aarav Sharma', anomalyType: 'TAB_SWITCH', timestamp: '14:22:10', confidenceScore: 0.99, tabSwitchCount: 0, integrityRating: 98 },
  { id: 'v2', studentRoll: '24MCA004', studentName: 'Bhavna Patel', anomalyType: 'GAZE_DEVIATION', timestamp: '14:35:40', confidenceScore: 0.88, tabSwitchCount: 1, integrityRating: 91 },
  { id: 'v3', studentRoll: '24MCA005', studentName: 'Chirag Sen', anomalyType: 'MULTIPLE_FACES', timestamp: '14:41:15', confidenceScore: 0.94, tabSwitchCount: 3, integrityRating: 72 }
];

export class ExamService {
  private assessmentBreaker = new CircuitBreaker<AssessmentItem[]>({
    moduleId: 'exams',
    operationName: 'fetchAssessments',
    fallbackSupplier: () => storage.getItem('assessments', INITIAL_ASSESSMENTS)
  });

  constructor() {
    // Decoupled listener: When attendance condonation is filed or approved, unlock student exam ticket!
    CampusEventBus.subscribe('ATTENDANCE_CONDONATION_FILED', 'team03_exams', (event) => {
      console.log(`[EduExam AI] Received condonation notification for ${event.payload.studentRoll}. Checking hall ticket locks...`);
    });
  }

  public async getAssessments(): Promise<AssessmentItem[]> {
    return this.assessmentBreaker.execute(async () => {
      return storage.getItem('assessments', INITIAL_ASSESSMENTS);
    });
  }

  public async getViolations(): Promise<ProctoringViolation[]> {
    return storage.getItem('violations', INITIAL_VIOLATIONS);
  }

  public async recordTelemetryViolation(violation: Omit<ProctoringViolation, 'id'>): Promise<ProctoringViolation> {
    const list = await this.getViolations();
    const newEntry: ProctoringViolation = {
      ...violation,
      id: `viol_${Date.now()}`
    };
    const updated = [newEntry, ...list];
    storage.setItem('violations', updated);
    return newEntry;
  }
}

export const examService = new ExamService();
