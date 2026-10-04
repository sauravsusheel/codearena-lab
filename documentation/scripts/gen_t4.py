from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE difficulty_level AS ENUM (\'EASY\',\'MEDIUM\',\'HARD\');\n'
    'CREATE TYPE verdict          AS ENUM (\'AC\',\'WA\',\'TLE\',\'MLE\',\'RE\',\'CE\',\'PENDING\');\n'
    'CREATE TYPE assign_status    AS ENUM (\'DRAFT\',\'PUBLISHED\',\'CLOSED\');\n'
    'CREATE TABLE code_problems (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  slug VARCHAR(256) UNIQUE NOT NULL, difficulty difficulty_level DEFAULT \'MEDIUM\',\n'
    '  description TEXT NOT NULL, constraints TEXT, sample_input TEXT, sample_output TEXT,\n'
    '  editorial TEXT, time_limit_ms INT DEFAULT 2000, memory_limit_kb INT DEFAULT 262144,\n'
    '  tags TEXT[], created_by UUID NOT NULL, is_public BOOLEAN DEFAULT TRUE,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE code_test_cases (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  problem_id UUID NOT NULL REFERENCES code_problems(id) ON DELETE CASCADE,\n'
    '  input TEXT NOT NULL, expected TEXT NOT NULL, is_sample BOOLEAN DEFAULT FALSE, weight INT DEFAULT 1\n'
    ');\n'
    'CREATE TABLE code_submissions (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  problem_id UUID NOT NULL REFERENCES code_problems(id), student_id UUID NOT NULL,\n'
    '  language VARCHAR(16) NOT NULL, source_code TEXT NOT NULL, verdict verdict DEFAULT \'PENDING\',\n'
    '  runtime_ms INT, memory_kb INT, score NUMERIC(5,2) DEFAULT 0,\n'
    '  ai_feedback TEXT, submitted_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE code_contests (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,\n'
    '  created_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');'
)
doc=nd()
cv(doc,4,"CodeArena","Coding Practice and Assignment Platform",4004,"code_db",5435)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Monaco editor UI, problem browser, leaderboard, submission history","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Problem API, Judge0 CE integration, assignment and contest workflows","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Judge0 CE Docker setup, Redis queues","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The CodeArena module is an in-browser competitive coding and assignment platform. Students can practise problems from a curated problem bank, participate in timed coding contests, and submit graded coding assignments set by faculty. The platform uses Judge0 Community Edition (self-hosted) as the code execution backend, supporting Python, Java, C++, C, JavaScript, and Go with isolated execution environments.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (code_db) on port 5435. The module API is served on port 4004. The Central API Gateway routes all /codearena/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Problem Bank",2)
for x in ["Searchable problem catalogue with filters for difficulty, topic tag, and completion status.","Problem statement with constraints, sample inputs and outputs, and progressive hints.","Editorial section unlocked after submission or after a configurable faculty-set delay.","Taxonomy tags: Arrays, Dynamic Programming, Graphs, Strings, Trees."]: bl(doc,x)
hd(doc,"3.2 Code Editor and Execution",2)
for x in ["Monaco Editor with syntax highlighting for Python, Java, C++, C, JavaScript, and Go.","Custom stdin input panel for manual testing before formal submission.","Submission queue via BullMQ; results returned asynchronously via WebSocket.","Execution metrics: runtime in milliseconds, memory used in KB, test case pass and fail breakdown."]: bl(doc,x)
hd(doc,"3.3 Assignments",2)
for x in ["Faculty creates coding assignments with due date, problem set, and grading rubric.","Auto-grading against hidden test cases not visible to students.","AI code review via Gemini API: code quality, time complexity, documentation standards.","Plagiarism detection via MOSS (Measure of Software Similarity) API.","Late submission penalty configuration (percentage deduction per hour late)."]: bl(doc,x)
hd(doc,"3.4 Contests and Leaderboard",2)
for x in ["Time-boxed coding contests with multiple problems and simultaneous participants.","Real-time leaderboard updated on each accepted submission using Redis sorted sets.","ICPC penalty time scoring: accepted_time plus 20 minutes per wrong attempt.","Post-contest editorial and accepted solution review mode."]: bl(doc,x)
hd(doc,"4. Database Schema (code_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the code_db instance (Port 5435).")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["GET","/api/v1/problems","Any","List and filter problem bank"],
    ["GET","/api/v1/problems/:slug","Any","Get problem details with constraints"],
    ["POST","/api/v1/problems","FACULTY","Create a new problem"],
    ["POST","/api/v1/submissions","STUDENT","Submit code for judging via Judge0"],
    ["GET","/api/v1/submissions/:id","STUDENT","Poll submission verdict and execution metrics"],
    ["POST","/api/v1/assignments","FACULTY","Create a coding assignment"],
    ["GET","/api/v1/assignments/:id","STUDENT","View assignment details and deadline"],
    ["POST","/api/v1/contests","FACULTY","Create a new coding contest"],
    ["GET","/api/v1/contests/:id/leaderboard","Any","Real-time contest leaderboard"],
    ["GET","/api/v1/student/:id/stats","STUDENT","Personal statistics, rating, and solved count"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.9,1.4,2.8])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, code_db schema, Judge0 CE Docker setup, problem CRUD API, test case management."],
    ["Sprint 2","3-4","Monaco editor integration, code submission via BullMQ queue, Judge0 callback handler, verdict display."],
    ["Sprint 3","5-6","Problem bank search UI, submission history panel, execution metrics display, custom stdin tester."],
    ["Sprint 4","7-8","Assignment creation, hidden test case grading, late submission penalty engine, MOSS plagiarism integration."],
    ["Sprint 5","9-10","Contest engine, real-time leaderboard with Redis sorted sets, ICPC penalty scoring, post-contest mode."],
    ["Sprint 6","11-12","Gemini AI code review, student statistics dashboard, API Gateway integration at /codearena, tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["All code submissions must be routed through Judge0 CE running in Docker with no host network access.","Execution time and memory hard limits are enforced at the container level, not only by Judge0.","Plagiarism detection runs asynchronously and does not block the submission flow.","Problem editorials are gated behind a configurable reveal policy set by the faculty author."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/codearena-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://code_user:pass@localhost:5435/code_db\n# JUDGE0_URL=http://localhost:2358  |  GEMINI_API_KEY=<key>\ndocker compose -f docker-compose.judge0.yml up -d\npnpm prisma migrate dev --name init\npnpm dev   # Port 4004")
out=os.path.join(BASE,"team04_CodeArena"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 4 CodeArena dossier saved.")
