from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE user_role     AS ENUM (\'SUPER_ADMIN\',\'DEAN\',\'HOD\',\'FACULTY\',\'STAFF\');\n'
    'CREATE TYPE leave_status  AS ENUM (\'PENDING_HOD\',\'PENDING_DEAN\',\'PENDING_REGISTRAR\',\'APPROVED\',\'REJECTED\',\'CANCELLED\');\n'
    'CREATE TYPE tenure_status AS ENUM (\'PROBATION\',\'CONFIRMED\',\'SENIOR\',\'PROFESSOR\',\'EMERITUS\');\n'
    'CREATE TABLE hrms_users (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL,\n'
    '  password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(128) NOT NULL,\n'
    '  role user_role NOT NULL, dept_code VARCHAR(16) NOT NULL, dept_name VARCHAR(128) NOT NULL,\n'
    '  is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE hrms_faculty_profiles (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  user_id UUID UNIQUE NOT NULL REFERENCES hrms_users(id) ON DELETE CASCADE,\n'
    '  designation VARCHAR(64) NOT NULL, tenure_status tenure_status DEFAULT \'PROBATION\',\n'
    '  date_of_joining DATE NOT NULL, base_salary NUMERIC(12,2) NOT NULL,\n'
    '  max_teaching_credits INT DEFAULT 16, phone VARCHAR(16), profile_photo_url VARCHAR(512),\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE hrms_leave_requests (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  user_id UUID NOT NULL REFERENCES hrms_users(id) ON DELETE CASCADE,\n'
    '  leave_type VARCHAR(32) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL,\n'
    '  days_requested INT NOT NULL, reason TEXT NOT NULL, status leave_status DEFAULT \'PENDING_HOD\',\n'
    '  hod_action_at TIMESTAMPTZ, dean_action_at TIMESTAMPTZ,\n'
    '  approved_by UUID REFERENCES hrms_users(id), rejection_reason TEXT,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE hrms_payroll_records (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  user_id UUID NOT NULL REFERENCES hrms_users(id) ON DELETE CASCADE,\n'
    '  month_year VARCHAR(16) NOT NULL, basic_pay NUMERIC(12,2) NOT NULL,\n'
    '  hra NUMERIC(10,2) DEFAULT 0, da NUMERIC(10,2) DEFAULT 0,\n'
    '  pf_deduction NUMERIC(10,2) DEFAULT 0, tds NUMERIC(10,2) DEFAULT 0,\n'
    '  net_pay NUMERIC(12,2) NOT NULL, pdf_payslip_url VARCHAR(512),\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, month_year)\n'
    ');\n'
    'CREATE TABLE hrms_audit_logs (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  actor_id UUID NOT NULL REFERENCES hrms_users(id),\n'
    '  action VARCHAR(64) NOT NULL, table_name VARCHAR(64) NOT NULL, record_id UUID,\n'
    '  payload_diff JSONB, ip_address VARCHAR(45), timestamp TIMESTAMPTZ DEFAULT NOW()\n'
    ');'
)
doc=nd()
cv(doc,1,"EduHRMS","Human Resource Management System",4001,"hrms_db",5432)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Next.js pages, UI components, forms, faculty and staff dashboards","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Express.js controllers, business logic, leave state machines","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Docker, RBAC middleware, payslip pipeline","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The EduHRMS module is a complete, production-grade Human Resource Management System designed exclusively for academic institutions. It manages the full lifecycle of faculty and administrative staff from onboarding to payroll generation, replacing paper-based HR processes with automated, auditable digital workflows.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (hrms_db) on port 5432. The module is exposed via REST API on port 4001. The Central API Gateway routes all /hrms/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Faculty and Staff Profiles",2)
for x in ["Digital dossier: full name, designation, qualification, department, emergency contacts.","Tenure timeline: Probation, Confirmed, Senior, Professor, Emeritus.","Document attachments: joining letter, qualification certificates, research publications.","Profile photo upload with server-side crop and resize."]: bl(doc,x)
hd(doc,"3.2 Leave Management System",2)
for x in ["Leave types: Casual (CL), Medical (ML), Duty (DL), Sabbatical, Maternity and Paternity.","Multi-tier digital approval chain: Faculty to HOD to Dean to Registrar.","Real-time leave balance calculator updated instantly upon approval.","Rejection workflows with mandatory comment fields.","Auto-escalation if HOD does not act within 48 hours (BullMQ cron job)."]: bl(doc,x)
hd(doc,"3.3 Academic Workload and Subject Allocation",2)
for x in ["Credit-hour allocation dashboard per faculty per semester.","Maximum credit cap enforcement (default: 16 credits per semester).","Conflict detection if a faculty member is assigned the same lecture slot twice.","Lab, tutorial, and committee assignment tracking."]: bl(doc,x)
hd(doc,"3.4 Payroll and Compensation Engine",2)
for x in ["Monthly automated salary computation: basic pay, HRA, DA, research allowance.","Configurable deduction slabs: PF, Professional Tax, TDS.","Arrears and annual increment management.","Auto-generated PDF payslip download, watermarked and date-stamped."]: bl(doc,x)
hd(doc,"3.5 Staff Attendance and Analytics",2)
for x in ["IP-whitelisted portal attendance marking on dashboard access.","Manual attendance regularisation request workflow.","Department-wise staffing headcount and absenteeism trend charts.","Payroll expenditure versus budget variance graph."]: bl(doc,x)
hd(doc,"4. Database Schema (hrms_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the hrms_db instance (Port 5432).")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/auth/login","Public","Faculty and staff login, returns JWT access token"],
    ["GET","/api/v1/profile/me","Any","Get authenticated user profile"],
    ["PUT","/api/v1/profile/me","Any","Update personal information"],
    ["GET","/api/v1/faculty","HOD, DEAN","List all faculty in department"],
    ["POST","/api/v1/leaves/apply","FACULTY, STAFF","Submit leave request"],
    ["PUT","/api/v1/leaves/:id/approve","HOD, DEAN","Approve or reject leave"],
    ["POST","/api/v1/workload","HOD","Create workload allocation entry"],
    ["GET","/api/v1/payroll/:userId/slips","Self, ADMIN","List payslips for user"],
    ["GET","/api/v1/payroll/:id/pdf","Self, ADMIN","Download PDF payslip"],
    ["GET","/api/v1/analytics/staffing","DEAN","Department staffing analytics dashboard"],
    ["GET","/api/v1/faculty/:userId/profile-summary","Gateway","Public contract for other modules"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.8,1.5,2.8])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Monorepo setup, hrms_db schema migration, JWT auth endpoint, faculty profile CRUD foundation."],
    ["Sprint 2","3-4","Staff profile listing and editing, leave application API with balance validation, leave listing and filtering."],
    ["Sprint 3","5-6","Multi-tier leave approval state machine, BullMQ auto-escalation job, HOD and Dean approval dashboard."],
    ["Sprint 4","7-8","Workload allocation CRUD with credit-cap enforcement, payroll computation engine, PDF payslip generation."],
    ["Sprint 5","9-10","RBAC middleware, Jest unit tests (greater than 80 percent coverage), immutable audit log, Docker Compose setup."],
    ["Sprint 6","11-12","UI polish using shared component library, API Gateway integration at /hrms, health check, end-to-end tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["All routes except /auth/login must validate the JWT Bearer token.","The password_hash field must never be returned in any API response.","Payroll data is restricted to the employee themselves and SUPER_ADMIN role only.","All payslip PDF URLs must be pre-signed S3 URLs with a 30-minute expiration.","All sensitive modifications must write an entry to hrms_audit_logs.","CSRF protection must be enabled on all state-mutating endpoints."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/hrms-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://hrms_user:pass@localhost:5432/hrms_db\n# REDIS_URL=redis://localhost:6379  |  JWT_SECRET=<secret>\npnpm prisma migrate dev --name init\npnpm dev   # Port 4001")
out=os.path.join(BASE,"team01_HRMS"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 1 HRMS dossier saved.")
