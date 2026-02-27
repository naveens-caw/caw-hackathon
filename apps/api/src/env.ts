import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3000),
  APP_VERSION: z.string().default('0.1.0'),
  DATABASE_URL: z.string().url(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const validateEnv = (rawEnv: Record<string, unknown>): AppEnv => {
  return envSchema.parse(rawEnv);
};