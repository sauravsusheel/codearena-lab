# CodeArena Lab Station — Docker Sandbox Deployment

This release makes student-code execution authoritative on the server/worker. The browser does **not** execute student submissions as a fallback.

## Architecture

```text
Browser / Monaco IDE
        |
        | authenticated HTTPS/API
        v
CodeArena API
        |
        +--> PostgreSQL
        +--> Redis submission queue
        +--> Docker sandbox for interactive Run/Terminal
        |
        v
Redis -> Judge Worker -> Docker sandbox -> verdict/gradebook
```

Each sandbox container is isolated with:

- `--network none`
- read-only root filesystem
- writable `/work` tmpfs with executable permission only inside the sandbox
- `noexec,nosuid,nodev` `/tmp`
- dropped Linux capabilities
- `no-new-privileges`
- default seccomp profile
- CPU limit
- memory + swap limit
- PID limit
- file/process ulimits
- output limit
- execution timeout
- optional gVisor runtime (`runsc`)

The API/worker use `docker create/start/exec` and stream source files through `docker exec` stdin into the writable `/tmp` tmpfs. They do not depend on host-visible paths or `docker cp` writes into the read-only container root filesystem.

## Supported languages

The authoritative sandbox supports 9 official curriculum languages:

1. **Python 3.12** (Judge0 ID 71)
2. **Java 21** (Judge0 ID 62)
3. **C (C17)** (Judge0 ID 50)
4. **C++ 20** (Judge0 ID 54)
5. **JavaScript (Node.js 20)** (Judge0 ID 63)
6. **HTML5** (Isolated Iframe Sandbox with CSP)
7. **SQL / SQLite** (Judge0 ID 82)
8. **PHP 8.3** (Judge0 ID 68)
9. **R** (Judge0 ID 80)

Compiled binaries are written to `/work`, never `/tmp`. HTML/CSS is executed inside a hardened client-side iframe sandbox with `sandbox="allow-scripts"` and strict Content Security Policy (omitting `allow-same-origin` to ensure zero access to tokens and session cookies).

## Windows PowerShell development

Use Docker Desktop with Linux containers. From the `unisphere-main` directory, prepare the runtime images and start the app with Docker execution enabled:

```powershell
docker version
npm run sandbox:images
npm run dev:docker
```

The first image preparation downloads the language runtimes and can take several minutes. The Node-based image script works in PowerShell and WSL and uses the same language image map as the sandbox runner.

## Ubuntu / WSL setup

Run these commands from Ubuntu/WSL after Docker Desktop has WSL integration enabled:

```bash
cd ~/CodeArena\ Lab\ Station/unisphere-main
```

Use your actual extracted project directory if the path is different.

### 1. Verify Docker

```bash
docker version
docker compose version
```

The first command must show both a Docker Client and Docker Server.

### 2. Create production secrets

```bash
export POSTGRES_PASSWORD="$(openssl rand -hex 32)"
export REDIS_PASSWORD="$(openssl rand -hex 32)"
export CODEARENA_JWT_SECRET="$(openssl rand -hex 48)"
export CODEARENA_WORKER_SECRET="$(openssl rand -hex 32)"
export CODEARENA_CORS_ORIGIN="http://localhost:5173"
```

For a permanent deployment, put these values in a protected `.env` file instead of exporting them only for the current shell. Never commit that file.

### 3. Build the TypeScript sandbox and pull language images

```bash
chmod +x scripts/build-sandbox-images.sh
./scripts/build-sandbox-images.sh
```

This builds:

```text
codearena/typescript:5.9
```

and pulls the remaining language runtime images.

### 4. Build CodeArena

```bash
docker compose -f docker-compose.codearena.yml build --no-cache
```

### 5. Start PostgreSQL, Redis, API, web and judge worker

```bash
docker compose -f docker-compose.codearena.yml up -d
```

### 6. Check containers

```bash
docker compose -f docker-compose.codearena.yml ps
```

All of these should become healthy/running:

```text
postgres
redis
codearena-api
web
judge-worker
backup
```

### 7. Check CodeArena API

```bash
curl http://localhost:8787/api/health
```

The response should show:

```json
{
  "ok": true,
  "docker": true,
  "dockerDaemon": true,
  "database": "postgresql",
  "redis": true
}
```

### 8. Check web application

Open:

```text
http://localhost:5173
```

### 9. Test the sandbox

Log in through CodeArena, open the IDE, select Python and run a simple program.

Then test at least:

```text
Python
JavaScript
TypeScript
C
C++
Java
C#
Go
Rust
Kotlin
```

After that test the remaining runtimes.

### 10. Optional gVisor

If `runsc` is installed and registered with Docker:

```bash
docker info | grep -i runtimes
```

Then set:

```bash
export CODEARENA_SANDBOX_RUNTIME=runsc
```

and recreate the API/worker:

```bash
docker compose -f docker-compose.codearena.yml up -d --force-recreate codearena-api judge-worker
```

Do not set `runsc` until `docker info` shows the runtime.

## Important production behavior

Demo users are not seeded when `CODEARENA_PRODUCTION=1` unless `CODEARENA_SEED_DEMO=1` is explicitly enabled.

Station agent tokens are random. A Super Admin can rotate/retrieve a station token with the authenticated endpoint:

```text
POST /api/codearena/stations/PC-01/agent-credentials
```

Store the returned token securely on that workstation and start the agent:

```bash
export CODEARENA_STATION_TOKEN="<station-specific-secret>"
node scripts/station-agent.mjs PC-01 http://SERVER:8787
```

The Faculty/Lab Instructor reboot action now creates a real station command. The station agent polls the command and invokes the operating-system reboot command on the workstation.

## Verification commands

From the source checkout, without production services:

```bash
npm run test:codearena
npm run test:codearena:sandbox
npm run test:codearena:production
```

The release was statically checked for all 20 sandbox language specifications and the API regression suite passed in the development profile.

## Important limitation of this packaging environment

The packaging environment used for this ZIP did not have a Docker daemon available, so the final runtime containers/images could not be pulled and executed here. The ZIP therefore contains the complete Docker sandbox implementation, image-preload script, compose configuration, and automated tests; the actual `docker compose up` and 20-runtime smoke test must be performed on the laptop/Ubuntu machine where Docker is installed.
