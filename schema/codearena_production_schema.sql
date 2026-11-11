-- ============================================================================
-- CodeArena Lab Station & Judge Platform: Core Database DDL (PostgreSQL 16+)
-- Normalized schema integrating Students, Lab Stations, Problems & Submissions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";       -- For case-insensitive emails & roll numbers

-- ----------------------------------------------------------------------------
-- 1. ENUMS & CURRICULUM LANGUAGES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_verdict') THEN
        CREATE TYPE submission_verdict AS ENUM (
            'ACCEPTED',
            'WRONG_ANSWER',
            'TIME_LIMIT_EXCEEDED',
            'MEMORY_LIMIT_EXCEEDED',
            'RUNTIME_ERROR',
            'COMPILATION_ERROR'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'station_status') THEN
        CREATE TYPE station_status AS ENUM (
            'OFFLINE',
            'AVAILABLE',
            'IN_USE',
            'MAINTENANCE',
            'LOCKED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_role') THEN
        CREATE TYPE enrollment_role AS ENUM (
            'STUDENT',
            'TEACHING_ASSISTANT',
            'FACULTY'
        );
    END IF;
END $$;

-- Supported Curriculum Languages
CREATE TABLE IF NOT EXISTS languages (
    language_id         VARCHAR(32) PRIMARY KEY,
    display_name        VARCHAR(64) NOT NULL,
    compiler_version    VARCHAR(64) NOT NULL,
    default_timeout_ms  INTEGER NOT NULL DEFAULT 2000 CHECK (default_timeout_ms > 0),
    default_memory_kb   INTEGER NOT NULL DEFAULT 262144 CHECK (default_memory_kb > 0),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO languages (language_id, display_name, compiler_version, default_timeout_ms, default_memory_kb) VALUES
    ('python3',   'Python 3.12', '3.12.3',            3000, 262144),
    ('java21',    'Java 21',     'OpenJDK 21.0.2',    4000, 524288),
    ('c17',       'C17',         'GCC 13.2 (C17)',    1500, 131072),
    ('cpp20',     'C++20',       'GCC 13.2 (C++20)',  1500, 131072),
    ('node20',    'Node.js 20',  'Node 20.12.0 LTS',  2500, 262144),
    ('html5',     'HTML5 / Web', 'W3C Validator',     2000, 131072),
    ('sqlite',    'SQLite 3',    'SQLite 3.45',       2000, 131072),
    ('php83',     'PHP 8.3',     'PHP 8.3.4 CLI',     2500, 262144),
    ('r43',       'R 4.3',       'R 4.3.3',           4000, 524288)
ON CONFLICT (language_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    compiler_version = EXCLUDED.compiler_version;

-- ----------------------------------------------------------------------------
-- 2. STUDENTS / USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no             VARCHAR(32) NOT NULL,
    first_name          VARCHAR(64) NOT NULL,
    last_name           VARCHAR(64) NOT NULL,
    email               CITEXT NOT NULL,
    department          VARCHAR(64) NOT NULL,
    semester            SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    academic_year       VARCHAR(16) NOT NULL, -- e.g. '2025-2026'
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMPTZ NULL,     -- Soft-delete timestamp
    
    CONSTRAINT chk_roll_no_format CHECK (roll_no ~* '^[A-Z0-9]{2,8}-[0-9]{3,6}$'),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$')
);

-- Partial Unique Indexes enforcing uniqueness only for active (non-soft-deleted) records
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_roll_no_active 
    ON students (UPPER(roll_no)) 
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_students_email_active 
    ON students (email) 
    WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 3. LAB STATIONS & SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab_stations (
    station_id          VARCHAR(32) PRIMARY KEY, -- e.g. 'PC-01'
    mac_address         MACADDR NOT NULL UNIQUE,
    ip_address          INET NOT NULL,
    lab_room            VARCHAR(32) NOT NULL DEFAULT 'LAB-101',
    status              station_status NOT NULL DEFAULT 'AVAILABLE',
    last_heartbeat_at   TIMESTAMPTZ NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_sessions (
    session_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id          VARCHAR(32) NOT NULL REFERENCES lab_stations(station_id) ON DELETE RESTRICT,
    student_id          UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    login_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_at           TIMESTAMPTZ NULL,
    is_active           BOOLEAN GENERATED ALWAYS AS (logout_at IS NULL) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_station_session 
    ON lab_sessions (station_id) 
    WHERE logout_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_student_session 
    ON lab_sessions (student_id) 
    WHERE logout_at IS NULL;

-- ----------------------------------------------------------------------------
-- 4. COURSES, LAB BATCHES & ENROLLMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    course_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code         VARCHAR(32) NOT NULL UNIQUE,
    title               VARCHAR(128) NOT NULL,
    department          VARCHAR(64) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_batches (
    batch_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id           UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    batch_name          VARCHAR(64) NOT NULL,
    instructor_name     VARCHAR(128) NOT NULL,
    academic_term       VARCHAR(32) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, batch_name, academic_term)
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    enrollment_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id            UUID NOT NULL REFERENCES lab_batches(batch_id) ON DELETE CASCADE,
    student_id          UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    role                enrollment_role NOT NULL DEFAULT 'STUDENT',
    enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMPTZ NULL,
    UNIQUE (batch_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 5. PROBLEMS & SUBMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problems (
    problem_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(64) NOT NULL UNIQUE,
    title               VARCHAR(128) NOT NULL,
    difficulty          VARCHAR(16) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    max_score           NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    time_limit_ms       INTEGER NOT NULL DEFAULT 2000,
    memory_limit_kb     INTEGER NOT NULL DEFAULT 262144,
    is_published        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    submission_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    problem_id          UUID NOT NULL REFERENCES problems(problem_id) ON DELETE RESTRICT,
    language_id         VARCHAR(32) NOT NULL REFERENCES languages(language_id) ON DELETE RESTRICT,
    station_id          VARCHAR(32) NULL REFERENCES lab_stations(station_id) ON DELETE SET NULL,
    source_code         TEXT NOT NULL,
    verdict             submission_verdict NOT NULL,
    execution_time_ms   INTEGER NOT NULL DEFAULT 0 CHECK (execution_time_ms >= 0),
    memory_used_kb      INTEGER NOT NULL DEFAULT 0 CHECK (memory_used_kb >= 0),
    score               NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (score >= 0 AND score <= 1000),
    compiler_output     TEXT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMPTZ NULL
);

-- ----------------------------------------------------------------------------
-- 6. INDEXING STRATEGY FOR HIGH-THROUGHPUT LOOKUPS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_roll_no 
    ON students (roll_no) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_student_history 
    ON submissions (student_id, created_at DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_problem_verdict 
    ON submissions (problem_id, verdict) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lab_sessions_station_active 
    ON lab_sessions (station_id, login_at DESC) 
    WHERE logout_at IS NULL;

-- ----------------------------------------------------------------------------
-- 7. AUDIT & UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_students_updated_at') THEN
        CREATE TRIGGER trg_students_updated_at
        BEFORE UPDATE ON students
        FOR EACH ROW EXECUTE FUNCTION fn_trigger_update_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lab_stations_updated_at') THEN
        CREATE TRIGGER trg_lab_stations_updated_at
        BEFORE UPDATE ON lab_stations
        FOR EACH ROW EXECUTE FUNCTION fn_trigger_update_timestamp();
    END IF;
END $$;

-- Active student presentation view
CREATE OR REPLACE VIEW vw_active_students AS
SELECT 
    s.student_id,
    s.roll_no,
    s.first_name,
    s.last_name,
    s.email,
    s.department,
    s.semester,
    s.academic_year,
    s.is_active,
    ls.station_id AS current_station_id,
    ls.login_at   AS station_logged_in_at,
    s.created_at,
    s.updated_at
FROM students s
LEFT JOIN lab_sessions ls 
    ON s.student_id = ls.student_id AND ls.logout_at IS NULL
WHERE s.deleted_at IS NULL;
