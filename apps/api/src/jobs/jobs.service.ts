import { applications, jobs, users, type DbClient } from '@caw-hackathon/db';
import {
  createJobRequestSchema,
  jobDetailsSchema,
  jobListQuerySchema,
  jobListResponseSchema,
  stageCountsSchema,
  updateJobRequestSchema,
  type CreateJobRequest,
  type Job,
  type JobDetails,
  type JobListQuery,
  type JobListResponse,
  type StageCounts,
  type UpdateJobRequest,
} from '@caw-hackathon/shared';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { DB } from '../db.module.js';

type DbJobRow = typeof jobs.$inferSelect;

@Injectable()
export class JobsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async listJobs(currentUser: AuthenticatedUser, query: JobListQuery): Promise<JobListResponse> {
    const parsedQuery = jobListQuerySchema.parse(query);
    const filters = this.buildListFilters(currentUser, parsedQuery);

    const rows = await this.db
      .select()
      .from(jobs)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(jobs.createdAt));

    return jobListResponseSchema.parse({
      jobs: rows.map((row) => this.toJob(row)),
    });
  }

  async getJobById(currentUser: AuthenticatedUser, id: number): Promise<JobDetails> {
    const jobRow = await this.getJobRowById(id);
    this.assertCanReadJob(currentUser, jobRow);

    const stageRows = await this.db
      .select({
        stage: applications.stage,
        total: count(),
      })
      .from(applications)
      .where(eq(applications.jobId, id))
      .groupBy(applications.stage);

    const applicationCounts: StageCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      decision: 0,
    };

    for (const row of stageRows) {
      applicationCounts[row.stage] = Number(row.total);
    }

    return jobDetailsSchema.parse({
      job: this.toJob(jobRow),
      applicationCounts: stageCountsSchema.parse(applicationCounts),
    });
  }

  async createJob(currentUser: AuthenticatedUser, body: CreateJobRequest): Promise<Job> {
    this.assertRole(currentUser, ['hr']);

    const payload = createJobRequestSchema.parse(body);
    await this.assertManager(payload.hiringManagerUserId);

    const timestamps = this.computeStatusTimestamps(payload.status, null);

    const [created] = await this.db
      .insert(jobs)
      .values({
        ...payload,
        location: payload.location ?? null,
        postedByUserId: currentUser.id,
        openedAt: timestamps.openedAt,
        closedAt: timestamps.closedAt,
      })
      .returning();

    if (!created) {
      throw new BadRequestException('Failed to create job.');
    }

    return this.toJob(created);
  }

  async updateJob(
    currentUser: AuthenticatedUser,
    id: number,
    body: UpdateJobRequest,
  ): Promise<Job> {
    this.assertRole(currentUser, ['hr']);

    const payload = updateJobRequestSchema.parse(body);
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('At least one field is required for update.');
    }

    const existing = await this.getJobRowById(id);

    if (payload.hiringManagerUserId) {
      await this.assertManager(payload.hiringManagerUserId);
    }

    const nextStatus = payload.status ?? existing.status;
    const timestamps = this.computeStatusTimestamps(nextStatus, existing);

    const [updated] = await this.db
      .update(jobs)
      .set({
        title: payload.title ?? existing.title,
        description: payload.description ?? existing.description,
        department: payload.department ?? existing.department,
        location: payload.location ?? existing.location,
        employmentType: payload.employmentType ?? existing.employmentType,
        status: nextStatus,
        hiringManagerUserId: payload.hiringManagerUserId ?? existing.hiringManagerUserId,
        openedAt: timestamps.openedAt,
        closedAt: timestamps.closedAt,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Job not found.');
    }

    return this.toJob(updated);
  }

  async deleteJob(currentUser: AuthenticatedUser, id: number): Promise<{ ok: true }> {
    this.assertRole(currentUser, ['hr']);

    const existing = await this.getJobRowById(id);
    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft jobs can be deleted in MVP.');
    }

    await this.db.delete(jobs).where(eq(jobs.id, id));
    return { ok: true };
  }

  async getHrDashboard(currentUser: AuthenticatedUser) {
    this.assertRole(currentUser, ['hr']);

    const [openPositionsRow] = await this.db
      .select({ total: count() })
      .from(jobs)
      .where(eq(jobs.status, 'open'));

    const [totalApplicationsRow] = await this.db.select({ total: count() }).from(applications);

    const stageRows = await this.db
      .select({
        stage: applications.stage,
        total: count(),
      })
      .from(applications)
      .groupBy(applications.stage);

    const stageDistribution: StageCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      decision: 0,
    };
    for (const row of stageRows) {
      stageDistribution[row.stage] = Number(row.total);
    }

    return {
      openPositions: Number(openPositionsRow?.total ?? 0),
      totalApplications: Number(totalApplicationsRow?.total ?? 0),
      stageDistribution,
    };
  }

  private buildListFilters(currentUser: AuthenticatedUser, query: JobListQuery) {
    const filters = [];

    if (currentUser.role === 'employee') {
      filters.push(eq(jobs.status, 'open'));
    } else if (currentUser.role === 'manager') {
      filters.push(eq(jobs.hiringManagerUserId, currentUser.id));
    } else if (currentUser.role !== 'hr') {
      throw new ForbiddenException('Assigned role required.');
    }

    if (query.status) {
      filters.push(eq(jobs.status, query.status));
    }
    if (query.department) {
      filters.push(eq(jobs.department, query.department));
    }

    return filters;
  }

  private assertCanReadJob(currentUser: AuthenticatedUser, jobRow: DbJobRow): void {
    if (currentUser.role === 'hr') {
      return;
    }
    if (currentUser.role === 'manager' && jobRow.hiringManagerUserId === currentUser.id) {
      return;
    }
    if (currentUser.role === 'employee' && jobRow.status === 'open') {
      return;
    }
    throw new ForbiddenException('You do not have access to this job.');
  }

  private async assertManager(userId: string): Promise<void> {
    const [manager] = await this.db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!manager) {
      throw new BadRequestException('hiringManagerUserId does not exist.');
    }
    if (manager.role !== 'manager') {
      throw new BadRequestException('hiringManagerUserId must reference a manager user.');
    }
  }

  private assertRole(
    currentUser: AuthenticatedUser,
    allowed: Array<AuthenticatedUser['role']>,
  ): void {
    if (!allowed.includes(currentUser.role)) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }
  }

  private async getJobRowById(id: number): Promise<DbJobRow> {
    const [jobRow] = await this.db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!jobRow) {
      throw new NotFoundException('Job not found.');
    }
    return jobRow;
  }

  private computeStatusTimestamps(nextStatus: Job['status'], existing: DbJobRow | null) {
    const now = new Date();

    if (!existing) {
      if (nextStatus === 'open') return { openedAt: now, closedAt: null };
      if (nextStatus === 'closed') return { openedAt: null, closedAt: now };
      return { openedAt: null, closedAt: null };
    }

    if (nextStatus === 'open') {
      if (existing.status === 'open') {
        return { openedAt: existing.openedAt, closedAt: existing.closedAt };
      }
      return { openedAt: now, closedAt: null };
    }

    if (nextStatus === 'closed') {
      if (existing.status === 'closed') {
        return { openedAt: existing.openedAt, closedAt: existing.closedAt };
      }
      return { openedAt: existing.openedAt, closedAt: now };
    }

    return { openedAt: null, closedAt: null };
  }

  private toJob(row: DbJobRow): Job {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      department: row.department,
      location: row.location,
      employmentType: row.employmentType,
      status: row.status,
      postedByUserId: row.postedByUserId,
      hiringManagerUserId: row.hiringManagerUserId,
      openedAt: row.openedAt?.toISOString() ?? null,
      closedAt: row.closedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
