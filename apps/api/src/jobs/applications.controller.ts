import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import {
  myApplicationsResponseSchema,
  updateApplicationStageRequestSchema,
  updateApplicationStageResponseSchema,
} from '@caw-hackathon/shared';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { JobsService } from './jobs.service.js';

@Controller('api/applications')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('me')
  @Roles('employee')
  async listMine(@CurrentUser() currentUser: AuthenticatedUser) {
    const response = await this.jobsService.listMyApplications(currentUser);
    return myApplicationsResponseSchema.parse(response);
  }

  @Patch(':id/stage')
  @Roles('hr', 'manager')
  async updateStage(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    const payload = updateApplicationStageRequestSchema.parse(body);
    const response = await this.jobsService.updateApplicationStage(currentUser, id, payload);
    return updateApplicationStageResponseSchema.parse(response);
  }
}
