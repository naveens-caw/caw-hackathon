import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/lib/store';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

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
      const response = await fetch(`${API_URL}/api/version`);
      if (!response.ok) throw new Error('Failed to fetch API version');
      return (await response.json()) as { version: string; env: string };
    },
  });

  const submitProject = useMutation({
    mutationFn: async (payload: ProjectFormValues) => payload,
    onSuccess: () => incrementSubmissions(),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <section className="rounded-lg border bg-white p-4">
        <h1 className="text-2xl font-semibold">CAW Hackathon Bootstrap testing develop branch</h1>
        <p className="mt-2 text-sm text-slate-600">
          API: {versionQuery.data ? `${versionQuery.data.version} (${versionQuery.data.env})` : 'loading...'}
        </p>
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
