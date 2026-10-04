import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'codearena.sqlite');
mkdirSync(DATA_DIR, { recursive: true });

const SQLITE_SCHEMA = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, code TEXT UNIQUE, name TEXT, school TEXT, primary_language TEXT, faculty_name TEXT, description TEXT, requires_coding INTEGER);
CREATE TABLE IF NOT EXISTS problems (id TEXT PRIMARY KEY, subject_id TEXT, title TEXT, difficulty TEXT, category TEXT, points INTEGER, time_limit_ms INTEGER, memory_limit_mb INTEGER, statement TEXT, sample_input TEXT, sample_output TEXT, starter_codes TEXT, version INTEGER DEFAULT 1, published INTEGER DEFAULT 1, created_by TEXT, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS test_cases (id TEXT PRIMARY KEY, problem_id TEXT, test_case_number INTEGER, input TEXT, expected_output TEXT, is_hidden INTEGER, weight INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, role TEXT, usn TEXT UNIQUE, password_hash TEXT, active INTEGER DEFAULT 1, created_at TEXT);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT, role TEXT, expires_at TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, user_id TEXT, semester TEXT, subject_code TEXT, problem_id TEXT, language TEXT, code TEXT, version INTEGER DEFAULT 1, updated_at TEXT, UNIQUE(user_id,semester,subject_code,problem_id,language));
CREATE TABLE IF NOT EXISTS draft_versions (id TEXT PRIMARY KEY, draft_id TEXT, version INTEGER, code TEXT, saved_at TEXT);
CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, user_id TEXT, problem_id TEXT, language TEXT, source_code TEXT, verdict TEXT, passed INTEGER, total INTEGER, runtime_ms INTEGER, memory_mb REAL, marks REAL, created_at TEXT, quality_json TEXT, exam_id TEXT, lms_section_id TEXT, plagiarism_score REAL DEFAULT 0, queue_status TEXT DEFAULT 'COMPLETED', queue_started_at TEXT);
CREATE TABLE IF NOT EXISTS stations (id TEXT PRIMARY KEY, station_number INTEGER UNIQUE, ip_address TEXT, row_name TEXT, os TEXT, cpu_cores INTEGER, ram_gb INTEGER, gpu_model TEXT, sandbox_runtime TEXT, status TEXT, cpu_usage_pct INTEGER, ram_usage_pct INTEGER, student_usn TEXT, student_name TEXT, subject_code TEXT, language TEXT, current_problem_title TEXT, session_minutes INTEGER, active_minutes INTEGER, idle_minutes INTEGER, total_submissions INTEGER, accepted_submissions INTEGER, last_heartbeat TEXT, incident_notes TEXT, agent_token TEXT, hardware_json TEXT);
CREATE TABLE IF NOT EXISTS time_records (usn TEXT, name TEXT, school TEXT, subject_code TEXT, subject_name TEXT, total_hours REAL, weekly_hours REAL, active_ratio REAL, submissions INTEGER, accuracy REAL, assigned_station TEXT, last_active TEXT, status TEXT, PRIMARY KEY(usn, subject_code));
CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, station_id TEXT, category TEXT, severity TEXT, description TEXT, reported_by TEXT, reported_at TEXT, status TEXT, assigned_to TEXT, resolved_at TEXT);
CREATE TABLE IF NOT EXISTS broadcasts (id TEXT PRIMARY KEY, message TEXT, severity TEXT, created_by TEXT, created_at TEXT, active INTEGER);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, user_id TEXT, action TEXT, entity_type TEXT, entity_id TEXT, details TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS exams (id TEXT PRIMARY KEY, title TEXT, subject_code TEXT, starts_at TEXT, ends_at TEXT, status TEXT, submission_limit INTEGER DEFAULT 5, auto_submit INTEGER DEFAULT 1, published INTEGER DEFAULT 0, created_by TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS exam_problems (exam_id TEXT, problem_id TEXT, position INTEGER, PRIMARY KEY(exam_id,problem_id));
CREATE TABLE IF NOT EXISTS exam_sessions (id TEXT PRIMARY KEY, exam_id TEXT, user_id TEXT, started_at TEXT, last_seen_at TEXT, submitted_at TEXT, locked INTEGER DEFAULT 0, UNIQUE(exam_id,user_id));
CREATE TABLE IF NOT EXISTS exam_submissions (exam_id TEXT, user_id TEXT, submission_id TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS question_versions (id TEXT PRIMARY KEY, problem_id TEXT, version INTEGER, snapshot_json TEXT, created_at TEXT, created_by TEXT);
CREATE TABLE IF NOT EXISTS gradebook (id TEXT PRIMARY KEY, user_id TEXT, subject_code TEXT, assessment_type TEXT, assessment_id TEXT, marks REAL, max_marks REAL, locked INTEGER DEFAULT 0, overridden INTEGER DEFAULT 0, updated_at TEXT, UNIQUE(user_id,subject_code,assessment_type,assessment_id));
CREATE TABLE IF NOT EXISTS plagiarism_reviews (id TEXT PRIMARY KEY, submission_id TEXT, compared_submission_id TEXT, similarity REAL, evidence_json TEXT, status TEXT DEFAULT 'PENDING', reviewed_by TEXT, reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, message TEXT, severity TEXT, read_at TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS learning_events (id TEXT PRIMARY KEY, user_id TEXT, subject_code TEXT, event_type TEXT, minutes INTEGER, metadata_json TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, window_start INTEGER, count INTEGER);
CREATE TABLE IF NOT EXISTS remedial_assignments (id TEXT PRIMARY KEY, user_id TEXT, subject_code TEXT, topic TEXT, required_minutes INTEGER DEFAULT 30, completed_minutes INTEGER DEFAULT 0, status TEXT DEFAULT 'REQUIRED', created_at TEXT, completed_at TEXT);
CREATE TABLE IF NOT EXISTS exam_eligibility (user_id TEXT, subject_code TEXT, eligible INTEGER DEFAULT 0, approved INTEGER DEFAULT 0, approved_by TEXT, approved_at TEXT, reason TEXT, updated_at TEXT, PRIMARY KEY(user_id,subject_code));
CREATE TABLE IF NOT EXISTS station_commands (id TEXT PRIMARY KEY, station_id TEXT, command TEXT, status TEXT DEFAULT 'QUEUED', created_at TEXT, acknowledged_at TEXT, result TEXT);
CREATE TABLE IF NOT EXISTS system_errors (id TEXT PRIMARY KEY, severity TEXT, source TEXT, message TEXT, stack TEXT, request_id TEXT, created_at TEXT, resolved INTEGER DEFAULT 0, resolved_by TEXT, resolved_at TEXT);
CREATE TABLE IF NOT EXISTS backups (id TEXT PRIMARY KEY, kind TEXT, location TEXT, size_bytes INTEGER, checksum TEXT, created_at TEXT, status TEXT);
CREATE TABLE IF NOT EXISTS academic_terms (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT DEFAULT 'PLANNED', created_at TEXT);
CREATE TABLE IF NOT EXISTS lms_courses (id TEXT PRIMARY KEY, course_code TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT, credits INTEGER DEFAULT 3, subject_id TEXT, department TEXT, active INTEGER DEFAULT 1, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS lms_sections (id TEXT PRIMARY KEY, course_id TEXT NOT NULL, term_id TEXT NOT NULL, section_code TEXT NOT NULL, room TEXT, schedule_json TEXT, capacity INTEGER DEFAULT 60, status TEXT DEFAULT 'ACTIVE', created_at TEXT, UNIQUE(course_id,term_id,section_code));
CREATE TABLE IF NOT EXISTS lms_enrollments (id TEXT PRIMARY KEY, section_id TEXT NOT NULL, user_id TEXT NOT NULL, enrollment_status TEXT DEFAULT 'ENROLLED', enrolled_at TEXT, completed_at TEXT, UNIQUE(section_id,user_id));
CREATE TABLE IF NOT EXISTS lms_faculty_assignments (id TEXT PRIMARY KEY, section_id TEXT NOT NULL, user_id TEXT NOT NULL, assignment_role TEXT DEFAULT 'FACULTY', assigned_at TEXT, active INTEGER DEFAULT 1, UNIQUE(section_id,user_id));
CREATE TABLE IF NOT EXISTS lms_course_problems (id TEXT PRIMARY KEY, section_id TEXT NOT NULL, problem_id TEXT NOT NULL, assessment_type TEXT DEFAULT 'PRACTICE', available_from TEXT, due_at TEXT, required INTEGER DEFAULT 0, max_attempts INTEGER DEFAULT 0, weight REAL DEFAULT 1, published INTEGER DEFAULT 1, created_by TEXT, created_at TEXT, UNIQUE(section_id,problem_id));
CREATE TABLE IF NOT EXISTS lms_learning_modules (id TEXT PRIMARY KEY, section_id TEXT NOT NULL, title TEXT NOT NULL, topic TEXT, position INTEGER DEFAULT 1, required_minutes INTEGER DEFAULT 0, published INTEGER DEFAULT 1, created_at TEXT);
CREATE TABLE IF NOT EXISTS lms_module_progress (id TEXT PRIMARY KEY, module_id TEXT NOT NULL, user_id TEXT NOT NULL, completed_minutes INTEGER DEFAULT 0, status TEXT DEFAULT 'NOT_STARTED', completed_at TEXT, updated_at TEXT, UNIQUE(module_id,user_id));
CREATE TABLE IF NOT EXISTS lms_audit_events (id TEXT PRIMARY KEY, user_id TEXT, section_id TEXT, event_type TEXT NOT NULL, entity_id TEXT, metadata_json TEXT, created_at TEXT);
`;

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'object') return `'${JSON.stringify(v).replaceAll("'", "''")}'`;
  return `'${String(v).replaceAll("'", "''")}'`;
}
function bind(sql, args) {
  let i = 0;
  return sql.replace(/\?/g, () => sqlLiteral(args[i++]));
}
function pgSql(sql, args = []) {
  let q = bind(sql, args).trim().replace(/;\s*$/, '');
  q = q.replace(/INSERT\s+OR\s+IGNORE\s+INTO/ig, 'INSERT INTO');
  q = q.replace(/INSERT\s+OR\s+REPLACE\s+INTO\s+rate_limits/ig, 'INSERT INTO rate_limits');
  if (/INSERT\s+INTO\s+rate_limits/i.test(q) && /VALUES/i.test(q)) q += ' ON CONFLICT (key) DO UPDATE SET window_start=EXCLUDED.window_start, count=EXCLUDED.count';
  else if (/INSERT\s+INTO/i.test(q) && /VALUES/i.test(q)) q += ' ON CONFLICT DO NOTHING';
  q = q.replace(/datetime\(\s*'now'\s*,\s*'-([0-9]+) seconds'\s*\)/ig, "CURRENT_TIMESTAMP - INTERVAL '$1 seconds'");
  q = q.replace(/datetime\(\s*'now'\s*\)/ig, 'CURRENT_TIMESTAMP');
  q = q.replace(/\bOR\s+REPLACE\b/ig, '');
  return q;
}

class PostgresDatabase {
  constructor(url) {
    this.url = url;
    this.schemaPath = path.join(ROOT, 'database_postgresql_schema.sql');
    if (!existsSync(this.schemaPath)) throw new Error('PostgreSQL schema file missing');
    this.execRaw(readFileSync(this.schemaPath, 'utf8'));
    // Upgrade existing CodeArena PostgreSQL installations created before the LMS layer.
    this.execRaw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS lms_section_id TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS queue_started_at TIMESTAMPTZ;`);
  }
  execRaw(sql) {
    const r = spawnSync('psql', [this.url, '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-c', sql], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'PostgreSQL command failed').trim());
    return r.stdout;
  }
  query(sql, args = []) {
    const q = pgSql(sql, args);
    const r = spawnSync('psql', [this.url, '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', `SELECT COALESCE(json_agg(row_to_json(q))::text, '[]') FROM (${q}) q`], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'PostgreSQL query failed').trim());
    const raw = String(r.stdout || '').trim();
    return raw ? JSON.parse(raw) : [];
  }
  run(sql, args) {
    const q = pgSql(sql, args);
    const output = String(this.execRaw(q) || '').trim();
    const lines = output.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const tag = lines.at(-1) || '';
    let changes = 0;
    let match = tag.match(/^(?:UPDATE|DELETE|MERGE)\s+(\d+)$/i);
    if (match) changes = Number(match[1]);
    else {
      match = tag.match(/^INSERT\s+\d+\s+(\d+)$/i);
      if (match) changes = Number(match[1]);
    }
    return { changes };
  }
  all(sql, args) { return this.query(sql, args); }
  get(sql, args) { return this.query(sql, args)[0]; }
  exec(sql) { this.execRaw(sql); }
  prepare(sql) { return { run: (...args) => this.run(sql, args), all: (...args) => this.all(sql, args), get: (...args) => this.get(sql, args) }; }
}

let db;
const databaseUrl = process.env.DATABASE_URL || process.env.CODEARENA_DATABASE_URL;
if (databaseUrl) {
  db = new PostgresDatabase(databaseUrl);
  console.log('CodeArena database: PostgreSQL');
} else {
  const sqlite = new DatabaseSync(DB_PATH);
  sqlite.exec(SQLITE_SCHEMA);
  db = sqlite;
  // Backward-compatible migrations for databases created by earlier CodeArena ZIPs.
  try { db.exec('ALTER TABLE users ADD COLUMN external_id TEXT'); } catch {}
  try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id)'); } catch {}
  try { db.exec('ALTER TABLE submissions ADD COLUMN queue_started_at TEXT'); } catch {}
  try { db.exec('ALTER TABLE submissions ADD COLUMN lms_section_id TEXT'); } catch {}
  console.log('CodeArena database: SQLite development profile');
}
export { db, DB_PATH, DATA_DIR };
