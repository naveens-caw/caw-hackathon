import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getHrDashboard } from '@/lib/jobs-api';

export const HrDashboardPage = () => {
  const dashboardQuery = useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: () => getHrDashboard(),
  });

  if (dashboardQuery.isLoading) {
    return <main className="p-6 text-sm text-slate-600">Loading dashboard...</main>;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <main className="p-6 text-sm text-red-600">Failed to load dashboard.</main>;
  }

  const dashboard = dashboardQuery.data;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">HR Dashboard</h1>
        <Link className="text-sm text-blue-600 underline" to="/hr/jobs">
          Manage Jobs
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Open Positions</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.openPositions}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.totalApplications}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Decision Stage</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.stageDistribution.decision}</p>
        </article>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Pipeline Snapshot</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Applied</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.stageDistribution.applied}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Screening</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.stageDistribution.screening}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Interview</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.stageDistribution.interview}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs uppercase text-slate-500">Decision</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.stageDistribution.decision}</p>
          </div>
        </div>
      </section>
    </main>
  );
};
