import { meResponseSchema } from '@caw-hackathon/shared';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthenticatedUser } from './auth.types.js';

@Controller('api/auth')
export class AuthController {
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return meResponseSchema.parse(currentUser);
  }
}
