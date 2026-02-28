import { describe, expect, it } from 'vitest';
import { seedSummary } from './seed.js';

describe('seedSummary', () => {
  it('matches expected user distribution', () => {
    expect(seedSummary.users).toEqual({
      hr: 1,
      manager: 2,
      employee: 6,
    });
  });

  it('matches expected jobs and applications distribution', () => {
    expect(seedSummary.jobs).toEqual({
      total: 6,
      open: 3,
      draft: 2,
      closed: 1,
    });
    expect(seedSummary.applications).toEqual({
      total: 12,
      stage: {
        applied: 4,
        screening: 3,
        interview: 3,
        decision: 2,
      },
      decision: {
        accepted: 1,
        rejected: 1,
        pending: 10,
      },
    });
  });
});
