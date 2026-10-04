# Subsystem Specification: Team 04 - CodeArena (Algorithmic Judge & Compiler Sandbox)

## 1. Executive Summary & Functional Scope
CodeArena is the coding, competitive programming, and automated evaluation module for computer science courses at Chanakya University. The repository now contains a authoritative server-side judge with Docker sandbox execution for production and optional gVisor/Firecracker-compatible runtime hardening.

### Key Capabilities
- **Monaco Browser IDE**: Fully featured code editor with syntax highlighting, auto-completion, line numbers, and theme support.
- **Sandbox execution path**: per-run temporary workspaces, execution time/output limits, cleanup, and optional Docker `--network none` isolation; production deployment should place the worker behind gVisor/Firecracker or an equivalent hardened sandbox.
- **Plagiarism Forensics Engine**: normalized-token fingerprinting/Winnowing-style similarity across persisted submissions, with faculty/admin review UI.
- **Contest Leaderboard**: Real-time rank aggregation based on problem weight, execution time, memory usage, and penalty minutes.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team04_codearena/
|-- components/
|   |-- CodeEditor.tsx           # Monaco code editing interface with language selector
|   |-- TestCaseRunner.tsx       # Standard input/output runner with diff assertions
|   |-- PlagiarismDetector.tsx   # structural token/Winnowing similarity engine and comparison diff
|   \-- ContestLeaderboard.tsx   # Dynamic scoreboard with testcase benchmarks
|-- services/
|   \-- codeArenaService.ts      # Sandbox dispatch service with queue throttling
|-- types/
|   \-- codearena.types.ts       # Programming problem and submission definitions
|-- index.tsx                    # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE codearena_problems (
    problem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    difficulty VARCHAR(16) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    time_limit_ms INT DEFAULT 1000,
    memory_limit_mb INT DEFAULT 256,
    problem_statement TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE codearena_testcases (
    testcase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES codearena_problems(problem_id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    weight INT DEFAULT 1
);

CREATE TABLE codearena_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES codearena_problems(problem_id),
    student_id UUID NOT NULL,
    language VARCHAR(16) NOT NULL CHECK (language IN ('PYTHON3', 'CPP20', 'JAVA17', 'GO')),
    source_code TEXT NOT NULL,
    verdict VARCHAR(32) DEFAULT 'PENDING' CHECK (verdict IN ('ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'PLAGIARISM_FLAGGED')),
    passed_testcases INT DEFAULT 0,
    total_testcases INT DEFAULT 0,
    max_runtime_ms INT DEFAULT 0,
    max_memory_mb INT DEFAULT 0,
    ast_hash VARCHAR(64),
    plagiarism_score NUMERIC(5, 2) DEFAULT 0.0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Specification & Network Contracts
### REST & Execution Endpoints
- `POST /api/v1/codearena/run`
  - **Payload**: `{"language": "PYTHON3", "source_code": "...", "custom_input": "5\n1 2 3 4 5"}`
  - **Response 200**: `{"stdout": "15\n", "stderr": "", "execution_time_ms": 42, "memory_mb": 14.2, "status": "SUCCESS"}`
- `POST /api/v1/codearena/submit`
  - **Payload**: `{"problem_id": "...", "language": "CPP20", "source_code": "..."}`
  - **Response 200**: `{"submission_id": "...", "verdict": "ACCEPTED", "passed": 10, "total": 10, "runtime_ms": 18}`
- `POST /api/v1/codearena/plagiarism-audit`
  - **Auth**: Bearer JWT (Role: `FACULTY`, `SUPER_ADMIN`)
  - **Response 200**: Pairwise similarity matrices identifying shared code fragments.

---

## 5. Resilience & Fault-Isolation Architecture
- **Sandboxing Boundaries**: Fork bombs, network sockets, and unprivileged system calls are blocked by seccomp filters. If a student writes an infinite loop or allocates excessive RAM, only the ephemeral runner terminates.
- **Persistent Drafts**: editor code is autosaved to the CodeArena SQLite service, with the existing without executing student code locally.


## 2026 Working Implementation Upgrade

The repository now includes a real CodeArena service layer under `server/index.mjs`. The frontend requires the authoritative CodeArena backend for code execution, submissions, and lab operations.

### Implemented workflows
- SQLite-backed problems, hidden/public test cases, submissions, drafts, lab stations, maintenance tickets, broadcasts, audit logs, and learning-time records.
- Real native execution for Python, JavaScript, C, C++, Java, and Go using temporary per-run workspaces, timeouts, output limits, and cleanup.
- Optional Docker isolation with `CODEARENA_DOCKER=1`; Docker execution uses `--network none`, CPU/memory/PID limits, read-only workspace, and temporary filesystem.
- Server-authoritative assignment evaluation and submission receipts instead of browser-generated marks/receipts.
- Cloud-synchronized drafts/autosave with an offline fallback indicator.
- Persistent submission history and code-quality scoring.
- Learning-hour tracking, accuracy tracking, weak-topic detection, remedial-practice status, and configurable exam-eligibility thresholds.
- Persistent 60-station inventory, maintenance workflow, reboot/reset actions, station heartbeat API, and a deployable `scripts/station-agent.mjs`.
- Faculty analytics reads persistent station/time data rather than only static component data.
- Plagiarism audit API using normalized-token fingerprints/Winnowing-style matching; faculty-only UI remains protected by the existing role gate.
- Broadcast/audit endpoints are available for lab operations.

### Run locally

Terminal 1:
```bash
npm run server
```

Terminal 2:
```bash
npm run dev
```

Or use:
```bash
npm run dev:full
```

The API is available at `http://localhost:8787`. The SQLite database is created automatically at `server/data/codearena.sqlite` and is ignored by Git.

### Real lab station heartbeat
Run one agent on each lab workstation, replacing the server address:
```bash
node scripts/station-agent.mjs PC-01 http://LAB-SERVER:8787
```
The agent reports CPU/RAM health every five seconds.

### Production execution isolation
Production execution requires Docker sandboxing (`CODEARENA_DOCKER=1`). Student code is never executed by the browser or a host-native fallback. Configure `CODEARENA_SANDBOX_RUNTIME=runsc` when Docker is configured with gVisor.

### Execution boundary
There is no host-native or browser execution path. Batch evaluation, quick-run, submissions, and the interactive terminal all require the Docker sandbox. For internet-facing student workloads, configure `CODEARENA_SANDBOX_RUNTIME=runsc` when gVisor is available, keep `--network none`, enforce cgroup/PID/output limits, and isolate execution workers from the public network.
