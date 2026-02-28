import type { AppRole } from '@caw-hackathon/shared';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';

type MePayload = {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  status: 'active' | 'pending_role';
};

export const RequireRole = ({ allowed, children }: { allowed: AppRole[]; children: ReactNode }) => {
  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to load authenticated user.');
      }
      return (await response.json()) as MePayload;
    },
  });

  if (meQuery.isLoading) {
    return <div className="p-6 text-sm text-slate-600">Checking role access...</div>;
  }

  if (meQuery.isError || !meQuery.data) {
    return <Navigate replace to="/" />;
  }

  if (!allowed.includes(meQuery.data.role)) {
    return <Navigate replace to="/" />;
  }

  return children;
};
