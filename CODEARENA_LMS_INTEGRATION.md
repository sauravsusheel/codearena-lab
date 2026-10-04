# CodeArena Lab Station — LMS Integration

This release adds an LMS-owned academic layer to CodeArena rather than treating CodeArena subjects as standalone records.

## Implemented

- Academic term/catalog records (`academic_terms`, `lms_courses`).
- Course sections with capacity, room and schedule metadata.
- Student enrollment and completion state.
- Faculty/lab-instructor teaching assignments with server-side authorization.
- CodeArena problem assignment to a specific LMS section.
- Learning modules and per-student module progress.
- LMS audit events for enrollment, faculty assignment, problem assignment and CodeArena submissions.
- LMS-scoped roster, faculty, assignment and gradebook views.
- Portal identity bridge using the portal user's stable `id` as `external_id` in development/header-auth mode. Production deployments should replace header authentication with the institution's signed SSO/JWT exchange.
- Student CodeArena submissions are server-checked against LMS enrollment and section problem assignment.
- Student exam start now requires active LMS enrollment in the exam course in addition to the existing learning/remedial eligibility and faculty approval gates.

## Main API

- `GET /api/lms/bootstrap` — terms, catalog, visible sections and the current user's linked sections.
- `GET /api/lms/dashboard` — student enrollments, teaching sections and learning totals.
- `GET /api/lms/courses` — LMS course/section catalog.
- `GET /api/lms/sections/:sectionId` — section, roster, faculty, CodeArena assignments and scoped gradebook.
- `POST /api/lms/sections/:sectionId/enroll` — student self-enrollment or faculty/admin roster enrollment.
- `POST /api/lms/sections/:sectionId/faculty` — coordinator/admin teaching assignment.
- `GET/POST /api/lms/sections/:sectionId/problems` — CodeArena problem assignment for the section.
- `POST /api/lms/sections/:sectionId/modules` — learning-module creation.
- `POST /api/lms/modules/:moduleId/progress` — student module progress.

## Production notes

`DATABASE_URL` should point to PostgreSQL in production. The PostgreSQL schema contains the same LMS tables as the SQLite development profile. The existing CodeArena sandbox, queue, gradebook, plagiarism and lab-station workflows remain in place.
