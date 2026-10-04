// Team 04 (EduCode Judge) Domain Types
// Aligned with PostgreSQL 16 schema: judge_problems, judge_submissions, judge_test_cases, judge_plagiarism_audits

export type SupportedLanguage = 'python' | 'java' | 'c' | 'cpp' | 'csharp' | 'javascript' | 'typescript' | 'html' | 'css' | 'sql' | 'php' | 'go' | 'rust' | 'kotlin' | 'swift' | 'dart' | 'ruby' | 'r' | 'bash' | 'lua';
export type JudgeVerdict = 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';

export interface CurriculumSubject {
  id: string;
  code: string;
  name: string;
  school: string;
  primaryLanguage: SupportedLanguage;
  facultyName: string;
  description: string;
  requiresCoding: boolean;
}

export interface TestCaseDefinition {
  id: string;
  testCaseNumber: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodeProblem {
  id: string;
  subjectId: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  statement: string;
  sampleInput: string;
  sampleOutput: string;
  starterCodes: Partial<Record<SupportedLanguage, string>>;
  testCases?: TestCaseDefinition[];
}

export interface TestCaseResult {
  id: string;
  testCaseNumber: number;
  verdict: JudgeVerdict;
  executionTimeMs: number;
  memoryKb: number;
  passed: boolean;
  isHidden: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  errorMessage?: string;
}

export interface PlagiarismComparison {
  studentA: string;
  studentB: string;
  structuralSimilarityPercentage: number;
  winnowingHashMatchCount: number;
  flaggedLogicClones: string[];
}

export interface StudentCodingStation {
  stationId: string; // e.g. "Station #01"
  stationNumber: number;
  ipAddress: string;
  studentUsn: string;
  studentName: string;
  school: string;
  subjectCode: string;
  language: SupportedLanguage;
  status: 'ACTIVE' | 'RUNNING' | 'IDLE' | 'OFFLINE';
  currentProblemTitle: string;
  sessionMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  lastActiveTime: string;
}

export interface StudentLabTimeRecord {
  usn: string;
  name: string;
  school: string;
  subjectCode: string;
  subjectName: string;
  totalHoursSpent: number;
  weeklyHours: number;
  activeRatioPercent: number;
  submissionsCount: number;
  accuracyRatePercent: number;
  assignedStation: string;
  lastActive: string;
  status: 'ONLINE' | 'AWAY' | 'COMPLETED';
}

