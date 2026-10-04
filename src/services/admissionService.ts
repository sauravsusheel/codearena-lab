// Chanakya University Central Admissions & Student Enrolment Service
// Manages UG & PG applicant pipeline, entrance scores, document audits, and provisional offer letters

import { dbStorageService } from './dbStorageService';

export type AdmissionLevel = 'UG' | 'PG';
export type AdmissionStatus = 'SUBMITTED' | 'DOCS_VERIFIED' | 'INTERVIEW_SCHEDULED' | 'OFFER_ISSUED' | 'REJECTED';

export interface AdmissionApplication {
  id: string; // e.g. CU-2026-UG-8421
  level: AdmissionLevel;
  school: string;
  program: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'General' | 'OBC' | 'SC/ST' | 'EWS' | 'International';
  previousEducation: string;
  percentageCgpa: number;
  entranceExam: string;
  sop: string;
  documentNames: string[];
  status: AdmissionStatus;
  interviewDate?: string;
  scholarshipAwarded?: string;
  offerLetterIssuedAt?: string;
  submittedAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'chanakya_admission_applications_v1';

const INITIAL_APPLICATIONS: AdmissionApplication[] = [
  {
    id: 'CU-2026-PG-1042',
    level: 'PG',
    school: 'School of Engineering',
    program: 'Master of Computer Applications (MCA - Cloud & AI)',
    fullName: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@gmail.com',
    phone: '+91 98450 12345',
    dob: '2002-05-14',
    gender: 'Male',
    category: 'General',
    previousEducation: 'B.Sc Computer Science (Bangalore University)',
    percentageCgpa: 84.5,
    entranceExam: 'Karnataka PGCET 2026 (Rank: 420)',
    sop: 'Passionate about distributed system reliability, cloud architecture, and kernel hacking. Aspiring to contribute to open-source autonomous academic tools.',
    documentNames: ['degree_marksheet_sem6.pdf', 'pgcet_rank_card.pdf', 'sop_statement.pdf'],
    status: 'OFFER_ISSUED',
    interviewDate: '2026-08-25',
    scholarshipAwarded: 'Chanakya Merit Fellowship (25% Tuition Concession)',
    offerLetterIssuedAt: '2026-08-28',
    submittedAt: '2026-08-20 10:30 AM',
    updatedAt: '2026-08-28 04:15 PM'
  },
  {
    id: 'CU-2026-UG-2189',
    level: 'UG',
    school: 'School of Engineering',
    program: 'B.Tech in Artificial Intelligence & Data Science',
    fullName: 'Ananya S. Murthy',
    email: 'ananya.murthy@outlook.com',
    phone: '+91 94480 87654',
    dob: '2008-01-22',
    gender: 'Female',
    category: 'General',
    previousEducation: '12th Standard / CBSE (Physics, Chem, Math, CS)',
    percentageCgpa: 92.4,
    entranceExam: 'JEE Main 2026 (96.4 Percentile) / CUET 2026',
    sop: 'Focused on deep learning models for biomedical diagnostics and generative voice agents. Chanakya University’s interdisciplinary curriculum is my dream.',
    documentNames: ['cbse_12th_marksheet.pdf', 'jee_scorecard.pdf', 'aadhar_proof.pdf'],
    status: 'INTERVIEW_SCHEDULED',
    interviewDate: '2026-09-08 11:00 AM (Online Panel A)',
    submittedAt: '2026-08-30 02:15 PM',
    updatedAt: '2026-09-02 10:00 AM'
  },
  {
    id: 'CU-2026-PG-3051',
    level: 'PG',
    school: 'School of Management Sciences',
    program: 'Master of Business Administration (MBA - FinTech & Analytics)',
    fullName: 'Karthik Ramanathan',
    email: 'karthik.r@yahoo.com',
    phone: '+91 97310 99887',
    dob: '2001-11-03',
    gender: 'Male',
    category: 'OBC',
    previousEducation: 'B.Com (Honours) - Christ University',
    percentageCgpa: 78.2,
    entranceExam: 'CAT 2025 (88.5 Percentile)',
    sop: 'Worked for 14 months as junior equity research analyst. Seeking structured MBA with computational fintech specialization.',
    documentNames: ['bcom_provisional.pdf', 'cat_score_slip.pdf', 'work_experience_letter.pdf'],
    status: 'DOCS_VERIFIED',
    submittedAt: '2026-09-01 09:45 AM',
    updatedAt: '2026-09-03 01:20 PM'
  },
  {
    id: 'CU-2026-UG-4102',
    level: 'UG',
    school: 'School of Law, Governance & Public Policy',
    program: 'B.A. LL.B. (Honours)',
    fullName: 'Pooja Srinivas',
    email: 'pooja.srinivas@gmail.com',
    phone: '+91 99001 54321',
    dob: '2007-09-18',
    gender: 'Female',
    category: 'General',
    previousEducation: '12th Karnataka Pre-University (Humanities)',
    percentageCgpa: 89.0,
    entranceExam: 'CLAT 2026 (AIR 3420)',
    sop: 'Keen on constitutional law, space jurisprudence, and cyber privacy regulatory frameworks in India.',
    documentNames: ['puc_statement_of_marks.pdf', 'clat_rank_card.pdf'],
    status: 'SUBMITTED',
    submittedAt: '2026-09-05 06:10 PM',
    updatedAt: '2026-09-05 06:10 PM'
  }
];

class AdmissionService {
  private getStored(): AdmissionApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.save(INITIAL_APPLICATIONS);
    return INITIAL_APPLICATIONS;
  }

  private save(apps: AdmissionApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save admission applications', e);
    }
  }

  public getApplications(): AdmissionApplication[] {
    return this.getStored();
  }

  public getApplicationById(id: string): AdmissionApplication | undefined {
    return this.getStored().find(a => a.id.toLowerCase() === id.toLowerCase());
  }

  public submitApplication(appData: Omit<AdmissionApplication, 'id' | 'status' | 'submittedAt' | 'updatedAt'>): AdmissionApplication {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newApp: AdmissionApplication = {
      ...appData,
      id: `CU-2026-${appData.level}-${randomCode}`,
      status: 'SUBMITTED',
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    const list = [newApp, ...this.getStored()];
    this.save(list);

    // Sync to Cloud Storage / Firestore when configured
    dbStorageService.saveRecord('admissions', newApp.id, newApp);

    // Notify window
    window.dispatchEvent(new CustomEvent('chanakya_admission_new_application', { detail: newApp }));
    return newApp;
  }

  public updateStatus(
    id: string, 
    status: AdmissionStatus, 
    extraData?: Partial<Pick<AdmissionApplication, 'interviewDate' | 'scholarshipAwarded' | 'offerLetterIssuedAt'>>
  ): { success: boolean; application?: AdmissionApplication } {
    const list = this.getStored();
    const index = list.findIndex(a => a.id === id);
    if (index === -1) return { success: false };

    const updated: AdmissionApplication = {
      ...list[index],
      ...extraData,
      status,
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    list[index] = updated;
    this.save(list);

    // Sync status change to Cloud Storage / Firestore
    dbStorageService.saveRecord('admissions', updated.id, updated);

    return { success: true, application: updated };
  }
}

export const admissionService = new AdmissionService();
