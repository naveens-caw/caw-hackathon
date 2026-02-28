import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  it('allows users with matching role', () => {
    const reflector = {
      getAllAndOverride: () => ['employee'],
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const allowed = guard.canActivate({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({
        getRequest: () => ({
          currentUser: { role: 'employee' },
        }),
      }),
    } as never);

    expect(allowed).toBe(true);
  });

  it('blocks users with non-matching role', () => {
    const reflector = {
      getAllAndOverride: () => ['hr'],
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(() =>
      guard.canActivate({
        getHandler: () => null,
        getClass: () => null,
        switchToHttp: () => ({
          getRequest: () => ({
            currentUser: { role: 'employee' },
          }),
        }),
      } as never),
    ).toThrow(ForbiddenException);
  });
});
