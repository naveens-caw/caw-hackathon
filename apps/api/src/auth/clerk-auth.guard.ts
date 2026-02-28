import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthenticatedUser } from './auth.types.js';

type AuthenticatedRequest = {
  headers: { authorization?: string };
  currentUser?: AuthenticatedUser;
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.currentUser = await this.authService.authenticate(request.headers.authorization);
    return true;
  }
}
