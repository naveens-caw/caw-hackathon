import { describe, expect, it } from 'vitest';
import { schema } from './index';

describe('db schema', () => {
  it('exports hackathonProjects table', () => {
    expect(schema.hackathonProjects).toBeDefined();
  });
});