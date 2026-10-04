# Chanakya University ERP & Autonomous Academic Platform
## Comprehensive Feature Audit, Status Matrix & Production Roadmap

**Document Reference:** CU-ARCH-2026-AUDIT-V3.1  
**Generated Date:** September 06, 2026  
**Auditor / Lead Architect:** Senior Lead Architect & Cybersecurity Specialist  
**Security & Accreditation Status:** NAAC A++ / UGC Autonomous / AICTE Tier-1 Aligned  
**Compliance Standard:** DPDP Act 2023, UGC CBCS & NEP 2020 Norms (60:40 Continuous Evaluation), Zero-Trust RBAC

---

### Executive Summary & System Architecture
The Chanakya University Academic Platform (UniSphere) is a fault-isolated, micro-frontend inspired multi-role autonomous university management system. Each functional area is decoupled into self-contained teams (Modules 01 through 08 plus institutional administration modules) wrapped in resilient error boundaries (`ModuleErrorBoundary`), circuit breaker proxies, namespaced client storage, and sandboxed event communication.

---

### Module-Wise & Role-Wise Feature Audit Matrix

| Module # | Module Name | Role Coverage | Current Operational Status |
| :--- | :--- | :--- | :--- |
| **Module 01** | **EduHRMS** (Faculty & Staff HRMS) | Faculty, HOD, Dean, Super Admin, Bursar | **Fully Functional & Live Verified** (UGC Workload Balancing Matrix, Printable 7th CPC Payslip, Leave Approvals) |
| **Module 02** | **EduAttend AI** (Smart Attendance) | Student, Faculty, HOD, Proctor, Super Admin | **Fully Functional & Live Verified** (Dynamic 5s QR, GPS Geofence Radar, Biometric Face Kiosk, Timetable Scoped) |
| **Module 03** | **ExamShield** (AI Proctored Exams) | Student, Faculty, Exam Controller, Super Admin | **Fully Functional & Live Verified** (Lockdown Browser, Gurukulya 60:40 NEP Grading, Role-gated Authoring) |
| **Module 04** | **CodeArena** (Execution Sandbox & Labs) | Student, Faculty, Placement Officer, Super Admin | **Fully Functional & Live Verified** (Multi-language IDE, Non-blocking stdin Shell, Plagiarism Guarded) |
| **Module 05** | **PresentAI** (Viva & Presentation Studio) | Student, Faculty, Dean | **Fully Functional & Live Verified** (WebRTC Stage, Speech Pace WPM, Gaze Heatmap, Automated Viva Qs) |
| **Module 06** | **CampusBot AI** (University Oracle) | All 11 Roles (Multi-Persona RAG Engine) | **Fully Functional & Live Verified** (174 Faculty Knowledge Base, Solar PV Expert Dr. Rajeshwari, Socratic Tutor) |
| **Module 07** | **UniHub** (Digital Library & Git Archive) | Student, Faculty, Librarian, Super Admin | **Fully Functional & Live Verified** (Digital Catalog, RFID Circulation, Git Repo Explorer, Research Archive) |
| **Module 08** | **TrackIt** (Capstone & Internships) | Student, Faculty Mentor, Coordinator, HOD | **Fully Functional & Live Verified** (Gantt Milestones M1-M4, Architecture Sign-Off, Industry Internships) |
| **Admissions** | **Admissions System** | Admission Officer, Super Admin | **Fully Functional & Live Verified** (Pipeline Management, Document Verification, Digital Student ID Pass) |
| **Finance** | **Student Fee & Bursar Console** | Bursar, Super Admin, Student | **Fully Functional & Live Verified** (Fee Ledger, Defaulter Tracking, Instant Receipts, Payroll Disbursement) |
| **Governance**| **Security & Governance Center** | Super Admin | **Fully Functional & Live Verified** (Live WAF Telemetry, Encrypted DB Backup, Interactive RBAC Matrix) |
| **Website** | **Website Content Controller** | Super Admin, Website Manager | **Fully Functional & Live Verified** (Real-Time Headline Ticker, Event Broadcaster, Campus Media) |
| **Public Web**| **Multi-Page Landing Portal** | Public / All Personas | **Fully Functional & Live Verified** (7 Distinct Hash Routes: Home, About, Academics, Faculty, Campus, Events, Admissions) |

