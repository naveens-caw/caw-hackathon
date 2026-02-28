import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readMigration = (filename: string) =>
  readFileSync(resolve(process.cwd(), 'src', 'migrations', filename), 'utf8');

describe('migrations', () => {
  it('drops legacy hackathon_projects table', () => {
    const sql = readMigration('0002_jobs.sql');
    expect(sql).toContain('DROP TABLE IF EXISTS "hackathon_projects"');
  });

  it('enforces duplicate apply protection and decision consistency', () => {
    const sql = readMigration('0003_applications.sql');
    expect(sql).toContain('UNIQUE("job_id","applicant_user_id")');
    expect(sql).toContain('chk_applications_decision_consistency');
  });
});
