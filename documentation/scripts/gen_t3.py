from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE question_type  AS ENUM (\'MCQ\',\'TRUE_FALSE\',\'SHORT\',\'DESCRIPTIVE\',\'CODE\');\n'
    'CREATE TYPE difficulty      AS ENUM (\'EASY\',\'MEDIUM\',\'HARD\');\n'
    'CREATE TYPE exam_status     AS ENUM (\'DRAFT\',\'SCHEDULED\',\'LIVE\',\'COMPLETED\',\'ARCHIVED\');\n'
    'CREATE TYPE attempt_status  AS ENUM (\'NOT_STARTED\',\'IN_PROGRESS\',\'SUBMITTED\',\'GRADED\');\n'
    'CREATE TABLE exam_questions (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_code VARCHAR(16) NOT NULL,\n'
    '  question_text TEXT NOT NULL, question_type question_type NOT NULL,\n'
    '  difficulty difficulty DEFAULT \'MEDIUM\', bloom_level VARCHAR(32),\n'
    '  marks INT NOT NULL DEFAULT 1, options JSONB, model_answer TEXT, grading_rubric TEXT,\n'
    '  tags TEXT[], created_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE exam_papers (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  course_code VARCHAR(16) NOT NULL, duration_mins INT NOT NULL,\n'
    '  total_marks INT NOT NULL, pass_marks INT NOT NULL,\n'
    '  scheduled_start TIMESTAMPTZ NOT NULL, scheduled_end TIMESTAMPTZ NOT NULL,\n'
    '  status exam_status DEFAULT \'DRAFT\', allow_retakes BOOLEAN DEFAULT FALSE,\n'
    '  created_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE exam_attempts (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  paper_id UUID NOT NULL REFERENCES exam_papers(id), student_id UUID NOT NULL,\n'
    '  started_at TIMESTAMPTZ DEFAULT NOW(), submitted_at TIMESTAMPTZ,\n'
    '  status attempt_status DEFAULT \'NOT_STARTED\', tab_switch_count INT DEFAULT 0,\n'
    '  proctoring_flags JSONB DEFAULT \'[]\', total_score NUMERIC(6,2),\n'
    '  UNIQUE(paper_id, student_id)\n'
    ');\n'
    'CREATE TABLE exam_responses (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,\n'
    '  question_id UUID NOT NULL, response_text TEXT, code_submission TEXT, language VARCHAR(16),\n'
    '  auto_score NUMERIC(5,2), ai_score NUMERIC(5,2), final_score NUMERIC(5,2),\n'
    '  faculty_override BOOLEAN DEFAULT FALSE, feedback TEXT, graded_at TIMESTAMPTZ\n'
    ');'
)
doc=nd()
cv(doc,3,"ExamShield","AI-Powered Secure Online Examination System",4003,"exam_db",5434)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Secure exam UI, proctoring overlay, result dashboards, faculty control panel","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Question bank APIs, exam engine, auto-grading, anti-cheat logic","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Docker, gVisor sandbox setup, Redis","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The ExamShield module is a fully proctored, AI-assisted examination platform supporting Traditional Theory Examinations (MCQ, short answer, descriptive) and Secure Coding Examinations with a browser-based Monaco IDE and a gVisor containerised sandbox. The system auto-grades objective questions and uses an AI evaluation pipeline via Google Gemini API for descriptive and coding submissions.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (exam_db) on port 5434. The module API is served on port 4003. The Central API Gateway routes all /exams/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Question Bank Management",2)
for x in ["CRUD for questions: MCQ, True/False, Short Answer, Descriptive, Code Challenge.","Bloom Taxonomy tagging per question: Remember, Understand, Apply, Analyse, Evaluate, Create.","Difficulty classification: Easy, Medium, Hard.","Bulk CSV import with duplicate detection.","Topic and subtopic categorisation with keyword search."]: bl(doc,x)
hd(doc,"3.2 Examination Configuration",2)
for x in ["Configurable parameters: duration, total marks, pass percentage, allowed attempts.","Randomised question ordering and answer shuffling per student.","Section-wise mark allocation.","Scheduled exam windows with auto-start and auto-submit on timer expiry."]: bl(doc,x)
hd(doc,"3.3 AI-Assisted Proctoring",2)
for x in ["Tab-switch detection: records every focus-loss event; alerts faculty after three occurrences.","Full-screen enforcement via the Fullscreen API.","Webcam snapshot capture every 60 seconds stored for faculty review.","Client-side AI face-presence detection using TensorFlow.js BlazeFace model.","Right-click and copy-paste keyboard shortcut blocking within the exam interface."]: bl(doc,x)
hd(doc,"3.4 Secure Coding Examination",2)
for x in ["Monaco Editor with syntax highlighting for Python, Java, C++, and JavaScript.","Code execution inside a gVisor sandbox container with complete kernel isolation.","Custom test case runner with stdout and stderr capture and execution time tracking.","AI-powered code quality review via Google Gemini API."]: bl(doc,x)
hd(doc,"3.5 Auto-Grading and AI Evaluation",2)
for x in ["MCQ and True/False: instant automated grading with negative marking support.","Descriptive answers: evaluated by Gemini API against model answer and rubric.","Coding submissions: test case pass rate and AI code quality score (70/30 weighted).","Faculty can override any AI-assigned mark with a mandatory written justification."]: bl(doc,x)
hd(doc,"4. Database Schema (exam_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the exam_db instance (Port 5434).")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/questions","FACULTY","Create a question in the question bank"],
    ["GET","/api/v1/questions","FACULTY","Search and filter question bank"],
    ["POST","/api/v1/papers","FACULTY","Create a new exam paper"],
    ["POST","/api/v1/papers/:id/publish","FACULTY","Schedule and publish an exam"],
    ["GET","/api/v1/papers/live","STUDENT","List currently available exams"],
    ["POST","/api/v1/attempts/start","STUDENT","Start an exam attempt"],
    ["PUT","/api/v1/attempts/:id/submit","STUDENT","Submit completed exam"],
    ["POST","/api/v1/attempts/:id/execute","STUDENT","Execute code in sandbox and return output"],
    ["GET","/api/v1/results/:studentId","STUDENT, FACULTY","View exam results and AI feedback"],
    ["PUT","/api/v1/responses/:id/override","FACULTY","Override AI-assigned mark with justification"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.8,1.4,2.9])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service setup, exam_db schema, JWT auth, question CRUD API, basic question bank UI."],
    ["Sprint 2","3-4","Exam paper creation, question assignment, randomisation logic, scheduled exam window configuration."],
    ["Sprint 3","5-6","Student exam interface, countdown timer, auto-submit on expiry, answer persistence on each navigation."],
    ["Sprint 4","7-8","Proctoring layer: tab-switch detection, fullscreen enforcement, webcam snapshots, TF.js face detection."],
    ["Sprint 5","9-10","Auto-grading pipeline for MCQ, Gemini API for descriptive and code evaluation, gVisor sandbox integration."],
    ["Sprint 6","11-12","Faculty override UI, result dashboards, API Gateway integration at /exams, end-to-end tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["The exam interface must enforce fullscreen mode; any exit must be logged as a proctoring flag.","Code submissions are executed exclusively inside gVisor sandbox containers with CPU and memory limits enforced.","Network access is completely disabled inside the sandbox execution environment.","Proctoring snapshots are stored in a private S3 bucket accessible only to faculty members."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/exam-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://exam_user:pass@localhost:5434/exam_db\n# GEMINI_API_KEY=<key>  |  REDIS_URL=redis://localhost:6381\npnpm prisma migrate dev --name init\npnpm dev   # Port 4003")
out=os.path.join(BASE,"team03_OnlineExams"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 3 ExamShield dossier saved.")
