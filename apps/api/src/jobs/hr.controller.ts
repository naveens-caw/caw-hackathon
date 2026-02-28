import { hrDashboardSchema } from '@caw-hackathon/shared';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { JobsService } from './jobs.service.js';

@Controller('api/hr')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('hr')
export class HrController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() currentUser: AuthenticatedUser) {
    const response = await this.jobsService.getHrDashboard(currentUser);
    return hrDashboardSchema.parse(response);
  }
}
