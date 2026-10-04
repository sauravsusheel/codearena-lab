# Subsystem Specification: Team 01 - EduHRMS (Human Resource & Workload Management)

## 1. Executive Summary & Functional Scope
The EduHRMS subsystem serves as the centralized digital repository for academic personnel, tenure dossiers, credit-hour distribution, multi-tier leave approval state machines, and statutory compensation disbursement. Built specifically for Chanakya University's multi-school collegiate structure, EduHRMS balances teaching workloads under the National Education Policy (NEP 2020) while enforcing rigid role-based access control (RBAC).

### Key Capabilities
- **Faculty Digital Dossier**: Verified tracking of educational qualifications, Scopus/UGC-CARE indexed publications, ongoing doctoral supervisions, and patent filings.
- **NEP Workload Allocation Engine**: Automated distribution of theory lectures, laboratory practica, and research credits, with real-time detection of timetable collision and credit over-allocation (>16 credits/week).
- **Hierarchical Leave State Machine**: Four-stage workflow (Draft -> Submitted -> HoD Endorsement -> Dean Approval / Rejection) supporting Casual Leave (CL), Medical Leave (ML), and On-Duty Academic Leave (OD).
- **Payroll & Statutory Deductions**: Automated computation of Basic Pay, Academic Grade Pay (AGP), House Rent Allowance (HRA), Dearness Allowance (DA), Provident Fund (PF), and Professional Tax (PT).

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team01_hrms/
|-- components/
|   |-- FacultyDossier.tsx       # Comprehensive academic credentials and research index
|   |-- LeaveManagement.tsx      # Multi-tier leave application and approval dashboard
|   |-- WorkloadAllocator.tsx    # Credit-hour balancing and collision detection matrix
|   \-- PayrollView.tsx          # Institutional payslip generator and tax summary
|-- services/
|   \-- hrmsService.ts           # Resilient data service with CircuitBreaker and IsolatedStorage
|-- types/
|   \-- hrms.types.ts            # Immutable TypeScript interfaces matching PostgreSQL schema
|-- index.tsx                    # Autonomous subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical documentation and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE hrms_faculty_profiles (
    faculty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    institutional_email VARCHAR(128) UNIQUE NOT NULL,
    designation VARCHAR(64) NOT NULL,
    school_id VARCHAR(32) NOT NULL,
    qualification VARCHAR(64) NOT NULL,
    specialization VARCHAR(128) NOT NULL,
    teaching_credits_per_week INT CHECK (teaching_credits_per_week <= 20),
    scopus_publications_count INT DEFAULT 0,
    phd_scholars_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hrms_leave_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES hrms_faculty_profiles(faculty_id) ON DELETE CASCADE,
    leave_type VARCHAR(16) CHECK (leave_type IN ('CASUAL', 'MEDICAL', 'ON_DUTY', 'MATERNITY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL CHECK (days_count > 0),
    reason TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'HOD_APPROVED', 'DEAN_APPROVED', 'REJECTED')),
    approver_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hrms_payroll_records (
    payroll_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES hrms_faculty_profiles(faculty_id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    basic_pay NUMERIC(10, 2) NOT NULL,
    agp NUMERIC(10, 2) NOT NULL,
    hra NUMERIC(10, 2) NOT NULL,
    da NUMERIC(10, 2) NOT NULL,
    pf_deduction NUMERIC(10, 2) NOT NULL,
    pt_deduction NUMERIC(10, 2) NOT NULL,
    net_payable NUMERIC(10, 2) NOT NULL,
    disbursed_at TIMESTAMPTZ,
    status VARCHAR(16) DEFAULT 'PROCESSED'
);
```

---

## 4. API Specification & Network Contracts
### REST Endpoints
- `GET /api/v1/hrms/faculty/me`
  - **Auth**: Bearer JWT (Roles: `FACULTY`, `HR_ADMIN`, `SUPER_ADMIN`)
  - **Response 200**: Complete JSON dossier with publication lists and teaching allocations.
- `POST /api/v1/hrms/leaves`
  - **Auth**: Bearer JWT (Role: `FACULTY`)
  - **Payload**: `{"leave_type": "CASUAL", "start_date": "2026-09-10", "end_date": "2026-09-12", "reason": "Academic conference"}`
  - **Response 201**: `{"request_id": "...", "status": "SUBMITTED"}`
- `PATCH /api/v1/hrms/leaves/:id/status`
  - **Auth**: Bearer JWT (Roles: `HR_ADMIN`, `COORDINATOR`, `SUPER_ADMIN`)
  - **Payload**: `{"status": "DEAN_APPROVED", "remarks": "Approved with substitute faculty assigned"}`
  - **Response 200**: Updated record with timestamped signature.

---

## 5. Resilience & Fault-Isolation Architecture
- **Circuit Breaker**: Integrated `CircuitBreaker` with 5-failure threshold and 30-second cooldown prevents cascading network timeouts to PostgreSQL.
- **Isolated Storage Partitioning**: Cache stored under local key prefix `cu_mod_hrms_*`, ensuring quota corruption in other modules cannot impact HRMS state.
- **Self-Healing UI**: If unhandled runtime exceptions occur within Leave or Payroll components, `ModuleErrorBoundary` displays a diagnostic panel with Safe-Mode fallback while leaving the rest of the ERP fully functional.

---

## 6. Cybersecurity & Compliance Verification
- **Input Sanitization**: All free-text inputs (leave reasons, remarks) are sanitized against XSS using DOMPurify before rendering.
- **PII Obfuscation**: Bank account numbers and PAN IDs in payroll views are masked (e.g., `XXXX-XXXX-4819`) to prevent over-the-shoulder data leaks.
- **Data Protection**: Full compliance with the Digital Personal Data Protection (DPDP) Act 2023 regarding employee personnel records.
