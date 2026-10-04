import { CurriculumSubject, CodeProblem, SupportedLanguage, StudentCodingStation, StudentLabTimeRecord, TestCaseResult, PlagiarismComparison } from '../types/codearena.types';
import { codeArenaApi } from './codeArenaApi';

/**
 * Database-backed CodeArena service facade.
 *
 * This class intentionally contains no local/demo dataset. All authoritative
 * subjects, problems, stations, submissions, plagiarism records and telemetry
 * are persisted and retrieved through the CodeArena API/database layer.
 */
export class JudgeService {
  public async getSubjects(): Promise<CurriculumSubject[]> {
    return codeArenaApi.subjects();
  }

  public async getProblems(subjectId?: string): Promise<CodeProblem[]> {
    return codeArenaApi.problems(subjectId);
  }

  public async getCodingStations(): Promise<StudentCodingStation[]> {
    return codeArenaApi.stations();
  }

  public async getStudentTimeRecords(subjectCode?: string): Promise<StudentLabTimeRecord[]> {
    return codeArenaApi.timeRecords(subjectCode || 'ALL');
  }

  public async evaluateCode(problemId: string, language: SupportedLanguage, code: string): Promise<TestCaseResult[]> {
    const result = await codeArenaApi.evaluate(problemId, language, code);
    return result.results;
  }

  public async submitCode(problemId: string, language: SupportedLanguage, code: string) {
    return codeArenaApi.submit(problemId, language, code);
  }

  public async getPlagiarismAudits(): Promise<PlagiarismComparison[]> {
    return codeArenaApi.plagiarism();
  }

  public async auditPlagiarism(problemId?: string): Promise<PlagiarismComparison[]> {
    return codeArenaApi.auditPlagiarism(problemId);
  }

  public async logStudentCodingTime(_usn: string, subjectCode: string, additionalMinutes: number): Promise<void> {
    await codeArenaApi.logTime({ subjectCode, minutes: additionalMinutes });
  }
}

export const judgeService = new JudgeService();
