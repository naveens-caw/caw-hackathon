import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDb, getSqlClient } from './index';

const run = async (): Promise<void> => {
  const db = getDb();

  await migrate(db, {
    migrationsFolder: new URL('./migrations', import.meta.url).pathname,
  });

  await getSqlClient().end();
};

run().catch((error) => {
  console.error('Migration failed', error);
  process.exit(1);
});