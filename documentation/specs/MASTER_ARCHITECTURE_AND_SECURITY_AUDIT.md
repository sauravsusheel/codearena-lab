# UniSphere: Enterprise Master Architecture Specification & Cybersecurity Audit
## Chanakya University Autonomous Academic Platform
**Document Version:** 3.0-PROD  
**Target Academic Year:** 2026–2027  
**System Classification:** Enterprise Critical Multi-Tenant Academic ERP  

---

## 1. Executive Summary & Zero-Cascading Architecture

The **UniSphere Autonomous Academic Platform** is an enterprise-grade digital campus ecosystem engineered for Chanakya University. The core design mandate requires **Absolute Fault Isolation**: a catastrophic crash, infinite loop, or network failure inside any single academic subsystem must **never cascade to bring down the portal shell, authentication service, or any other functional module**.

To enable seamless concurrent development across 8 independent student engineering teams (24 student engineers), the monorepo is partitioned into autonomous modules with strict interface boundaries:
1. **Module 01 (Team 01)**: `EduHRMS` — Academic HRMS, Faculty Dossier & Workload Allocator
2. **Module 02 (Team 02)**: `EduAttend AI` — Smart Attendance, 5s Dynamic QR & 75% Exam Gate
3. **Module 03 (Team 03)**: `EduExam AI` — ExamShield Lockdown & AI-Proctored Examination Suite
4. **Module 04 (Team 04)**: `EduCode Judge` — Cloud Code Arena, Sandbox Judge & AST Plagiarism Engine
5. **Module 05 (Team 05)**: `EduPresent AI` — WebRTC Virtual Presentation & Multi-Modal Viva Evaluator
6. **Module 06 (Team 06)**: `EduAssist AI` — CampusBot Knowledge Base & Context-Aware RAG Assistant
7. **Module 07 (Team 07)**: `UniHub` — Git Code Repository, Research Archive & Innovation Network
8. **Module 08 (Team 08)**: `TrackIt` — Capstone Project Milestones, Rubrics & Internship Tracker

---

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph PresentationTier ["Presentation Tier: Client Portal & Responsive Mobile Shell"]
        UI["UniSphere React 18 / Vite Shell<br/>(Tailwind CSS / Lucide Icons / Inter Typography)"]
        Nav["Universal 3-Click Navigation Shell & Dynamic RBAC Filter"]
        HealthMonitor["Live Resilience & Health Telemetry Indicator"]
    end

    subgraph FaultIsolationCore ["Resilience & Fault-Containment Middleware"]
        EB["ModuleErrorBoundary Traps<br/>(Scythed Component Subtrees / Zero Cascading)"]
        CB["Client-Side CircuitBreakers<br/>(CLOSED / OPEN / HALF_OPEN States)"]
        Bus["Sandboxed CampusEventBus<br/>(Isolated Try-Catch Event Dispatcher)"]
        IsoStore["Namespaced IsolatedStorage<br/>(cu_mod_&lt;id&gt;_* Partitions)"]
    end

    subgraph AutonomousModules ["Autonomous Team Modules (Independent Workspaces)"]
        M1["Module 01: EduHRMS<br/><b>Team 01</b>"]
        M2["Module 02: EduAttend AI<br/><b>Team 02</b>"]
        M3["Module 03: EduExam AI<br/><b>Team 03</b>"]
        M4["Module 04: EduCode Judge<br/><b>Team 04</b>"]
        M5["Module 05: EduPresent AI<br/><b>Team 05</b>"]
        M6["Module 06: EduAssist AI<br/><b>Team 06</b>"]
        M7["Module 07: UniHub<br/><b>Team 07</b>"]
        M8["Module 08: TrackIt<br/><b>Team 08</b>"]
    end

    subgraph GatewayTier ["Security, Ingress & Reverse Proxy Tier"]
        NGINX["NGINX Reverse Proxy / TLS 1.3 Termination"]
        APIGateway["Central Node.js/Express API Gateway<br/>(JWT Token Guard / CSRF Tokenizer / Rate Limiter)"]
    end

    subgraph PersistenceTier ["Data Storage & Vector Compute Tier"]
        PGSQL[("PostgreSQL 16 Enterprise Relational DB<br/>(Normalized ACID Schemas / Foreign Keys)")]
        PGVector[("pgvector Vector Store<br/>(1536-dim HNSW Cosine Similarity Index)")]
        RedisDB[("Redis 7.2 In-Memory Store<br/>(5s Dynamic Nonces / BullMQ Queues / Sessions)")]
        S3MinIO[("MinIO S3 Object Store<br/>(AES-256 Encrypted Recordings, Slides & PDFs)")]
        DockerSandbox["Isolated Container Sandbox<br/>(gVisor runsc Kernel / 256MB RAM / Network Disabled)")]
    end

    UI --> Nav
    Nav --> HealthMonitor
    UI --> EB
    EB --> AutonomousModules
    AutonomousModules --> CB
    AutonomousModules -.->|Decoupled Events| Bus
    AutonomousModules --> IsoStore

    AutonomousModules --> NGINX
    NGINX --> APIGateway

    APIGateway --> PGSQL
    APIGateway --> PGVector
    APIGateway --> RedisDB
    APIGateway --> S3MinIO
    M4 --> DockerSandbox
    M2 -.->|ATTENDANCE_CONDONATION_FILED Event| M3
