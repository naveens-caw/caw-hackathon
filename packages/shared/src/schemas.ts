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

export const applicationStageEventSchema = z.object({
  id: z.number().int().positive(),
  applicationId: z.number().int().positive(),
  fromStage: applicationStageSchema,
  toStage: applicationStageSchema,
  changedByUserId: z.string(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AppRole = z.infer<typeof appRoleSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type ApplicationStage = z.infer<typeof applicationStageSchema>;
export type DecisionStatus = z.infer<typeof decisionStatusSchema>;
export type Job = z.infer<typeof jobSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationStageEvent = z.infer<typeof applicationStageEventSchema>;
