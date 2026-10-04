import { CurriculumSubject, CodeProblem, SupportedLanguage, StudentCodingStation, StudentLabTimeRecord, TestCaseResult } from '../types/codearena.types';

const API = (import.meta as any).env?.VITE_CODEARENA_API_URL || '/api-proxy';
const TOKEN_KEY = 'codearena_access_token';

const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeStation = (row: any = {}): StudentCodingStation => {
  const stationId = row.stationId ?? row.station_id ?? row.id ?? `PC-${row.station_number ?? row.stationNumber ?? 0}`;
  const studentName = row.studentName ?? row.student_name ?? '';
  const studentUsn = row.studentUsn ?? row.student_usn ?? '';
  const subjectCode = row.subjectCode ?? row.subject_code ?? '';

  return {
    ...row,
    stationId,
    stationNumber: toNumber(row.stationNumber ?? row.station_number, 0),
    ipAddress: row.ipAddress ?? row.ip_address ?? '',
    studentUsn,
    studentName,
    school: row.school ?? '',
    subjectCode,
    language: row.language ?? 'python',
    status: row.status === 'RUNNING_SANDBOX' ? 'RUNNING' : row.status === 'OPERATIONAL' ? 'ACTIVE' : (row.status ?? 'IDLE'),
    currentProblemTitle: row.currentProblemTitle ?? row.current_problem_title ?? '',
    sessionMinutes: toNumber(row.sessionMinutes ?? row.session_minutes, 0),
    activeMinutes: toNumber(row.activeMinutes ?? row.active_minutes, 0),
    idleMinutes: toNumber(row.idleMinutes ?? row.idle_minutes, 0),
    totalSubmissions: toNumber(row.totalSubmissions ?? row.total_submissions, 0),
    acceptedSubmissions: toNumber(row.acceptedSubmissions ?? row.accepted_submissions, 0),
    lastActiveTime: row.lastActiveTime ?? row.last_heartbeat ?? row.last_active ?? '',
  };
};

const normalizeTimeRecord = (row: any = {}): StudentLabTimeRecord => ({
  usn: row.usn ?? '',
  name: row.name ?? row.studentName ?? row.student_name ?? '',
  school: row.school ?? '',
  subjectCode: row.subjectCode ?? row.subject_code ?? '',
  subjectName: row.subjectName ?? row.subject_name ?? '',
  totalHoursSpent: toNumber(row.totalHoursSpent ?? row.total_hours, 0),
  weeklyHours: toNumber(row.weeklyHours ?? row.weekly_hours, 0),
  activeRatioPercent: toNumber(row.activeRatioPercent ?? row.active_ratio, 0),
  submissionsCount: toNumber(row.submissionsCount ?? row.submissions, 0),
  accuracyRatePercent: toNumber(row.accuracyRatePercent ?? row.accuracy, 0),
  assignedStation: row.assignedStation ?? row.assigned_station ?? '',
  lastActive: row.lastActive ?? row.last_active ?? '',
  status: row.status ?? 'ONLINE',
});

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const user = (() => { try { return JSON.parse(localStorage.getItem('unisphere_user_profile') || '{}'); } catch { return {}; } })();
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('unisphere_access_token') || localStorage.getItem('unisphere_sso_token');
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string,string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  else if ((import.meta as any).env?.VITE_CODEARENA_REQUIRE_AUTH !== '1' && user.id) {
    // Development/header-auth bridge: the identity must come from the active
    // UniSphere session; there is no fabricated demo identity fallback.
    headers['X-User-Id'] = user.id;
    headers['X-User-Role'] = user.role || 'STUDENT';
    headers['X-User-Name'] = user.name || user.id;
    headers['X-User-USN'] = user.usn || user.employeeId || user.id;
  }
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (!response.ok) throw new Error((await response.json().catch(() => ({})))?.error || `CodeArena API ${response.status}`);
  return response.json();
}