```

---

## 3. Database Schema: Normalized PostgreSQL 16 DDL

```sql
-- ====================================================================
-- CORE INSTITUTIONAL SCHEMA & RBAC
-- ====================================================================

CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN', 'DEAN', 'HOD', 'FACULTY', 'STAFF', 'STUDENT', 'TEACHING_ASSISTANT'
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    faculty_dean_id UUID,
    budget NUMERIC(14,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    employee_or_roll_id VARCHAR(32) UNIQUE NOT NULL,
    role user_role_enum NOT NULL,
    dept_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- MODULE 01: EduHRMS SCHEMA (Team 01)
-- ====================================================================

CREATE TABLE hrms_faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(64) NOT NULL,
    tenure_status VARCHAR(32) DEFAULT 'PROBATION',
    base_salary NUMERIC(12,2) NOT NULL,
    max_teaching_credits INT DEFAULT 16,
    emergency_contact VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE leave_status_enum AS ENUM ('PENDING_HOD', 'PENDING_DEAN', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE hrms_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT NOT NULL,
    status leave_status_enum DEFAULT 'PENDING_HOD',
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hrms_workload_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(16) NOT NULL,
    course_name VARCHAR(128) NOT NULL,
    credits INT NOT NULL,
    format VARCHAR(32) NOT NULL,
    hours_per_week INT NOT NULL,
    students_enrolled INT DEFAULT 0,
    semester VARCHAR(32) NOT NULL,
    academic_year VARCHAR(16) NOT NULL
);

-- ====================================================================
-- MODULE 02: EduAttend AI SCHEMA (Team 02)
-- ====================================================================

CREATE TABLE attend_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(16) NOT NULL,
    faculty_id UUID NOT NULL REFERENCES users(id),
    room_identifier VARCHAR(32) NOT NULL,
    center_latitude NUMERIC(9,6) NOT NULL,
    center_longitude NUMERIC(9,6) NOT NULL,
    radius_meters INT DEFAULT 50,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TYPE attend_status_enum AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'CONDONED');
CREATE TYPE attend_mode_enum AS ENUM ('QR_CODE', 'GPS_GEOFENCE', 'BLE_BEACON', 'FACE_LIVENESS');

CREATE TABLE attend_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attend_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status attend_status_enum NOT NULL,
    mode attend_mode_enum NOT NULL,
    verified_radius_meters INT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE TABLE attend_condonation_petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(16) NOT NULL,
    hospital_reason TEXT NOT NULL,
    document_s3_url VARCHAR(512),
    status leave_status_enum DEFAULT 'PENDING_HOD',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- MODULE 03: EduExam AI SCHEMA (Team 03)
-- ====================================================================

CREATE TYPE exam_question_type AS ENUM ('MCQ', 'MULTI_SELECT', 'FORMULA_LATEX', 'SUBJECTIVE_ESSAY');

