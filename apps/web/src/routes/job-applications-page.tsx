import type { ApplicationStage } from '@caw-hackathon/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TopNav } from '@/components/layout/top-nav';
import {
  getNextStageOptions,
  getJobDetails,
  listJobApplications,
  updateApplicationStage,
} from '@/lib/jobs-api';

type DraftState = {
  toStage: ApplicationStage;
  decision: 'accepted' | 'rejected' | '';
  note: string;
};

const stageLabel = (value: string): string => value.replace('_', ' ');

export const JobApplicationsPage = () => {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, DraftState>>({});

  const jobQuery = useQuery({
    queryKey: ['job-details', jobId],
    queryFn: () => getJobDetails(jobId),
    enabled: Number.isFinite(jobId),
  });

  const applicationsQuery = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => listJobApplications(jobId),
    enabled: Number.isFinite(jobId),
  });

  const stageMutation = useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: number;
      payload: {
        toStage: ApplicationStage;
        decision?: 'accepted' | 'rejected';
        note?: string | null;
      };
    }) => updateApplicationStage(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-details', jobId] });
      queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
    },
  });

  if (!Number.isFinite(jobId)) {
    return <main className="p-6 text-sm text-red-600">Invalid job id.</main>;
  }

  if (jobQuery.isLoading || applicationsQuery.isLoading) {
    return <main className="p-6 text-sm text-slate-600">Loading pipeline board...</main>;
  }

  if (jobQuery.isError || !jobQuery.data || applicationsQuery.isError) {
    return <main className="p-6 text-sm text-red-600">Failed to load job applications.</main>;
  }

  const setDraft = (applicationId: number, next: Partial<DraftState>) => {
    setDrafts((prev) => {
      const current = prev[applicationId];
      const fallbackStage = getNextStageOptions(
        applicationsQuery.data?.find((item) => item.id === applicationId)?.stage ?? 'decision',
      )[0];
      const base: DraftState = current ?? {
        toStage: fallbackStage ?? 'decision',
        decision: '',
        note: '',
      };
      return { ...prev, [applicationId]: { ...base, ...next } };
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
      <TopNav />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline Board</h1>
          <p className="mt-1 text-sm text-slate-600">
            {jobQuery.data.job.title} | {jobQuery.data.job.department}
          </p>
        </div>
        <Link className="text-sm text-blue-600 underline" to={`/jobs/${jobId}`}>
          Back to Job
        </Link>
      </header>

      <section className="space-y-3">
        {applicationsQuery.data?.length ? (
          applicationsQuery.data.map((application) => {
            const options = getNextStageOptions(application.stage);
            const draft = drafts[application.id] ?? {
              toStage: options[0] ?? 'decision',
              decision: '',
              note: '',
            };
            const canTransition = options.length > 0;

            return (
              <article className="rounded-lg border bg-white p-4" key={application.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium">
                      {application.applicant.fullName ?? application.applicant.email}
                    </h2>
                    <p className="text-sm text-slate-600">{application.applicant.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs uppercase text-blue-700">
                      {stageLabel(application.stage)}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs uppercase text-slate-700">
                      {stageLabel(application.decision)}
                    </span>
                  </div>
                </div>

                {canTransition ? (
                  <form
                    className="mt-4 grid grid-cols-1 gap-3 rounded border p-3 md:grid-cols-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      stageMutation.mutate({
                        applicationId: application.id,
                        payload: {
                          toStage: draft.toStage,
                          decision:
                            draft.toStage === 'decision' ? draft.decision || undefined : undefined,
                          note: draft.note.trim() || undefined,
                        },
                      });
                    }}
                  >
                    <label className="text-sm md:col-span-1">
                      Next stage
                      <select
                        className="mt-1 w-full rounded border px-2 py-2"
                        onChange={(event) =>
                          setDraft(application.id, {
                            toStage: event.target.value as ApplicationStage,
                            decision: event.target.value === 'decision' ? draft.decision : '',
                          })
                        }
                        value={draft.toStage}
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {stageLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>

                    {draft.toStage === 'decision' ? (
                      <label className="text-sm md:col-span-1">
                        Decision
                        <select
                          className="mt-1 w-full rounded border px-2 py-2"
                          onChange={(event) =>
                            setDraft(application.id, {
                              decision: event.target.value as 'accepted' | 'rejected' | '',
                            })
                          }
                          value={draft.decision}
                        >
                          <option value="">Select</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </label>
                    ) : null}

                    <label className="text-sm md:col-span-2">
                      Note (optional)
                      <input
                        className="mt-1 w-full rounded border px-3 py-2"
                        onChange={(event) => setDraft(application.id, { note: event.target.value })}
                        placeholder="Feedback for this transition"
                        value={draft.note}
                      />
                    </label>

                    <div className="flex items-end md:col-span-1">
                      <button
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
                        disabled={stageMutation.isPending}
                        type="submit"
                      >
                        Advance
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Application is in terminal stage.</p>
                )}
              </article>
            );
          })
        ) : (
          <section className="rounded-lg border bg-white p-4 text-sm text-slate-600">
            No applications yet for this job.
          </section>
        )}
      </section>

      {stageMutation.isError ? (
        <p className="text-sm text-red-600">
          {(stageMutation.error as Error).message || 'Failed to update stage.'}
        </p>
      ) : null}
      {stageMutation.isSuccess ? <p className="text-sm text-green-700">Stage updated.</p> : null}
    </main>
  );
};
