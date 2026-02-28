import { eq, inArray } from 'drizzle-orm';
import { applicationStageEvents, applications, getDb, getSqlClient, jobs, users } from './index.js';

export const seedUsers = [
  {
    id: 'seed_hr_1',
    clerkUserId: 'seed_hr_1',
    email: 'hr1@internal.local',
    fullName: 'Seed HR One',
    role: 'hr' as const,
  },
  {
    id: 'seed_manager_1',
    clerkUserId: 'seed_manager_1',
    email: 'manager1@internal.local',
    fullName: 'Seed Manager One',
    role: 'manager' as const,
  },
  {
    id: 'seed_manager_2',
    clerkUserId: 'seed_manager_2',
    email: 'manager2@internal.local',
    fullName: 'Seed Manager Two',
    role: 'manager' as const,
  },
  {
    id: 'seed_employee_1',
    clerkUserId: 'seed_employee_1',
    email: 'employee1@internal.local',
    fullName: 'Seed Employee One',
    role: 'employee' as const,
  },
  {
    id: 'seed_employee_2',
    clerkUserId: 'seed_employee_2',
    email: 'employee2@internal.local',
    fullName: 'Seed Employee Two',
    role: 'employee' as const,
  },
  {
    id: 'seed_employee_3',
    clerkUserId: 'seed_employee_3',
    email: 'employee3@internal.local',
    fullName: 'Seed Employee Three',
    role: 'employee' as const,
  },
  {
    id: 'seed_employee_4',
    clerkUserId: 'seed_employee_4',
    email: 'employee4@internal.local',
    fullName: 'Seed Employee Four',
    role: 'employee' as const,
  },
  {
    id: 'seed_employee_5',
    clerkUserId: 'seed_employee_5',
    email: 'employee5@internal.local',
    fullName: 'Seed Employee Five',
    role: 'employee' as const,
  },
  {
    id: 'seed_employee_6',
    clerkUserId: 'seed_employee_6',
    email: 'employee6@internal.local',
    fullName: 'Seed Employee Six',
    role: 'employee' as const,
  },
];

export const seedSummary = {
  users: {
    hr: seedUsers.filter((user) => user.role === 'hr').length,
    manager: seedUsers.filter((user) => user.role === 'manager').length,
    employee: seedUsers.filter((user) => user.role === 'employee').length,
  },
  jobs: {
    total: 6,
    open: 3,
    draft: 2,
    closed: 1,
  },
  applications: {
    total: 12,
    stage: {
      applied: 4,
      screening: 3,
      interview: 3,
      decision: 2,
    },
    decision: {
      accepted: 1,
      rejected: 1,
      pending: 10,
    },
  },
};

const getRequired = <T>(value: T | undefined, label: string): T => {
  if (value === undefined) {
    throw new Error(`Missing required seed value: ${label}`);
  }
  return value;
};

