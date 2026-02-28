import { meResponseSchema, type JobStatus } from '@caw-hackathon/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { TopNav } from '@/components/layout/top-nav';
import { applyToJob, listJobs, listMyApplications } from '@/lib/jobs-api';

const statusOptions: Array<JobStatus | 'all'> = ['all', 'draft', 'open', 'closed'];

export const JobsPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<JobStatus | 'all'>('all');
  const [department, setDepartment] = useState('');

  const query = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      department: department.trim() ? department.trim() : undefined,
    }),
    [status, department],
  );

  const jobsQuery = useQuery({
    queryKey: ['jobs', query.status, query.department],
    queryFn: () => listJobs(query),
  });

  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch authenticated user');
      }
      return meResponseSchema.parse(await response.json());
    },
  });
  const isHr = meQuery.data?.role === 'hr';
  const isEmployee = meQuery.data?.role === 'employee';
  const isManager = meQuery.data?.role === 'manager';

  const myApplicationsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => listMyApplications(),
    enabled: isEmployee,
  });

  const appliedJobIds = new Set((myApplicationsQuery.data ?? []).map((item) => item.job.id));

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => applyToJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <TopNav />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <div className="flex items-center gap-3">
          {isHr ? (
            <>
              <Link className="text-sm text-blue-600 underline" to="/hr/dashboard">
                HR Dashboard
              </Link>
              <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/hr/jobs/new">
                Create Job
              </Link>
            </>
          ) : null}
          {isEmployee ? (
            <Link className="text-sm text-blue-600 underline" to="/my-applications">
              My Applications
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-3">
        <label className="text-sm">
          Status
          <select
            className="mt-1 w-full rounded border px-2 py-2"
            onChange={(event) => setStatus(event.target.value as JobStatus | 'all')}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm sm:col-span-2">
          Department
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="Engineering"
            value={department}
          />
        </label>
      </section>

      {jobsQuery.isLoading ? <p className="text-sm text-slate-600">Loading jobs...</p> : null}
      {jobsQuery.isError ? <p className="text-sm text-red-600">Failed to load jobs.</p> : null}

      <section className="space-y-3">
        {jobsQuery.data?.map((job) => (
          <article className="rounded-lg border bg-white p-4" key={job.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-medium">{job.title}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs uppercase">{job.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {job.department} | {job.employmentType.replace('_', ' ')}
              {job.location ? ` | ${job.location}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link className="text-blue-600 underline" to={`/jobs/${job.id}`}>
                View
              </Link>
              {isHr ? (
                <Link className="text-blue-600 underline" to={`/hr/jobs/${job.id}/edit`}>
                  Edit
                </Link>
              ) : null}
              {isHr || isManager ? (
                <Link className="text-blue-600 underline" to={`/jobs/${job.id}/applications`}>
                  Applications
                </Link>
              ) : null}
              {isEmployee ? (
                <button
                  className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-60"
                  disabled={
                    applyMutation.isPending || job.status !== 'open' || appliedJobIds.has(job.id)
                  }
                  onClick={() => applyMutation.mutate(job.id)}
                  type="button"
                >
                  {appliedJobIds.has(job.id) ? 'Applied' : 'Apply'}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
      {applyMutation.isError ? (
        <p className="text-sm text-red-600">{(applyMutation.error as Error).message}</p>
      ) : null}
    </main>
  );
};
