import { Request, Response } from 'express';
import { StudentService } from './student.service';
import {
  BulkImportStudentSchema,
  CreateStudentSchema,
  StudentQuerySchema,
  UpdateStudentSchema,
} from './student.types';

export class StudentController {
  constructor(private readonly service: StudentService) {}

  private handlePostgresError(error: any, res: Response): boolean {
    // 23505 = PostgreSQL unique_violation code
    if (error?.code === '23505') {
      const detail = error.detail || 'Unique constraint conflict';
      res.status(409).json({
        error: 'Conflict',
        message: 'A student with this roll number or email already exists.',
        detail,
      });
      return true;
    }
    return false;
  }

  register = async (req: Request, res: Response) => {
    try {
      const parsed = CreateStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Student input data validation failed',
          issues: parsed.error.issues,
        });
      }

      const result = await this.service.registerStudent(parsed.data);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (this.handlePostgresError(err, res)) return;
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to register student',
      });
    }
  };

  bulkImport = async (req: Request, res: Response) => {
    try {
      const parsed = BulkImportStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Bulk import validation failed',
          issues: parsed.error.issues,
        });
      }

      const results = await this.service.importBulk(parsed.data.students);
      return res.status(201).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (err: any) {
      if (this.handlePostgresError(err, res)) return;
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to perform bulk import',
      });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const parsed = StudentQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid Query Parameters',
          issues: parsed.error.issues,
        });
      }

      const data = await this.service.getStudents(parsed.data);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to list students',
      });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      const history = await this.service.getStudentHistory(id);
      if (!history) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Student with ID ${id} not found`,
        });
      }
      return res.status(200).json(history);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to fetch student history',
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      const parsed = UpdateStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation Error',
          issues: parsed.error.issues,
        });
      }

      const updated = await this.service.updateStudent(id, parsed.data);
      if (!updated) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Student with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      if (this.handlePostgresError(err, res)) return;
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to update student',
      });
    }
  };
}
