# UniSphere: Strategic Project Roadmap & Engineering Blueprint
## Academic Year 2026-2027 | Enterprise Campus Autonomous Ecosystem
**Document Status:** Production Certified (Post-Fix Live Verified)  
**Last Updated:** September 6, 2026  
**Auditor / Lead Architect:** Senior Lead Architect & Cybersecurity Specialist

---

## 1. Vision & Architecture Philosophy

UniSphere is designed as a **resilient, fault-isolated academic ecosystem** engineered for high-concurrency university operations. The foundational architectural principle is **Autonomous Domain Isolation**: each department and functional domain operates as an autonomous module with strict fault boundaries, ensuring that **a catastrophic fault in any single subsystem never cascades to compromise the university portal shell or adjacent services**.

```
                           +---------------------------------------------+
                           |       Universal Portal Shell & Gateway      |
                           |  (Zero-Downtime, Dynamic RBAC, SSO, Audit)  |
                           +---------------------------------------------+
                                                  |
                    +-----------------------------+-----------------------------+
                    |                             |                             |
      +---------------------------+ +---------------------------+ +---------------------------+
      | Module 01: EduHRMS        | | Module 02: EduAttend AI   | | Module 03: EduExam AI     |
      | - Faculty Dossiers        | | - 5s Dynamic QR Codes     | | - Anti-Cheat Lockdown     |
      | - Workload Allocator      | | - Geo-Fencing Polygon     | | - Formula Authoring Studio|
      | - Payroll & Payslips      | | - 75% Statutory Gate      | | - Real-time AI Proctoring |
      | [Module Error Boundary]   | | [Module Error Boundary]   | | [Module Error Boundary]   |
      +---------------------------+ +---------------------------+ +---------------------------+
                    |                             |                             |
      +---------------------------+ +---------------------------+ +---------------------------+
      | Module 04: EduCode Judge  | | Module 05: EduPresent AI  | | Module 06: EduAssist AI   |
      | - Monaco Web IDE          | | - WebRTC Virtual Studio   | | - RAG Ingestion Pipeline  |
      | - Container Sandbox Judge | | - Slide-Audio Alignment   | | - Role-Scoped Citations   |
      | - AST Plagiarism Engine   | | - AI Viva Voce Generator  | | - Socratic Code Tutor     |
      | [Module Error Boundary]   | | [Module Error Boundary]   | | [Module Error Boundary]   |
      +---------------------------+ +---------------------------+ +---------------------------+
                    |                             |                             |
      +---------------------------+ +---------------------------+ +---------------------------+
      | Module 07: UniHub         | | Module 08: TrackIt        | | Core Resilience Tier      |
      | - Self-Hosted Git Explorer| | - Capstone Milestones     | | - Circuit Breaker Pattern |
      | - Diff & Branch Inspector | | - Guide & Coord Rubrics   | | - Sandboxed Campus Bus    |
      | - Research Paper Archive  | | - Logbook Audit Trail     | | - Isolated Storage Slices |
      | [Module Error Boundary]   | | [Module Error Boundary]   | | - Health Registry Telemetry|
      +---------------------------+ +---------------------------+ +---------------------------+
```

---

## 2. Multi-Phase Implementation Roadmap

### Phase 1: Foundation & Fault Isolation Engine (Completed & Verified)
- [x] Monorepo structure setup and UI token unification (Navy, Saffron, Gold).
- [x] Implement `ModuleErrorBoundary` with visual diagnostics, hot module reload, and crash sandbox.
- [x] Implement client-side `CircuitBreaker` service (`CLOSED`, `OPEN`, `HALF_OPEN`).
- [x] Deploy `CampusEventBus` with sandboxed listener execution to prevent event handler crashes from bubbling.
- [x] Deploy `IsolatedStorage` with namespace partitioning (`cu_mod_<id>_*`).
- [x] Deploy real-time `ModuleHealthRegistry` with dynamic status telemetry in Portal Header.

### Phase 2: Autonomous Team Modularization (Completed & Verified)
- [x] Create autonomous folder structures under `src/modules/` for each team (`team01_hrms` through `team08_trackit`).
- [x] Relocate and refactor module logic into modular subcomponents:
  - `components/`: UI views, forms, modals, visualization cards.
  - `services/`: Resilient data access, circuit breaker integration, mock data.
  - `types/`: Strict TypeScript contracts and DDL-aligned interfaces.
  - `hooks/`: Domain-specific state management.
  - `README.md`: Developer contract and integration guide for each 3-student team.
- [x] Wire all 8 modules into `src/App.tsx` through `ModuleErrorBoundary` wrappers.

### Phase 3: Feature Enhancement & Domain Deepening (Completed & Verified)
- [x] **HRMS**: Dynamic workload credit calculator with overload warnings and printable PDF payslip preview.
- [x] **Smart Attendance**: Live 5-second rotating HMAC-SHA256 QR generator and interactive geofencing simulator.
- [x] **Online Exams**: Fullscreen lockdown test runner with simulated webcam face-gaze proctoring violations and Gurukulya 60:40 NEP grading studio.
- [x] **Code Arena**: Interactive Monaco-based code editor with non-blocking continuous stdin/stdout execution simulator and testcase verdicts.
- [x] **Presentation AI**: Synchronized slide viewer with simulated speech pace, filler-word detector, and viva questions.
- [x] **Campus AI Bot**: Socratic tutor mode with context-grounded citations, 174 faculty profiles, and Solar PV expert persona.
- [x] **UniHub**: Interactive Git repo explorer with visual branch commit tree, diff viewer, and research PDF preview.
- [x] **TrackIt**: Interactive capstone milestone timeline with rubric scoring, guide feedback, and corporate internships.

