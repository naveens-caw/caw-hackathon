import { z } from 'zod';

export const appRoleSchema = z.enum(['unassigned', 'employee', 'manager', 'hr']);

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

export type AppRole = z.infer<typeof appRoleSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
