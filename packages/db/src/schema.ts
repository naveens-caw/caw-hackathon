import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const appRoleEnum = pgEnum('app_role', ['employee', 'manager', 'hr']);
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
]);
export const jobStatusEnum = pgEnum('job_status', ['draft', 'open', 'closed']);
export const applicationStageEnum = pgEnum('application_stage', [
  'applied',
  'screening',
  'interview',
  'decision',
]);
export const decisionStatusEnum = pgEnum('decision_status', ['pending', 'accepted', 'rejected']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: appRoleEnum('role').notNull().default('employee'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const jobs = pgTable(
  'jobs',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    department: text('department').notNull(),
    location: text('location'),
    employmentType: employmentTypeEnum('employment_type').notNull(),
    status: jobStatusEnum('status').notNull().default('draft'),
    postedByUserId: text('posted_by_user_id')
      .notNull()
      .references(() => users.id),
    hiringManagerUserId: text('hiring_manager_user_id')
      .notNull()
      .references(() => users.id),
    openedAt: timestamp('opened_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idxJobsStatus: index('idx_jobs_status').on(table.status),
    idxJobsHiringManager: index('idx_jobs_hiring_manager').on(table.hiringManagerUserId),
    idxJobsDepartment: index('idx_jobs_department').on(table.department),
    idxJobsCreatedAt: index('idx_jobs_created_at').on(table.createdAt.desc()),
  }),
);

export const applications = pgTable(
  'applications',
  {
    id: serial('id').primaryKey(),
    jobId: integer('job_id')
      .notNull()
      .references(() => jobs.id),
    applicantUserId: text('applicant_user_id')
      .notNull()
      .references(() => users.id),
    resumeUrl: text('resume_url'),
    coverLetter: text('cover_letter'),
    stage: applicationStageEnum('stage').notNull().default('applied'),
    decision: decisionStatusEnum('decision').notNull().default('pending'),
    appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uqApplicationsJobApplicant: unique('uq_applications_job_applicant').on(
      table.jobId,
      table.applicantUserId,
    ),
    chkApplicationsDecisionConsistency: check(
      'chk_applications_decision_consistency',
      sql`(${table.stage} = 'decision') OR (${table.decision} = 'pending')`,
    ),
    idxApplicationsJob: index('idx_applications_job').on(table.jobId),
    idxApplicationsApplicant: index('idx_applications_applicant').on(table.applicantUserId),
    idxApplicationsStage: index('idx_applications_stage').on(table.stage),
    idxApplicationsJobStage: index('idx_applications_job_stage').on(table.jobId, table.stage),
  }),
);

export const applicationStageEvents = pgTable(
  'application_stage_events',
  {
    id: serial('id').primaryKey(),
    applicationId: integer('application_id')
      .notNull()
      .references(() => applications.id),
    fromStage: applicationStageEnum('from_stage').notNull(),
    toStage: applicationStageEnum('to_stage').notNull(),
    changedByUserId: text('changed_by_user_id')
      .notNull()
      .references(() => users.id),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idxStageEventsApplication: index('idx_stage_events_application').on(
      table.applicationId,
      table.createdAt.desc(),
    ),
  }),
);
