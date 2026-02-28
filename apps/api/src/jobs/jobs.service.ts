import {
  applicationStageEvents,
  applications,
  jobs,
  users,
  type DbClient,
} from '@caw-hackathon/db';
import {
  applyToJobRequestSchema,
  applicationListItemSchema,
  applicationSchema,
  createJobRequestSchema,
  jobDetailsSchema,
  jobApplicationsResponseSchema,
  jobListQuerySchema,
  jobListResponseSchema,
  myApplicationSchema,
  myApplicationsResponseSchema,
  stageCountsSchema,
  updateApplicationStageRequestSchema,
  updateApplicationStageResponseSchema,
  updateJobRequestSchema,
  type Application,
  type ApplicationStage,
  type ApplyToJobRequest,
  type CreateJobRequest,
  type Job,
  type JobApplicationsResponse,
  type JobDetails,
  type JobListQuery,
  type JobListResponse,
  type MyApplicationsResponse,
  type StageCounts,
  type UpdateApplicationStageRequest,
  type UpdateApplicationStageResponse,
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
import { getAllowedNextStages, isValidStageTransition } from './stage-transitions.js';

type DbJobRow = typeof jobs.$inferSelect;
type DbApplicationRow = typeof applications.$inferSelect;

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

  async applyToJob(
    currentUser: AuthenticatedUser,
    jobId: number,
    body: ApplyToJobRequest,
  ): Promise<Application> {
    this.assertRole(currentUser, ['employee']);

    const payload = applyToJobRequestSchema.parse(body);
    const jobRow = await this.getJobRowById(jobId);

    if (jobRow.status !== 'open') {
      throw new BadRequestException('Only open jobs can accept applications.');
    }

    const [created] = await this.db
      .insert(applications)
      .values({
        jobId,
        applicantUserId: currentUser.id,
        resumeUrl: payload.resumeUrl ?? null,
        coverLetter: payload.coverLetter ?? null,
        stage: 'applied',
        decision: 'pending',
      })
      .onConflictDoNothing({
        target: [applications.jobId, applications.applicantUserId],
      })
      .returning();

    if (!created) {
      throw new BadRequestException('You have already applied to this job.');
    }

    return this.toApplication(created);
  }

  async listMyApplications(currentUser: AuthenticatedUser): Promise<MyApplicationsResponse> {
    this.assertRole(currentUser, ['employee']);

    const rows = await this.db
      .select({
        application: applications,
        job: {
          id: jobs.id,
          title: jobs.title,
          department: jobs.department,
          employmentType: jobs.employmentType,
          status: jobs.status,
          location: jobs.location,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(applications.applicantUserId, currentUser.id))
      .orderBy(desc(applications.appliedAt));

    return myApplicationsResponseSchema.parse({
      applications: rows.map((row) =>
        myApplicationSchema.parse({
          ...this.toApplication(row.application),
          job: row.job,
        }),
      ),
    });
  }

  async listJobApplications(
    currentUser: AuthenticatedUser,
    jobId: number,
  ): Promise<JobApplicationsResponse> {
    this.assertRole(currentUser, ['hr', 'manager']);

    const jobRow = await this.getJobRowById(jobId);
    this.assertCanManageJobApplications(currentUser, jobRow);

    const rows = await this.db
      .select({
        application: applications,
        applicant: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
      })
      .from(applications)
      .innerJoin(users, eq(users.id, applications.applicantUserId))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    return jobApplicationsResponseSchema.parse({
      applications: rows.map((row) =>
        applicationListItemSchema.parse({
          ...this.toApplication(row.application),
          applicant: row.applicant,
        }),
      ),
    });
  }

  async updateApplicationStage(
    currentUser: AuthenticatedUser,
    applicationId: number,
    body: UpdateApplicationStageRequest,
  ): Promise<UpdateApplicationStageResponse> {
    this.assertRole(currentUser, ['hr', 'manager']);
    const payload = updateApplicationStageRequestSchema.parse(body);

    const [existing] = await this.db
      .select({
        application: applications,
        job: {
          id: jobs.id,
          hiringManagerUserId: jobs.hiringManagerUserId,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Application not found.');
    }

    this.assertCanManageJobApplications(currentUser, existing.job);
    this.assertValidStageTransition(existing.application.stage, payload.toStage);

    const nextDecision = payload.toStage === 'decision' ? payload.decision : 'pending';

    const result = await this.db.transaction(async (tx) => {
      const [updatedApplication] = await tx
        .update(applications)
        .set({
          stage: payload.toStage,
          decision: nextDecision,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId))
        .returning();

      if (!updatedApplication) {
        throw new NotFoundException('Application not found.');
      }

      const [event] = await tx
        .insert(applicationStageEvents)
        .values({
          applicationId,
          fromStage: existing.application.stage,
          toStage: payload.toStage,
          changedByUserId: currentUser.id,
          note: payload.note ?? null,
        })
        .returning();

      if (!event) {
        throw new BadRequestException('Failed to persist stage event.');
      }

      return { updatedApplication, event };
    });

    return updateApplicationStageResponseSchema.parse({
      application: this.toApplication(result.updatedApplication),
      stageEvent: {
        id: result.event.id,
        applicationId: result.event.applicationId,
        fromStage: result.event.fromStage,
        toStage: result.event.toStage,
        changedByUserId: result.event.changedByUserId,
        note: result.event.note,
        createdAt: result.event.createdAt.toISOString(),
      },
    });
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

  private assertCanManageJobApplications(
    currentUser: AuthenticatedUser,
    job: Pick<DbJobRow, 'hiringManagerUserId'>,
  ): void {
    if (currentUser.role === 'hr') {
      return;
    }

    if (currentUser.role === 'manager' && job.hiringManagerUserId === currentUser.id) {
      return;
    }

    throw new ForbiddenException('You do not have access to applications for this job.');
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

  private assertValidStageTransition(fromStage: ApplicationStage, toStage: ApplicationStage): void {
    if (fromStage === toStage) {
      throw new BadRequestException(`Application is already in '${toStage}' stage.`);
    }

    const allowed = getAllowedNextStages(fromStage);
    if (!isValidStageTransition(fromStage, toStage)) {
      throw new BadRequestException(
        `Invalid stage transition '${fromStage}' -> '${toStage}'. Allowed next stages: ${allowed.join(', ') || 'none'}.`,
      );
    }
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

  private toApplication(row: DbApplicationRow): Application {
    return applicationSchema.parse({
      id: row.id,
      jobId: row.jobId,
      applicantUserId: row.applicantUserId,
      resumeUrl: row.resumeUrl,
      coverLetter: row.coverLetter,
      stage: row.stage,
      decision: row.decision,
      appliedAt: row.appliedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
}
