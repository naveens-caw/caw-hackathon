import {
  createJobRequestSchema,
  hrDashboardSchema,
  jobDetailsSchema,
  jobListQuerySchema,
  jobListResponseSchema,
  jobSchema,
  updateJobRequestSchema,
  type CreateJobRequest,
  type HrDashboard,
  type Job,
  type JobDetails,
  type JobListQuery,
} from '@caw-hackathon/shared';
import { apiFetch } from './api';

const toSearchParams = (query: JobListQuery): string => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.department) params.set('department', query.department);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
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