CREATE TABLE exam_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES exam_assessments(id) ON DELETE CASCADE,
    type exam_question_type NOT NULL,
    prompt TEXT NOT NULL,
    formula_latex TEXT,
    options JSONB,
    correct_answer JSONB,
    marks INT NOT NULL,
    bloom_level VARCHAR(32) DEFAULT 'UNDERSTAND'
);

CREATE TABLE exam_proctoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES exam_assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(64) NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    snapshot_s3_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- MODULE 04: EduCode Judge SCHEMA (Team 04)
-- ====================================================================

CREATE TABLE judge_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(16) NOT NULL,
    category VARCHAR(64) NOT NULL,
    points INT NOT NULL,
    time_limit_ms INT DEFAULT 2000,
    memory_limit_mb INT DEFAULT 256,
    statement TEXT NOT NULL,
    sample_input TEXT NOT NULL,
    sample_output TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE judge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES judge_problems(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    code_source TEXT NOT NULL,
    verdict VARCHAR(32) NOT NULL,
    execution_time_ms INT,
    memory_used_kb INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- MODULE 05: EduPresent AI SCHEMA (Team 05)
-- ====================================================================

CREATE TABLE present_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id),
    guide_id UUID NOT NULL REFERENCES users(id),
    slide_deck_s3_url VARCHAR(512),
    video_recording_s3_url VARCHAR(512),
    total_score NUMERIC(5,2),
    grade VARCHAR(16),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE present_viva_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES present_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    source_transcript_snippet TEXT,
    difficulty VARCHAR(32),
    suggested_answer_points JSONB
);

-- ====================================================================
-- MODULE 06: EduAssist AI SCHEMA (Team 06)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    s3_url VARCHAR(512) NOT NULL,
    total_chunks INT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT NOT NULL,
    section_header VARCHAR(255),
    embedding vector(1536)
);

CREATE INDEX idx_rag_chunks_hnsw ON rag_chunks USING hnsw (embedding vector_cosine_ops);

-- ====================================================================
-- MODULE 07: UniHub SCHEMA (Team 07)
-- ====================================================================

CREATE TABLE unihub_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    stars_count INT DEFAULT 0,
    forks_count INT DEFAULT 0,
    primary_language VARCHAR(32),
    visibility VARCHAR(16) DEFAULT 'PUBLIC',
    git_storage_path VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_owner_repo UNIQUE (owner_id, name)
);

CREATE TABLE unihub_research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(512) NOT NULL,
    authors JSONB NOT NULL,
    dept_id UUID REFERENCES departments(id),
    journal_or_conference VARCHAR(255),
    doi VARCHAR(128) UNIQUE,
    year INT NOT NULL,
    citations_count INT DEFAULT 0,
    pdf_s3_url VARCHAR(512) NOT NULL,
    bibtex TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- MODULE 08: TrackIt SCHEMA (Team 08)
-- ====================================================================

