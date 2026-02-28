import {
  applicationSchema,
  applyToJobRequestSchema,
  jobApplicationsResponseSchema,
  createJobRequestSchema,
  hrDashboardSchema,
  jobDetailsSchema,
  jobListQuerySchema,
  jobListResponseSchema,
  jobSchema,
  myApplicationsResponseSchema,
  updateApplicationStageRequestSchema,
  updateApplicationStageResponseSchema,
  updateJobRequestSchema,
  type Application,
  type ApplicationListItem,
  type ApplicationStage,
  type CreateJobRequest,
  type HrDashboard,
  type Job,
  type JobDetails,
  type JobListQuery,
  type MyApplication,
  type UpdateApplicationStageResponse,
} from '@caw-hackathon/shared';
import { apiFetch } from './api';

const toSearchParams = (query: JobListQuery): string => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.department) params.set('department', query.department);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
};

const extractApiErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(', ');
    }
    if (payload.message) {
      return payload.message;
    }
  } catch {
    // no-op: keep fallback for non-json responses
  }
  return fallback;
};

export const listJobs = async (query: JobListQuery): Promise<Job[]> => {
  const parsed = jobListQuerySchema.parse(query);
  const response = await apiFetch(`/api/jobs${toSearchParams(parsed)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }

  const payload = jobListResponseSchema.parse(await response.json());
  return payload.jobs;
};

export const getJobDetails = async (id: number): Promise<JobDetails> => {
  const response = await apiFetch(`/api/jobs/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job details');
  }
  return jobDetailsSchema.parse(await response.json());
};

export const createJob = async (payload: CreateJobRequest): Promise<Job> => {
  const body = createJobRequestSchema.parse(payload);
  const response = await apiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to create job');
  }

  return jobSchema.parse(await response.json());
};

export const updateJob = async (id: number, payload: Partial<CreateJobRequest>): Promise<Job> => {
  const body = updateJobRequestSchema.parse(payload);
  const response = await apiFetch(`/api/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to update job');
  }

  return jobSchema.parse(await response.json());
};

export const deleteJob = async (id: number): Promise<void> => {
  const response = await apiFetch(`/api/jobs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
};

export const getHrDashboard = async (): Promise<HrDashboard> => {
  const response = await apiFetch('/api/hr/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch HR dashboard');
  }
  return hrDashboardSchema.parse(await response.json());
};

export const applyToJob = async (
  id: number,
  payload: { resumeUrl?: string | null; coverLetter?: string | null } = {},
): Promise<Application> => {
  const body = applyToJobRequestSchema.parse(payload);
  const response = await apiFetch(`/api/jobs/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Failed to apply to job'));
  }

  return applicationSchema.parse(await response.json());
};

export const listMyApplications = async (): Promise<MyApplication[]> => {
  const response = await apiFetch('/api/applications/me');
  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Failed to fetch my applications'));
  }
  return myApplicationsResponseSchema.parse(await response.json()).applications;
};

export const listJobApplications = async (jobId: number): Promise<ApplicationListItem[]> => {
  const response = await apiFetch(`/api/jobs/${jobId}/applications`);
  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Failed to fetch job applications'));
  }
  return jobApplicationsResponseSchema.parse(await response.json()).applications;
};

export const updateApplicationStage = async (
  applicationId: number,
  payload: {
    toStage: ApplicationStage;
    decision?: 'accepted' | 'rejected';
    note?: string | null;
  },
): Promise<UpdateApplicationStageResponse> => {
  const normalizedPayload = {
    ...payload,
    decision: payload.decision ?? undefined,
  };

  const body = updateApplicationStageRequestSchema.parse(normalizedPayload);
  const response = await apiFetch(`/api/applications/${applicationId}/stage`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Failed to update application stage'));
  }

  return updateApplicationStageResponseSchema.parse(await response.json());
};

export const getNextStageOptions = (currentStage: ApplicationStage): ApplicationStage[] => {
  const transitionMap: Record<ApplicationStage, ApplicationStage[]> = {
    applied: ['screening'],
    screening: ['interview', 'decision'],
    interview: ['decision'],
    decision: [],
  };
  return transitionMap[currentStage];
};
