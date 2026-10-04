from helpers import *

SQL_T8 = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE project_type     AS ENUM (\'MINI\',\'MAJOR\',\'RESEARCH\',\'OPEN_SOURCE\');\n'
    'CREATE TYPE project_stage    AS ENUM (\'PROPOSED\',\'UNDER_REVIEW\',\'APPROVED\',\'IN_PROGRESS\',\'UNDER_EVALUATION\',\'COMPLETED\',\'REJECTED\');\n'
    'CREATE TYPE intern_status    AS ENUM (\'REGISTERED\',\'OFFER_VERIFIED\',\'ONGOING\',\'MID_EVAL_DONE\',\'COMPLETED\',\'WITHDRAWN\');\n'
    'CREATE TYPE milestone_status AS ENUM (\'PENDING\',\'SUBMITTED\',\'REVIEWED\',\'MISSED\');\n'
    'CREATE TABLE track_projects (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  abstract TEXT NOT NULL, domain VARCHAR(64) NOT NULL, tech_stack TEXT[],\n'
    '  project_type project_type NOT NULL, stage project_stage DEFAULT \'PROPOSED\',\n'
    '  lead_student_id UUID NOT NULL, guide_faculty_id UUID,\n'
    '  academic_year VARCHAR(16) NOT NULL, semester VARCHAR(32) NOT NULL,\n'
    '  unihub_repo_id UUID, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE track_project_members (\n'
    '  project_id UUID NOT NULL REFERENCES track_projects(id) ON DELETE CASCADE,\n'
    '  student_id UUID NOT NULL, role VARCHAR(32) DEFAULT \'MEMBER\',\n'
    '  joined_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY(project_id, student_id)\n'
    ');\n'
    'CREATE TABLE track_milestones (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  project_id UUID NOT NULL REFERENCES track_projects(id) ON DELETE CASCADE,\n'
    '  title VARCHAR(128) NOT NULL, due_date DATE NOT NULL,\n'
    '  weightage NUMERIC(4,1) DEFAULT 10.0, status milestone_status DEFAULT \'PENDING\',\n'
    '  order_index INT NOT NULL\n'
    ');\n'
    'CREATE TABLE track_milestone_submissions (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  milestone_id UUID NOT NULL REFERENCES track_milestones(id) ON DELETE CASCADE,\n'
    '  submitted_by UUID NOT NULL, progress_text TEXT NOT NULL,\n'
    '  deliverable_url VARCHAR(512), submitted_at TIMESTAMPTZ DEFAULT NOW(),\n'
    '  score NUMERIC(5,2), faculty_feedback TEXT\n'
    ');\n'
    'CREATE TABLE track_mentor_logs (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  project_id UUID NOT NULL REFERENCES track_projects(id) ON DELETE CASCADE,\n'
    '  logged_by UUID NOT NULL, meeting_date DATE NOT NULL, duration_mins INT,\n'
    '  summary TEXT NOT NULL, action_items TEXT, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE track_evaluations (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  project_id UUID NOT NULL REFERENCES track_projects(id) ON DELETE CASCADE,\n'
    '  examiner_id UUID NOT NULL, examiner_role VARCHAR(32) NOT NULL,\n'
    '  report_score NUMERIC(5,2), presentation_score NUMERIC(5,2),\n'
    '  technical_score NUMERIC(5,2), innovation_score NUMERIC(5,2),\n'
    '  viva_score NUMERIC(5,2), total_score NUMERIC(5,2),\n'
    '  remarks TEXT, submitted_at TIMESTAMPTZ DEFAULT NOW(),\n'
    '  UNIQUE(project_id, examiner_id)\n'
    ');\n'
    'CREATE TABLE track_internships (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL,\n'
    '  company_name VARCHAR(256) NOT NULL, role_title VARCHAR(128) NOT NULL,\n'
    '  stipend_per_month NUMERIC(10,2), start_date DATE NOT NULL, end_date DATE NOT NULL,\n'
    '  offer_letter_url VARCHAR(512), status intern_status DEFAULT \'REGISTERED\',\n'
    '  coordinator_id UUID, final_grade VARCHAR(16), created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE track_intern_logs (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  internship_id UUID NOT NULL REFERENCES track_internships(id) ON DELETE CASCADE,\n'
    '  week_number INT NOT NULL, hours_worked INT NOT NULL,\n'
    '  tasks_completed TEXT NOT NULL, skills_acquired TEXT, challenges TEXT,\n'
    '  submitted_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(internship_id, week_number)\n'
    ');\n'
    'CREATE TABLE track_intern_evaluations (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  internship_id UUID NOT NULL REFERENCES track_internships(id) ON DELETE CASCADE,\n'
    '  evaluator_type VARCHAR(24) NOT NULL, attendance_score NUMERIC(5,2),\n'
    '  log_quality_score NUMERIC(5,2), performance_score NUMERIC(5,2),\n'
    '  remarks TEXT, submitted_at TIMESTAMPTZ DEFAULT NOW(),\n'
    '  UNIQUE(internship_id, evaluator_type)\n'
    ');'
)

