import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDb, getSqlClient } from './index';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(currentDir, 'migrations');

const run = async (): Promise<void> => {
  const db = getDb();

  await migrate(db, {
    migrationsFolder,
  });

  await getSqlClient().end();
};

run().catch((error) => {
  console.error('Migration failed', error);
  process.exit(1);
});
