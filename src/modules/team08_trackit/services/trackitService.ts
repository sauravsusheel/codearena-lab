// Team 08 (TrackIt) Resilient Service Layer
// Milestone tracking, guide rubrics, internship logbook verification, and CircuitBreaker protection.

import { CircuitBreaker } from '../../../core/resilience/CircuitBreaker';
import { IsolatedStorage } from '../../../core/resilience/IsolatedStorage';
import { CapstoneProject, InternshipRecord } from '../types/trackit.types';

const storage = new IsolatedStorage('team08_trackit');

const INITIAL_PROJECTS: CapstoneProject[] = [
  {
    id: 'proj_1',
    title: 'UniSphere: Enterprise Unified Academic Portal & Autonomous Campus Ecosystem',
    category: 'MCA Major Project',
    leadStudentRoll: '24MCA003',
    leadStudentName: 'Arjun Kumar',
    teamMembers: ['Aarav Sharma (24MCA001)', 'Ananya Rao (24MCA002)', 'Bhavna Patel (24MCA004)'],
    facultyGuideId: 'usr_fac_01',
    facultyGuideName: 'Deepak B (Assistant Professor & Project Lead)',
    stage: 'IN_PROGRESS',
    gitRepositoryUrl: 'https://unihub.chanakya.edu/chanakya-edu/unisphere-monorepo',
    milestones: [
      {
        id: 'm1',
        name: 'Project Synopsis & Architectural Feasibility',
        code: 'M1',
        description: 'Problem definition, literature review, and 8-module decoupled architecture design.',
        dueDate: '2026-07-30',
        status: 'COMPLETED',
        score: 9.5,
        maxScore: 10,
        feedback: 'Excellent fault-isolation architecture using React Error Boundaries and Circuit Breakers.',
        guideApproved: true
      },
      {
        id: 'm2',
        name: 'SRS, ER Strategy & API Specifications',
        code: 'M2',
        description: 'Normalized PostgreSQL schema, REST contracts, and JWT RBAC flow definition.',
        dueDate: '2026-08-20',
        status: 'COMPLETED',
        score: 9.0,
        maxScore: 10,
        feedback: 'Comprehensive DDL specifications with pgvector index integration.',
        guideApproved: true
      },
      {
        id: 'm3',
        name: 'Core System Prototype & Multi-Team Integration',
        code: 'M3',
        description: 'Functional independent team folders and live resilience demonstration.',
        dueDate: '2026-09-15',
        status: 'IN_PROGRESS',
        maxScore: 10,
        feedback: 'Integration in progress; verify zero-cascading failure behavior across all modules.',
        guideApproved: false
      },
      {
        id: 'm4',
        name: 'Final Capstone Viva Defense & IEEE Manuscript',
        code: 'M4',
        description: 'Complete system deployment, proctored presentation defense, and paper archival.',
        dueDate: '2026-10-10',
        status: 'SCHEDULED',
        maxScore: 20,
        guideApproved: false
      }
    ]
  }
];

const INITIAL_INTERNSHIPS: InternshipRecord[] = [
  {
    id: 'int_1',
    studentRoll: '24MCA003',
    studentName: 'Arjun Kumar',
    companyName: 'Infosys Limited, Bengaluru DC',
    location: 'Electronics City, Bengaluru',
    role: 'Cloud Engineering & AI Systems Intern',
    stipendPerMonth: 25000,
    durationMonths: 6,
    status: 'OFFER_VERIFIED',
    weeklyLogsApproved: 8,
    totalRequiredLogs: 16
  },
  {
    id: 'int_2',
    studentRoll: '24MCA001',
    studentName: 'Aarav Sharma',
    companyName: 'Wipro Technologies',
    location: 'Sarjapur Campus, Bengaluru',
    role: 'Full-Stack Developer Intern',
    stipendPerMonth: 22000,
    durationMonths: 6,
    status: 'LOGS_SUBMITTED',
    weeklyLogsApproved: 7,
    totalRequiredLogs: 16
  }
];

export class TrackItService {
  private projectBreaker = new CircuitBreaker<CapstoneProject[]>({
    moduleId: 'trackit',
    operationName: 'fetchCapstoneProjects',
    fallbackSupplier: () => storage.getItem('projects', INITIAL_PROJECTS)
  });

  public async getProjects(): Promise<CapstoneProject[]> {
    return this.projectBreaker.execute(async () => {
      return storage.getItem('projects', INITIAL_PROJECTS);
    });
  }

  public async getInternships(): Promise<InternshipRecord[]> {
    return storage.getItem('internships', INITIAL_INTERNSHIPS);
  }
}

export const trackitService = new TrackItService();
