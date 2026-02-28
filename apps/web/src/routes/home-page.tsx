import { SignedOut } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TopNav } from '@/components/layout/top-nav';
import { apiFetch } from '@/lib/api';

export const HomePage = () => {
  // const versionQuery = useQuery({
  //   queryKey: ['version'],
  //   queryFn: async () => {
  //     const response = await apiFetch('/api/version');
  //     if (!response.ok) throw new Error('Failed to fetch API version');
  //     return (await response.json()) as { version: string; env: string };
  //   },
  // });

  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch authenticated user');
      return (await response.json()) as {
        id: string;
        email: string;
        fullName: string | null;
        role: 'unassigned' | 'employee' | 'manager' | 'hr';
        status: 'active' | 'pending_role';
      };
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <TopNav />
      <section className="rounded-lg border bg-white p-4">
        <h1 className="text-2xl font-semibold">Internal Job Board</h1>

        <p className="mt-1 text-sm text-slate-600">
          User:{' '}
          {meQuery.data
            ? `${meQuery.data.email} | role=${meQuery.data.role} | status=${meQuery.data.status}`
            : 'loading...'}
        </p>
        {meQuery.data ? (
          <div className="mt-3 flex gap-3 text-sm">
            <Link className="text-blue-600 underline" to="/jobs">
              Browse Jobs
            </Link>
            {meQuery.data.role === 'employee' ? (
              <Link className="text-blue-600 underline" to="/my-applications">
                My Applications
              </Link>
            ) : null}
            {meQuery.data.role === 'hr' ? (
              <Link className="text-blue-600 underline" to="/hr/dashboard">
                HR Dashboard
              </Link>
            ) : null}
          </div>
        ) : null}
        <SignedOut>
          <p className="mt-2 text-sm text-red-600">You are signed out. Please use /sign-in.</p>
        </SignedOut>
      </section>
    </main>
  );
};
