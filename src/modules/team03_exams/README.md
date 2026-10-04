# Subsystem Specification: Team 03 - ExamShield (Secure Assessments & Proctoring)

## 1. Executive Summary & Functional Scope
ExamShield is the institutional examination delivery, question bank curation, and real-time AI proctoring subsystem of Chanakya University. Conforming to autonomous university grading policies and Bloom's Revised Taxonomy, ExamShield delivers resilient online assessments with multi-factor lockdown integrity controls.

### Key Capabilities
- **ProctorLock Browser Shell**: Fullscreen confinement with continuous detection of blur events, multi-display connections, alt-tab attempts, and keyboard shortcuts (PrintScreen, DevTools).
- **BlazeFace Proctoring Telemetry**: Edge-based facial landmark assessment evaluating head orientation, multi-face presence, and continuous student gaze tracking.
- **Bloom's Taxonomy Authoring Studio**: Item authoring system categorizing questions into Remember, Understand, Apply, Analyze, Evaluate, and Create levels with automated difficulty weighting.
- **Real-Time Proctor Escalation**: Anomaly score accumulator raising automated proctor alerts when gaze deviations or secondary face intrusions exceed threshold limits.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team03_exams/
|-- components/
|   |-- ExamSessionShell.tsx      # Lockdown candidate testing interface with autosave
|   |-- AuthoringStudio.tsx       # Bloom taxonomy item authoring and question bank
|   |-- ProctorDashboard.tsx      # Real-time candidate telemetry and incident queue
|   \-- EvaluationConsole.tsx     # Rubric grading, marks reconciliation, and moderation
|-- services/
|   \-- examService.ts            # High-resilience exam session manager with delta-sync
|-- types/
|   \-- exam.types.ts             # TypeScript interfaces matching examination schemas
|-- index.tsx                     # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                     # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE exam_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(16) NOT NULL,
    title VARCHAR(128) NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    pass_marks INT NOT NULL,
    lockdown_enabled BOOLEAN DEFAULT TRUE,
    ai_proctoring_enabled BOOLEAN DEFAULT TRUE,
    start_window TIMESTAMPTZ NOT NULL,
    end_window TIMESTAMPTZ NOT NULL,
    status VARCHAR(16) DEFAULT 'SCHEDULED'
);

CREATE TABLE exam_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES exam_assessments(assessment_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    bloom_level VARCHAR(16) CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE')),
    difficulty_level VARCHAR(16) CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    marks INT NOT NULL,
    options_json JSONB,
    correct_answer TEXT,
    rubric_criteria JSONB
);

CREATE TABLE exam_candidate_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES exam_assessments(assessment_id),
    student_id UUID NOT NULL,
    student_roll_number VARCHAR(32) NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    submit_time TIMESTAMPTZ,
    anomaly_incidents_count INT DEFAULT 0,
    tab_switch_count INT DEFAULT 0,
    face_not_detected_duration_seconds INT DEFAULT 0,
    multiple_faces_detected_count INT DEFAULT 0,
    session_status VARCHAR(16) DEFAULT 'IN_PROGRESS' CHECK (session_status IN ('IN_PROGRESS', 'SUBMITTED', 'TERMINATED_DISCIPLINARY', 'EVALUATED')),
    final_score NUMERIC(5, 2)
);
```

---

## 4. API Specification & Network Contracts
### REST & Event Endpoints
- `POST /api/v1/exams/:assessmentId/start`
  - **Auth**: Bearer JWT (Role: `STUDENT`)
  - **Response 200**: Complete assessment packet with randomized question order and session token.
- `PUT /api/v1/exams/sessions/:sessionId/answers/:questionId`
  - **Auth**: Bearer JWT (Role: `STUDENT`)
  - **Payload**: `{"selected_option": "B", "descriptive_text": "...", "client_timestamp": "..."}`
  - **Response 200**: Signed acknowledgement with SHA-256 state proof.
- `POST /api/v1/exams/sessions/:sessionId/telemetry`
  - **Payload**: `{"incident_type": "TAB_BLUR", "duration_ms": 1420, "anomaly_delta": 1.5}`
  - **Response 200**: Current cumulative threat level (`NORMAL`, `SUSPICIOUS`, `LOCKED`).

---

## 5. Resilience & Fault-Isolation Architecture
- **Delta-Autosave**: Exam responses are cached to `cu_mod_exams_answers_*` in local storage on every keystroke. In case of browser crash or power loss, session is recovered seamlessly within the remaining time window.
- **Circuit Breaker Integration**: Telemetry bursts are buffered and batched; network hiccups do not interrupt the student's examination experience.
