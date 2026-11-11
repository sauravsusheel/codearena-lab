import { Pool, PoolClient } from 'pg';
import {
  CreateStudentDto,
  StudentQueryDto,
  StudentRecord,
  SubmissionHistorySummary,
  UpdateStudentDto,
} from './student.types';

export class StudentRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: CreateStudentDto): Promise<StudentRecord> {
    const query = `
      INSERT INTO students (
        roll_no, first_name, last_name, email, department, semester, academic_year
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        student_id, roll_no, first_name, last_name, email, 
        department, semester, academic_year, is_active, created_at, updated_at;
    `;
    const params = [
      data.roll_no.toUpperCase(),
      data.first_name,
      data.last_name,
      data.email,
      data.department,
      data.semester,
      data.academic_year,
    ];

    const { rows } = await this.pool.query<StudentRecord>(query, params);
    return rows[0];
  }

  async createBulk(students: CreateStudentDto[]): Promise<StudentRecord[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const inserted: StudentRecord[] = [];

      const insertSql = `
        INSERT INTO students (
          roll_no, first_name, last_name, email, department, semester, academic_year
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          student_id, roll_no, first_name, last_name, email, 
          department, semester, academic_year, is_active, created_at, updated_at;
      `;

      for (const item of students) {
        const params = [
          item.roll_no.toUpperCase(),
          item.first_name,
          item.last_name,
          item.email,
          item.department,
          item.semester,
          item.academic_year,
        ];
        const res = await client.query<StudentRecord>(insertSql, params);
        inserted.push(res.rows[0]);
      }

      await client.query('COMMIT');
      return inserted;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findPaginated(filters: StudentQueryDto): Promise<{ total: number; data: StudentRecord[] }> {
    const conditions: string[] = ['s.deleted_at IS NULL'];
    const values: (string | number)[] = [];
    let idx = 1;

    if (filters.department) {
      conditions.push(`s.department = $${idx++}`);
      values.push(filters.department);
    }
    if (filters.semester) {
      conditions.push(`s.semester = $${idx++}`);
      values.push(filters.semester);
    }
    if (filters.station_id) {
      conditions.push(`ls.station_id = $${idx++} AND ls.logout_at IS NULL`);
      values.push(filters.station_id);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countQuery = `
      SELECT COUNT(DISTINCT s.student_id)::int AS count
      FROM students s
      LEFT JOIN lab_sessions ls ON s.student_id = ls.student_id AND ls.logout_at IS NULL
      ${whereClause};
    `;

    const countRes = await this.pool.query(countQuery, values);
    const total = countRes.rows[0]?.count || 0;

    const offset = (filters.page - 1) * filters.limit;
    values.push(filters.limit, offset);

    const listQuery = `
      SELECT 
        s.student_id, s.roll_no, s.first_name, s.last_name, s.email, 
        s.department, s.semester, s.academic_year, s.is_active,
        ls.station_id AS current_station_id,
        s.created_at, s.updated_at
      FROM students s
      LEFT JOIN lab_sessions ls ON s.student_id = ls.student_id AND ls.logout_at IS NULL
      ${whereClause}
      ORDER BY s.roll_no ASC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    const { rows } = await this.pool.query<StudentRecord>(listQuery, values);
    return { total, data: rows };
  }

  async findById(studentId: string): Promise<StudentRecord | null> {
    const query = `
      SELECT s.*, ls.station_id AS current_station_id
      FROM students s
      LEFT JOIN lab_sessions ls ON s.student_id = ls.student_id AND ls.logout_at IS NULL
      WHERE s.student_id = $1 AND s.deleted_at IS NULL;
    `;
    const { rows } = await this.pool.query<StudentRecord>(query, [studentId]);
    return rows[0] || null;
  }

  async getRecentSubmissionHistory(studentId: string, limit = 20): Promise<SubmissionHistorySummary> {
    const statsQuery = `
      SELECT 
        COUNT(*)::int AS total_submissions,
        COUNT(*) FILTER (WHERE verdict = 'ACCEPTED')::int AS total_accepted,
        ROUND(COALESCE(AVG(execution_time_ms), 0)::numeric, 2) AS avg_runtime_ms,
        ROUND(COALESCE(AVG(memory_used_kb), 0)::numeric, 2) AS avg_memory_kb
      FROM submissions
      WHERE student_id = $1 AND deleted_at IS NULL;
    `;

    const submissionsQuery = `
      SELECT 
        sub.submission_id, sub.problem_id, p.title AS problem_title,
        sub.language_id, sub.verdict, sub.execution_time_ms, sub.memory_used_kb,
        sub.score, sub.created_at
      FROM submissions sub
      JOIN problems p ON sub.problem_id = p.problem_id
      WHERE sub.student_id = $1 AND sub.deleted_at IS NULL
      ORDER BY sub.created_at DESC
      LIMIT $2;
    `;

    const [statsResult, subResult] = await Promise.all([
      this.pool.query(statsQuery, [studentId]),
      this.pool.query(submissionsQuery, [studentId, limit]),
    ]);

    const stats = statsResult.rows[0] || {
      total_submissions: 0,
      total_accepted: 0,
      avg_runtime_ms: 0,
      avg_memory_kb: 0,
    };

    const passRate = stats.total_submissions > 0
      ? Number(((stats.total_accepted / stats.total_submissions) * 100).toFixed(2))
      : 0;

    return {
      metrics: {
        total_submissions: stats.total_submissions,
        total_accepted: stats.total_accepted,
        pass_rate_percentage: passRate,
        avg_runtime_ms: Number(stats.avg_runtime_ms || 0),
        avg_memory_kb: Number(stats.avg_memory_kb || 0),
      },
      recent_submissions: subResult.rows,
    };
  }

  async update(studentId: string, data: UpdateStudentDto): Promise<StudentRecord | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) return this.findById(studentId);

    values.push(studentId);
    const query = `
      UPDATE students
      SET ${fields.join(', ')}
      WHERE student_id = $${idx} AND deleted_at IS NULL
      RETURNING 
        student_id, roll_no, first_name, last_name, email, 
        department, semester, academic_year, is_active, created_at, updated_at;
    `;

    const { rows } = await this.pool.query<StudentRecord>(query, values);
    return rows[0] || null;
  }

  async softDelete(studentId: string): Promise<boolean> {
    const query = `
      UPDATE students
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE student_id = $1 AND deleted_at IS NULL;
    `;
    const res = await this.pool.query(query, [studentId]);
    return (res.rowCount ?? 0) > 0;
  }
}
