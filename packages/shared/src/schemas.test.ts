import { describe, expect, it } from 'vitest';
import { versionResponseSchema } from './schemas';

describe('versionResponseSchema', () => {
  it('parses valid payloads', () => {
    const parsed = versionResponseSchema.safeParse({
      version: '0.1.0',
      env: 'development',
    });

    expect(parsed.success).toBe(true);
  });
});