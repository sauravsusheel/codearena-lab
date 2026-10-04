# UniSphere (unisphere) — Chanakya University Unified Autonomous Academic Platform

[![CI Pipeline](https://github.com/deepak5256/unisphere/actions/workflows/ci.yml/badge.svg)](https://github.com/deepak5256/unisphere/actions)
[![Production Build](https://img.shields.io/badge/Production%20Build-Passing%20(5.22s)-emerald?style=flat-square&logo=vite)](https://github.com/deepak5256/unisphere)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2%20Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-DPDP%202023%20%7C%20NEP%202020-orange?style=flat-square)](https://www.education.gov.in/nep)
[![Security](https://img.shields.io/badge/Zero--Trust-17%20Roles%20Enforced-navy?style=flat-square)](#security--governance)

> **Official Institutional Monorepo & Autonomous Academic Operating System**  
> Established under the Chanakya University Act, 2021 (Karnataka Act No. 24 of 2021).  
> Designed and architected as a decoupled, fault-isolated, zero-cascading academic and governance ecosystem.

---

## 🏛️ System Overview

UniSphere is the enterprise digital infrastructure of Chanakya University. Engineered for high-concurrency university administration, research facilitation, and automated academic operations, UniSphere delivers complete coverage across the student and faculty lifecycle:

1. **Multi-Page Public Portal**: Deep-linked, bookmarkable public web interface with dedicated routes for Institutional Overview, 6-School Academic Explorer, 174-Faculty Directory, Campus Facilities, Events, and Admissions Pipeline.
2. **Autonomous Academic Subsystems**: 8 independent team modules isolated by client-side `ModuleErrorBoundary` containers, 3-state `CircuitBreaker` proxies, namespaced `IsolatedStorage` partitions, and a sandboxed `CampusEventBus`.
3. **Institutional Governance & Security**: Real-time WAF telemetry, cryptographic audit trails, automated DPDP Act 2023 compliance isolation, and tamper-proof digital credentials.
4. **Offline-First & Hybrid Cloud Storage**: Unified LocalStorage engine for instant zero-latency development and demonstration, with hot-swappable Firebase Firestore & Storage production connectivity.

---

## 🌐 Public Website Architecture (Multi-Page Router)

The public landing experience (`src/components/landing/`) is structured as a modular Multi-Page Application powered by hash-based routing (`#home`, `#about`, `#academics`, `#faculty`, `#campus`, `#events`, `#admissions`):

| Route | View Component | Key Features & Capabilities |
|---|---|---|
| `#home` | [`LandingHomePage.tsx`](src/components/landing/pages/LandingHomePage.tsx) | Dynamic Admissions CTA, Live Academic Statistics strip, 4 Institutional Pillars, Campus Events teaser. |
| `#about` | [`LandingAboutPage.tsx`](src/components/landing/pages/LandingAboutPage.tsx) | Board of Governors, Chancellor & Vice-Chancellor leadership profiles, statutory accreditation framework. |
| `#academics` | [`LandingAcademicsPage.tsx`](src/components/landing/pages/LandingAcademicsPage.tsx) | Interactive tabbed explorer across all 6 constituent schools (Engineering, Management, Humanities, Science, Law, Indian Studies) with detailed programme specs and apply hooks. |
| `#faculty` | [`LandingFacultyPage.tsx`](src/components/landing/pages/LandingFacultyPage.tsx) | Full directory of **174 faculty members** with instantaneous text search, school/department filtering, publication counts, and verified email links. |
| `#campus` | [`LandingCampusPage.tsx`](src/components/landing/pages/LandingCampusPage.tsx) | High-resolution campus media carousel, emergency contact registry, structured facility showcases (NVIDIA AI Center, Solar PV Lab, Central Library, Research Complex). |
| `#events` | [`LandingEventsPage.tsx`](src/components/landing/pages/LandingEventsPage.tsx) | 3-column event catalog with calendar actions, symposium listings, and hackathon registration forms. |
| `#admissions` | [`LandingAdmissionsPage.tsx`](src/components/landing/pages/LandingAdmissionsPage.tsx) | 4-step admissions roadmap, UG/PG fee structures, statutory document checklist, and interactive apply modal. |

---

## 👥 Institutional Roles & Test Accounts

UniSphere enforces strict, zero-trust role-based access control across **11 distinct institutional personas**. Each persona has tailor-made module scopes, privacy isolation, and authorization gates:

| # | Role Key | Test Username | Test Persona & Description | Accessible Modules |
|---|---|---|---|---|
| 1 | `SUPER_ADMIN` | `admin` | Dr. R. Sharma (System Administrator) | All 17 internal modules + WAF & Governance |
| 2 | `STUDENT` | `student` | Arjun Kumar (MCA Sem 3, Roll: 24MCA003) | Attendance QR, CodeArena, Exams, PresentAI, UniHub, TrackIt |
| 3 | `FACULTY` | `faculty` | Dr. Priya Nair (Associate Professor, CSE) | QR Kiosk, 60:40 NEP Grading, Question Authoring, Viva Scoring |
| 4 | `HOD` | `hod` | Dr. A. K. Sundaram (Head of Computing) | Department Workload, Leave Approvals, Curriculum Allocations |
| 5 | `DEAN` | `dean` | Prof. M. S. Rao (Dean of Engineering) | School-Level KPIs, Recruitment Dossiers, Research Grants |
| 6 | `PROCTOR` | `proctor` | Prof. Vikram Sen (Chief Proctor) | Attendance Defaulters (<75%), Medical Leave Proofs, Gate Logs |
| 7 | `EXAM_CONTROLLER`| `coe` | Dr. S. K. Venkatesh (Controller of Exams) | Master Timetable, 75% Gate, Digital Hall Tickets, Transcripts |
| 8 | `ADMISSION_OFFICER`| `admissions` | Ms. Sunita Roy (Admissions Officer) | Lead Ingestion, Document Verification, Fee Receipts, Enrolment |
| 9 | `PLACEMENT_OFFICER`| `placements` | Mr. Rakesh Menon (Corporate Relations) | Drive Coordinator, Student Eligibility Filters, Recruiter Portal |
| 10| `BURSAR` | `bursar` | CA Ramesh Chand (Finance Officer) | Student Fee Ledgers, Faculty Payroll, Bank Reconciliation |
| 11| `AUDITOR` | `auditor` | External Quality Assurance Cell (NAAC/NIRF) | Read-only compliance audit, immutable logs, SSR exports |

> **Authentication Credentials Note:** For all test personas, use the respective username with password `password123` (or any valid preset configured in [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx)). Invalid passwords trigger strict authentication rejection.

---

## 🧩 Autonomous Subsystem Modules (Monorepo Layout)

Each subsystem resides in `src/modules/` and conforms to strict modularity guidelines:

```
src/modules/
├── team01_hrms/           # EduHRMS: Faculty Dossiers, Workload Allocator, Payroll Engine
├── team02_attendance/     # EduAttend AI: Dynamic QR (5s), GPS Geofencing, Biometric Kiosk
├── team03_exams/          # ExamShield: Lockdown Browser, Question Authoring, Gurukulya 60:40 AI
├── team04_codearena/      # CodeArena: Multi-Language IDE, Non-blocking stdin, Plagiarism Audit
├── team05_presentation/   # PresentAI: WebRTC Viva Stage, Gaze Heatmap, Speech Pace, WPM Meter
├── team06_campusbot/      # Campus AI Oracle: Context-Aware RAG Bot, 174 Faculty Knowledge Base
├── team07_unihub/         # UniHub: Institutional Research Archive, Git Explorer, OpenAlex Papers
└── team08_trackit/        # TrackIt: Capstone Milestones M1-M4, Industry Internships, Guide Rubric
```

### Core Portal Views (`src/components/portal/`)
- `SuperAdminGovernanceView.tsx`: Real-time security telemetry, WAF intrusion metrics, cryptographic backup engine, dynamic RBAC matrix.
- `StudentFeeFinanceView.tsx`: Complete fee management console, tuition defaulter ledger, instant receipt generator.
- `AdmissionsManagementView.tsx`: Pipeline tracking, application processing desk, digital student ID card issuer.
- `WebsiteContentManagerView.tsx`: Real-time public website headline ticker, event broadcaster, campus media management.
- `FacultyDossierView.tsx`: Detailed faculty tenure tracker, h-index, and publication archives.
- `ApprovalsView.tsx`: Centralized institutional workflow approval queue.
- `HelpCenterView.tsx`: University directory, helpline extensions, and downloadable statutory circulars.

---

## 🛡️ Security & Zero-Trust Architecture

UniSphere enforces an exhaustive cybersecurity posture:

1. **Route & Component-Level Authorization**: Direct URL manipulation or programmatic view switching to unauthorized modules triggers a dedicated **Access Denied** panel featuring the user's role badge, the requested module name, and an automatic safe navigation link.
2. **DPDP Act 2023 Compliance**: Student health justifications, biometric face recordings, and GPS coordinates are quarantined and rendered only to the specific student and authorized proctors.
3. **Information Leakage Suppression**:
   - Master institutional timetables are completely inaccessible to students (enforced at sidebar, module navigation, and component render layers).
   - CodeArena plagiarism inspection tools are hidden and blocked from student roles.
   - Examination authoring and evaluation studios are strictly gated to faculty and exam controllers.
4. **Input Sanitization & Sandboxing**: All form inputs, search fields, and terminal code executions are sanitized and run in isolated sandboxed contexts.
5. **Zero Emojis Mandate**: Strict adherence to enterprise institutional aesthetics utilizing Lucide SVG icons exclusively.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: `v20+` or `v24`)
- **Package Manager**: `npm` (v9+) or `pnpm`
- **Python**: `3.10+` (optional, for regenerating statutory `.docx` documentation)

### Installation
```bash
# Clone the repository
git clone https://github.com/deepak5256/unisphere.git
cd unisphere

# Install dependencies
npm install

# Configure environment secrets
cp .env.example .env
```

### Environment Secrets Configuration
UniSphere includes `.env.example` (and `.env.examples`) detailing optional cloud bindings:
- **Firebase Firestore & Cloud Storage**: Real-time multi-tenant database & asset hosting.
- **Institutional SMTP**: Automated 6-digit cryptographic OTP dispatch and official circulars.
- **Artificial Intelligence APIs**: Gemini, OpenAI, and Anthropic for Campus AI Oracle & Socratic Tutor.
- **CodeArena Judge0 API**: Remote sandbox compiler engine for automated test runners.

### Development Server
```bash
# Start local Vite development server
npm run dev
```
The portal is immediately accessible at **`http://localhost:5173/`**.

### Production Build
```bash
# Validate TypeScript contracts and build production bundle
npm run build
```
Build completes with zero errors into `dist/`.

---

## 📚 Documentation Index

The repository maintains an exhaustive suite of formal documentation:

| Document File | Format | Description |
|---|---|---|
| [`ROLE_WISE_FEATURE_AUDIT_AND_GAP_ANALYSIS.md`](ROLE_WISE_FEATURE_AUDIT_AND_GAP_ANALYSIS.md) | Markdown | V3.0 comprehensive feature inventory, live-verified audit, and roadmap gaps across all 11 roles and 17 modules. |
| [`UNISPHERE_ROLE_FEATURE_AUDIT_AND_GAP_ANALYSIS.docx`](UNISPHERE_ROLE_FEATURE_AUDIT_AND_GAP_ANALYSIS.docx) | Word (.docx) | Statutory audit document, including ER schemas and API specs. |
| [`CHANAKYA_UNIVERSITY_UNISPHERE_MASTER_SYSTEM_ARCHITECTURE_AND_SECURITY_AUDIT.docx`](CHANAKYA_UNIVERSITY_UNISPHERE_MASTER_SYSTEM_ARCHITECTURE_AND_SECURITY_AUDIT.docx) | Word (.docx) | Deep-dive master system architecture, zero-cascading resilience pillars, circuit breaker policies, and PostgreSQL schemas. |
| [`CRITIQUE_AND_ENHANCEMENT_REPORT.md`](CRITIQUE_AND_ENHANCEMENT_REPORT.md) | Markdown | Multi-persona critique, defect analysis, and UX hardening roadmap. |
| [`FEATURE_AUDIT_AND_ROADMAP.md`](FEATURE_AUDIT_AND_ROADMAP.md) | Markdown | Engineering milestone matrix, completed feature inventory, and planned Phase 2/3 enhancements. |
| [`documentation/specs/PROJECT_SPECIFICATION.md`](documentation/specs/PROJECT_SPECIFICATION.md) | Markdown | Statutory software requirements specification (SRS) and domain specifications. |

---

## 🏛️ Statutory Authority & Governance

Developed for **Chanakya University**, Global Campus, Haraluru, Devanahalli Taluk, Bengaluru Rural District, Karnataka, India.  
*All rights reserved &copy; 2026 Chanakya University.*
