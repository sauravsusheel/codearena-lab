import { z } from 'zod';

const COLLEGE_DOMAIN = process.env.ALLOWED_COLLEGE_EMAIL_DOMAIN || 'college.edu';

export const RollNoSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{2,8}-[0-9]{3,6}$/, {
    message: 'Roll number must match pattern like CS2026-042 or EC2025-101',
  });

export const CollegeEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .refine(
    (email) => email.endsWith(`@${COLLEGE_DOMAIN}`) || email.endsWith('.edu'),
    { message: `Email must belong to authorized institution domain (*.${COLLEGE_DOMAIN} or *.edu)` }
  );

export const CreateStudentSchema = z.object({
  roll_no: RollNoSchema,
  first_name: z.string().trim().min(1, 'First name is required').max(64),
  last_name: z.string().trim().min(1, 'Last name is required').max(64),
  email: CollegeEmailSchema,
  department: z.string().trim().min(2, 'Department is required').max(64),
  semester: z.number().int().min(1).max(12),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format must be YYYY-YYYY (e.g. 2025-2026)'),
});

export const BulkImportStudentSchema = z.object({
  students: z.array(CreateStudentSchema).min(1, 'Payload must contain at least 1 student').max(1000),
});

export const UpdateStudentSchema = CreateStudentSchema.partial().omit({ roll_no: true });

export const StudentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  department: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  station_id: z.string().trim().optional(),
});

export type CreateStudentDto = z.infer<typeof CreateStudentSchema>;
export type BulkImportStudentDto = z.infer<typeof BulkImportStudentSchema>;
export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>;
export type StudentQueryDto = z.infer<typeof StudentQuerySchema>;

export interface StudentRecord {
  student_id: string;
  roll_no: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  semester: number;
  academic_year: string;
  is_active: boolean;
  current_station_id?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface SubmissionHistorySummary {
  metrics: {
    total_submissions: number;
    total_accepted: number;
    pass_rate_percentage: number;
    avg_runtime_ms: number;
    avg_memory_kb: number;
  };
  recent_submissions: Array<{
    submission_id: string;
    problem_id: string;
    problem_title: string;
    language_id: string;
    verdict: string;
    execution_time_ms: number;
    memory_used_kb: number;
    score: number;
    created_at: Date | string;
  }>;
}
