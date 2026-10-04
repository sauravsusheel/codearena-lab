// Team 08 (TrackIt) Domain Types
// Aligned with PostgreSQL 16 schema: track_projects, track_milestones, track_rubric_scores, track_internships

export interface MilestoneCheckpoint {
  id: string;
  name: string;
  code: 'M1' | 'M2' | 'M3' | 'M4';
  description: string;
  dueDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  score?: number;
  maxScore: number;
  feedback?: string;
  guideApproved: boolean;
}

export interface CapstoneProject {
  id: string;
  title: string;
  category: 'MCA Major Project' | 'B.Tech Capstone' | 'M.Tech Thesis';
  leadStudentRoll: string;
  leadStudentName: string;
  teamMembers: string[];
  facultyGuideId: string;
  facultyGuideName: string;
  stage: 'PROPOSED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
  milestones: MilestoneCheckpoint[];
  gitRepositoryUrl: string;
}

export interface InternshipRecord {
  id: string;
  studentRoll: string;
  studentName: string;
  companyName: string;
  location: string;
  role: string;
  stipendPerMonth: number;
  durationMonths: number;
  status: 'OFFER_VERIFIED' | 'LOGS_SUBMITTED' | 'FINAL_EVALUATION';
  weeklyLogsApproved: number;
  totalRequiredLogs: number;
}
