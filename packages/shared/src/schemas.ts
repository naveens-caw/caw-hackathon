import { z } from 'zod';

export const versionResponseSchema = z.object({
  version: z.string(),
  env: z.enum(['development', 'test', 'production']),
});

export type VersionResponse = z.infer<typeof versionResponseSchema>;