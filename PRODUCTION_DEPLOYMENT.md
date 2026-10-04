# CodeArena production deployment

## Requirements

- Docker Engine + Docker Compose v2
- 8 GB RAM recommended for a small lab deployment
- PostgreSQL 16
- Redis 7
- Node.js 22 only for non-container development/verification

## One-command deployment

1. Copy `.env.codearena.production.example` to `.env`.
2. Replace every `change-this-*` value with strong unique secrets.
3. Run:

```bash
docker compose -f docker-compose.codearena.yml up -d --build
```

The web UI is exposed on port `5173`; the API is exposed on port `8787` for administration/health checks.

## Dependency installation

For a host-based development install:

```bash
npm ci --no-audit --no-fund --omit=optional
npm run verify:all
```

Windows PowerShell:

```powershell
.\scripts\install-dependencies.ps1
npm run verify:all
```

The production Docker images install the exact versions from `package-lock.json` during image build, so the deployed image contains its runtime dependencies.

## Sandbox

The judge worker requires Docker. Production execution never falls back to native host execution. Set `CODEARENA_SANDBOX_RUNTIME=runsc` only on hosts where gVisor is installed and registered with Docker.

## Backups

The compose stack runs a backup service every six hours. Backups are stored in the `codearena-backups` volume. Restore with:

```bash
npm run restore:codearena -- <backup-file>
```

## Important

This repository intentionally does not include `node_modules` because dependencies are platform-specific and must be installed from the lockfile. In this build environment the public npm registry was unreachable, so a complete local `node_modules` bundle could not be honestly produced. The Docker build remains the reproducible production dependency installation path.
