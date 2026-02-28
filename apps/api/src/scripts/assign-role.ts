import { getDb, getSqlClient, users } from '@caw-hackathon/db';
import { appRoleSchema } from '@caw-hackathon/shared';
import { eq } from 'drizzle-orm';

const [clerkUserId, roleInput] = process.argv.slice(2);

if (!clerkUserId || !roleInput) {
  console.error(
    'Usage: pnpm --filter api assign-role <clerkUserId> <unassigned|employee|manager|hr>',
  );
  process.exit(1);
}

const parsedRole = appRoleSchema.safeParse(roleInput);

if (!parsedRole.success) {
  console.error(`Invalid role: ${roleInput}`);
  process.exit(1);
}

const run = async (): Promise<void> => {
  const db = getDb();
  const updated = await db
    .update(users)
    .set({ role: parsedRole.data, updatedAt: new Date() })
    .where(eq(users.clerkUserId, clerkUserId))
    .returning({ id: users.id, role: users.role, email: users.email });

  await getSqlClient().end();

  if (updated.length === 0) {
    console.error(`No user found for clerkUserId=${clerkUserId}`);
    process.exit(1);
  }

  console.log('Role updated:', updated[0]);
};

run().catch((error) => {
  console.error('Failed to assign role', error);
  process.exit(1);
});
