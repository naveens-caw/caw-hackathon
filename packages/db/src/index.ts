import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let client: postgres.Sql | null = null;

export const getSqlClient = (connectionString = process.env.DATABASE_URL): postgres.Sql => {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize database client.');
  }

  if (!client) {
    client = postgres(connectionString, { max: 1 });
  }

  return client;
};

export const getDb = (connectionString?: string) => {
  const sql = getSqlClient(connectionString);
  return drizzle(sql, { schema });
};

export type DbClient = ReturnType<typeof getDb>;
export { schema };