doc=nd()
cv(doc,8,"TrackIt","Project and Internship Track Management System",4008,"track_db",5439)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Project registration UI, mentor dashboard, internship portal, progress timeline","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Project lifecycle API, internship verification, milestone engine, approval workflows","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Docker, MinIO file storage, notification service","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The TrackIt module is a comprehensive Project and Internship Track Management System managing the complete lifecycle of student academic projects (individual and team-based) and industry internship programmes. Students can register projects, submit periodic progress reports, request mentor guidance, and have their work evaluated by an assigned faculty committee. For internships, the module manages company onboarding, offer letter verification, weekly log submission, mid-term and final evaluations, and grade computation.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (track_db) on port 5439. The module API is served on port 4008. The Central API Gateway routes all /trackit/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Academic Project Registration and Lifecycle",2)
for x in [
    "Student or team lead registers a project: title, abstract, objectives, domain, technology stack, and expected outcomes.",
    "Faculty guide assignment: system suggests available guides based on domain expertise drawn from the HRMS module; student selects from the shortlist.",
    "Project status pipeline: Proposed, Under Review, Approved, In Progress, Under Evaluation, Completed.",
    "Project type classification: Mini Project, Major Project, Research Project, Open Source Contribution.",
    "Team-based projects support: up to 4 members per team with role designation (Lead or Member).",
    "Integration with UniHub module: upon completion, system automatically creates a repository entry in UniHub."
]: bl(doc,x)
hd(doc,"3.2 Progress Report and Milestone Tracking",2)
for x in [
    "Faculty guide defines a milestone plan with up to 8 configurable checkpoints: dates, expected deliverables, and weightage.",
    "Students submit milestone reports: written progress update and uploaded deliverable (PDF, ZIP, or GitHub URL).",
    "Faculty guide reviews each submission, assigns a numerical score, and provides written feedback.",
    "Missed milestone alerts sent to student and HOD via in-app notification.",
    "Gantt-style progress timeline visible to the student, guide, and HOD."
]: bl(doc,x)
hd(doc,"3.3 Mentor Interaction and Communication Log",2)
for x in [
    "Students can log mentor meeting records: date, duration, discussion summary, and action items.",
    "Faculty guide can post guidance notes and resource links on the project workspace.",
    "All communication is stored as a permanent, immutable audit trail.",
    "Student can raise a formal escalation if the guide is unresponsive for more than 14 days; escalates automatically to HOD."
]: bl(doc,x)
hd(doc,"3.4 Final Evaluation and Viva",2)
for x in [
    "Evaluation committee: Guide, Internal Examiner, and External Examiner, constituted per project.",
    "Structured marking rubric: Report Quality, Presentation, Technical Depth, Innovation, and Viva Performance.",
    "Each committee member submits marks independently; system computes weighted average.",
    "Integration with PresentAI module: final viva can be conducted via the online presentation room.",
    "Grade computation: Distinction (above 85%), Merit (above 70%), Pass (above 50%), Fail (below 50%).",
    "Automatically generated project completion certificate upon passing evaluation."
]: bl(doc,x)
hd(doc,"3.5 Internship Management",2)
for x in [
    "Student submits internship registration: company name, role title, stipend (optional), start and end dates.",
    "Admin verifies the offer letter PDF against a university-approved company whitelist.",
    "Faculty internship coordinator is assigned per student for the duration of the internship.",
    "Weekly log submission: hours worked, tasks completed, skills acquired, and challenges faced.",
    "Mid-internship and final evaluation forms submitted by company supervisor and faculty coordinator.",
    "Internship grade computation: Attendance (20%), Log Quality (20%), Supervisor Rating (30%), Faculty Rating (30%).",
    "Internship completion certificate generated and stored in the student profile."
]: bl(doc,x)
hd(doc,"3.6 Reporting and Analytics",2)
for x in [
    "HOD dashboard: all active projects and internships in the department with status distribution chart.",
    "Faculty workload report: number of projects being guided per faculty member.",
    "Departmental analytics: domain-wise project distribution, completion rate, average milestone adherence score.",
    "Internship analytics: company-wise placement count, average stipend, domain distribution."
]: bl(doc,x)
hd(doc,"4. Database Schema (track_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the track_db instance (Port 5439).")
cb(doc,SQL_T8)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/projects","STUDENT","Register a new academic project"],
    ["GET","/api/v1/projects/mine","STUDENT","List own projects with current stage"],
    ["GET","/api/v1/projects","FACULTY, HOD","List all projects in department"],
    ["PUT","/api/v1/projects/:id/approve","HOD","Approve or reject a project proposal"],
    ["POST","/api/v1/milestones","FACULTY","Create milestone plan for a project"],
    ["POST","/api/v1/milestones/:id/submit","STUDENT","Submit milestone deliverable"],
    ["PUT","/api/v1/milestones/:id/review","FACULTY","Score and provide feedback on milestone"],
    ["POST","/api/v1/projects/:id/mentor-log","STUDENT, FACULTY","Log a mentor meeting record"],
    ["POST","/api/v1/projects/:id/evaluate","FACULTY","Submit evaluation committee marks"],
    ["GET","/api/v1/projects/:id/final-grade","STUDENT, FACULTY","Get computed final grade"],
    ["POST","/api/v1/internships","STUDENT","Register an internship"],
    ["PUT","/api/v1/internships/:id/verify","ADMIN","Verify offer letter and approve internship"],
    ["POST","/api/v1/internships/:id/weekly-log","STUDENT","Submit weekly internship log"],
    ["POST","/api/v1/internships/:id/evaluate","FACULTY","Submit internship evaluation"],
    ["GET","/api/v1/analytics/projects","HOD, DEAN","Departmental project analytics dashboard"],
    ["GET","/api/v1/analytics/internships","HOD, DEAN","Departmental internship analytics dashboard"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.8,1.5,2.8])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, track_db schema migration, JWT auth middleware, project registration and listing API."],
    ["Sprint 2","3-4","HOD approval workflow, faculty guide assignment using domain matching via HRMS API, project status pipeline."],
    ["Sprint 3","5-6","Milestone plan creation by faculty, student milestone submission, review and scoring API."],
    ["Sprint 4","7-8","Gantt timeline UI, mentor meeting log, missed milestone BullMQ alert, student project dashboard."],
    ["Sprint 5","9-10","Internship registration, offer letter upload to MinIO, admin verification workflow, weekly log submission."],
    ["Sprint 6","11-12","Evaluation committee marks, final grade computation, internship evaluation, analytics dashboards, API Gateway integration at /trackit."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in [
    "Offer letter documents are stored in a private MinIO bucket and accessible only via pre-signed URLs.",
    "Evaluation marks submitted by committee members are immutable once submitted; amendments require HOD override with audit log entry.",
    "Project proposals are not visible to other students until formally approved by HOD.",
    "All cross-module calls to HRMS and PresentAI use the internal Gateway token exclusively.",
    "Internship grade and certificate are finalised only after both supervisor and coordinator evaluations are submitted."
]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/trackit-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://track_user:pass@localhost:5439/track_db\n# REDIS_URL=redis://localhost:6384  |  MINIO_ENDPOINT=localhost:9000\n# INTERNAL_GATEWAY_TOKEN=<shared_secret>\npnpm prisma migrate dev --name init\npnpm dev   # Port 4008")
hd(doc,"9. Integration Points with Other Modules")
tb(doc,["Dependency Module","Integration Purpose","Method"],[
    ["HRMS (Team 1)","Suggest faculty guides by domain expertise from faculty profile data","GET /api/v1/faculty via Gateway"],
    ["PresentAI (Team 5)","Conduct final viva in the online presentation room","POST /api/v1/sessions via Gateway"],
    ["UniHub (Team 7)","Create a repository entry automatically when project is marked Completed","POST /api/v1/projects via Gateway"],
    ["CampusBot (Team 6)","Bot can answer student queries about project deadlines and internship status","GET /api/v1/projects/mine via Gateway"],
],ws=[1.6,3.2,2.2])
out=os.path.join(BASE,"team08_ProjectInternshipTrack")
os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx"))
print("Team 8 TrackIt dossier saved.")