export const runSeed = async (): Promise<void> => {
  const db = getDb();

  await db.delete(applicationStageEvents);
  await db.delete(applications);
  await db.delete(jobs);
  await db.delete(users).where(
    inArray(
      users.id,
      seedUsers.map((user) => user.id),
    ),
  );

  await db.insert(users).values(
    seedUsers.map((user) => ({
      ...user,
      updatedAt: new Date(),
    })),
  );

  const [hr] = seedUsers.filter((user) => user.role === 'hr');
  const managers = seedUsers.filter((user) => user.role === 'manager');
  const employees = seedUsers.filter((user) => user.role === 'employee');
  const hrUser = getRequired(hr, 'hr user');
  const manager1 = getRequired(managers[0], 'manager 1');
  const manager2 = getRequired(managers[1], 'manager 2');
  const employee1 = getRequired(employees[0], 'employee 1');
  const employee2 = getRequired(employees[1], 'employee 2');
  const employee3 = getRequired(employees[2], 'employee 3');
  const employee4 = getRequired(employees[3], 'employee 4');
  const employee5 = getRequired(employees[4], 'employee 5');
  const employee6 = getRequired(employees[5], 'employee 6');

  const insertedJobs = await db
    .insert(jobs)
    .values([
      {
        title: 'Frontend Engineer I',
        description: 'Build internal career portal components.',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'full_time',
        status: 'open',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager1.id,
        openedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Backend Engineer I',
        description: 'Own APIs for internal workflows.',
        department: 'Engineering',
        location: 'Bangalore',
        employmentType: 'full_time',
        status: 'open',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager2.id,
        openedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'People Operations Analyst',
        description: 'Partner with HR systems and hiring operations.',
        department: 'People',
        location: 'Delhi',
        employmentType: 'contract',
        status: 'open',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager1.id,
        openedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Product Intern',
        description: 'Support product planning and user research.',
        department: 'Product',
        location: 'Remote',
        employmentType: 'internship',
        status: 'draft',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager2.id,
        updatedAt: new Date(),
      },
      {
        title: 'Finance Coordinator',
        description: 'Support finance operations.',
        department: 'Finance',
        location: 'Mumbai',
        employmentType: 'part_time',
        status: 'draft',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager1.id,
        updatedAt: new Date(),
      },
      {
        title: 'Sales Operations Manager',
        description: 'Lead sales operations readiness.',
        department: 'Sales',
        location: 'Hybrid',
        employmentType: 'full_time',
        status: 'closed',
        postedByUserId: hrUser.id,
        hiringManagerUserId: manager2.id,
        openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        closedAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning({ id: jobs.id, status: jobs.status });

  const openJobs = insertedJobs.filter((job) => job.status === 'open');
  const openJob1 = getRequired(openJobs[0], 'open job 1');
  const openJob2 = getRequired(openJobs[1], 'open job 2');
  const openJob3 = getRequired(openJobs[2], 'open job 3');

  const insertedApplications = await db
    .insert(applications)
    .values([
      // applied (4)
      { jobId: openJob1.id, applicantUserId: employee1.id, stage: 'applied', decision: 'pending' },
      { jobId: openJob1.id, applicantUserId: employee2.id, stage: 'applied', decision: 'pending' },
      { jobId: openJob2.id, applicantUserId: employee3.id, stage: 'applied', decision: 'pending' },
      { jobId: openJob3.id, applicantUserId: employee4.id, stage: 'applied', decision: 'pending' },
      // screening (3)
      {
        jobId: openJob1.id,
        applicantUserId: employee5.id,
        stage: 'screening',
        decision: 'pending',
      },
      {
        jobId: openJob2.id,
        applicantUserId: employee6.id,
        stage: 'screening',
        decision: 'pending',
      },
      {
        jobId: openJob3.id,
        applicantUserId: employee1.id,
        stage: 'screening',
        decision: 'pending',
      },
      // interview (3)
      {
        jobId: openJob1.id,
        applicantUserId: employee3.id,
        stage: 'interview',
        decision: 'pending',
      },
      {
        jobId: openJob2.id,
        applicantUserId: employee4.id,
        stage: 'interview',
        decision: 'pending',
      },
      {
        jobId: openJob3.id,
        applicantUserId: employee5.id,
        stage: 'interview',
        decision: 'pending',
      },
      // decision (2)
      {
        jobId: openJob2.id,
        applicantUserId: employee2.id,
        stage: 'decision',
        decision: 'accepted',
      },
      {
        jobId: openJob3.id,
        applicantUserId: employee6.id,
        stage: 'decision',
        decision: 'rejected',
      },
    ])
    .returning({
      id: applications.id,
      stage: applications.stage,
      applicantUserId: applications.applicantUserId,
    });

  const managerByJobId = new Map<number, string>();
  for (const openJob of openJobs) {
    const job = await db
      .select({ hiringManagerUserId: jobs.hiringManagerUserId })
      .from(jobs)
      .where(eq(jobs.id, openJob.id))
      .limit(1);
    managerByJobId.set(openJob.id, job[0]?.hiringManagerUserId ?? manager1.id);
  }

  for (const application of insertedApplications) {
    if (application.stage === 'applied') {
      continue;
    }

    const current = await db
      .select({ jobId: applications.jobId, stage: applications.stage })
      .from(applications)
      .where(eq(applications.id, application.id))
      .limit(1);

    const jobId = current[0]?.jobId;
    if (!jobId) {
      continue;
    }

    if (application.stage === 'screening') {
      await db.insert(applicationStageEvents).values({
        applicationId: application.id,
        fromStage: 'applied',
        toStage: 'screening',
        changedByUserId: managerByJobId.get(jobId) ?? manager1.id,
        note: 'Moved to screening during seed setup.',
      });
    }

    if (application.stage === 'interview') {
      await db.insert(applicationStageEvents).values([
        {
          applicationId: application.id,
          fromStage: 'applied',
          toStage: 'screening',
          changedByUserId: managerByJobId.get(jobId) ?? manager1.id,
          note: 'Moved to screening during seed setup.',
        },
        {
          applicationId: application.id,
          fromStage: 'screening',
          toStage: 'interview',
          changedByUserId: managerByJobId.get(jobId) ?? manager1.id,
          note: 'Moved to interview during seed setup.',
        },
      ]);
    }

    if (application.stage === 'decision') {
      await db.insert(applicationStageEvents).values({
        applicationId: application.id,
        fromStage: 'screening',
        toStage: 'decision',
        changedByUserId: managerByJobId.get(jobId) ?? manager1.id,
        note: 'Decision recorded during seed setup.',
      });
    }
  }

  await getSqlClient().end();

  console.log('Seed completed:', {
    users: seedUsers.length,
    jobs: insertedJobs.length,
    applications: insertedApplications.length,
  });
};

if (process.argv[1]?.includes('seed.ts')) {
  runSeed().catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  });
}
