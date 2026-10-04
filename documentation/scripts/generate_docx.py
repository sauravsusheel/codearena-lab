import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def add_callout(doc, text, title="SECURITY & ARCHITECTURE NOTE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="1F4E79"/>'
                        f'<w:top w:val="none"/>'
                        f'<w:right w:val="none"/>'
                        f'<w:bottom w:val="none"/>'
                        f'</w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_title = p.add_run(f"[{title}]\n")
    run_title.bold = True
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(10)
    run_title.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    run_body = p.add_run(text)
    run_body.font.name = "Calibri"
    run_body.font.size = Pt(9.5)
    run_body.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def style_table(table, header_bg="1F4E79", alt_bg="F9FAFB", col_widths=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        for j, cell in enumerate(row.cells):
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            if col_widths and j < len(col_widths):
                cell.width = col_widths[j]
            
            tcPr = cell._element.get_or_add_tcPr()
            borders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                                f'<w:left w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                                f'<w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                                f'</w:tcBorders>')
            tcPr.append(borders)
            
            if i == 0:
                set_cell_background(cell, header_bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(4)
                    p.paragraph_format.space_after = Pt(4)
                    for r in p.runs:
                        r.bold = True
                        r.font.name = "Calibri"
                        r.font.size = Pt(10)
                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                bg = alt_bg if i % 2 == 1 else "FFFFFF"
                set_cell_background(cell, bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    for r in p.runs:
                        r.font.name = "Calibri"
                        r.font.size = Pt(9.5)
                        r.font.color.rgb = RGBColor(0x1A, 0x20, 0x2C)

def create_document():
    doc = docx.Document()
    
    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    
    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("UNISPHERE: ENTERPRISE UNIFIED UNIVERSITY PORTAL")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(23)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(14)
    run_sub = subtitle_p.add_run("Master System Architecture, Student Team Implementation Blueprint & Cybersecurity Audit\nIncludes HRMS, Smart Attendance, AI Exams, Code Judge, AI Presentation Evaluator, RAG Bot & UniHub Repo\nVersion 2.5 | Production-Ready Engineering Specification")
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)
    
    add_callout(doc, 
                "Authoritative Engineering Mandate: This specification governs the architecture and end-stage integration for 7 specialized modules built by 7 independent student teams (3 students per team). All modules adhere to unified Next.js/Express standards, normalized PostgreSQL 16 schemas, hardened Docker sandboxing, and zero-trust authentication.",
                "SENIOR LEAD ARCHITECT MANDATE")

    # =========================================================================
    # SECTION 1: MASTER SYSTEM ARCHITECTURE & 7-MODULE INTEGRATION BLUEPRINT
    # =========================================================================
    h1 = doc.add_heading("1. Executive Blueprint & Master System Architecture", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "UniSphere integrates seven mission-critical university subsystems into a high-performance digital ecosystem: "
        "(1) Academic HRMS & Workforce, (2) Smart Student Attendance Tracking & Exam Eligibility Gate, "
        "(3) AI-Proctored Secure Online Examination Suite, (4) Interactive Code Execution Arena & Auto-Judge, "
        "(5) AI-Powered Online Presentation & Virtual Viva Voce Evaluation Platform, (6) Institutional Knowledge RAG AI Assistant, "
        "and (7) UniHub Institutional Code Repository & Research Publication Archive. "
        "Each module is engineered by a separate 3-student team using identical technical conventions and coordinated through a Monorepo workspace."
    )
    
    doc.add_heading("1.1 7-Module Global Architecture Diagram (Mermaid / Component View)", level=2)
    
    mermaid_code = (
        "```mermaid\n"
        "graph TB\n"
        "    subgraph PresentationTier [Unified Presentation Layer]\n"
        "        WebShell[Unified Next.js 14 Web Portal - Tailwind CSS / Shadcn UI]\n"
        "        MobilePWA[Responsive Mobile Web & PWA Client]\n"
        "    end\n\n"
        "    subgraph IngressGateway [Security & Ingress Gateway]\n"
        "        Proxy[NGINX / Traefik Reverse Proxy & TLS 1.3 Termination]\n"
        "        APIGateway[Central API Gateway - JWT RBAC / Rate Limiter / CSRF]\n"
        "    end\n\n"
        "    subgraph Microservices [7 Decoupled Microservice Modules - 3 Students Each]\n"
        "        M1[Module 1: Academic HRMS & Staff Attendance]\n"
        "        M2[Module 2: Smart Student Attendance & Dynamic QR Gate]\n"
        "        M3[Module 3: AI-Proctored Examination Suite]\n"
        "        M4[Module 4: Code Arena & Auto-Judge Sandbox]\n"
        "        M5[Module 5: AI Online Presentation & Viva Evaluator]\n"
        "        M6[Module 6: RAG Campus Knowledge Assistant]\n"
        "        M7[Module 7: UniHub Git & Research Archive]\n"
        "    end\n\n"
        "    subgraph DataStorageTier [Persistence, Compute & Sandbox Tier]\n"
        "        PGSQL[(PostgreSQL 16 Enterprise + pgvector)]\n"
        "        RedisStore[(Redis 7.2 - Dynamic QR Nonces / BullMQ / Session Cache)]\n"
        "        DockerSandbox[Docker Container Runner - gVisor runsc / cgroups]\n"
        "        ObjectStore[MinIO / S3 - Encrypted Video, Slides, Git & PDFs]\n"
        "    end\n\n"
        "    WebShell --> Proxy\n"
        "    MobilePWA --> Proxy\n"
        "    Proxy --> APIGateway\n"
        "    APIGateway --> M1 & M2 & M3 & M4 & M5 & M6 & M7\n"
        "    M1 & M2 & M3 & M4 & M5 & M6 & M7 --> PGSQL\n"
        "    M2 & M3 & M4 & M5 & M6 --> RedisStore\n"
        "    M4 --> DockerSandbox\n"
        "    M5 & M7 --> ObjectStore\n"
        "    M2 -.->|Automated Eligibility Lock| M3\n"
        "```"
    )
    p_code = doc.add_paragraph(mermaid_code)
    p_code.paragraph_format.space_before = Pt(4)
    p_code.paragraph_format.space_after = Pt(8)
    for r in p_code.runs:
        r.font.name = "Consolas"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    doc.add_heading("1.2 Unified Technology Stack Rationale", level=2)
    
    stack_table = doc.add_table(rows=7, cols=3)
    stack_headers = ["Layer", "Standardized Technology", "Engineering Justification"]
    for j, h in enumerate(stack_headers):
        stack_table.cell(0, j).paragraphs[0].text = h
    
    stack_data = [
        ["Frontend UI", "Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion", "Unified styling tokens, WCAG 2.1 AA accessibility, SSR performance, zero layout shift."],
        ["Backend APIs", "Node.js 20 LTS, Express.js (TypeScript), Zod Schema Validation", "Non-blocking high concurrency, end-to-end type sharing with frontend, structured JSON APIs."],
        ["AI & Multi-Modal", "Python 3.11, FastAPI, Whisper/Vosk (Speech), MediaPipe (Vision), LangChain", "Real-time speech-to-text, eye contact/gaze metrics, and context-grounded RAG embeddings."],
        ["Streaming Video", "WebRTC (LiveKit / Mediasoup) + PDF.js", "Ultra-low-latency real-time video/audio streaming with synchronized slide deck broadcast."],
        ["Database Tier", "PostgreSQL 16 (with pgvector extension), Prisma ORM", "Relational BCNF schemas, ACID transactions, and native HNSW vector similarity search."],
        ["In-Memory & Queues", "Redis 7.2 (BullMQ for background tasks)", "5-second rotating QR nonce validation, rate-limiting, and async code execution worker queues."]
    ]
    for i, row in enumerate(stack_data):
        for j, val in enumerate(row):
            stack_table.cell(i+1, j).paragraphs[0].text = val
    style_table(stack_table, col_widths=[Inches(1.5), Inches(2.2), Inches(2.8)])

    # =========================================================================
    # SECTION 2: 3-STUDENT TEAM ASSIGNMENTS (7 TEAMS)
    # =========================================================================
    doc.add_page_break()
    h2 = doc.add_heading("2. Team Organization & Role Distribution (3 Students per Module)", level=1)
    h2.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    teams = [
        {
            "num": "Team 1",
            "name": "Enterprise Academic HRMS & Staff Attendance (EduHRMS)",
            "s1": "Student 1 (Frontend & UX Lead): Develops faculty/staff dossiers, leave application dialogs, attendance check-in UI with geo-location verification, and workforce analytics dashboards.",
            "s2": "Student 2 (Backend & API Architect): Implements multi-tier leave approval state machine (Faculty -> HOD -> Dean), payroll engine with PF/tax deductions, and workload credit balancing algorithms.",
            "s3": "Student 3 (DevOps, Database & Security): Architects normalized PostgreSQL HR schema, builds automated PDF payslip generation pipeline (PDFKit), establishes RBAC middleware, and conducts audit logging."
        },
        {
            "num": "Team 2",
            "name": "Smart Campus Student Attendance Tracking & Exam Eligibility (EduAttend AI)",
            "s1": "Student 1 (Frontend & Scanner UX Lead): Builds dynamic rotating QR display console for classroom projectors, mobile QR scanner with camera permissions, and student course-wise attendance tracking cards.",
            "s2": "Student 2 (Backend & Geo-Fencing Architect): Implements 5-second rotating HMAC-SHA256 QR nonces in Redis, geofencing polygon validator, and automated exam eligibility calculation service (75% rule).",
            "s3": "Student 3 (AI Vision, Security & Condonation Lead): Deploys MediaPipe facial recognition kiosk with liveness blink verification, builds medical certificate OCR upload workflow, and configures defaulter SMS/email alerts."
        },
        {
            "num": "Team 3",
            "name": "AI-Proctored Intelligent Examination Suite (EduExam AI)",
            "s1": "Student 1 (Frontend & Exam Shell Lead): Builds full-screen lockdown test environment, disables keyboard shortcuts/tab switching, and creates interactive question renderer (LaTeX/KaTeX formulas).",
            "s2": "Student 2 (Backend & Realtime Telemetry): Develops question bank shuffler, time-synchronized WebSocket heartbeat, incremental answer auto-save (IndexedDB + REST), and auto-grading engine.",
            "s3": "Student 3 (AI Proctoring & Integrity Lead): Implements client-side MediaPipe/TensorFlow.js face & gaze tracking, audio noise analyzer, integrity violation snapshot aggregator, and risk rating generator."
        },
        {
            "num": "Team 4",
            "name": "Cloud-Based Code Execution Arena, Auto-Judge & Plagiarism Engine (EduCode Judge)",
            "s1": "Student 1 (Frontend & IDE Architect): Integrates Monaco Editor with syntax highlighting, custom themes, stdin input panels, real-time stdout console, and competitive practice leaderboards.",
            "s2": "Student 2 (Judge Backend & Task Queues): Builds BullMQ distributed worker queue, manages test-case evaluation logic, and formats execution verdicts (Accepted, WA, TLE, Memory Limit Exceeded).",
            "s3": "Student 3 (Sandbox Security & AST Plagiarism): Deploys isolated Docker container runners with strict cgroups memory/CPU limits, no-network jail, and builds Python AST tokenization code similarity checker."
        },
        {
            "num": "Team 5",
            "name": "AI-Powered Online Presentation, Virtual Viva & Multi-Modal Evaluator (EduPresent AI)",
            "s1": "Student 1 (WebRTC Studio & Presentation UX Lead): Builds live WebRTC presentation stage, synchronized PDF/PPTX slide viewer with presenter laser pointer, and interactive evaluator scoring panel.",
            "s2": "Student 2 (Multi-Modal AI Pipeline Architect): Implements audio transcription (Whisper/Vosk), calculates words-per-minute pace, detects filler words ('um', 'like'), and builds AI viva question generator.",
            "s3": "Student 3 (Computer Vision & Slide Alignment Specialist): Deploys MediaPipe eye contact and posture tracking, computes semantic alignment between speech and slide text via embeddings, and generates PDF dossiers."
        },
        {
            "num": "Team 6",
            "name": "Institutional Knowledge Base & Conversational AI Assistant (EduAssist AI)",
            "s1": "Student 1 (Conversational UX Lead): Creates streaming AI chat interface with markdown formatting, syntax-highlighted code blocks, citation link popups, and interactive tutor mode controls.",
            "s2": "Student 2 (RAG Pipeline & Document Ingestion): Implements PDF/Docx text extraction, semantic chunking, embedding generation, hybrid search orchestration, and helpdesk escalation ticketing.",
            "s3": "Student 3 (Vector Database & Prompt Security): Configures PostgreSQL `pgvector` with HNSW cosine indexes, role-scoped data partitions, system prompt injection filters, and latency benchmarking."
        },
        {
            "num": "Team 7",
            "name": "Institutional Code Repository, Research Archive & Innovation Network (UniHub)",
            "s1": "Student 1 (Git Web UI & Discovery Lead): Builds file tree navigation, visual commit branch graphs, side-by-side code diff viewer, PDF research manuscript reader, and student project showcases.",
            "s2": "Student 2 (Git Engine & Paper Indexer): Implements Git HTTP smart protocol backend (packfiles, commits, trees), BibTeX citation generator, and manuscript metadata extraction pipeline.",
            "s3": "Student 3 (Storage, Activity Feeds & Security): Sets up MinIO S3 object storage for Git bare repositories & PDF papers, builds real-time campus activity event stream, and enforces repo access control."
        }
    ]
    
    for t in teams:
        doc.add_heading(f"{t['num']}: {t['name']}", level=2)
        p1 = doc.add_paragraph(t['s1'])
        p1.paragraph_format.space_after = Pt(2)
        p2 = doc.add_paragraph(t['s2'])
        p2.paragraph_format.space_after = Pt(2)
        p3 = doc.add_paragraph(t['s3'])
        p3.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # SECTION 3: DATABASE SCHEMA & ENTITY-RELATIONSHIP (ER) STRATEGY
    # =========================================================================
    doc.add_page_break()
    h3 = doc.add_heading("3. Database Schema & Entity-Relationship (ER) Strategy", level=1)
    h3.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "The UniSphere database architecture is built on PostgreSQL 16 with UUIDv7 primary keys and BCNF normalization. "
        "The schema integrates transactional workflows across HR, smart student attendance, proctored exams, code sandbox, "
        "multi-modal presentations, and Git repositories with AI vector embeddings."
    )
    
    doc.add_heading("3.1 Entity Relationship Diagram (Mermaid ER Model)", level=2)
    mermaid_er = (
        "```mermaid\n"
        "erDiagram\n"
        "    DEPARTMENTS ||--o{ USERS : assigns\n"
        "    USERS ||--o{ HRMS_PROFILES : has\n"
        "    USERS ||--o{ ATTEND_STUDENT_LOGS : records\n"
        "    USERS ||--o{ EXAM_SUBMISSIONS : takes\n"
        "    USERS ||--o{ CODING_SUBMISSIONS : submits\n"
        "    USERS ||--o{ PRESENT_SESSIONS : delivers\n"
        "    USERS ||--o{ REPOSITORIES : owns\n\n"
        "    ATTEND_COURSES ||--o{ ATTEND_SESSIONS : schedules\n"
        "    ATTEND_SESSIONS ||--o{ ATTEND_STUDENT_LOGS : logs\n"
        "    ATTEND_STUDENT_LOGS }o--|| EXAM_SUBMISSIONS : gates_eligibility\n\n"
        "    EXAM_ASSESSMENTS ||--o{ EXAM_QUESTIONS : contains\n"
        "    EXAM_ASSESSMENTS ||--o{ EXAM_SUBMISSIONS : evaluates\n\n"
        "    CODING_PROBLEMS ||--o{ CODING_TEST_CASES : tests\n"
        "    CODING_PROBLEMS ||--o{ CODING_SUBMISSIONS : receives\n\n"
        "    PRESENT_SESSIONS ||--o{ PRESENT_SLIDES : contains\n"
        "    PRESENT_SESSIONS ||--o{ PRESENT_EVALUATIONS : scored_by\n"
        "    PRESENT_SESSIONS ||--o{ PRESENT_VIVA_QA : questions\n\n"
        "    KNOWLEDGE_DOCS ||--o{ DOC_CHUNKS : splits\n"
        "    REPOSITORIES ||--o{ COMMITS : records\n"
        "```"
    )
    p_er = doc.add_paragraph(mermaid_er)
    for r in p_er.runs:
        r.font.name = "Consolas"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    doc.add_heading("3.2 Full Production Table Specifications", level=2)
    
    schema_tables = [
        {
            "name": "Module 1: HRMS & Academic Workforce Tables",
            "desc": "Engineered by Team 1 for faculty and workforce lifecycle.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["hrms_faculty_profiles", "id (UUID)", "user_id (FK), designation, tenure_status, base_salary, max_credits", "Detailed academic faculty dossier and contract terms."],
                ["hrms_leave_requests", "id (UUID)", "user_id (FK), leave_type, start_date, end_date, status, approved_by", "Multi-stage leave approval state tracking."],
                ["hrms_workload_allocations", "id (UUID)", "faculty_id (FK), semester, course_code, lecture_hrs, lab_hrs", "Teaching credit and laboratory workload distribution."],
                ["hrms_payroll_records", "id (UUID)", "user_id (FK), month_year, basic_pay, allowances, deductions, net_pay", "Monthly salary disbursement and generated PDF slip references."]
            ]
        },
        {
            "name": "Module 2: Smart Student Attendance & Eligibility Tables",
            "desc": "Engineered by Team 2 for multi-modal check-in and exam eligibility gating.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["attend_courses", "id (UUID)", "code, name, dept_id (FK), faculty_id (FK), min_attendance_pct", "Course master record with mandatory attendance threshold."],
                ["attend_sessions", "id (UUID)", "course_id (FK), session_date, start_time, end_time, room_polygon, qr_secret", "Classroom lecture instance with geo-fence polygon and QR secret."],
                ["attend_student_logs", "id (UUID)", "session_id (FK), student_id (FK), checkin_method, verified_gps, timestamp", "Student attendance check-in log (QR, Geofence, Face AI)."],
                ["attend_condonations", "id (UUID)", "student_id (FK), course_id (FK), medical_cert_url, ocr_data, status", "Medical leave condonation approval workflow."]
            ]
        },
        {
            "name": "Module 3: Examination & Proctoring Tables",
            "desc": "Engineered by Team 3 for high-stakes online examinations.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["exam_assessments", "id (UUID)", "title, course_id, scheduled_start, duration_mins, total_marks, is_proctored", "Exam master record with time and security rules."],
                ["exam_questions", "id (UUID)", "exam_id (FK), question_type, prompt_text, options_json, correct_answer, marks", "Item bank supporting MCQs, multi-select, and essays."],
                ["exam_submissions", "id (UUID)", "exam_id (FK), student_id (FK), answers_json, score, status, integrity_rating", "Student responses, grading status, and integrity flag score."],
                ["exam_proctor_violations", "id (UUID)", "submission_id (FK), event_type, snapshot_url, timestamp, severity", "AI detection log: tab switch, multi-face, missing face, audio."]
            ]
        },
        {
            "name": "Module 4: Code Arena & Auto-Judge Tables",
            "desc": "Engineered by Team 4 for programming assessments and sandbox runs.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["coding_problems", "id (UUID)", "title, slug, difficulty, time_limit_ms, memory_limit_mb, description_md", "Coding challenge metadata and sandbox execution constraints."],
                ["coding_test_cases", "id (UUID)", "problem_id (FK), input_data, expected_output, is_hidden, points", "Automated grading test suite with hidden validation cases."],
                ["coding_submissions", "id (UUID)", "problem_id (FK), student_id (FK), language, source_code, verdict, time_ms", "Evaluation outcome: AC, WA, TLE, MLE, Runtime Error."],
                ["coding_plagiarism_audits", "id (UUID)", "submission_a_id (FK), submission_b_id (FK), similarity_score, ast_matches", "AST token similarity audit flagging code duplication."]
            ]
        },
        {
            "name": "Module 5: AI Online Presentation & Virtual Viva Tables",
            "desc": "Engineered by Team 5 for multi-modal presentation evaluation.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["present_sessions", "id (UUID)", "presenter_id (FK), course_id, title, slide_deck_url, recording_url, status", "Presentation room session with WebRTC and recording references."],
                ["present_slides", "id (UUID)", "session_id (FK), slide_number, slide_text, key_topics, visual_score", "Extracted slide contents for semantic oral alignment."],
                ["present_evaluations", "id (UUID)", "session_id (FK), wpm_pace, filler_count, eye_contact_pct, semantic_score, total_score", "Multi-modal AI metric dossier and final rubric score."],
                ["present_viva_qa", "id (UUID)", "session_id (FK), ai_generated_question, student_answer_transcript, correctness_score", "AI viva questions generated in real-time from presentation speech."]
            ]
        },
        {
            "name": "Module 6: RAG Knowledge Assistant Tables",
            "desc": "Engineered by Team 6 for campus knowledge vector retrieval.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["ai_knowledge_documents", "id (UUID)", "title, category, file_path, target_roles, is_indexed, uploaded_at", "Official university policies, syllabi, handbooks, regulations."],
                ["ai_document_chunks", "id (UUID)", "document_id (FK), content_chunk, chunk_index, embedding (VECTOR(1536))", "Indexed text chunks with pgvector cosine similarity embeddings."],
                ["ai_chat_sessions", "id (UUID)", "user_id (FK), session_title, role_context, created_at", "Conversational session history and user context."],
                ["ai_chat_messages", "id (UUID)", "session_id (FK), sender, content, cited_sources_json, feedback_rating", "Streamed conversation turns with source document citations."]
            ]
        },
        {
            "name": "Module 7: UniHub Git & Research Showcase Tables",
            "desc": "Engineered by Team 7 for code hosting, papers, and campus activity.",
            "cols": ["Table Name", "Primary Key", "Key Attributes & Foreign Keys", "Description"],
            "rows": [
                ["repos_repositories", "id (UUID)", "owner_id (FK), name, description, is_private, git_path, stars_count", "Institutional Git repositories for student and faculty projects."],
                ["research_papers", "id (UUID)", "author_id (FK), title, abstract, pdf_storage_url, bibtex, doi, peer_status", "Academic research manuscript archive with citation generation."],
                ["campus_activity_feed", "id (UUID)", "actor_id (FK), event_type, entity_id, entity_type, summary_text, timestamp", "Live dynamic university feed of commits, papers, and achievements."]
            ]
        }
    ]

    for sec in schema_tables:
        doc.add_heading(sec["name"], level=3)
        p_desc = doc.add_paragraph(sec["desc"])
        p_desc.paragraph_format.space_after = Pt(4)
        tbl = doc.add_table(rows=len(sec["rows"])+1, cols=4)
        for j, c in enumerate(sec["cols"]):
            tbl.cell(0, j).paragraphs[0].text = c
        for i, r_data in enumerate(sec["rows"]):
            for j, val in enumerate(r_data):
                tbl.cell(i+1, j).paragraphs[0].text = val
        style_table(tbl, col_widths=[Inches(1.8), Inches(1.1), Inches(2.2), Inches(1.9)])

    # =========================================================================
    # SECTION 4: REST API SPECIFICATIONS
    # =========================================================================
    doc.add_page_break()
    h4 = doc.add_heading("4. Comprehensive API Documentation", level=1)
    h4.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    apis = [
        {
            "module": "Module 2: Smart Student Attendance & Exam Eligibility Gate",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/attendance/session/start-qr",
                    "desc": "Faculty initializes rotating QR session; generates 5-second rotating cryptographic HMAC tokens.",
                    "req": "{\n  \"courseId\": \"018dc5b2-3f11-7000-8000-000000000010\",\n  \"roomPolygon\": [[13.1234, 77.5678], [13.1235, 77.5679], ...],\n  \"bleBeaconUuid\": \"e2c56db5-dffb-48d2-b060-d0f5a71096e0\"\n}",
                    "res": "{\n  \"sessionId\": \"018dc5b2-3f22-7000-8000-000000000020\",\n  \"initialQrToken\": \"hmac_sha256_9f83...\",\n  \"refreshIntervalSec\": 5\n}"
                },
                {
                    "method": "POST",
                    "path": "/api/v1/attendance/checkin",
                    "desc": "Student mobile app submits scanned QR token with device GPS coordinates and BLE beacon proof.",
                    "req": "{\n  \"sessionId\": \"018dc5b2-3f22-7000-8000-000000000020\",\n  \"qrToken\": \"hmac_sha256_9f83...\",\n  \"latitude\": 13.12342,\n  \"longitude\": 77.56784,\n  \"bleDetected\": true\n}",
                    "res": "{\n  \"status\": \"VERIFIED\",\n  \"attendancePercentage\": 84.5,\n  \"examEligibility\": \"ELIGIBLE\"\n}"
                },
                {
                    "method": "GET",
                    "path": "/api/v1/attendance/eligibility/:studentId/:courseId",
                    "desc": "Invoked by Exam Engine (Module 3) to gate test access against the statutory 75% attendance rule.",
                    "req": "Header: Authorization: Bearer <GATEWAY_INTERNAL_KEY>",
                    "res": "{\n  \"studentId\": \"018dc5b2-3f00-7000-8000-000000000001\",\n  \"courseId\": \"018dc5b2-3f11-7000-8000-000000000010\",\n  \"totalClasses\": 40,\n  \"attendedClasses\": 32,\n  \"condonationsApproved\": 2,\n  \"effectivePercentage\": 85.0,\n  \"examHallTicketIssued\": true\n}"
                }
            ]
        },
        {
            "module": "Module 5: AI-Powered Online Presentation & Virtual Viva Platform",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/presentation/session/create",
                    "desc": "Initializes live WebRTC virtual presentation room and uploads presentation slide deck (PDF/PPTX).",
                    "req": "Form-Data:\n  title: 'Autonomous Drone Navigation Capstone Defense'\n  courseId: 'CS499'\n  slideDeck: [binary file upload: capstone_slides.pdf]",
                    "res": "{\n  \"sessionId\": \"018dc5b2-3f55-7000-8000-000000000050\",\n  \"webrtcRoomUrl\": \"wss://live.unisphere.edu/room/capstone-499\",\n  \"totalSlidesParsed\": 24,\n  \"status\": \"ROOM_READY\"\n}"
                },
                {
                    "method": "POST",
                    "path": "/api/v1/presentation/:id/ai-evaluate",
                    "desc": "Triggers multi-modal AI evaluation on completed audio, video stream, and synchronized slide progression.",
                    "req": "{\n  \"sessionId\": \"018dc5b2-3f55-7000-8000-000000000050\",\n  \"includeVivaQa\": true\n}",
                    "res": "{\n  \"evaluationDossier\": {\n    \"speechPaceWpm\": 138,\n    \"fillerWordCount\": 6,\n    \"fillerWordsList\": [\"um: 4\", \"like: 2\"],\n    \"eyeContactPercentage\": 88.2,\n    \"slideSemanticMatchScore\": 91.5,\n    \"vivaQuestions\": [\n      {\"q\": \"How does your SLAM algorithm handle dynamic obstacles in GPS-denied environments?\", \"confidence\": 0.96}\n    ],\n    \"compositeRubricScore\": 89.0,\n    \"pdfDossierUrl\": \"https://storage.unisphere.edu/dossiers/018dc5b2.pdf\"\n  }\n}"
                }
            ]
        }
    ]

    for api_group in apis:
        doc.add_heading(api_group["module"], level=2)
        for ep in api_group["endpoints"]:
            doc.add_heading(f"{ep['method']} {ep['path']}", level=3)
            doc.add_paragraph(ep["desc"])
            
            p_req_title = doc.add_paragraph()
            p_req_title.add_run("Request:").bold = True
            p_req = doc.add_paragraph(ep["req"])
            for r in p_req.runs:
                r.font.name = "Consolas"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0x2C, 0x52, 0x82)
                
            p_res_title = doc.add_paragraph()
            p_res_title.add_run("Response:").bold = True
            p_res = doc.add_paragraph(ep["res"])
            for r in p_res.runs:
                r.font.name = "Consolas"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0x22, 0x54, 0x3D)

    # =========================================================================
    # SECTION 5: CYBERSECURITY AUDIT
    # =========================================================================
    doc.add_page_break()
    h5 = doc.add_heading("5. Cybersecurity Audit & Defensive Hardening Framework", level=1)
    h5.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    doc.add_heading("5.1 Attendance Anti-Spoofing & Proxy Mitigation Controls", level=2)
    anti_spoof = [
        "1. Dynamic Rotating QR Nonces: The classroom projector displays a QR code containing an HMAC-SHA256 signature hashed with a secret key and timestamp. The QR expires in 5 seconds. Screenshots sent via WhatsApp to absent friends fail signature expiration upon scanning.",
        "2. Multi-Polygon Geofence Validation: Student check-in coordinates are verified against the specific classroom's polygon perimeter. Mock GPS locations are detected by inspecting Android/iOS Location Provider APIs (`isFromMockProvider` flag) and network latency triangulation.",
        "3. Ambient BLE Beacon Handshake: The mobile app must detect the classroom's physical Bluetooth Low Energy (BLE) beacon UUID to prevent spoofing from outside the building.",
        "4. Face Liveness Detection: Facial check-in uses MediaPipe iris tracking and natural blink detection to block 2D photo prints or pre-recorded video playback."
    ]
    for s in anti_spoof:
        p_s = doc.add_paragraph(s)
        p_s.paragraph_format.space_after = Pt(2)

    doc.add_heading("5.2 WebRTC Presentation & Media Stream Protection", level=2)
    webrtc_sec = [
        "1. End-to-End Encryption: WebRTC media streams are encrypted using DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol).",
        "2. Watermarked Slides: Slide renders feature dynamic viewer watermarks (student name and ID) to prevent unauthorized redistribution of proprietary capstone intellectual property.",
        "3. Ephemeral Audio Processing: Student audio streams routed to the Whisper speech-to-text model are processed in RAM and purged immediately after transcript generation, complying with GDPR/FERPA privacy regulations."
    ]
    for w in webrtc_sec:
        p_w = doc.add_paragraph(w)
        p_w.paragraph_format.space_after = Pt(2)

    # Save document
    base_dir = "c:/Users/bdeepak/OneDrive - Chanakya University/Course materials/projects"
    doc_path = os.path.join(base_dir, "university_portal_master_architecture.docx")
    doc_path_updated = os.path.join(base_dir, "university_portal_master_architecture_updated.docx")
    
    doc.save(doc_path_updated)
    print(f"Successfully saved {doc_path_updated}")
    try:
        doc.save(doc_path)
        print(f"Successfully updated main docx {doc_path}")
    except PermissionError:
        print(f"Main docx locked, updated copy saved at {doc_path_updated}")

if __name__ == "__main__":
    create_document()
