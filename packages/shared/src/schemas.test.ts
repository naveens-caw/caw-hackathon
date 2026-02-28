import { describe, expect, it } from 'vitest';
import { meResponseSchema, versionResponseSchema } from './schemas';

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
