import { prisma } from '@/lib/prisma';
import { retryJob } from '@/lib/media/job-service';
import { jsonOk, jsonError, requireAdmin, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** POST /api/admin/media/:id/retry — requeue a failed job (spec §7/admin). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`media-retry:${guard.user.id}`, 30, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  const { id } = await params;
  const existing = await prisma.mediaJob.findUnique({ where: { id } }).catch(() => null);
  if (!existing) return jsonError('Job not found', 404);
  if (!['FAILED', 'CANCELLED'].includes(existing.status)) {
    return jsonError(`Job is ${existing.status}; only FAILED or CANCELLED jobs can be retried`, 409);
  }

  const job = await retryJob(id);
  return jsonOk(job);
}