---

### Section 1: Detailed Feature Breakdown by Subsystem

#### 1. Public Multi-Page Portal (`src/components/landing/`)
- **Multi-Page Hash Router**: `#home`, `#about`, `#academics`, `#faculty`, `#campus`, `#events`, `#admissions`.
- **Dynamic Admissions CTA**: Real-time counter, program quick-select, and modal triggers.
- **6-School Academic Explorer**: Full program specifications, credit allocations, and direct application hooks.
- **174-Faculty Directory**: Live keyword search, school/department filtering, research citation metrics, and verified email links.
- **Interactive Campus Carousel**: High-resolution gallery and emergency contact cards.
- **Full Events Catalog**: 3-column responsive event grid with calendar actions.
- **Admissions Wizard**: 4-step admissions guide, UG/PG fee structures, and document verification checklists.

#### 2. Universal Portal Shell & Security Core (`src/components/portal/`, `src/core/`)
- **11-Persona Switcher**: Dynamic role selection across all institutional profiles.
- **Role-Based Dynamic Sidebar**: Zero cross-contamination; inaccessible routes hidden from view.
- **Universal Module-Level RBAC Guard**: Prevents direct URL bypassing; renders dedicated **Access Denied** panel.
- **Decoupled Error Isolation**: `ModuleErrorBoundary` wrapping all modules with live recovery options.
- **3-State Circuit Breaker**: Prevents cascading failures during simulated or live service outages.
- **Namespaced Partitioned Storage**: `cu_mod_*` isolated storage slices preventing token or session cross-corruption.

#### 3. Module 01: EduHRMS (`src/modules/team01_hrms/`)
- Monthly Attendance Calendar with biometric status pills (Emerald Present, Sky On-Duty, Amber Half-Day, Purple Holiday, Rose Leave, Slate Weekend).
- High-contrast Attendance Color Legend & Shift Compliance panel.
- Hover popover showing detailed punch timings (In, Out, Total Hours, Biometric Terminal ID, Session Count).
- Digital Faculty Dossier displaying publications, h-index, funded research grants, and tenure milestone timeline.
- Multi-Tier Leave Workflow (Casual Leave, Medical Leave, Duty Leave, Sabbatical) with balance ledger.
- UGC Workload Balancing Matrix with School filtering, Assistant/Associate/Professor workload caps, and CSV audit export.
- Official Printable Payslip Certificate Modal with university letterhead, 7th CPC Level 10 slabs, EPF UAN, bank IFSC, and monthly payroll disbursement engine.

#### 4. Module 02: EduAttend AI (`src/modules/team02_attendance/`)
- 5-Second Rotating Cryptographic Dynamic QR Code Projector with TOTP SHA-256 tokens.
- GPS Polygon Geofencing Radar with Haversine radius validation (within 50 meters of classroom).
- Biometric Face Liveness Kiosk with BlazeFace anti-spoofing telemetry.
- Statutory 75% Exam Eligibility Gatekeeper with Condonation Request petition workflow.
- Course-Wise Manual Attendance Register with `P`/`A`/`OD`/`L` entries, bulk presets, CSV export, and `<75%` risk detection.
- Student Confidential View: Strictly restricted to student's own enrolled subject attendance. Master timetable view and downloads permanently suppressed.

#### 5. Module 03: ExamShield (`src/modules/team03_exams/`)
- Question Authoring Studio with Bloom's Taxonomy classification and KaTeX mathematical notation.
- Fullscreen Lockdown Exam Runner with multi-choice and descriptive questions.
- BlazeFace AI Proctoring Telemetry tracking head posture angles, eye gaze off-screen events, and tab switches.
- Statutory 60:40 NEP-2020 Continuous Evaluation Studio with FA-1 (15M), Mid-Term (20M), FA-2 (15M), Presentation (10M), and Final SEE (40M, min 16 to pass), automated UGC relative grade calculator, and PKI lock marksheet hash.
- Role-scoped: Authoring and evaluation tabs strictly hidden and gated from Student role.

