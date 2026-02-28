import {
  createJobRequestSchema,
  jobDetailsSchema,
  jobListQuerySchema,
  jobListResponseSchema,
  jobSchema,
  updateJobRequestSchema,
} from '@caw-hackathon/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { JobsService } from './jobs.service.js';

@Controller('api/jobs')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @Roles('hr', 'manager', 'employee')
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const parsedQuery = jobListQuerySchema.parse(query);
    const response = await this.jobsService.listJobs(currentUser, parsedQuery);
    return jobListResponseSchema.parse(response);
  }

  @Get(':id')
  @Roles('hr', 'manager', 'employee')
  async details(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.jobsService.getJobById(currentUser, id);
    return jobDetailsSchema.parse(response);
  }

  @Post()
  @Roles('hr')
  async create(@CurrentUser() currentUser: AuthenticatedUser, @Body() body: unknown) {
    const payload = createJobRequestSchema.parse(body);
    const response = await this.jobsService.createJob(currentUser, payload);
    return jobSchema.parse(response);
  }

  @Patch(':id')
  @Roles('hr')
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    const payload = updateJobRequestSchema.parse(body);
    const response = await this.jobsService.updateJob(currentUser, id, payload);
    return jobSchema.parse(response);
  }

  @Delete(':id')
  @Roles('hr')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobsService.deleteJob(currentUser, id);
  }
}
