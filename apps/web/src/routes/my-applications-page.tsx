import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TopNav } from '@/components/layout/top-nav';
import { listMyApplications } from '@/lib/jobs-api';

const stageLabel = (value: string): string => value.replace('_', ' ');

const decisionClasses: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

export const MyApplicationsPage = () => {
  const applicationsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => listMyApplications(),
  });

  if (applicationsQuery.isLoading) {
    return <main className="p-6 text-sm text-slate-600">Loading applications...</main>;
  }

  if (applicationsQuery.isError) {
    return <main className="p-6 text-sm text-red-600">Failed to load applications.</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <TopNav />
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <Link className="text-sm text-blue-600 underline" to="/jobs">
          Browse Jobs
        </Link>
      </header>

      {applicationsQuery.data?.length ? (
        <section className="space-y-3">
          {applicationsQuery.data.map((application) => (
            <article className="rounded-lg border bg-white p-4" key={application.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">{application.job.title}</h2>
                  <p className="text-sm text-slate-600">
                    {application.job.department} | {stageLabel(application.job.employmentType)}
                    {application.job.location ? ` | ${application.job.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded px-2 py-1 text-xs uppercase bg-blue-100 text-blue-700">
                    {stageLabel(application.stage)}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs uppercase ${decisionClasses[application.decision] ?? 'bg-slate-100 text-slate-700'}`}
                  >
                    {stageLabel(application.decision)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <p>Applied: {new Date(application.appliedAt).toLocaleString()}</p>
                <Link className="text-blue-600 underline" to={`/jobs/${application.job.id}`}>
                  View Job
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border bg-white p-4 text-sm text-slate-600">
          You have not applied to any jobs yet.
        </section>
      )}
    </main>
  );
};