### Phase 4: Production Hardening, Security Audit & Defect Fixes (Completed & Verified)
- [x] Conduct end-to-end type check (`tsc --noEmit`) — 0 errors.
- [x] Verify production build (`npm run build`) — bundled in 6.59s.
- [x] Perform fault-isolation tests (simulate module crash; verify portal shell remains healthy).
- [x] Remediate arbitrary password authentication bypass in `AuthContext.tsx`.
- [x] Restrict Exam Authoring and Evaluation tabs from student view in `ExamsModule`.
- [x] Gated CodeArena Plagiarism tab from student view in `team04_codearena`.
- [x] Block student timetable extraction and download across sidebar, module tabs, and render components.
- [x] Deploy centralized route and module RBAC guard in `App.tsx` with dynamic Access Denied panel.

### Phase 5: Multi-Page Public Website Architecture (Completed & Verified)
- [x] Deconstruct monolithic landing page into a modular multi-page application.
- [x] Implement hash-based deep linking for all 7 public routes (`#home`, `#about`, `#academics`, `#faculty`, `#campus`, `#events`, `#admissions`).
- [x] Deploy 6-school interactive academic explorer with programme specifications and application triggers.
- [x] Deploy 174-faculty directory with instant search, school filtering, and verified links.
- [x] Deploy responsive campus facility showcase and high-resolution media carousel.
- [x] Generate updated statutory Word documents (`UNISPHERE_ROLE_FEATURE_AUDIT_AND_GAP_ANALYSIS.docx` & `CHANAKYA_UNIVERSITY_UNISPHERE_MASTER_SYSTEM_ARCHITECTURE_AND_SECURITY_AUDIT.docx`).

### Phase 6: Future Enterprise Horizons (Next Sprints)
- [ ] AI Automated Question Paper Generator from syllabus PDF embeddings.
- [ ] Direct bank webhook listener (Razorpay/PayU) for zero-latency fee reconciliation.
- [ ] DigiLocker / NAD integration for automated transcript uploads.
- [ ] FIDO2 / WebAuthn hardware biometric key authentication for administrative roles.

---

## 3. Team Assignment & Responsibility Matrix

| Team & Module | Primary Responsibilities | Student Roles & Focus |
| :--- | :--- | :--- |
| **Team 01: EduHRMS** | Personnel records, leave approval chains, workload balancing, payroll computation. | S1: Dossier UI / S2: Workload Engine / S3: Payroll Schema & Security |
| **Team 02: EduAttend AI** | Dynamic rotating QR codes, GPS geofence radius, face liveness kiosk, 75% exam gate. | S1: Scanner UI / S2: 5s Nonce & GeoFence / S3: Liveness & Medical Condonation |
| **Team 03: EduExam AI** | Lockdown exam shell, question authoring with formulas, AI proctoring, instant grading. | S1: Exam Shell / S2: Question Shuffler & Autosave / S3: AI Gaze & Violation Logger |
| **Team 04: EduCode Judge** | Monaco Web IDE, execution sandbox, test-case evaluator, AST plagiarism detection. | S1: Web IDE / S2: Test Case Judge Queue / S3: Sandbox Security & AST Comparator |
| **Team 05: EduPresent AI** | Live WebRTC stage, slide sync, speech pace & filler words, automated viva generation. | S1: WebRTC & Slides / S2: Speech Metrics / S3: Gaze Analysis & Rubric Dossier |
| **Team 06: EduAssist AI** | RAG document ingestion, hybrid vector search, role-aware answers, tutor mode. | S1: Chat Interface / S2: RAG Ingestion Pipeline / S3: pgvector Security & Citations |
| **Team 07: UniHub** | Web Git repo explorer, diff viewer, research paper archive, live activity feed. | S1: Git Explorer UI / S2: Git Smart Protocol / S3: S3 Storage & Paper Indexer |
| **Team 08: TrackIt** | Capstone project milestones, guide & coordinator rubrics, logbook audit trail. | S1: Milestone Kanban / S2: Review Scorer / S3: Approval Workflow & Audit Trail |

---

## 4. Fault Isolation & High Availability Architecture

```
                          [ Client Browser Navigation ]
                                       |
                     [ Portal Shell (Top Nav + Sidebar) ]
                                       |
                   [ Active Module Container (e.g. Code Arena) ]
                                       |
                      +---------------------------------+
                      |    ModuleErrorBoundary Check    |
                      +---------------------------------+
                                     /     \
                                    /       \
                         [ Normal Render ]  [ Unhandled Exception Caught ]
                                |                        |
                    [ CircuitBreaker: Safe ]   +------------------------------------+
                                |              | Render Fault-Isolation Fallback:   |
                     [ Complete Module UI ]    | • "CodeArena Fault Isolated"       |
                                               | • Diagnostics & Error Stack        |
                                               | • [Reload Module] [Safe Mode]      |
                                               | • Universal Shell Unaffected       |
                                               +------------------------------------+
```

Every module is isolated within its own subtree. A fatal exception in one module triggers the localized error boundary without propagating to React root or adjacent modules.
