// Team 03 (EduExam AI) Domain Types
// Aligned with PostgreSQL 16 schema: exam_assessments, exam_questions, exam_submissions, exam_proctoring_logs

export type QuestionType = 'MCQ' | 'MULTI_SELECT' | 'FORMULA_LATEX' | 'SUBJECTIVE_ESSAY';
export type ProctoringAnomalyType = 'MISSING_FACE' | 'MULTIPLE_FACES' | 'GAZE_DEVIATION' | 'TAB_SWITCH' | 'BACKGROUND_SPEECH';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  formulaLatex?: string;
  options?: string[];
  correctAnswer?: string | string[];
  marks: number;
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
}

export interface AssessmentItem {
  id: string;
  title: string;
  courseCode: string;
  durationMinutes: number;
  totalMarks: number;
  scheduledDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'EVALUATED';
  questions: ExamQuestion[];
  isLockedDueToAttendanceShortage: boolean;
}

export interface ProctoringViolation {
  id: string;
  studentRoll: string;
  studentName: string;
  anomalyType: ProctoringAnomalyType;
  timestamp: string;
  confidenceScore: number;
  tabSwitchCount: number;
  integrityRating: number; // 0 - 100
}

export interface QuestionEvaluation {
  questionId: string;
  questionPrompt: string;
  maxMarks: number;
  modelAnswer: string;
  studentAnswer: string;
  awardedMarks: number;
  aiConfidence: number; // 0.0 - 1.0
  reasoning: string;
  feedback: string;
  status: 'AI_GRADED' | 'MANUALLY_OVERRIDDEN' | 'PENDING';
}

export interface StudentDescriptiveSubmission {
  id: string;
  studentRoll: string;
  studentName: string;
  courseCode: string;
  examTitle: string;
  submittedAt: string;
  totalMarks: number;
  scoredMarks: number;
  evaluationStatus: 'PENDING' | 'EVALUATED' | 'PUBLISHED';
  questions: QuestionEvaluation[];
}
