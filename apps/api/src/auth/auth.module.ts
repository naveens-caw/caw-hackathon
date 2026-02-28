import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ClerkAuthGuard, RolesGuard],
  exports: [AuthService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
