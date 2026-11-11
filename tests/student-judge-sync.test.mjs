import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateStudentSchema,
  BulkImportStudentSchema,
  UpdateStudentSchema,
  StudentQuerySchema,
} from '../src/server/modules/students/student.types.ts';
import { StudentController } from '../src/server/modules/students/student.controller.ts';
import { SandboxExecutionResultSchema, JudgeResultConsumer } from '../src/server/workers/judge-result-consumer.ts';

// ----------------------------------------------------------------------------
// 1. Zod Schema & Validation Tests
// ----------------------------------------------------------------------------
test('Student Zod Validation: Valid student passes validation', () => {
  const valid = {
    roll_no: 'CS2026-042',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@college.edu',
    department: 'Computer Science',
    semester: 4,
    academic_year: '2025-2026',
  };

  const res = CreateStudentSchema.safeParse(valid);
  assert.equal(res.success, true);
});

test('Student Zod Validation: Rejects invalid roll number format', () => {
  const invalid = {
    roll_no: 'invalid_roll_123!!',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@college.edu',
    department: 'Computer Science',
    semester: 4,
    academic_year: '2025-2026',
  };

  const res = CreateStudentSchema.safeParse(invalid);
  assert.equal(res.success, false);
  assert.ok(res.error.issues.some((i) => i.path.includes('roll_no')));
});

test('Student Zod Validation: Rejects non-institutional email domains', () => {
  const invalid = {
    roll_no: 'CS2026-042',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@gmail.com', // Non-college domain
    department: 'Computer Science',
    semester: 4,
    academic_year: '2025-2026',
  };

  const res = CreateStudentSchema.safeParse(invalid);
  assert.equal(res.success, false);
  assert.ok(res.error.issues.some((i) => i.path.includes('email')));
});

test('Student Zod Validation: Bulk import enforces min/max constraints', () => {
  const emptyBatch = { students: [] };
  const resEmpty = BulkImportStudentSchema.safeParse(emptyBatch);
  assert.equal(resEmpty.success, false);

  const validBatch = {
    students: [
      {
        roll_no: 'CS2026-001',
        first_name: 'Diya',
        last_name: 'Patel',
        email: 'diya.patel@college.edu',
        department: 'CS',
        semester: 2,
        academic_year: '2025-2026',
      },
    ],
  };
  const resValid = BulkImportStudentSchema.safeParse(validBatch);
  assert.equal(resValid.success, true);
});

test('Student Query Schema: Applies default pagination parameters', () => {
  const parsed = StudentQuerySchema.parse({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
});

// ----------------------------------------------------------------------------
// 2. Controller PostgreSQL Error Handling (23505 -> 409 Conflict)
// ----------------------------------------------------------------------------
test('StudentController: Handles PostgreSQL 23505 unique conflict with HTTP 409', async () => {
  const mockService = {
    registerStudent: async () => {
      const err = new Error('duplicate key value violates unique constraint "uq_students_roll_no_active"');
      err.code = '23505';
      err.detail = 'Key (UPPER(roll_no))=(CS2026-042) already exists.';
      throw err;
    },
  };

  const controller = new StudentController(mockService);

  const req = {
    body: {
      roll_no: 'CS2026-042',
      first_name: 'Duplicate',
      last_name: 'Student',
      email: 'dup@college.edu',
      department: 'CSE',
      semester: 3,
      academic_year: '2025-2026',
    },
  };

  let statusCode = 0;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  await controller.register(req, res);

  assert.equal(statusCode, 409);
  assert.equal(jsonResponse.error, 'Conflict');
  assert.match(jsonResponse.message, /already exists/i);
});

// ----------------------------------------------------------------------------
// 3. Worker Execution Result & State Synchronization Schema
// ----------------------------------------------------------------------------
test('Judge Result Schema: Validates Docker sandbox execution result format', () => {
  const validResult = {
    submission_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    problem_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    language_id: 'python3',
    station_id: 'PC-04',
    source_code: 'print("Hello CodeArena")',
    verdict: 'ACCEPTED',
    execution_time_ms: 125,
    memory_used_kb: 45056,
    score: 100,
    compiler_output: null,
    retry_count: 0,
  };

  const res = SandboxExecutionResultSchema.safeParse(validResult);
  assert.equal(res.success, true);
});

test('Judge Result Schema: Rejects invalid verdict string', () => {
  const invalid = {
    submission_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    problem_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    language_id: 'python3',
    source_code: 'exit(1)',
    verdict: 'UNKNOWN_VERDICT',
    execution_time_ms: 50,
    memory_used_kb: 1024,
    score: 0,
  };

  const res = SandboxExecutionResultSchema.safeParse(invalid);
  assert.equal(res.success, false);
});

test('Judge Result Consumer: Corrupt message gets redirected to DLQ immediately', async () => {
  let dlqPushed = null;
  let processingRemoved = null;

  const mockRedis = {
    defineCommand: () => {},
    lrem: async (key, count, val) => {
      processingRemoved = { key, val };
    },
    rpush: async (key, val) => {
      dlqPushed = { key, val };
    },
  };

  const mockPool = { query: async () => {} };
  const consumer = new JudgeResultConsumer(mockRedis, mockPool);

  await consumer.processItem('{corrupt-json-not-valid');

  assert.ok(dlqPushed);
  assert.equal(dlqPushed.key, 'codearena:sandbox:results:dlq');
  const dlqData = JSON.parse(dlqPushed.val);
  assert.equal(dlqData.reason, 'MALFORMED_JSON');
  assert.ok(processingRemoved);
});
