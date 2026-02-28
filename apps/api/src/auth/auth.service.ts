import { createClerkClient, verifyToken } from '@clerk/backend';
import { users } from '@caw-hackathon/db';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, sql } from 'drizzle-orm';
import { DB } from '../db.module.js';
import type { AppEnv } from '../env.js';
import type { DbClient } from '@caw-hackathon/db';
import type { AppRole } from '@caw-hackathon/shared';
import type { AuthStatus, AuthenticatedUser } from './auth.types.js';

@Injectable()
export class AuthService {
  private readonly clerkClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
    @Inject(DB) private readonly db: DbClient,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get('CLERK_SECRET_KEY', { infer: true }),
    });
  }

  async authenticate(authorizationHeader: string | undefined): Promise<AuthenticatedUser> {
    try {
      const token = this.extractBearerToken(authorizationHeader);
      const payload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY', { infer: true }),
      });
      const clerkUserId = payload.sub;

      if (!clerkUserId) {
        throw new UnauthorizedException('Invalid Clerk token payload.');
      }

      const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
      const primaryEmail =
        clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses.at(0)?.emailAddress;

      if (!primaryEmail) {
        throw new UnauthorizedException('Clerk user does not have an email.');
      }

      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || null;

      await this.db
        .insert(users)
        .values({
          id: clerkUserId,
          clerkUserId,
          email: primaryEmail.toLowerCase(),
          fullName,
          role: 'employee',
        })
        .onConflictDoUpdate({
          target: users.clerkUserId,
          set: {
            email: primaryEmail.toLowerCase(),
            fullName,
            updatedAt: new Date(),
          },
        });

      // Backward compatibility for records created before role-default changes.
      await this.db
        .update(users)
        .set({ role: 'employee', updatedAt: new Date() })
        .where(and(eq(users.clerkUserId, clerkUserId), sql`${users.role}::text = 'unassigned'`));

      const [user] = await this.db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
        })
        .from(users)
        .where(eq(users.clerkUserId, clerkUserId))
        .limit(1);

      if (!user) {
        throw new UnauthorizedException('Failed to sync local user.');
      }

      const status: AuthStatus = 'active';

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as AppRole,
        status,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Unexpected authentication failure', error as Error);
      throw new InternalServerErrorException('Authentication service failed.');
    }
  }

  private extractBearerToken(header: string | undefined): string {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const token = header.replace('Bearer ', '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid bearer token.');
    }

    return token;
  }
}
