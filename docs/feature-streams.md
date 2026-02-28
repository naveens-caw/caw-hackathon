# Internal Job Board - Feature Streams (Team of 2)

## Shared Foundation (Serial, 0.5-1 day)

Complete these before parallel work:

1. Freeze shared contracts in `packages/shared`:

- `Job`, `Application`, `PipelineStage`, API response schemas.

2. Add DB enums/tables/migrations/seeds in `packages/db`.
3. Add API module skeletons/routes in `apps/api`.
4. Add web route placeholders/nav in `apps/web`.

Merge checkpoint: foundation must be merged and green before splitting streams.

## Stream Split (Vertical Slices)

- Engineer 1: Job Posting + HR Dashboard
- Engineer 2: Application Flow + Pipeline Management

## Engineer 1 Stream - Job Posting + HR Dashboard

### Backend

- `POST /api/jobs` (HR only)
- `GET /api/jobs` (role-aware list)
- `GET /api/jobs/:id`
- `PATCH /api/jobs/:id` (HR only)
- `DELETE /api/jobs/:id` (HR only, `draft` only in MVP)
- `GET /api/hr/dashboard` (HR only)

### Frontend

- HR job list page with filters (`status`, `department`)
- Job create/edit form
- Job details page with per-stage application counts
- HR dashboard cards:
- open positions
- total applications
- stage distribution snapshot

### Acceptance

- HR can create/update/close job postings.
- Employee sees only open jobs.
- Manager sees jobs they manage.
- Dashboard counters reflect API truth.

## Engineer 2 Stream - Application + Pipeline

### Backend

- `POST /api/jobs/:id/apply` (employee only)
- `GET /api/applications/me` (employee)
- `GET /api/jobs/:id/applications` (manager/hr)
- `PATCH /api/applications/:id/stage` (manager/hr, transition validation + stage event write)

### Frontend

- Employee job browse/apply UX
- My Applications page (stage + decision badges)
- Manager application board per job
- Pipeline controls (advance stage + optional note)

### Acceptance

- Duplicate apply is blocked.
- Unauthorized requests are role-guarded.
- Invalid stage transitions return clear validation errors.
- Stage event row is written for every successful stage change.

## Integration Checkpoints

1. Checkpoint 1: DB + shared schemas merged
2. Checkpoint 2: both streams API-complete
3. Checkpoint 3: both streams UI-complete
4. Checkpoint 4: end-to-end demo path complete

## Suggested Endpoint Inventory (Final)

- `/api/jobs` (CRUD + list)
- `/api/jobs/:id/apply`
- `/api/jobs/:id/applications`
- `/api/applications/me`
- `/api/applications/:id/stage`
- `/api/hr/dashboard`

## Test Coverage Targets

### API

- Role access matrix for every endpoint.
- Apply duplicate constraint.
- Stage transition validator.
- Stage event persistence.

### Frontend

- Route/role gating.
- Apply flow behavior.
- Pipeline stage update behavior.
- HR dashboard rendering.

### E2E

- HR creates and opens a job.
- Employee applies.
- Manager advances pipeline.
- Dashboard reflects counts and status.
