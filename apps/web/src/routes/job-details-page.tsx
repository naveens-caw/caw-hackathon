import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { deleteJob, getJobDetails } from '@/lib/jobs-api';

export const JobDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const jobQuery = useQuery({
    queryKey: ['job-details', jobId],
    queryFn: () => getJobDetails(jobId),
    enabled: Number.isFinite(jobId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate('/jobs');
    },
  });

  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch authenticated user');
      }
      return (await response.json()) as { role: 'unassigned' | 'employee' | 'manager' | 'hr' };
    },
  });

  if (!Number.isFinite(jobId)) {
    return <main className="p-6 text-sm text-red-600">Invalid job id.</main>;
  }

  if (jobQuery.isLoading) {
    return <main className="p-6 text-sm text-slate-600">Loading job details...</main>;
  }

  if (jobQuery.isError || !jobQuery.data) {
    return <main className="p-6 text-sm text-red-600">Failed to load job details.</main>;
  }

  const { job, applicationCounts } = jobQuery.data;
  const isHr = meQuery.data?.role === 'hr';
  const canManageApplications = meQuery.data?.role === 'hr' || meQuery.data?.role === 'manager';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {job.department} | {job.employmentType.replace('_', ' ')} | {job.status}
          </p>
          {job.location ? <p className="text-sm text-slate-600">{job.location}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-blue-600 underline" to="/jobs">
            Back
          </Link>
          {isHr ? (
            <>
              <Link className="text-sm text-blue-600 underline" to={`/hr/jobs/${job.id}/edit`}>
                Edit
              </Link>
              <button
                className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
                disabled={deleteMutation.isPending || job.status !== 'draft'}
                onClick={() => deleteMutation.mutate()}
                type="button"
              >
                Delete Draft
              </button>
            </>
          ) : null}
          {canManageApplications ? (
            <Link className="text-sm text-blue-600 underline" to={`/jobs/${job.id}/applications`}>
              Pipeline Board
            </Link>
          ) : null}
        </div>
      </header>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Applications by Stage</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Applied</p>
            <p className="mt-1 text-xl font-semibold">{applicationCounts.applied}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Screening</p>
            <p className="mt-1 text-xl font-semibold">{applicationCounts.screening}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Interview</p>
            <p className="mt-1 text-xl font-semibold">{applicationCounts.interview}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Decision</p>
            <p className="mt-1 text-xl font-semibold">{applicationCounts.decision}</p>
          </div>
        </div>
      </section>
    </main>
  );
};
