import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from './auth/clerk-auth.guard.js';
import { CurrentUser } from './auth/current-user.decorator.js';
import { Roles } from './auth/roles.decorator.js';
import { RolesGuard } from './auth/roles.guard.js';
import type { AuthenticatedUser } from './auth/auth.types.js';

@Controller('api/rbac-demo')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RbacDemoController {
  @Get('hr')
  @Roles('hr')
  hr(@CurrentUser() currentUser: AuthenticatedUser) {
    return { ok: true, path: 'hr', role: currentUser.role };
  }

  @Get('manager')
  @Roles('manager')
  manager(@CurrentUser() currentUser: AuthenticatedUser) {
    return { ok: true, path: 'manager', role: currentUser.role };
  }

  @Get('employee')
  @Roles('employee')
  employee(@CurrentUser() currentUser: AuthenticatedUser) {
    return { ok: true, path: 'employee', role: currentUser.role };
  }
}
