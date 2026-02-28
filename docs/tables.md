# Internal Job Board - Core Data Models

## Scope

- Existing table reused: `users`
- Legacy bootstrap table removed in Step 4: `hackathon_projects`
- New primary entities:
- `jobs`
- `applications`
- `application_stage_events`

## Table Specifications

### `jobs`

- `id` `serial` PK
- `title` `text` NOT NULL
- `description` `text` NOT NULL
- `department` `text` NOT NULL
- `location` `text` NULL
- `employment_type` enum: `full_time | part_time | contract | internship`
- `status` enum: `draft | open | closed`
- `posted_by_user_id` `text` FK -> `users.id` NOT NULL
- `hiring_manager_user_id` `text` FK -> `users.id` NOT NULL
- `opened_at` `timestamptz` NULL
- `closed_at` `timestamptz` NULL
- `created_at` `timestamptz` NOT NULL default now
- `updated_at` `timestamptz` NOT NULL default now

Indexes:

- `idx_jobs_status` (`status`)
- `idx_jobs_hiring_manager` (`hiring_manager_user_id`)
- `idx_jobs_department` (`department`)
- `idx_jobs_created_at` (`created_at` desc)

Business rules:

- Only `hr` can create/update/delete jobs.
- `hiring_manager_user_id` must belong to user with role `manager` (validated in service layer).
- `opened_at` is set when status becomes `open`; `closed_at` is set when status becomes `closed`.

### `applications`

- `id` `serial` PK
- `job_id` `int` FK -> `jobs.id` NOT NULL
- `applicant_user_id` `text` FK -> `users.id` NOT NULL
- `resume_url` `text` NULL
- `cover_letter` `text` NULL
- `stage` enum: `applied | screening | interview | decision`
- `decision` enum: `pending | accepted | rejected` default `pending`
- `applied_at` `timestamptz` NOT NULL default now
- `updated_at` `timestamptz` NOT NULL default now

Constraints:

- Unique (`job_id`, `applicant_user_id`) to prevent duplicate apply.
- Check rule: if stage is not `decision`, decision must be `pending`.

Indexes:

- `idx_applications_job` (`job_id`)
- `idx_applications_applicant` (`applicant_user_id`)
- `idx_applications_stage` (`stage`)
- `idx_applications_job_stage` (`job_id`, `stage`)

Business rules:

- Only `employee` can apply.
- Employees can view only their own applications.
- HR and assigned manager can view applications for a job.
- Stage transitions are allowed only by `manager` or `hr`.

### `application_stage_events`

- `id` `serial` PK
- `application_id` `int` FK -> `applications.id` NOT NULL
- `from_stage` enum: `applied | screening | interview | decision` NOT NULL
- `to_stage` enum: `applied | screening | interview | decision` NOT NULL
- `changed_by_user_id` `text` FK -> `users.id` NOT NULL
- `note` `text` NULL
- `created_at` `timestamptz` NOT NULL default now

Indexes:

- `idx_stage_events_application` (`application_id`, `created_at` desc)

Business rules:

- Append-only audit log.
- Insert one event row on every stage change.

## Pipeline State Machine

Allowed transitions:

- `applied -> screening`
- `screening -> interview`
- `interview -> decision`
- `screening -> decision` (fast reject)
- `applied -> decision` (direct reject, MVP allowed)

Disallowed transitions:

- Any backward move (MVP).
- Any transition out of `decision`.

## Migration Plan

- Migration 1: enums + `jobs`
- Migration 2: `applications` + unique/check constraints + indexes
- Migration 3: `application_stage_events`

## Seed Plan (Dev Data)

Seeding behavior:

- Reset-safe for job board entities (`jobs`, `applications`, `application_stage_events` are cleared first).
- Seed users are deterministic with `seed_*` IDs and are upsert-safe for repeated runs.

- Users:
- 1 HR
- 2 managers
- 6 employees
- Jobs:
- 6 total (`3 open`, `2 draft`, `1 closed`)
- Applications:
- 12 across open jobs
- Stage distribution:
- applied: 4
- screening: 3
- interview: 3
- decision: 2 (`1 accepted`, `1 rejected`)
