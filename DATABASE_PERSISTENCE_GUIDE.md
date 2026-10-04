# CodeArena Lab Station — Database Persistence Guide

## Authoritative data path

CodeArena uses the backend database as the authoritative store:

`React UI → CodeArena API → database`

Student source execution remains server-authoritative:

`React UI → CodeArena API → Docker/gVisor sandbox`

The browser does not execute submitted code and the UI does not use a demo dataset when the database/API is unavailable.

## Supported database profiles

### Development

If `DATABASE_URL` is not set, the server creates `server/data/codearena.sqlite` automatically. This file is intentionally ignored by Git and is not included in the delivery ZIP.

### Production

Set `DATABASE_URL` to PostgreSQL. Production mode rejects startup without PostgreSQL unless the explicit development-only SQLite override is enabled.

Example:

```env
DATABASE_URL=postgresql://codearena:<password>@postgres:5432/codearena
CODEARENA_REDIS_URL=redis://redis:6379/0
CODEARENA_JWT_SECRET=<64+ character secret>
CODEARENA_WORKER_SECRET=<strong worker secret>
```

The PostgreSQL schema is in `database_postgresql_schema.sql`. The server applies the schema automatically when it starts with `DATABASE_URL` configured.

## Persisted CodeArena data

The database contains persistent records for:

- Users and sessions
- Academic terms, LMS courses and sections
- LMS enrollments and faculty assignments
- LMS CodeArena problem assignments
- LMS learning modules and progress
- Subjects and problems
- Test cases and hidden test cases
- Drafts and draft versions
- Submissions, verdicts, runtime/memory metrics and quality data
- Gradebook records and faculty overrides/locks
- Exams, exam problems, exam sessions and exam submissions
- Exam eligibility and remedial assignments
- Learning events and coding-time records
- Lab stations and heartbeat/hardware telemetry
- Station commands and maintenance tickets
- Broadcasts and notifications
- Plagiarism review records and audit evidence
- Audit logs, system errors, rate limits and backup records

## Important persistence behavior

- CodeArena problem creation persists supplied test cases to `test_cases`.
- Student submissions are linked to their LMS section in `submissions.lms_section_id`.
- LMS authorization is checked server-side before student submission.
- Grades are generated from persisted submission results.
- Draft autosave writes both the current draft and a version history row.
- Station telemetry is read from `stations`; incidents are read from `tickets`.
- When the database/API is unavailable, CodeArena does not silently substitute fabricated station, ticket, problem, or subject data.

## First run

1. Configure `.env` from `.env.codearena.production.example` or `.env.example`.
2. Start PostgreSQL/Redis with `docker-compose.codearena.yml` for a production-style deployment.
3. Start the CodeArena API.
4. The schema is initialized automatically.
5. The frontend uses the API for CodeArena/LMS data.

For local development without PostgreSQL, omit `DATABASE_URL`; SQLite is created automatically by the API.
