import type { AppRole } from '@caw-hackathon/shared';

export type AuthStatus = 'active' | 'pending_role';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  status: AuthStatus;
}
