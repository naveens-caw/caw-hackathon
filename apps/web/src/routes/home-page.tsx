import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useUiStore } from '@/lib/store';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export const HomePage = () => {
  const incrementSubmissions = useUiStore((state) => state.incrementSubmissions);
  const submissions = useUiStore((state) => state.submissions);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '' },
  });

  const versionQuery = useQuery({
    queryKey: ['version'],
    queryFn: async () => {
      const response = await apiFetch('/api/version');
      if (!response.ok) throw new Error('Failed to fetch API version');
      return (await response.json()) as { version: string; env: string };
    },
  });

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

  const submitProject = useMutation({
    mutationFn: async (payload: ProjectFormValues) => payload,
    onSuccess: () => incrementSubmissions(),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <section className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Internal Job Board: Auth + RBAC</h1>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          API:{' '}
          {versionQuery.data
            ? `${versionQuery.data.version} (${versionQuery.data.env})`
            : 'loading...'}
        </p>
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

      <form
        className="rounded-lg border bg-white p-4"
        onSubmit={form.handleSubmit(async (values) => submitProject.mutateAsync(values))}
      >
        <label className="mb-2 block text-sm font-medium" htmlFor="name">
          Project name
        </label>
        <input
          id="name"
          className="mb-2 w-full rounded-md border px-3 py-2"
          placeholder="Build something in 24h"
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="mb-2 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}

        <Button disabled={submitProject.isPending} type="submit">
          Save draft
        </Button>
      </form>

      <p className="text-sm text-slate-700">Local submissions counter (Zustand): {submissions}</p>
    </main>
  );
};