CREATE TABLE track_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    lead_student_id UUID NOT NULL REFERENCES users(id),
    guide_id UUID NOT NULL REFERENCES users(id),
    stage VARCHAR(32) DEFAULT 'IN_PROGRESS',
    repo_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE track_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES track_projects(id) ON DELETE CASCADE,
    milestone_code VARCHAR(8) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'SCHEDULED',
    score NUMERIC(4,2),
    max_score NUMERIC(4,2) NOT NULL,
    feedback TEXT,
    guide_approved BOOLEAN DEFAULT FALSE
);
```

---

## 4. API Documentation: Central RESTful & Event Endpoints

### 4.1 Authentication & Profile
- `POST /api/v1/auth/login`: Authenticates user; returns HTTP-only JWT token with claims `{ id, role, employeeId, allowedModules }`.
- `GET /api/v1/auth/profile`: Retrieves active user session dossier and accessible module keys.
- `POST /api/v1/auth/logout`: Clears authorization session cookies and blacklists refresh tokens in Redis.

### 4.2 Module 01: EduHRMS
- `GET /api/v1/hrms/profile`: Returns full faculty dossier, qualifications, publications, and workload statistics.
- `GET /api/v1/hrms/leaves`: Returns historical leave applications and hierarchical approval audit logs.
- `POST /api/v1/hrms/leaves`: Submits new leave application (`{ type, startDate, endDate, reason }`).
- `GET /api/v1/hrms/workload`: Returns semester teaching credits, assigned lecture/lab hours, and enrollment counts.
- `GET /api/v1/hrms/payslips`: Retrieves monthly salary compensation statements with PDF download link.

### 4.3 Module 02: EduAttend AI
- `GET /api/v1/attend/session/active`: Returns active lecture session configuration with 5-second rotating HMAC-SHA256 nonce.
- `POST /api/v1/attend/verify-qr`: Validates student scan payload `{ nonce, clientLatitude, clientLongitude, studentRoll }`.
- `POST /api/v1/attend/kiosk-face`: Submits MediaPipe 468-mesh facial vector and 3D eye-blink liveness proof.
- `GET /api/v1/attend/eligibility`: Calculates course-wise percentage against the statutory 75% exam gate.
- `POST /api/v1/attend/condonation`: Submits medical documentation petition to unlock hall ticket.

### 4.4 Module 03: EduExam AI
- `GET /api/v1/exams/assessments`: Retrieves scheduled, active, and completed exams for the enrolled student.
- `POST /api/v1/exams/{id}/start`: Initiates full-screen lockdown exam runner; initializes autosave session cache.
- `POST /api/v1/exams/{id}/telemetry`: Streams real-time proctoring anomalies (`TAB_SWITCH`, `GAZE_DEVIATION`, `MULTIPLE_FACES`).
- `POST /api/v1/exams/{id}/submit`: Submits final student answers; executes auto-grading for objective questions.

### 4.5 Module 04: EduCode Judge
- `GET /api/v1/judge/problems`: Returns coding problem catalog with starter templates and test case specifications.
- `POST /api/v1/judge/run`: Dispatches code execution task to BullMQ worker running in isolated gVisor container.
- `GET /api/v1/judge/plagiarism`: Returns AST tokenization comparisons and Winnowing hash match percentages.

### 4.6 Module 05: EduPresent AI
- `POST /api/v1/present/evaluate`: Dispatches multi-modal audio transcription, WPM pace, and filler word counter.
- `GET /api/v1/present/viva-questions`: Autonomously generates syllabus-grounded viva defense questions from speech transcript.
- `GET /api/v1/present/rubric-dossier`: Generates structured composite evaluation report spanning 5 rubric dimensions.

### 4.7 Module 06: EduAssist AI
- `POST /api/v1/rag/query`: Hybrid semantic vector search against university ordinances with strict page citations.
- `POST /api/v1/rag/ingest`: Ingests institutional handbook PDF; chunks text and generates 1536-dim embeddings.

### 4.8 Module 07: UniHub
- `GET /api/v1/unihub/repositories`: Lists university public and departmental Git repositories with star metrics.
- `GET /api/v1/unihub/diff`: Returns visual unified code diff for pull requests and commit inspections.
- `GET /api/v1/unihub/papers`: Returns peer-reviewed faculty pre-prints with automatic BibTeX citation export.

### 4.9 Module 08: TrackIt
- `GET /api/v1/trackit/projects`: Returns capstone project milestone progression pipeline (M1 to M4).
- `POST /api/v1/trackit/rubric-score`: Records guide evaluation score and feedback comments for a milestone.
- `GET /api/v1/trackit/internships`: Returns corporate student internship roster with weekly mentor log approval status.

---

## 5. Comprehensive Cybersecurity & Resilience Audit

### 5.1 Zero-Cascading Fault Isolation
- **React Error Boundary Subtree Scoping**: Every module is wrapped in a dedicated `ModuleErrorBoundary`. If unhandled exceptions occur within a module, only that specific component subtree is unmounted and replaced by a recovery console (`Restart Module`, `Safe Mode`). Top-level navigation, universal headers, and other 7 modules remain 100% stable.
- **Client-Side Circuit Breaker Pattern**: Network calls and worker queues use the 3-state Circuit Breaker (`CLOSED`, `OPEN`, `HALF_OPEN`). After 3 consecutive network failures or timeouts, the breaker opens, returning instant fallback data and preventing UI freezes.
- **Sandboxed Event Bus**: The campus publish-subscribe event bus executes every subscriber within an isolated `try...catch` block so a bug in an event listener never crashes the event publisher or adjacent subscribers.
- **Isolated Storage Namespaces**: LocalStorage keys are strictly partitioned with `cu_mod_<id>_*` prefixes, preventing storage quota crashes or corrupted JSON in one module from affecting another.

### 5.2 Application & Data Security
- **Cross-Site Request Forgery (CSRF)**: All state-modifying requests require double-submit cryptographic CSRF tokens combined with `SameSite=Strict` HTTP cookies.
- **SQL Injection Prevention**: All persistence operations utilize parameterized queries through Prisma ORM and prepared SQL statements. Zero string concatenation is permitted in database queries.
- **Cross-Site Scripting (XSS)**: All user-submitted code, markdown descriptions, and chat messages pass through DOMPurify sanitization. Strict Content Security Policy (CSP) headers block execution of untrusted scripts.
- **Role-Based Access Control (RBAC)**: Centralized JWT verification at the API Gateway inspects role claims against a permission matrix before routing to any microservice endpoint.
- **Data Encryption**:
  - **At Rest**: PostgreSQL data volumes and MinIO S3 object stores enforce AES-256 server-side encryption.
  - **In Transit**: All client-server, microservice-to-microservice, and WebRTC media transmissions enforce TLS 1.3 encryption.
- **Sandbox Container Containment**: Code submitted in CodeArena is executed within ephemeral gVisor (`runsc`) container sandboxes with Linux cgroups resource quotas (256MB RAM, 1 CPU core, 2000ms CPU timeout) and host network access completely severed.

---

## 6. Multi-Page Public Website Architecture & Zero-Trust RBAC Hardening

### 6.1 Multi-Page Public Web Standard
The public institutional portal (`src/components/landing/`) implements a high-performance, hash-routed Multi-Page Application:
- **`#home`**: Admissions hero, key institutional KPI metrics, 4 foundational pillars, campus events ticker.
- **`#about`**: Board of Governors profiles, university statutory governance structure, executive leadership biographies.
- **`#academics`**: 6 constituent schools interactive explorer with full course specifications and apply triggers.
- **`#faculty`**: Directory of 174 faculty profiles with real-time name search, school filters, publication counts, and email links.
- **`#campus`**: High-resolution campus media carousel and structured cards for NVIDIA AI Center, Solar PV Lab, Central Library, and Research Complex.
- **`#events`**: 3-column responsive event catalog featuring convocations, hackathons, and calendar registration links.
- **`#admissions`**: 4-step admissions roadmap, UG/PG fee structures, documents checklist, and interactive application modal.

### 6.2 Zero-Trust RBAC & Defect Remediations (Live-Verified)
1. **Password Authentication Enforcement**: `AuthContext.tsx` strictly validates passwords against registered accounts. Invalid passwords trigger immediate rejection notices while preserving the login modal context.
2. **Student Exam Authoring Isolation**: Gated Question Authoring and Evaluation tabs behind strict role checks in `ExamsModule/index.tsx`.
3. **Student Plagiarism Tab Suppression**: Wrapped CodeArena plagiarism inspection tab and views in an `isFacultyOrAdmin` guard in `team04_codearena/index.tsx`.
4. **Student Timetable Extraction Elimination**: Enforced 4-tier security barrier (renamed sidebar navigation to "Smart Attendance & QR", hid module timetable tabs, and deployed component-level access denied guards in `TimetableManager.tsx`).
5. **Universal Module Route Interceptor**: Implemented `hasModuleAccess` in `App.tsx` rendering a dedicated Access Denied panel for unauthorized module navigation attempts.
6. **DPDP Act 2023 Compliance**: Quarantined student medical justifications, GPS coordinate streams, and biometric face recordings strictly to the student and authorized proctors.

