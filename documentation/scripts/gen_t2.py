from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE TYPE session_status AS ENUM (\'SCHEDULED\',\'OPEN\',\'CLOSED\',\'CANCELLED\');\n'
    'CREATE TYPE attend_mode    AS ENUM (\'QR\',\'GPS\',\'MANUAL\',\'REGULARIZED\');\n'
    'CREATE TYPE attend_value   AS ENUM (\'PRESENT\',\'ABSENT\',\'LATE\');\n'
    'CREATE TABLE attend_courses (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_code VARCHAR(16) UNIQUE NOT NULL,\n'
    '  course_name VARCHAR(128) NOT NULL, batch VARCHAR(32) NOT NULL, semester VARCHAR(32) NOT NULL,\n'
    '  faculty_id UUID NOT NULL, max_students INT DEFAULT 60, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE attend_sessions (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  course_id UUID NOT NULL REFERENCES attend_courses(id) ON DELETE CASCADE,\n'
    '  session_date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL,\n'
    '  room_code VARCHAR(16), geo_lat NUMERIC(9,6), geo_lng NUMERIC(9,6), geo_radius_m INT DEFAULT 50,\n'
    '  qr_token_hash VARCHAR(64), qr_token_expiry TIMESTAMPTZ,\n'
    '  status session_status DEFAULT \'SCHEDULED\', opened_by UUID, opened_at TIMESTAMPTZ,\n'
    '  closed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE attend_records (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  session_id UUID NOT NULL REFERENCES attend_sessions(id) ON DELETE CASCADE,\n'
    '  student_id UUID NOT NULL, student_roll_no VARCHAR(32) NOT NULL,\n'
    '  status attend_value NOT NULL DEFAULT \'ABSENT\', mode attend_mode NOT NULL,\n'
    '  device_lat NUMERIC(9,6), device_lng NUMERIC(9,6), marked_at TIMESTAMPTZ DEFAULT NOW(),\n'
    '  UNIQUE(session_id, student_id)\n'
    ');\n'
    'CREATE TABLE attend_regularisation (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL,\n'
    '  session_id UUID NOT NULL REFERENCES attend_sessions(id),\n'
    '  reason TEXT NOT NULL, evidence_url VARCHAR(512), status VARCHAR(16) DEFAULT \'PENDING\',\n'
    '  reviewed_by UUID, review_comment TEXT, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');'
)
doc=nd()
cv(doc,2,"SmartAttend","Smart Student Attendance Tracking System",4002,"attend_db",5433)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Next.js dashboards, QR scanner UI, shortage report views","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Express.js APIs, geofencing validation logic, attendance engine","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Redis QR whitelist, Docker Compose","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The SmartAttend module provides a multi-mode, tamper-proof student attendance tracking system supporting QR code-based attendance per lecture, GPS geofencing verification, manual override workflows, and real-time attendance summaries per course. The system generates shortage reports and triggers academic alerts automatically when a student falls below the 75 percent attendance threshold.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (attend_db) on port 5433. The module API is served on port 4002. The Central API Gateway routes all /attendance/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Multi-Mode Attendance Collection",2)
bl(doc,"Lecturer generates a session-specific, time-limited QR code valid for 90 seconds. The payload is HMAC-SHA256 signed and stored in Redis to prevent replay attacks.",px="QR Code Mode")
bl(doc,"Validates student device coordinates via the browser Geolocation API against the classroom registered GPS polygon. Only students within a 50-metre radius can mark attendance.",px="GPS Geofencing")
bl(doc,"Faculty can manually mark students present or absent with a mandatory reason field and HOD approval step.",px="Manual Override")
hd(doc,"3.2 Session Lifecycle Management",2)
for x in ["Faculty opens an attendance session; session ID, course, batch, room, and timestamps are recorded.","Students mark attendance within the active session window.","Faculty closes the session; all marks after closure are blocked at the API level."]: bl(doc,x)
hd(doc,"3.3 Reports and Shortage Alerts",2)
for x in ["Student view: cumulative percentage per course, session-by-session attendance history.","Faculty view: class-by-class breakdown, absent and present counts per session.","HOD and Dean view: department-wide compliance and below-threshold flags.","Automated shortage alert when a student drops below 75 percent in any course."]: bl(doc,x)
hd(doc,"3.4 Regularisation Workflow",2)
for x in ["Students submit regularisation requests for medical emergencies with evidence upload.","Faculty to HOD multi-tier approval chain.","Approved regularisations are reflected immediately in attendance percentage calculations."]: bl(doc,x)
hd(doc,"4. Database Schema (attend_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the attend_db instance (Port 5433).")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/sessions/open","FACULTY","Open a new attendance session"],
    ["POST","/api/v1/sessions/:id/qr-generate","FACULTY","Generate HMAC-signed time-limited QR token"],
    ["POST","/api/v1/sessions/:id/close","FACULTY","Close the active attendance session"],
    ["POST","/api/v1/attend/mark","STUDENT","Mark attendance via QR payload or GPS coordinates"],
    ["GET","/api/v1/attend/student/:id","STUDENT, HOD","Student attendance summary per course"],
    ["GET","/api/v1/attend/session/:id","FACULTY, HOD","Session-wise present and absent list"],
    ["POST","/api/v1/regularisation","STUDENT","Submit regularisation request with evidence"],
    ["PUT","/api/v1/regularisation/:id","FACULTY, HOD","Approve or reject regularisation request"],
    ["GET","/api/v1/reports/shortage","HOD, DEAN","Below-threshold shortage report"],
    ["GET","/api/v1/student/:id/attendance-summary","Gateway","Public contract for other modules"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.9,1.4,2.8])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, attend_db schema, JWT auth middleware, session open and list endpoints."],
    ["Sprint 2","3-4","HMAC-SHA256 QR generation, Redis whitelist, attendance mark endpoint with replay prevention, QR scanner UI."],
    ["Sprint 3","5-6","Browser Geolocation API integration, Haversine server-side validation, classroom GPS admin panel."],
    ["Sprint 4","7-8","Materialised view refresh cron, shortage alert job via BullMQ, PDF and CSV report generation."],
    ["Sprint 5","9-10","Regularisation workflow with file upload, Jest unit tests, rate-limiting on mark endpoint."],
    ["Sprint 6","11-12","API Gateway registration at /attendance, public contract endpoint, health check, integration tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["QR tokens expire in 90 seconds and are single-use; each token is invalidated in Redis immediately after first use.","GPS coordinates are validated exclusively on the server side using the Haversine formula.","The UNIQUE constraint on (session_id, student_id) prevents duplicate records at the database level.","Rate-limiting: maximum one mark request per student per session."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/attendance-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://attend_user:pass@localhost:5433/attend_db\n# REDIS_URL=redis://localhost:6380  |  JWT_SECRET=<secret>\npnpm prisma migrate dev --name init\npnpm dev   # Port 4002")
out=os.path.join(BASE,"team02_SmartAttendance"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 2 SmartAttendance dossier saved.")