export const codeArenaApi = {
  health: () => request<{ok:boolean}>('/api/health'),
  login: async (usn:string,password:string) => { const result = await request<any>('/api/auth/login',{method:'POST',body:JSON.stringify({usn,password})}); localStorage.setItem(TOKEN_KEY,result.token); return result; },
  logout: () => localStorage.removeItem(TOKEN_KEY),
  subjects: () => request<CurriculumSubject[]>('/api/codearena/subjects'),
  problems: (subjectId?: string) => request<CodeProblem[]>(`/api/codearena/problems${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ''}`),
  evaluate: (problemId: string, language: SupportedLanguage, sourceCode: string) => request<{results: TestCaseResult[]; quality:any}>('/api/codearena/evaluate',{method:'POST',body:JSON.stringify({problemId,language,sourceCode})}),
  run: (language: SupportedLanguage, sourceCode: string, customInput: string) => request<any>('/api/codearena/run',{method:'POST',body:JSON.stringify({language,sourceCode,customInput})}),
  submit: (problemId: string, language: SupportedLanguage, sourceCode: string) => request<any>('/api/codearena/submit',{method:'POST',body:JSON.stringify({problemId,language,sourceCode})}),
  drafts: (params: {semester:string;subjectCode:string;problemId?:string;language:string}) => request<any>(`/api/codearena/drafts?semester=${encodeURIComponent(params.semester)}&subjectCode=${encodeURIComponent(params.subjectCode)}&problemId=${encodeURIComponent(params.problemId || '')}&language=${encodeURIComponent(params.language)}`),
  saveDraft: (data: any) => request<any>('/api/codearena/drafts',{method:'POST',body:JSON.stringify(data)}),
  stations: async () => {
    const rows = await request<any[]>('/api/codearena/stations');
    return rows.map(normalizeStation);
  },
  heartbeat: (stationId:string,data:any) => request<any>(`/api/codearena/stations/${encodeURIComponent(stationId)}/heartbeat`,{method:'POST',body:JSON.stringify(data)}),
  reboot: (stationId:string) => request<any>(`/api/codearena/stations/${encodeURIComponent(stationId)}/reboot`,{method:'POST'}),
  resetStations: () => request<any>('/api/codearena/stations/reset',{method:'POST'}),
  timeRecords: async (subjectCode='ALL') => {
    const rows = await request<any[]>(`/api/codearena/time-records?subjectCode=${encodeURIComponent(subjectCode)}`);
    return rows.map(normalizeTimeRecord);
  },
  logTime: (data:any) => request<any>('/api/codearena/time',{method:'POST',body:JSON.stringify(data)}),
  tickets: () => request<any[]>('/api/codearena/tickets'),
  createTicket: (data:any) => request<any>('/api/codearena/tickets',{method:'POST',body:JSON.stringify(data)}),
  resolveTicket: (id:string) => request<any>(`/api/codearena/tickets/${encodeURIComponent(id)}/resolve`,{method:'POST'}),
  plagiarism: () => request<any[]>('/api/codearena/plagiarism'),
  auditPlagiarism: (problemId?:string) => request<any[]>('/api/codearena/plagiarism-audit',{method:'POST',body:JSON.stringify({problemId})}),
  analytics: () => request<any>('/api/codearena/analytics'),
  learningInsights: () => request<any>('/api/codearena/learning-insights'),
  remedialAssignments: () => request<any[]>('/api/codearena/remedial'),
  completeRemedial: (id:string, minutes:number) => request<any>('/api/codearena/remedial/complete',{method:'POST',body:JSON.stringify({id,minutes})}),
  examEligibility: () => request<any[]>('/api/codearena/eligibility'),
  approveExamEligibility: (data:any) => request<any>('/api/codearena/eligibility/approve',{method:'POST',body:JSON.stringify(data)}),
  broadcasts: () => request<any[]>('/api/codearena/broadcasts'),
  createBroadcast: (data:any) => request<any>('/api/codearena/broadcasts',{method:'POST',body:JSON.stringify(data)}),
  notifications: () => request<any[]>('/api/codearena/notifications'),
  markNotificationRead: (id:string) => request<any>(`/api/codearena/notifications/${encodeURIComponent(id)}/read`,{method:'POST'}),
  exams: () => request<any[]>('/api/codearena/exams'),
  createExam: (data:any) => request<any>('/api/codearena/exams',{method:'POST',body:JSON.stringify(data)}),
  publishExam: (id:string) => request<any>(`/api/codearena/exams/${encodeURIComponent(id)}/publish`,{method:'POST'}),
  startExam: (id:string) => request<any>(`/api/codearena/exams/${encodeURIComponent(id)}/start`,{method:'POST'}),
  questionBank: () => request<any[]>('/api/codearena/question-bank'),
  createProblem: (data:any) => request<any>('/api/codearena/problems',{method:'POST',body:JSON.stringify(data)}),
  gradebook: () => request<any[]>('/api/codearena/gradebook'),
  overrideGrade: (id:string,marks:number) => request<any>('/api/codearena/gradebook/override',{method:'POST',body:JSON.stringify({id,marks})}),
  lockGrade: (id:string) => request<any>('/api/codearena/gradebook/lock',{method:'POST',body:JSON.stringify({id})}),
  draftVersions: () => request<any[]>('/api/codearena/draft-versions'),
  healthSummary: () => request<any>('/api/codearena/health/summary'),
  lmsBootstrap: () => request<any>('/api/lms/bootstrap'),
  lmsDashboard: () => request<any>('/api/lms/dashboard'),
  lmsTerms: () => request<any[]>('/api/lms/terms'),
  lmsCourses: (termId?: string) => request<any[]>(`/api/lms/courses${termId ? `?termId=${encodeURIComponent(termId)}` : ''}`),
  lmsSection: (sectionId: string) => request<any>(`/api/lms/sections/${encodeURIComponent(sectionId)}`),
  lmsEnroll: (sectionId: string, data: any = {}) => request<any>(`/api/lms/sections/${encodeURIComponent(sectionId)}/enroll`,{method:'POST',body:JSON.stringify(data)}),
  lmsAssignFaculty: (sectionId: string, data: any) => request<any>(`/api/lms/sections/${encodeURIComponent(sectionId)}/faculty`,{method:'POST',body:JSON.stringify(data)}),
  lmsAssignProblem: (sectionId: string, data: any) => request<any>(`/api/lms/sections/${encodeURIComponent(sectionId)}/problems`,{method:'POST',body:JSON.stringify(data)}),
  lmsProgress: (moduleId: string, completedMinutes: number) => request<any>(`/api/lms/modules/${encodeURIComponent(moduleId)}/progress`,{method:'POST',body:JSON.stringify({completedMinutes})}),
  streamUrl: async () => { const result = await request<{token:string}>('/api/codearena/stream-token',{method:'POST'}); return `${API}/api/codearena/stream?access_token=${encodeURIComponent(result.token)}`; },
  plagiarismReview: (id:string,status:string) => request<any>(`/api/codearena/plagiarism-reviews/${encodeURIComponent(id)}`,{method:'POST',body:JSON.stringify({status})}),
};
