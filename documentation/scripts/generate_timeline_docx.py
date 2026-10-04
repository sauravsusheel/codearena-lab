import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
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

def add_callout(doc, text, title="TIMELINE & GOVERNANCE MANDATE"):
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

def create_timeline_document():
    doc = docx.Document()
    
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    
    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("UNISPHERE: MASTER PROJECT TIMELINE & TEAM WORKFLOW DOSSIER")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(22)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(14)
    run_sub = subtitle_p.add_run("16-Week Semester Engineering Roadmap, Sprint Deliverables & Multi-Team Integration Protocol\nComprehensive Guide for 7 Student Teams (21 Engineers)")
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)
    
    add_callout(doc, 
                "Project Execution Directive: This document defines the exact sprint-by-sprint schedule, team-wise deliverables, student role assignments (Student 1, Student 2, Student 3), and integration protocols for the UniSphere university ecosystem. Every team works in their dedicated app within the Turborepo workspace, adhering to strict OpenAPI contracts to guarantee seamless end-stage merging without breaking changes.",
                "SENIOR LEAD ARCHITECT DIRECTIVE")

    # =========================================================================
    # SECTION 1: 16-WEEK MASTER ENGINEERING TIMELINE
    # =========================================================================
    h1 = doc.add_heading("1. 16-Week Master Engineering Timeline (6 Sprints)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "The project spans an intensive 16-week semester structured into 6 bi-weekly engineering sprints, followed by a dedicated "
        "four-week staging integration, load testing, security auditing, and capstone demonstration period. "
        "Every sprint concludes with a working vertical slice demonstration."
    )
    
    sprint_table = doc.add_table(rows=8, cols=4)
    sprint_headers = ["Sprint / Phase", "Weeks", "Milestone Focus", "Expected Deliverables & Gates"]
    for j, h in enumerate(sprint_headers):
        sprint_table.cell(0, j).paragraphs[0].text = h
        
    sprint_data = [
        ["Sprint 1", "Weeks 1 - 2", "Inception, Setup & Contract Freeze", "Turborepo monorepo setup, PostgreSQL 16 schema validation, Prisma migrations, shared packages/ui setup, OpenAPI 3.0 contract freeze."],
        ["Sprint 2", "Weeks 3 - 4", "Core Backend & Auth Integration", "Central JWT SSO login, role-based access control (RBAC), Express/FastAPI controllers, database CRUD operations, Next.js page layouts."],
        ["Sprint 3", "Weeks 5 - 6", "Domain Core Engine Development", "Leave state machine (Team 1), 5s rotating QR & Geofencing (Team 2), Lockdown exam shell (Team 3), gVisor Docker runner (Team 4)."],
        ["Sprint 4", "Weeks 7 - 8", "AI & Real-Time Telemetry", "WebRTC presentation room (Team 5), pgvector RAG pipeline (Team 6), Git HTTP smart protocol (Team 7), WebSocket telemetry and auto-save."],
        ["Sprint 5", "Weeks 9 - 10", "Security Hardening & Gateway Ingress", "Reverse proxy routing, Redis token blacklist, OWASP security audit, anti-spoofing tests, automated Jest test suites (>80% coverage)."],
        ["Sprint 6", "Weeks 11 - 12", "Master Staging Merge & E2E Tests", "Merge all 7 modules into staging branch, attendance-to-exam eligibility gating, slide-to-speech viva evaluation, unified UI theming."],
        ["Phase 5", "Weeks 13 - 16", "Load Testing & Live Showcase", "Simulate 500 concurrent users, live faculty demonstration, student capstone defense, disaster recovery drill, final production release."]
    ]
    for i, row in enumerate(sprint_data):
        for j, val in enumerate(row):
            sprint_table.cell(i+1, j).paragraphs[0].text = val
    style_table(sprint_table, col_widths=[Inches(1.2), Inches(1.1), Inches(2.2), Inches(2.7)])

    # =========================================================================
    # SECTION 2: MASTER INTEGRATION BLUEPRINT (HOW EVERYTHING COMBINES)
    # =========================================================================
    doc.add_page_break()
    h2 = doc.add_heading("2. Master Integration Blueprint: How Teams Combine Everything", level=1)
    h2.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "To enable 7 teams of 3 students (21 developers in total) to work concurrently without code conflicts, "
        "UniSphere utilizes a Monorepo Workspace (Turborepo) structure with shared packages and an API Gateway."
    )
    
    add_callout(doc,
                "Integration Rule: No team writes custom authentication or ad-hoc database connection logic. "
                "All teams import `packages/auth` for JWT token verification and `packages/database` for Prisma database access. "
                "This guarantees 100% interoperability at staging merge time.",
                "SHARED CONTRACT ARCHITECTURE")
    
    doc.add_heading("2.1 Monorepo Workspace Architecture", level=2)
    repo_tree = (
        "unisphere-monorepo/\n"
        "├── apps/\n"
        "│   ├── web-portal/             # Central Next.js 14 Unified Portal (SSO & Master Shell)\n"
        "│   ├── hrms-service/           # Module 1: Team 1 (Express.js API)\n"
        "│   ├── attendance-service/     # Module 2: Team 2 (Express.js + Redis QR Nonces)\n"
        "│   ├── exam-service/           # Module 3: Team 3 (Express.js + WebSocket Server)\n"
        "│   ├── judge-service/          # Module 4: Team 4 (BullMQ Worker + Docker Runner)\n"
        "│   ├── presentation-service/   # Module 5: Team 5 (WebRTC LiveKit + FastAPI AI Evaluator)\n"
        "│   ├── ai-bot-service/         # Module 6: Team 6 (FastAPI RAG Engine)\n"
        "│   └── unihub-service/         # Module 7: Team 7 (Git HTTP Server & Paper Archive)\n"
        "├── packages/\n"
        "│   ├── ui/                     # Shared Tailwind CSS / Shadcn UI Component Primitives\n"
        "│   ├── auth/                   # Shared JWT Token Verification & RBAC Middleware\n"
        "│   ├── database/               # Shared Prisma Schema & PostgreSQL Migrations\n"
        "│   ├── types/                  # Shared TypeScript Interfaces (User, Course, Role)\n"
        "│   └── tsconfig/               # Standard TypeScript configurations across all workspaces\n"
        "├── docker-compose.yml          # Local full-stack developer orchestration\n"
        "└── package.json                # Turborepo root workspace configuration\n"
    )
    p_tree = doc.add_paragraph(repo_tree)
    for r in p_tree.runs:
        r.font.name = "Consolas"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    doc.add_heading("2.2 Cross-Module Integration Contracts & Data Flows", level=2)
    
    contract_table = doc.add_table(rows=5, cols=4)
    contract_headers = ["Contract Flow", "Source Module", "Target Module", "Integration Mechanism & Payload"]
    for j, h in enumerate(contract_headers):
        contract_table.cell(0, j).paragraphs[0].text = h
        
    contract_data = [
        ["Attendance → Exam Gate", "Module 2 (EduAttend AI)", "Module 3 (EduExam AI)", "REST / Redis Cache: Exam engine queries student attendance %. If < 75% without approved medical condonation, exam session initialization is locked."],
        ["Exam & Code → Student Dossier", "Module 3 & Module 4", "Module 1 (EduHRMS)", "PostgreSQL Shared Relational Model: Exam scores, code assignment verdicts, and marks sync directly into student academic profiles."],
        ["Presentation AI → UniHub", "Module 5 (EduPresent AI)", "Module 7 (UniHub)", "S3 / MinIO Event Trigger: Completed capstone presentation recording, slide deck, and AI viva score dossier attach to the student's project repo."],
        ["RAG Bot → All Modules", "Module 6 (EduAssist AI)", "Modules 1, 2, 3, 5", "Vector Search Ingress: AI bot queries ingested HR policies, exam schedules, course syllabi, and presentation rubrics to answer user questions."]
    ]
    for i, row in enumerate(contract_data):
        for j, val in enumerate(row):
            contract_table.cell(i+1, j).paragraphs[0].text = val
    style_table(contract_table, col_widths=[Inches(1.8), Inches(1.5), Inches(1.5), Inches(2.4)])

    # =========================================================================
    # SECTION 3: TEAM-WISE DOSSIERS & ROLE WORKFLOWS
    # =========================================================================
    doc.add_page_break()
    h3 = doc.add_heading("3. Team-Wise Workflows & Detailed Student Role Assignments", level=1)
    h3.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "Each of the 7 teams operates as an autonomous pod of 3 student engineers. "
        "Below are the complete, detailed sprint task allocations for Student 1 (Frontend), Student 2 (Backend), and Student 3 (DevOps/Data/Security)."
    )

    team_dossiers = [
        {
            "num": "Team 1",
            "title": "Module 1: Enterprise Academic HRMS & Staff Attendance (EduHRMS)",
            "features": "Faculty/staff dossiers, leave application state machines, attendance regularization, payroll PDF generation, teaching credit workload balancing.",
            "s1": "Student 1 (Frontend & UX Lead):\n• Sprint 1: Wireframe faculty profile dossier and leave application modal in Figma/Shadcn.\n• Sprint 2: Build responsive personal profile page, tenure history tabs, and emergency contact forms.\n• Sprint 3: Develop interactive leave request dialog with dynamic balance calculator and status tracker.\n• Sprint 4: Build staff attendance dashboard with geolocation map pins and regularization requests.\n• Sprint 5: Create payroll history view with PDF payslip download button and breakdown cards.\n• Sprint 6: Harmonize UI theme with master web portal and conduct accessibility testing.",
            "s2": "Student 2 (Backend & API Lead):\n• Sprint 1: Review OpenAPI specs for HRMS and implement mock endpoints in Express.\n• Sprint 2: Build faculty profile CRUD controllers and Zod request validation schemas.\n• Sprint 3: Implement multi-stage leave approval state machine (Faculty -> HOD -> Dean -> HR).\n• Sprint 4: Build teaching workload balancing algorithm calculating lecture, lab, and committee credits.\n• Sprint 5: Develop payroll calculation engine (basic pay, PF deduction, tax slabs, research allowances).\n• Sprint 6: Optimize database queries, build integration tests with Jest, and assist staging merge.",
            "s3": "Student 3 (DevOps, Security & Data Lead):\n• Sprint 1: Deploy PostgreSQL 16 schema for HRMS and run initial Prisma migrations.\n• Sprint 2: Implement RBAC middleware verifying JWT tokens for SUPER_ADMIN, DEAN, HOD, and FACULTY.\n• Sprint 3: Build automated PDF payslip generation pipeline using PDFKit and stream to client.\n• Sprint 4: Set up immutable audit logging table recording salary changes and leave overrides.\n• Sprint 5: Harden endpoints against SQL injection and configure Docker Compose service container.\n• Sprint 6: Configure GitHub Actions CI pipeline and validate 0 lint/type errors."
        },
        {
            "num": "Team 2",
            "title": "Module 2: Smart Student Attendance Tracking & Exam Eligibility (EduAttend AI)",
            "features": "5-second rotating cryptographic QR codes, GPS geofencing, MediaPipe face liveness, medical leave condonation OCR, automated 75% exam gate.",
            "s1": "Student 1 (Frontend & Scanner UX Lead):\n• Sprint 1: Design classroom projector display UI and mobile camera scanning view.\n• Sprint 2: Implement mobile QR scanner using react-qr-reader with smooth camera permissions.\n• Sprint 3: Build dynamic QR projection screen with real-time countdown radial progress bar (5s refresh).\n• Sprint 4: Create student course-wise attendance dashboard showing current percentage and warning badges.\n• Sprint 5: Build medical certificate upload portal with preview and doctor note attachment.\n• Sprint 6: Integrate defaulter alert banner and finalize UI for mobile PWA usage.",
            "s2": "Student 2 (Backend & Geo-Fencing Architect):\n• Sprint 1: Set up Redis connection for ephemeral QR nonces and define attendance API contracts.\n• Sprint 2: Build classroom session creation endpoints with start/end time and GPS polygon boundaries.\n• Sprint 3: Implement 5-second rotating HMAC-SHA256 QR token generator and verification endpoint.\n• Sprint 4: Implement point-in-polygon algorithm to verify student coordinates are within classroom.\n• Sprint 5: Build automated course attendance percentage aggregator and 75% exam eligibility service.\n• Sprint 6: Implement WebSockets live headcount broadcast to faculty dashboard and optimize load.",
            "s3": "Student 3 (AI Vision, Security & Condonation Lead):\n• Sprint 1: Research MediaPipe face mesh and design tablet kiosk check-in pipeline.\n• Sprint 2: Implement facial liveness detection (blink and iris tracking) to defeat photo/video spoofing.\n• Sprint 3: Implement mock GPS detection inspecting Android/iOS Location Provider APIs (`isFromMockProvider`).\n• Sprint 4: Integrate Tesseract OCR for automated medical certificate text extraction and hospital validation.\n• Sprint 5: Set up automated SMS/email defaulter notification relay triggered at <75% attendance.\n• Sprint 6: Configure Docker container for attendance service and run security penetration tests."
        },
        {
            "num": "Team 3",
            "title": "Module 3: AI-Proctored Intelligent Examination Suite (EduExam AI)",
            "features": "Fullscreen lockdown exam shell, KaTeX formula editor, MediaPipe face/gaze telemetry, network-resilient auto-save, automated objective grading.",
            "s1": "Student 1 (Frontend & Exam Shell Lead):\n• Sprint 1: Design distraction-free examination layout and question navigation palette.\n• Sprint 2: Implement fullscreen lockdown mode with event listeners blocking Alt+Tab, Ctrl+C, Ctrl+V.\n• Sprint 3: Build KaTeX math formula rendering and rich-text question display supporting images.\n• Sprint 4: Implement client-side IndexedDB answer caching to survive sudden network disconnections.\n• Sprint 5: Build synchronized exam countdown timer with warning modals and auto-submit trigger.\n• Sprint 6: Integrate with Central Gateway and polish student examination report view.",
            "s2": "Student 2 (Backend & Telemetry Architect):\n• Sprint 1: Model exam assessment, question banks, and submission tables in Prisma.\n• Sprint 2: Build faculty question authoring studio endpoints with difficulty tags and randomized shuffling.\n• Sprint 3: Implement incremental answer auto-save endpoint with idempotency keys and timestamps.\n• Sprint 4: Build WebSocket heartbeat service monitoring active student connections and connectivity drops.\n• Sprint 5: Develop automated grading engine for MCQs/multi-select and rubric grading interface for essays.\n• Sprint 6: Connect to Module 2's attendance eligibility API to block ineligible students (<75%).",
            "s3": "Student 3 (AI Proctoring & Integrity Specialist):\n• Sprint 1: Set up client-side MediaPipe face detection model running in Web Worker.\n• Sprint 2: Implement gaze deviation tracker flagging students looking away from screen >5 seconds.\n• Sprint 3: Build multi-person presence detector and missing face alert mechanism.\n• Sprint 4: Integrate background audio decibel analyzer flagging talking or whispering during exams.\n• Sprint 5: Build encrypted violation snapshot upload service and automated academic integrity score rating.\n• Sprint 6: Dockerize exam service, configure Redis caching, and execute load testing."
        },
        {
            "num": "Team 4",
            "title": "Module 4: Cloud Code Execution Arena & Auto-Judge (EduCode Judge)",
            "features": "Monaco Editor integration, gVisor container sandbox runner, multi-tier test case judge (TLE, MLE, WA, AC), AST plagiarism detection engine.",
            "s1": "Student 1 (Frontend & IDE Architect):\n• Sprint 1: Integrate Monaco Editor (@monaco-editor/react) with language switcher (Python, C++, Java, JS).\n• Sprint 2: Build customizable editor themes, font size toggles, keyboard shortcuts, and code auto-save.\n• Sprint 3: Create interactive stdin input panel and tabbed stdout/stderr execution result console.\n• Sprint 4: Build problem description view with Markdown rendering, constraints, and sample test cases.\n• Sprint 5: Create competitive practice track with difficulty filters, user streak counter, and leaderboards.\n• Sprint 6: Harmonize IDE styles with master portal and test cross-browser responsiveness.",
            "s2": "Student 2 (Judge Backend & Task Queues):\n• Sprint 1: Configure BullMQ distributed task queue in Redis for async code execution requests.\n• Sprint 2: Implement submission dispatcher pushing code payloads to worker queues.\n• Sprint 3: Build test case evaluator comparing student output against expected output (handling whitespace).\n• Sprint 4: Implement execution verdict generator (Accepted, Wrong Answer, TLE, Memory Limit Exceeded).\n• Sprint 5: Build faculty assignment creation portal with private test cases and deadline rules.\n• Sprint 6: Optimize queue throughput to process 50 submissions per second and write unit tests.",
            "s3": "Student 3 (Sandbox Security & AST Plagiarism Specialist):\n• Sprint 1: Install and configure gVisor (runsc) runtime on Docker host machine.\n• Sprint 2: Build ephemeral Docker worker node with `--network none` and `--read-only` root filesystem.\n• Sprint 3: Enforce hard cgroups limits: 256MB RAM, 1.0 CPU core, and `--pids-limit 64` to block fork bombs.\n• Sprint 4: Mount in-memory tmpfs (`/tmp:rw,size=16m`) for compiled binaries, auto-purged upon termination.\n• Sprint 5: Build Python AST tokenization and Winnowing algorithm to detect structural code plagiarism.\n• Sprint 6: Conduct penetration testing attempting container breakout and write security documentation."
        },
        {
            "num": "Team 5",
            "title": "Module 5: AI Presentation & Virtual Viva Platform (EduPresent AI)",
            "features": "Live WebRTC presentation room, slide sync with laser pointer, Whisper speech pace/filler-word analysis, eye contact tracking, AI viva question generator.",
            "s1": "Student 1 (WebRTC Studio & Presentation Lead):\n• Sprint 1: Design virtual presentation stage with presenter video tile, slide canvas, and attendee grid.\n• Sprint 2: Build WebRTC audio/video client using LiveKit/Mediasoup SDK with mic/cam toggles.\n• Sprint 3: Integrate PDF.js viewer with real-time slide synchronized broadcasting across all viewers.\n• Sprint 4: Build presenter laser pointer and drawing tool synchronized over WebRTC data channels.\n• Sprint 5: Create evaluator rubric scoring panel with criteria sliders (Delivery, Content, Visuals, Q&A).\n• Sprint 6: Build student presentation history dashboard with downloadable AI feedback dossiers.",
            "s2": "Student 2 (Multi-Modal AI Pipeline Architect):\n• Sprint 1: Build FastAPI service for audio chunking and speech-to-text transcription.\n• Sprint 2: Deploy OpenAI Whisper / Vosk pipeline transcribing live presentation audio in real time.\n• Sprint 3: Build vocal pace analyzer calculating words per minute (WPM) and flagging rushed/slow delivery.\n• Sprint 4: Implement filler-word detector counting occurrences of 'um', 'uh', 'like', and 'you know'.\n• Sprint 5: Build AI viva question generator: extracts key topics from transcript and generates technical Qs.\n• Sprint 6: Implement student viva response transcription and evaluate conceptual correctness score.",
            "s3": "Student 3 (Computer Vision & Slide Alignment Specialist):\n• Sprint 1: Implement MediaPipe face and gaze tracker measuring student camera eye contact percentage.\n• Sprint 2: Build posture and fidgeting detector evaluating professional presentation body language.\n• Sprint 3: Extract slide text and images; compute vector semantic alignment between speech and slides.\n• Sprint 4: Enforce DTLS-SRTP encryption on media streams and generate dynamic viewer watermarks on slides.\n• Sprint 5: Build automated PDF report generator combining all multi-modal metrics into an executive dossier.\n• Sprint 6: Configure MinIO S3 bucket for presentation video archives and configure Docker containers."
        },
        {
            "num": "Team 6",
            "title": "Module 6: Institutional Knowledge Base & Conversational AI Assistant (EduAssist AI)",
            "features": "Document ingestion pipeline, PostgreSQL pgvector semantic search, hallucination-guarded RAG chatbot, role-based privacy filters, AI coding tutor.",
            "s1": "Student 1 (Conversational UX Lead):\n• Sprint 1: Design modern streaming chat interface with message bubbles, avatars, and input bar.\n• Sprint 2: Implement streaming text output using Server-Sent Events (SSE) for zero-latency response display.\n• Sprint 3: Build Markdown renderer supporting code blocks, tables, and KaTeX mathematical formulas.\n• Sprint 4: Create clickable source citation cards showing the exact university document and page number.\n• Sprint 5: Build student coding tutor mode with hint buttons and concept explanation toggles.\n• Sprint 6: Implement user feedback thumbs up/down buttons and integrate chat widget into portal layout.",
            "s2": "Student 2 (RAG Ingestion & Pipeline Lead):\n• Sprint 1: Build document upload portal for PDF, DOCX, and TXT files with metadata tagging.\n• Sprint 2: Implement recursive character text splitter chunking documents into 500-token semantic chunks.\n• Sprint 3: Build embedding generation pipeline using OpenAI / Gemini / HuggingFace embedding models.\n• Sprint 4: Implement hybrid search combining pgvector cosine similarity with full-text BM25 keyword search.\n• Sprint 5: Construct strict system prompts anchoring responses strictly to retrieved university context.\n• Sprint 6: Build unanswered query escalation workflow creating support tickets for campus helpdesk.",
            "s3": "Student 3 (Vector Database & Prompt Security Specialist):\n• Sprint 1: Enable PostgreSQL pgvector extension and create `ai_document_chunks` table with HNSW index.\n• Sprint 2: Implement role-scoped search partitions (e.g., student queries cannot access faculty salary data).\n• Sprint 3: Build prompt injection defense filter sanitizing adversarial user inputs.\n• Sprint 4: Set up Redis caching for frequent campus queries (e.g., academic calendar dates) to reduce latency.\n• Sprint 5: Build administrative analytics dashboard tracking top student queries and knowledge gaps.\n• Sprint 6: Dockerize FastAPI RAG service and benchmark query response times under load."
        },
        {
            "num": "Team 7",
            "title": "Module 7: UniHub Git Repository & Research Archive (UniHub)",
            "features": "Web Git repository hosting, commit graphs, side-by-side diffs, capstone project showcase, research paper pre-prints, campus innovation feed.",
            "s1": "Student 1 (Git Web UI & Discovery Lead):\n• Sprint 1: Design repository overview page with file explorer, README preview, and clone URL bar.\n• Sprint 2: Build interactive file tree navigation and syntax-highlighted code file viewer.\n• Sprint 3: Implement visual commit branch graph and side-by-side code diff viewer.\n• Sprint 4: Build capstone project exhibition gallery with technology tags, star ratings, and demo links.\n• Sprint 5: Create research paper reader with embedded PDF viewer and copyable BibTeX citation modal.\n• Sprint 6: Build live campus innovation feed ('Happening Now') showing recent commits and publications.",
            "s2": "Student 2 (Git Engine & Paper Indexer):\n• Sprint 1: Set up isomorphic-git / nodegit backend to handle Git smart HTTP packfiles (push/pull).\n• Sprint 2: Build repository creation wizard with options to initialize README and license files.\n• Sprint 3: Implement commit history parser extracting commit hash, author, timestamp, and diff chunks.\n• Sprint 4: Build branch management and tag creation API endpoints.\n• Sprint 5: Implement research manuscript upload pipeline extracting title, abstract, and DOI metadata.\n• Sprint 6: Build automated BibTeX citation generator and write unit tests for Git HTTP transfer.",
            "s3": "Student 3 (Storage, Activity Feeds & Security Specialist):\n• Sprint 1: Configure MinIO S3 object storage for bare Git repositories and research manuscript PDFs.\n• Sprint 2: Build real-time event broadcaster streaming repo pushes, stars, and papers to campus feed.\n• Sprint 3: Implement repository access control policies (Public, Departmental, Private).\n• Sprint 4: Build automated secret scanning linter detecting accidentally committed API keys or passwords.\n• Sprint 5: Set up repository backup and replication schedules to prevent intellectual property loss.\n• Sprint 6: Dockerize UniHub service, configure NGINX reverse proxy, and validate CI/CD pipelines."
        }
    ]

    for td in team_dossiers:
        doc.add_heading(f"{td['num']}: {td['title']}", level=2)
        p_feat = doc.add_paragraph()
        p_feat.add_run("Module Scope & Key Features: ").bold = True
        p_feat.add_run(td['features'])
        p_feat.paragraph_format.space_after = Pt(4)

        p1 = doc.add_paragraph(td['s1'])
        p1.paragraph_format.space_after = Pt(3)
        p2 = doc.add_paragraph(td['s2'])
        p2.paragraph_format.space_after = Pt(3)
        p3 = doc.add_paragraph(td['s3'])
        p3.paragraph_format.space_after = Pt(8)

    # =========================================================================
    # SECTION 4: GIT/GITHUB COLLABORATION & PR HYGIENE
    # =========================================================================
    doc.add_page_break()
    h4 = doc.add_heading("4. Git & GitHub Engineering Collaboration Protocol", level=1)
    h4.runs[0].font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    p = doc.add_paragraph(
        "With 21 student developers contributing to the UniSphere codebase, strict branch governance, "
        "automated pull request quality gates, and standardized merge hygiene are mandatory."
    )
    
    doc.add_heading("4.1 Branch Naming Conventions", level=2)
    branches = [
        "Feature Branches: `team<N>/feat-<short-description>` (e.g., `team2/feat-rotating-qr`, `team4/feat-gvisor-runner`)",
        "Bug Fix Branches: `team<N>/fix-<issue-description>` (e.g., `team3/fix-fullscreen-escape-bug`)",
        "Integration Branch: `staging` (All module branches merge here for cross-module integration)",
        "Production Branch: `main` (Locked; only updated via lead architect release tags)"
    ]
    for b in branches:
        p_b = doc.add_paragraph(b)
        p_b.paragraph_format.space_after = Pt(2)

    doc.add_heading("4.2 Mandatory Pull Request Checklist (Definition of Done)", level=2)
    dod_items = [
        "1. Code Quality Gate: `pnpm lint` executes with 0 errors and 0 warnings. Code is formatted via Prettier.",
        "2. Type Safety Gate: `pnpm typecheck` (`tsc --noEmit`) passes across all workspaces without `any` overrides.",
        "3. Test Coverage Gate: Unit test suites written in Jest execute cleanly with minimum 80% line coverage.",
        "4. Database Integrity: Any Prisma schema changes are reviewed, and migration files are committed.",
        "5. Two Peer Reviews: At least 2 developers (1 teammate + 1 peer from an interfacing module) must approve.",
        "6. No Broken Flows: Every button and interactive element must lead to functional logic. Zero placeholders."
    ]
    for d in dod_items:
        p_d = doc.add_paragraph(d)
        p_d.paragraph_format.space_after = Pt(2)

    doc.add_heading("4.3 Master Staging Merge Protocol (Week 12)", level=2)
    merge_steps = [
        "Step 1 (Interface Lock): In Week 11, all 7 teams freeze their REST and WebSocket API schemas.",
        "Step 2 (Local Submodule Verification): Each team runs `docker-compose up` to verify their standalone service.",
        "Step 3 (Staging Branch Merge): Teams issue pull requests from `team<N>/staging` to master `staging`.",
        "Step 4 (Gateway Ingress Binding): The API Gateway maps sub-paths (`/hrms`, `/attendance`, `/exams`, `/judge`, `/presentation`, `/ai`, `/unihub`) to the respective microservice containers.",
        "Step 5 (End-to-End User Journeys): Execute cross-module user journeys: Faculty sets up exam -> Student checks attendance eligibility -> Student takes proctored exam -> Student completes coding section -> Student presents capstone on WebRTC -> Presentation dossier and code push to UniHub repo."
    ]
    for ms in merge_steps:
        p_ms = doc.add_paragraph(ms)
        p_ms.paragraph_format.space_after = Pt(3)

    # Save Word document
    base_dir = "c:/Users/bdeepak/OneDrive - Chanakya University/Course materials/projects"
    doc_path = os.path.join(base_dir, "PROJECT_TIMELINE_AND_WORKFLOW.docx")
    doc.save(doc_path)
    print(f"Successfully generated {doc_path}")

if __name__ == "__main__":
    create_timeline_document()
