# CodeArena Production Implementation Checklist

## Implemented in this ZIP
- Real server-side compilation/execution for Python, JavaScript, C, C++, Java and Go.
- Queue-backed submissions with bounded worker concurrency.
- Persistent submissions, grades, drafts/version history, learning events, stations, incidents, broadcasts, notifications and audit logs.
- Signed access tokens and server-side role checks.
- Rate limiting, payload limits and security response headers.
- Exam scheduling/publishing/session start and submission limits.
- Persistent question-bank records and test cases.
- Plagiarism comparison records with faculty review state.
- 60-station heartbeat/health monitoring and automatic offline marking.
- Server-sent live event stream for queue/live status.
- Docker execution mode with network disabled and CPU/RAM/PID limits when the host is configured for Docker execution.
- Docker Compose topology including API, Redis and judge-worker entrypoint.

## Production deployment requirements
1. Put execution workers on dedicated machines/VMs and use gVisor/Firecracker or an equivalent hardened runtime.
2. Set `CODEARENA_JWT_SECRET` and `CODEARENA_WORKER_SECRET` to strong random values.
3. Set `VITE_CODEARENA_REQUIRE_AUTH=1` so the development `X-User-Id` fallback is disabled.
4. Use PostgreSQL for multi-instance production deployments. The current service intentionally remains SQLite-compatible for zero-dependency local development.
5. Put Redis behind authentication/TLS when used across hosts and run multiple isolated judge workers.
6. Use HTTPS, a reverse proxy, restricted CORS, firewall rules, centralized logs, metrics and backups.
7. Do not expose the execution host directly to the public internet.
8. Run the automated API smoke tests before each deployment: `npm run test:codearena`.

## Sandbox hardening release

- [x] Authoritative Docker execution for API/interactive execution
- [x] Redis worker uses the same Docker sandbox implementation
- [x] 20 language sandbox specifications
- [x] TypeScript sandbox image build
- [x] Rust sandbox runtime
- [x] C# temporary project build
- [x] Compiled binaries moved out of `noexec` `/tmp`
- [x] Hidden test inputs/expected outputs redacted from student responses
- [x] Faculty/staff protection on station, ticket, plagiarism and analytics endpoints
- [x] Short-lived SSE stream tokens
- [x] Centralized API error persistence in `system_errors`
- [x] Production demo-user seeding disabled by default
- [x] Random station tokens and station-agent command channel
- [x] Real station reboot command through the station agent
- [x] Docker CLI installed in the API/worker image
