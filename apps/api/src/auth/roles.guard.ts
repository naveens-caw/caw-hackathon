import type { AppRole } from '@caw-hackathon/shared';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import type { AuthenticatedUser } from './auth.types.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ currentUser?: AuthenticatedUser }>();
    const currentUser = request.currentUser;

    if (!currentUser) {
      throw new UnauthorizedException('User is not authenticated.');
    }

    if (!requiredRoles.includes(currentUser.role)) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return true;
  }
}
