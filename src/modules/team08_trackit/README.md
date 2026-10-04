# Subsystem Specification: Team 08 - TrackIt (Capstone Projects & Internship Tracker)

## 1. Executive Summary & Functional Scope
TrackIt is the capstone dissertation, industry internship, and project lifecycle management system of Chanakya University. TrackIt standardizes the progression of MCA, B.Tech, and MBA final-year students across four mandatory academic milestones (M1 to M4), incorporating faculty guide reviews, industry mentor sign-offs, and compliance auditing.

### Key Capabilities
- **Milestone Progression Pipeline**: Four-stage capstone lifecycle:
  - M1: Problem Formulation, Feasibility & Literature Survey
  - M2: Architectural Blueprint & Entity-Relationship Modeling
  - M3: Implementation Alpha & Unit Test Validation
  - M4: Final Defense, Code Audit & Plagiarism Verification
- **Faculty Guide Workload & Allocation**: Assignment of faculty mentors to project teams with balanced guide-to-scholar quotas (maximum 4 teams per guide).
- **Corporate Internship Management**: Tracking corporate MOU compliance, weekly student logs, and industry supervisor verification.
- **Rubric-Based Defense Grading**: Standardized scoring criteria evaluating innovation, architectural rigor, implementation completeness, and viva defense.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team08_trackit/
|-- components/
|   |-- MilestonePipeline.tsx    # M1-M4 progression tracker with submission deadlines
|   |-- ProjectRoster.tsx        # Searchable project directory with guide allocations
|   |-- InternshipTracker.tsx    # Corporate stipend, offer letter, and weekly log manager
|   \-- GuideReviewConsole.tsx   # Rubric grading, milestone sign-off, and feedback
|-- services/
|   \-- trackitService.ts        # Milestone lifecycle and review data service
|-- types/
|   \-- trackit.types.ts         # Project and internship schema definitions
|-- index.tsx                    # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE trackit_projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    domain VARCHAR(64) NOT NULL,
    team_lead_id UUID NOT NULL,
    team_members_json JSONB NOT NULL,
    faculty_guide_id UUID NOT NULL,
    current_milestone VARCHAR(8) DEFAULT 'M1' CHECK (current_milestone IN ('M1', 'M2', 'M3', 'M4', 'COMPLETED')),
    github_repo_url TEXT,
    defense_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trackit_milestone_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES trackit_projects(project_id) ON DELETE CASCADE,
    milestone VARCHAR(8) NOT NULL CHECK (milestone IN ('M1', 'M2', 'M3', 'M4')),
    document_uri TEXT NOT NULL,
    git_commit_sha VARCHAR(40),
    status VARCHAR(16) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED')),
    guide_feedback TEXT,
    rubric_score NUMERIC(4, 2),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE trackit_internships (
    internship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    company_name VARCHAR(128) NOT NULL,
    work_location VARCHAR(64) NOT NULL,
    mode VARCHAR(16) CHECK (mode IN ('ON_SITE', 'HYBRID', 'REMOTE')),
    monthly_stipend_inr NUMERIC(10, 2),
    industry_mentor_name VARCHAR(64) NOT NULL,
    industry_mentor_email VARCHAR(128) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    weekly_logs_completed INT DEFAULT 0,
    mou_verified BOOLEAN DEFAULT TRUE
);
```

---

## 4. Resilience & Fault-Isolation Architecture
- **State Partitioning**: Capstone state is isolated in `cu_mod_trackit_*` with automated recovery if local quota is exceeded.
- **Fail-Safe Operation**: If external Git API fails, students can still submit offline PDF deliverables without system interruption.
