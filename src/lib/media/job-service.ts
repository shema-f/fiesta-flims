/**
 * MediaJob service (spec §10, §35, §36).
 *
 * The web app creates a job and returns immediately; the worker claims and
 * processes it asynchronously. All status changes and logs go through here.
 */

import { prisma } from '@/lib/prisma';
import type { MediaJob, MediaJobStatus, MediaJobType, JobLogLevel } from '@prisma/client';

export interface CreateJobInput {
  movieId: string;
  jobType: MediaJobType;
  sourceAssetId?: string;
  providerId?: string;
  fingerprint?: string;
  options?: Record<string, unknown>;
  actorId?: string;
}

export async function createMediaJob(input: CreateJobInput): Promise<MediaJob> {
  return prisma.mediaJob.create({
    data: {
      movieId: input.movieId,
      jobType: input.jobType,
      sourceAssetId: input.sourceAssetId,
      providerId: input.providerId,
      fingerprint: input.fingerprint,
      options: (input.options ?? undefined) as any,
      actorId: input.actorId,
      status: 'QUEUED',
    },
  });
}

export async function getJob(id: string): Promise<any> {
  return prisma.mediaJob.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { createdAt: 'asc' }, take: 200 },
      movie: { select: { id: true, title: true, slug: true, status: true } },
    },
  });
}

export interface ListJobsFilter {
  status?: MediaJobStatus;
  movieId?: string;
  jobType?: MediaJobType;
  limit?: number;
}

export async function listJobs(filter: ListJobsFilter = {}): Promise<any[]> {
  return prisma.mediaJob.findMany({
    where: {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.movieId ? { movieId: filter.movieId } : {}),
      ...(filter.jobType ? { jobType: filter.jobType } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: filter.limit ?? 50,
    include: { movie: { select: { id: true, title: true, slug: true } } },
  });
}

export async function updateJob(
  id: string,
  data: Partial<{ status: MediaJobStatus; progress: number; errorMessage: string | null; result: unknown }>
): Promise<any> {
  return prisma.mediaJob.update({ where: { id }, data: data as any });
}

export async function logJob(
  jobId: string,
  level: JobLogLevel,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.mediaJobLog.create({
    data: { jobId, level, message, metadata: (metadata ?? undefined) as any },
  });
}

/** Move a job into a new status, timestamping lifecycle boundaries. */
export async function transitionJob(
  id: string,
  status: MediaJobStatus,
  patch: { progress?: number; errorMessage?: string | null; result?: unknown } = {}
): Promise<any> {
  const data: any = { status, ...patch };
  if (status === 'PROCESSING' || status === 'TRANSCODING') data.startedAt = new Date();
  if (status === 'READY' || status === 'FAILED' || status === 'CANCELLED') {
    data.completedAt = new Date();
    if (status === 'READY') data.progress = 100;
  }
  return prisma.mediaJob.update({ where: { id }, data });
}

/**
 * Atomically claim the next queued job. Uses updateMany with a status guard so
 * two workers cannot process the same job.
 */
export async function claimNextQueuedJob(): Promise<any | null> {
  const candidate = await prisma.mediaJob.findFirst({
    where: { status: 'QUEUED' },
    orderBy: { createdAt: 'asc' },
  });
  if (!candidate) return null;

  const claimed = await prisma.mediaJob.updateMany({
    where: { id: candidate.id, status: 'QUEUED' },
    data: { status: 'PROCESSING', startedAt: new Date(), attempts: { increment: 1 } },
  });
  if (!claimed || claimed.count === 0) return null;

  return prisma.mediaJob.findUnique({ where: { id: candidate.id } });
}

export async function retryJob(id: string): Promise<any> {
  return transitionJob(id, 'QUEUED', { errorMessage: null });
}

export async function cancelJob(id: string): Promise<any> {
  return transitionJob(id, 'CANCELLED');
}

/** Reset jobs stuck in a non-terminal state (worker crash recovery). */
export async function recoverStuckJobs(staleAfterMs = 30 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - staleAfterMs);
  const result = await prisma.mediaJob.updateMany({
    where: {
      status: { in: ['PROCESSING', 'TRANSCODING', 'UPLOADING', 'VERIFYING'] },
      updatedAt: { lt: cutoff },
    },
    data: { status: 'QUEUED', errorMessage: 'Requeued after worker timeout' },
  });
  return result?.count ?? 0;
}
