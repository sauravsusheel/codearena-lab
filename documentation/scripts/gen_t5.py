from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE session_state AS ENUM (\'SCHEDULED\',\'WAITING\',\'LIVE\',\'PROCESSING\',\'COMPLETED\');\n'
    'CREATE TYPE eval_status   AS ENUM (\'PENDING\',\'AI_DONE\',\'FACULTY_REVIEWED\',\'FINALISED\');\n'
    'CREATE TABLE pres_sessions (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_code VARCHAR(16) NOT NULL,\n'
    '  faculty_id UUID NOT NULL, title VARCHAR(256) NOT NULL, scheduled_at TIMESTAMPTZ NOT NULL,\n'
    '  duration_mins INT DEFAULT 15, state session_state DEFAULT \'SCHEDULED\',\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE pres_slots (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  session_id UUID NOT NULL REFERENCES pres_sessions(id) ON DELETE CASCADE,\n'
    '  student_id UUID NOT NULL, slide_url VARCHAR(512), recording_url VARCHAR(512),\n'
    '  transcript TEXT, scheduled_start TIMESTAMPTZ NOT NULL,\n'
    '  started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ, UNIQUE(session_id, student_id)\n'
    ');\n'
    'CREATE TABLE pres_rubric_criteria (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  session_id UUID NOT NULL REFERENCES pres_sessions(id) ON DELETE CASCADE,\n'
    '  criterion_name VARCHAR(64) NOT NULL, max_score INT NOT NULL, description TEXT\n'
    ');\n'
    'CREATE TABLE pres_evaluations (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  slot_id UUID NOT NULL REFERENCES pres_slots(id) ON DELETE CASCADE,\n'
    '  criterion_id UUID NOT NULL REFERENCES pres_rubric_criteria(id),\n'
    '  ai_score NUMERIC(5,2), ai_justification TEXT, faculty_score NUMERIC(5,2),\n'
    '  faculty_comment TEXT, final_score NUMERIC(5,2), status eval_status DEFAULT \'PENDING\',\n'
    '  UNIQUE(slot_id, criterion_id)\n'
    ');'
)
doc=nd()
cv(doc,5,"PresentAI","AI-Evaluated Online Presentation and Viva System",4005,"pres_db",5436)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Presentation upload UI, live room interface, feedback viewer, evaluation dashboard","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","WebRTC signalling server, AI evaluation pipeline, scoring engine, session scheduling","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Docker, MinIO media storage, COTURN TURN server","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The PresentAI module facilitates AI-assisted evaluation of student oral presentations and viva-voce examinations conducted online. Students upload their slide deck (PDF or PPTX), deliver their presentation via WebRTC video, and receive structured AI-generated feedback on content coverage, delivery quality, and slide design. Faculty can review recordings, override AI scores per rubric criterion, and download structured evaluation reports.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (pres_db) on port 5436. The module API is served on port 4005. The Central API Gateway routes all /presentations/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Presentation Scheduling",2)
for x in ["Faculty creates a presentation session: title, course, date, time, and evaluation rubric criteria.","Student receives an in-app notification with the session link and assigned time slot.","Waiting room with countdown timer before the session opens.","Session recording begins automatically when the presenter joins."]: bl(doc,x)
hd(doc,"3.2 Live Presentation Room",2)
for x in ["WebRTC peer-to-peer video session mediated by a COTURN TURN server for NAT traversal.","Slide deck rendered in-browser alongside the live video stream of the presenter.","Faculty can raise a virtual hand to ask questions in viva mode.","Session is recorded server-side using the MediaRecorder API and stored in MinIO."]: bl(doc,x)
hd(doc,"3.3 AI Evaluation Pipeline",2)
bl(doc,"Uploaded slides are parsed and content quality assessed against course objectives using Gemini API.",px="Slide Content Analysis")
bl(doc,"Session audio is transcribed using Google Speech-to-Text API.",px="Speech Transcription")
bl(doc,"Transcribed text is analysed for filler words, coherence, and confidence indicators.",px="Delivery Analysis")
bl(doc,"AI assigns a score per rubric criterion (Content, Delivery, Q and A, Time Management) with written justification.",px="Rubric-Based Scoring")
hd(doc,"3.4 Evaluation Reports",2)
for x in ["Student receives a structured feedback PDF after evaluation: criterion scores, strengths, and improvement areas.","Faculty receives a class-wide evaluation summary for the batch.","All recordings are retained for 90 days and accessible to faculty via pre-signed URLs."]: bl(doc,x)
hd(doc,"4. Database Schema (pres_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the pres_db instance (Port 5436).")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/sessions","FACULTY","Create a presentation session with rubric"],
    ["GET","/api/v1/sessions/mine","STUDENT","View assigned presentation sessions"],
    ["POST","/api/v1/slots/:id/upload-slides","STUDENT","Upload slide deck (PDF or PPTX)"],
    ["GET","/api/v1/sessions/:id/room","Any","Get WebRTC signalling and ICE credentials"],
    ["POST","/api/v1/sessions/:id/evaluate","SYSTEM","Trigger AI evaluation pipeline post-session"],
    ["GET","/api/v1/evaluations/:slotId","STUDENT, FACULTY","View evaluation scores and AI feedback"],
    ["PUT","/api/v1/evaluations/:id/override","FACULTY","Override AI score for a specific criterion"],
    ["GET","/api/v1/reports/session/:id","FACULTY","Download class evaluation summary report"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.9,1.4,2.8])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, pres_db schema, session creation and listing API, MinIO bucket setup."],
    ["Sprint 2","3-4","Slide upload (PDF and PPTX), in-browser PDF rendering, scheduling with in-app notifications."],
    ["Sprint 3","5-6","WebRTC live room using simple-peer library, COTURN TURN server setup, server-side recording to MinIO."],
    ["Sprint 4","7-8","Google Speech-to-Text audio transcription, Gemini API content and delivery evaluation pipeline."],
    ["Sprint 5","9-10","Faculty evaluation dashboard, criterion-level score override, PDF feedback report generation."],
    ["Sprint 6","11-12","Class summary report, API Gateway integration at /presentations, TrackIt integration for viva, end-to-end tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["Session recordings are stored in a private MinIO bucket; access is mediated exclusively through pre-signed URLs.","WebRTC signalling server must validate the JWT token before issuing ICE credentials.","Slide upload is restricted to PDF and PPTX formats with a maximum file size of 50 MB.","All AI evaluation results are treated as draft until explicitly finalised by a faculty member."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/presentai-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://pres_user:pass@localhost:5436/pres_db\n# MINIO_ENDPOINT=localhost:9000  |  GEMINI_API_KEY=<key>\n# GOOGLE_CLOUD_KEY=<service_account_json_path>\npnpm prisma migrate dev --name init\npnpm dev   # Port 4005")
out=os.path.join(BASE,"team05_PresentationAI"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 5 PresentAI dossier saved.")
