import { z } from 'zod';

export const appRoleSchema = z.enum(['unassigned', 'employee', 'manager', 'hr']);
export const employmentTypeSchema = z.enum(['full_time', 'part_time', 'contract', 'internship']);
export const jobStatusSchema = z.enum(['draft', 'open', 'closed']);
export const applicationStageSchema = z.enum(['applied', 'screening', 'interview', 'decision']);
export const decisionStatusSchema = z.enum(['pending', 'accepted', 'rejected']);

export const versionResponseSchema = z.object({
  version: z.string(),
  env: z.enum(['development', 'test', 'staging', 'production']),
});

export type VersionResponse = z.infer<typeof versionResponseSchema>;

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  role: appRoleSchema,
  status: z.enum(['active', 'pending_role']),
});

export const jobSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  department: z.string(),
  location: z.string().nullable(),
  employmentType: employmentTypeSchema,
  status: jobStatusSchema,
  postedByUserId: z.string(),
  hiringManagerUserId: z.string(),
  openedAt: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const jobListQuerySchema = z.object({
  status: jobStatusSchema.optional(),
  department: z.string().trim().min(1).optional(),
});

export const createJobRequestSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(10),
  department: z.string().trim().min(2),
  location: z.string().trim().min(2).nullable().optional(),
  employmentType: employmentTypeSchema,
  status: jobStatusSchema.default('draft'),
  hiringManagerUserId: z.string().trim().min(1),
});

export const updateJobRequestSchema = createJobRequestSchema.partial();

export const stageCountsSchema = z.object({
  applied: z.number().int().nonnegative(),
  screening: z.number().int().nonnegative(),
  interview: z.number().int().nonnegative(),
  decision: z.number().int().nonnegative(),
});

export const jobDetailsSchema = z.object({
  job: jobSchema,
  applicationCounts: stageCountsSchema,
});

export const jobListResponseSchema = z.object({
  jobs: z.array(jobSchema),
});

export const hrDashboardSchema = z.object({
  openPositions: z.number().int().nonnegative(),
  totalApplications: z.number().int().nonnegative(),
  stageDistribution: stageCountsSchema,
});

export const applicationSchema = z.object({
  id: z.number().int().positive(),
  jobId: z.number().int().positive(),
  applicantUserId: z.string(),
  resumeUrl: z.string().nullable(),
  coverLetter: z.string().nullable(),
  stage: applicationStageSchema,
  decision: decisionStatusSchema,
  appliedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const applyToJobRequestSchema = z.object({
  resumeUrl: z.string().url().nullable().optional(),
  coverLetter: z.string().trim().min(10).max(5000).nullable().optional(),
});

export const myApplicationJobSummarySchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  department: z.string(),
  employmentType: employmentTypeSchema,
  status: jobStatusSchema,
  location: z.string().nullable(),
});

export const myApplicationSchema = applicationSchema.extend({
  job: myApplicationJobSummarySchema,
});

export const myApplicationsResponseSchema = z.object({
  applications: z.array(myApplicationSchema),
});

export const applicationListItemSchema = applicationSchema.extend({
  applicant: z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string().nullable(),
  }),
});

export const jobApplicationsResponseSchema = z.object({
  applications: z.array(applicationListItemSchema),
});

const decisionOutcomeSchema = z.enum(['accepted', 'rejected']);

export const updateApplicationStageRequestSchema = z
  .object({
    toStage: applicationStageSchema,
    decision: decisionOutcomeSchema.optional(),
    note: z.string().trim().min(1).max(1000).nullable().optional(),
  })
  .superRefine((payload, ctx) => {
    if (payload.toStage === 'decision' && !payload.decision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decision'],
        message: 'decision is required when moving to decision stage.',
      });
    }

    if (payload.toStage !== 'decision' && payload.decision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decision'],
        message: 'decision can only be set for decision stage.',
      });
    }
  });

export const applicationStageEventSchema = z.object({
  id: z.number().int().positive(),
  applicationId: z.number().int().positive(),
  fromStage: applicationStageSchema,
  toStage: applicationStageSchema,
  changedByUserId: z.string(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const updateApplicationStageResponseSchema = z.object({
  application: applicationSchema,
  stageEvent: applicationStageEventSchema,
});

export type AppRole = z.infer<typeof appRoleSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type ApplicationStage = z.infer<typeof applicationStageSchema>;
export type DecisionStatus = z.infer<typeof decisionStatusSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobListQuery = z.infer<typeof jobListQuerySchema>;
export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;
export type UpdateJobRequest = z.infer<typeof updateJobRequestSchema>;
export type StageCounts = z.infer<typeof stageCountsSchema>;
export type JobDetails = z.infer<typeof jobDetailsSchema>;
export type JobListResponse = z.infer<typeof jobListResponseSchema>;
export type HrDashboard = z.infer<typeof hrDashboardSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplyToJobRequest = z.infer<typeof applyToJobRequestSchema>;
export type MyApplication = z.infer<typeof myApplicationSchema>;
export type MyApplicationsResponse = z.infer<typeof myApplicationsResponseSchema>;
export type ApplicationListItem = z.infer<typeof applicationListItemSchema>;
export type JobApplicationsResponse = z.infer<typeof jobApplicationsResponseSchema>;
export type UpdateApplicationStageRequest = z.infer<typeof updateApplicationStageRequestSchema>;
export type UpdateApplicationStageResponse = z.infer<typeof updateApplicationStageResponseSchema>;
export type ApplicationStageEvent = z.infer<typeof applicationStageEventSchema>;