#### 6. Module 04: CodeArena (`src/modules/team04_codearena/`)
- Multi-language sandbox execution (Python 3.11, Node v24, Java 25, C++23).
- Real-time active typing detector and student coding duration telemetry.
- Interactive Terminal Shell with continuous non-blocking stdin input pipe.
- Computer Lab Alpha 60-Station Hardware Inventory (PC-01 to PC-60) with CPU/RAM metrics, gVisor container health, and maintenance ticketing.
- AST Plagiarism Audit View comparing submission token trees and similarity matrices (strictly gated to faculty and admin).

#### 7. Module 05: PresentAI (`src/modules/team05_presentation/`)
- WebRTC Mock Video Studio stage with virtual camera and audio waveform monitoring.
- Real-time Speech Pace (WPM), Gaze Centering Heatmap, and Filler Words frequency analyzer.
- Automated Viva Voce Question Generator tailored to uploaded student slide decks.

#### 8. Module 06: CampusBot AI (`src/modules/team06_campusbot/`)
- Context-Aware Conversational Chatbot powered by Chanakya institutional knowledge base.
- Multi-Persona RAG Engine: Socratic Tutor Mode, Administrative Regulations Guide, and Solar PV Expert (Dr. Rajeshwari profile).
- Knowledge Ingestion Manager for uploading university circulars, handbooks, and bylaws.

#### 9. Module 07: UniHub (`src/modules/team07_unihub/`)
- Digital Library Catalog with title, author, ISBN, shelf rack location, and subscribed journals (IEEE Xplore, ACM DL).
- RFID Circulation Desk with 14-day book issuance, overdue calculation (₹5/day late fee), and barcode checkouts.
- Self-hosted Git Repository Explorer with branch selector, commit history, and side-by-side code diff visualizer.
- Faculty Research Paper Archive with BibTeX export, DOI resolvers, and OpenAlex indexing.

#### 10. Module 08: TrackIt (`src/modules/team08_trackit/`)
- Capstone Project Milestone Tracker with interactive Gantt-style progress bars and mentor approvals.
- Architecture Blueprint Sign-Off and Defense Panel scheduling.
- Industry Internship Roster tracking corporate MoUs, stipend amounts, and supervisor sign-offs.

---

### Section 2: Critical Vulnerability Remediations

| Defect / Vulnerability | Severity | Remediation | Verification Status |
|---|---|---|---|
| **Arbitrary Password Authentication** | **CRITICAL** | Enforced strict password matching in `AuthContext.tsx`. Rejected attempts trigger error notice while keeping modal open. | Verified Live |
| **Exam Authoring Student Exposure** | **HIGH** | Gated Authoring and Evaluation tabs behind role checks in `ExamsModule/index.tsx`. | Verified Live |
| **CodeArena Plagiarism Student Tab** | **HIGH** | Wrapped tab button and view renderer in `isFacultyOrAdmin` in `team04_codearena/index.tsx`. | Verified Live |
| **Student Timetable Extraction** | **HIGH** | Renamed navigation to "Smart Attendance & QR", hid module tabs, and enforced component-level access denied guards in `TimetableManager.tsx`. | Verified Live |
| **Direct URL Module RBAC Bypass** | **HIGH** | Added `hasModuleAccess` in `App.tsx` rendering a dedicated Access Denied panel for unauthorized module navigation attempts. | Verified Live |
| **Monolithic Public Landing Page** | **MEDIUM** | Split 710-line monolith into 7 modular pages with hash-based deep linking. | Verified Live |

---

### Section 3: Future Production Roadmap (Phases 2 & 3)

#### Phase 2: Immediate Enhancements
- [ ] **Automated Question Paper AI**: Generates balanced Bloom-taxonomy question sets from syllabus document embeddings.
- [ ] **Attendance Defaulter SMS/WhatsApp Dispatch**: Automated notifications to students and parents when attendance dips below 75%.
- [ ] **Payment Gateway Webhook Listener**: Direct Razorpay/PayU webhook listener for zero-latency fee reconciliation.
- [ ] **DigiLocker / NAD Integration**: Automated push of semester grade cards and degree transcripts to National Academic Depository.

#### Phase 3: Advanced Institutional Infrastructure
- [ ] **WebAuthn / FIDO2 Biometric Hardware Key Support**: Hardware token enforcement for administrative and bursar accounts.
- [ ] **Multi-Region Database Replication**: Read-replicas and cross-region disaster recovery failovers.
- [ ] **Offline PWA Service Worker**: Full offline caching of lecture PDFs, syllabus documents, and personal schedules.
