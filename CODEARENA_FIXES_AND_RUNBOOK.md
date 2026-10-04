# CodeArena Lab Station — Fixes Applied

This release is based on the uploaded `CodeArena-Lab-Station-LMS-Database-Connected.zip`.

## Major fixes

- Removed the Vite development-server code execution plugin. Student code is no longer executed on the host machine by `npm run dev`.
- Removed the browser-side Python/Java/C/C++ execution engines from the CodeArena execution service.
- Made CodeArena batch execution Docker-only.
- Reworked the interactive terminal to use the same Docker sandbox policy as grading.
- Added authenticated interactive session start/input/kill handling.
- Added short-lived stream-token authentication for interactive SSE connections.
- Removed legacy `/tmp/main` and `/tmp/main.jar` execution paths.
- Kept compiled binaries under `/work`, with an executable sandbox tmpfs rather than host `/tmp`.
- Added Docker availability checks and clear fail-closed errors.
- Fixed Redis RESP parsing so bulk responses are not lost when Redis combines response data in one TCP packet.
- Fixed PostgreSQL `run()` row-count handling so atomic worker claims correctly report `0` when another worker already claimed the submission.
- Added LMS assignment availability/deadline/max-attempt enforcement to student submissions.
- Scoped student problem listings to problems assigned through an active LMS enrollment.
- Renamed plagiarism UI/API output from misleading `AST Similarity` to `Structural Similarity`; the implementation is token/Winnowing based, not an AST engine.
- Removed fake initial execution metrics from the Monaco CodeArena UI.
- Added Docker-aware tests so sandbox-dependent tests are skipped when Docker is not available instead of pretending execution succeeded.
- Removed generated SQLite test databases from the release package.
- Development API binding now defaults to `127.0.0.1`; production can bind to `0.0.0.0`.

## Execution requirements

CodeArena execution requires Docker:

```powershell
$env:CODEARENA_DOCKER="1"
npm run server
```

For production, PostgreSQL, Redis, strong secrets, Docker, and the required environment variables are mandatory.

Build the TypeScript sandbox image and pull the remaining language images before first execution:

```bash
bash scripts/build-sandbox-images.sh
```

On Windows PowerShell, run the equivalent Docker commands from that script or use WSL/Git Bash.

## Validation performed in the release environment

- JavaScript syntax checks: PASS
- CodeArena API/LMS/sandbox/production test suite: PASS for all runnable tests
- Sandbox-dependent execution tests: SKIPPED because Docker is not available in the build environment
- Frontend TypeScript/Vite build: not executed in this environment because the npm registry dependency cache is incomplete; the release ZIP intentionally contains no `node_modules`

## Local startup

1. Install dependencies:

```bash
npm ci
```

2. Start the CodeArena API with Docker execution enabled:

```bash
CODEARENA_DOCKER=1 npm run server
```

3. In another terminal, start the frontend:

```bash
npm run dev
```

The Vite development server proxies `/api-proxy/*` to `http://127.0.0.1:8787` by default.

## Production

Use `docker-compose.codearena.yml`. Set real values for:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `CODEARENA_JWT_SECRET`
- `CODEARENA_WORKER_SECRET`
- `CODEARENA_CORS_ORIGIN`

Do not use the development demo credentials in production.

## Production deployment path (fully wired)

`docker-compose.codearena.yml` now includes a one-shot `sandbox-images` service. It builds the TypeScript sandbox and pulls the remaining language runtime images before the API and judge worker are allowed to start. This removes the previous requirement to remember a separate sandbox-image build step.

The production path is: UniSphere/LMS identity -> signed SSO assertion -> CodeArena token -> LMS enrollment/assignment authorization -> Redis queue -> Docker sandbox -> PostgreSQL gradebook.

For a fresh PostgreSQL deployment, optionally set `CODEARENA_BOOTSTRAP_ADMIN_USN`, `CODEARENA_BOOTSTRAP_ADMIN_NAME`, and `CODEARENA_BOOTSTRAP_ADMIN_PASSWORD` once to create the first CodeArena administrator. Do not use demo/header authentication in production.

For UniSphere SSO, the portal signs a short-lived token with `CODEARENA_SSO_JWT_SECRET`, including `iss=unisphere`, `sub`, `name`, `role`, and `usn`/`employeeId`, then POSTs it to `/api/auth/portal-exchange`. The returned CodeArena token is used for API calls.

Student evaluation and submission are both LMS-scoped: a student must be enrolled in the section, the problem must be assigned and published, and assignment availability/deadline/max-attempt rules are checked server-side.

The judge worker now requeues a claimed job if completion communication fails, and the API requeues stale RUNNING jobs after 15 minutes.
