import {
  employmentTypeSchema,
  jobStatusSchema,
  type CreateJobRequest,
  type EmploymentType,
  type JobStatus,
} from '@caw-hackathon/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createJob, getJobDetails, updateJob } from '@/lib/jobs-api';

const employmentOptions = employmentTypeSchema.options;
const statusOptions = jobStatusSchema.options;

type FormState = {
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  status: JobStatus;
  hiringManagerUserId: string;
};

const defaultState: FormState = {
  title: '',
  description: '',
  department: '',
  location: '',
  employmentType: 'full_time',
  status: 'draft',
  hiringManagerUserId: '',
};

export const JobFormPage = () => {
  const params = useParams<{ id?: string }>();
  const jobId = params.id ? Number(params.id) : null;
  const isEditMode = Number.isFinite(jobId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<FormState | null>(null);

  const jobDetailsQuery = useQuery({
    enabled: Boolean(isEditMode && jobId),
    queryKey: ['job-details', jobId],
    queryFn: async () => getJobDetails(jobId as number),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const serverState: FormState | null = jobDetailsQuery.data
    ? {
        title: jobDetailsQuery.data.job.title,
        description: jobDetailsQuery.data.job.description,
        department: jobDetailsQuery.data.job.department,
        location: jobDetailsQuery.data.job.location ?? '',
        employmentType: jobDetailsQuery.data.job.employmentType,
        status: jobDetailsQuery.data.job.status,
        hiringManagerUserId: jobDetailsQuery.data.job.hiringManagerUserId,
      }
    : null;

  const formState = draftState ?? serverState ?? defaultState;

  const createMutation = useMutation({
    mutationFn: (payload: CreateJobRequest) => createJob(payload),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate(`/jobs/${job.id}`);
    },
    onError: () => setError('Failed to create job. Check manager user ID and try again.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateJobRequest>) => updateJob(jobId as number, payload),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-details', job.id] });
      navigate(`/jobs/${job.id}`);
    },
    onError: () => setError('Failed to update job.'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = isEditMode ? 'Edit Job' : 'Create Job';

  const payload = useMemo<CreateJobRequest>(
    () => ({
      title: formState.title.trim(),
      description: formState.description.trim(),
      department: formState.department.trim(),
      location: formState.location.trim() ? formState.location.trim() : null,
      employmentType: formState.employmentType,
      status: formState.status,
      hiringManagerUserId: formState.hiringManagerUserId.trim(),
    }),
    [
      formState.description,
      formState.department,
      formState.employmentType,
      formState.hiringManagerUserId,
      formState.location,
      formState.status,
      formState.title,
    ],
  );

  const patchField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setDraftState((prev) => ({
      ...(prev ?? formState),
      [key]: value,
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isEditMode) {
      await updateMutation.mutateAsync(payload);
      return;
    }
    await createMutation.mutateAsync(payload);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Link className="text-sm text-blue-600 underline" to="/hr/jobs">
          Back to Jobs
        </Link>
      </header>

      <form className="space-y-4 rounded-lg border bg-white p-4" onSubmit={submit}>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(event) => patchField('title', event.target.value)}
            required
            value={formState.title}
          />
        </label>

        <label className="block text-sm">
          Description
          <textarea
            className="mt-1 min-h-28 w-full rounded border px-3 py-2"
            onChange={(event) => patchField('description', event.target.value)}
            required
            value={formState.description}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Department
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              onChange={(event) => patchField('department', event.target.value)}
              required
              value={formState.department}
            />
          </label>

          <label className="block text-sm">
            Location
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              onChange={(event) => patchField('location', event.target.value)}
              value={formState.location}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            Employment Type
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              onChange={(event) =>
                patchField('employmentType', event.target.value as EmploymentType)
              }
              value={formState.employmentType}
            >
              {employmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Status
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              onChange={(event) => patchField('status', event.target.value as JobStatus)}
              value={formState.status}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Hiring Manager User ID
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              onChange={(event) => patchField('hiringManagerUserId', event.target.value)}
              placeholder="user_xxx or seed_manager_1"
              required
              value={formState.hiringManagerUserId}
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Saving...' : isEditMode ? 'Update Job' : 'Create Job'}
        </button>
      </form>
    </main>
  );
};
