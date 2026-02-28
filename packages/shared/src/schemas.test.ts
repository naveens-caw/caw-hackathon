import { describe, expect, it } from 'vitest';
import {
  applyToJobRequestSchema,
  createJobRequestSchema,
  hrDashboardSchema,
  applicationSchema,
  applicationStageEventSchema,
  jobApplicationsResponseSchema,
  jobDetailsSchema,
  jobListResponseSchema,
  jobSchema,
  meResponseSchema,
  myApplicationsResponseSchema,
  updateApplicationStageRequestSchema,
  versionResponseSchema,
} from './schemas';

describe('versionResponseSchema', () => {
  it('parses valid payloads', () => {
    const parsed = versionResponseSchema.safeParse({
      version: '0.1.0',
      env: 'development',
    });

    expect(parsed.success).toBe(true);
  });
});

describe('meResponseSchema', () => {
  it('parses authenticated payloads', () => {
    const parsed = meResponseSchema.safeParse({
      id: 'user_123',
      email: 'user@example.com',
      fullName: 'Demo User',
      role: 'employee',
      status: 'active',
    });

    expect(parsed.success).toBe(true);
  });
});

describe('jobSchema', () => {
  it('parses a valid job payload', () => {
    const parsed = jobSchema.safeParse({
      id: 1,
      title: 'Backend Engineer',
      description: 'Build APIs',
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'full_time',
      status: 'open',
      postedByUserId: 'seed_hr_1',
      hiringManagerUserId: 'seed_manager_1',
      openedAt: new Date().toISOString(),
      closedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(parsed.success).toBe(true);
  });
});

describe('applicationSchema', () => {
  it('parses a valid application payload', () => {
    const parsed = applicationSchema.safeParse({
      id: 1,
      jobId: 1,
      applicantUserId: 'seed_employee_1',
      resumeUrl: null,
      coverLetter: null,
      stage: 'screening',
      decision: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(parsed.success).toBe(true);
  });
});

describe('applicationStageEventSchema', () => {
  it('parses a valid stage event payload', () => {
    const parsed = applicationStageEventSchema.safeParse({
      id: 1,
      applicationId: 10,
      fromStage: 'applied',
      toStage: 'screening',
      changedByUserId: 'seed_manager_1',
      note: 'advanced',
      createdAt: new Date().toISOString(),
    });

    expect(parsed.success).toBe(true);
  });
});

describe('job list/details/dashboard schemas', () => {
  it('parses list and details payloads', () => {
    const baseJob = {
      id: 2,
      title: 'Frontend Engineer',
      description: 'Build UI',
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'full_time',
      status: 'open',
      postedByUserId: 'seed_hr_1',
      hiringManagerUserId: 'seed_manager_1',
      openedAt: new Date().toISOString(),
      closedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(jobListResponseSchema.safeParse({ jobs: [baseJob] }).success).toBe(true);
    expect(
      jobDetailsSchema.safeParse({
        job: baseJob,
        applicationCounts: {
          applied: 1,
          screening: 2,
          interview: 0,
          decision: 1,
        },
      }).success,
    ).toBe(true);
  });

  it('parses create request and dashboard payload', () => {
    expect(
      createJobRequestSchema.safeParse({
        title: 'Backend Engineer',
        description: 'Build APIs for the hiring system.',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'full_time',
        status: 'draft',
        hiringManagerUserId: 'seed_manager_1',
      }).success,
    ).toBe(true);

    expect(
      hrDashboardSchema.safeParse({
        openPositions: 3,
        totalApplications: 12,
        stageDistribution: {
          applied: 4,
          screening: 3,
          interview: 3,
          decision: 2,
        },
      }).success,
    ).toBe(true);
  });
});

describe('application flow schemas', () => {
  it('parses apply and list payloads', () => {
    expect(
      applyToJobRequestSchema.safeParse({
        resumeUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am excited to apply for this role.',
      }).success,
    ).toBe(true);

    expect(
      myApplicationsResponseSchema.safeParse({
        applications: [
          {
            id: 1,
            jobId: 2,
            applicantUserId: 'seed_employee_1',
            resumeUrl: null,
            coverLetter: null,
            stage: 'applied',
            decision: 'pending',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            job: {
              id: 2,
              title: 'Frontend Engineer',
              department: 'Engineering',
              employmentType: 'full_time',
              status: 'open',
              location: 'Remote',
            },
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      jobApplicationsResponseSchema.safeParse({
        applications: [
          {
            id: 1,
            jobId: 2,
            applicantUserId: 'seed_employee_1',
            resumeUrl: null,
            coverLetter: null,
            stage: 'screening',
            decision: 'pending',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicant: {
              id: 'seed_employee_1',
              email: 'employee@example.com',
              fullName: 'Employee One',
            },
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('requires decision when moving to decision stage', () => {
    const missingDecision = updateApplicationStageRequestSchema.safeParse({
      toStage: 'decision',
    });
    expect(missingDecision.success).toBe(false);

    const invalidDecisionUse = updateApplicationStageRequestSchema.safeParse({
      toStage: 'screening',
      decision: 'accepted',
    });
    expect(invalidDecisionUse.success).toBe(false);
  });
});
