import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().optional(),
  API_PORT: z.coerce.number().default(3000),
  DEFAULT_SIGNUP_ROLE: z.enum(['unassigned', 'employee']).default('unassigned'),
  APP_VERSION: z.string().optional(),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const validateEnv = (rawEnv: Record<string, unknown>): AppEnv => {
  return envSchema.parse(rawEnv);
};
