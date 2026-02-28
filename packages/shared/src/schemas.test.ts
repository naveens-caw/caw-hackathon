import { describe, expect, it } from 'vitest';
import {
  applicationSchema,
  applicationStageEventSchema,
  jobSchema,
  meResponseSchema,
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
