import { StudentRepository } from './student.repository';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './student.types';

export class StudentService {
  constructor(private readonly repo: StudentRepository) {}

  async registerStudent(dto: CreateStudentDto) {
    return this.repo.create(dto);
  }

  async importBulk(dtos: CreateStudentDto[]) {
    return this.repo.createBulk(dtos);
  }

  async getStudents(query: StudentQueryDto) {
    const result = await this.repo.findPaginated(query);
    return {
      pagination: {
        page: query.page,
        limit: query.limit,
        total_records: result.total,
        total_pages: Math.ceil(result.total / query.limit),
      },
      students: result.data,
    };
  }

  async getStudentHistory(studentId: string) {
    const student = await this.repo.findById(studentId);
    if (!student) return null;
    const history = await this.repo.getRecentSubmissionHistory(studentId, 20);
    return {
      profile: student,
      ...history,
    };
  }

  async updateStudent(studentId: string, dto: UpdateStudentDto) {
    return this.repo.update(studentId, dto);
  }

  async removeStudent(studentId: string) {
    return this.repo.softDelete(studentId);
  }
}
