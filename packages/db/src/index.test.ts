import { describe, expect, it } from 'vitest';
import { schema } from './index';

describe('db schema', () => {
  it('exports core job-board tables', () => {
    expect(schema.users).toBeDefined();
    expect(schema.jobs).toBeDefined();
    expect(schema.applications).toBeDefined();
    expect(schema.applicationStageEvents).toBeDefined();
  });
});
