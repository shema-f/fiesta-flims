import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getProvider, storageManager } from '@/lib/storage';
import { getJob, logJob, transitionJob } from '@/lib/media/job-service';
import { jsonOk, jsonError, requireAdmin, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const completeSchema = z.object({
  jobId: z.string().min(1),
  /** Which presigned target the file was PUT to. Defaults to the job's first. */
  provider: z.string().min(1).optional(),
});

/**
 * POST /api/admin/media/upload/complete
 *
 * Called by the admin browser AFTER it has PUT the video straight to R2/S3
 * using the presigned URL from `/api/admin/media/upload`. The API never sees
 * the bytes; instead it verifies the object really exists in storage (HEAD via
 * the provider), records a VideoAsset + StorageObject row, and closes the
 * UPLOAD job. A browser that claims success without uploading gets a 409 —
 * nothing is marked ready on trust.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`media-upload-complete:${guard.user.id}`, 30, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  let parsed;
  try {
    parsed = completeSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Invalid completion request', 400);
  }

  const job = await getJob(parsed.jobId);
  if (!job) return jsonError('Upload job not found', 404);
  if (job.jobType !== 'UPLOAD') return jsonError('Job is not an upload job', 409);
  if (job.status === 'READY') {
    // Idempotent: a retried completion call returns the stored result.
    return jsonOk({ jobId: job.id, status: job.status, result: job.result });
  }
  if (!['QUEUED', 'UPLOADING', 'VERIFYING'].includes(job.status)) {
    return jsonError(`Upload job is ${job.status}; only QUEUED/UPLOADING/VERIFYING jobs can complete`, 409);
  }

  const options = (job.options || {}) as Record<string, any>;
  const providerSlug: string | undefined = parsed.provider || options.providers?.[0];
  const key: string | undefined =
    (Array.isArray(options.keys) ? options.keys.find((k: string) => k.includes(providerSlug || '')) : undefined) ||
    options.keys?.[0];
  if (!providerSlug || !key) {
    return jsonError('Upload job has no recorded storage target', 409);
  }

  const provider = getProvider(providerSlug);
  if (!provider?.isConfigured()) {
    return jsonError(`Provider ${providerSlug} is not configured`, 503);
  }

  await transitionJob(job.id, 'VERIFYING', { progress: 90 }).catch(() => {});
  await logJob(job.id, 'INFO', `Verifying upload ${key} on ${providerSlug}`).catch(() => {});

  // Trust nothing from the browser (spec §40): confirm the object with a HEAD.
  const meta = await provider.getMetadata(key).catch(() => null);
  if (!meta?.exists) {
    await transitionJob(job.id, 'FAILED', {
      errorMessage: `Object ${key} not found in ${providerSlug} — the direct upload did not complete`,
    }).catch(() => {});
    await logJob(job.id, 'ERROR', `Verification failed: ${key} missing in ${providerSlug}`).catch(() => {});
    return jsonError(
      `The upload was not found in ${providerSlug}. PUT the file to the presigned URL before calling complete.`,
      409
    );
  }

  try {
    // One VideoAsset per upload job (fingerprint filled by the transcode worker).
    const videoAsset = await prisma.videoAsset.create({
      data: {
        movieId: job.movieId,
        status: 'PROCESSING',
        sourceUrl: key,
        sizeBytes: meta.sizeBytes ? BigInt(meta.sizeBytes) : undefined,
      },
    });

    // Upsert by (provider, key) so a retried completion cannot duplicate rows.
    const providerRow = await prisma.storageProvider.findUnique({ where: { slug: providerSlug } });
    let storageObject = providerRow
      ? await prisma.storageObject.findFirst({
          where: { providerId: providerRow.id, externalObjectId: key, status: { not: 'DELETED' } },
        })
      : null;

    if (storageObject) {
      storageObject = await prisma.storageObject.update({
        where: { id: storageObject.id },
        data: {
          videoAssetId: videoAsset.id,
          sizeBytes: meta.sizeBytes ? BigInt(meta.sizeBytes) : undefined,
          status: 'ACTIVE',
        },
      });
    } else if (providerRow) {
      storageObject = await prisma.storageObject.create({
        data: {
          providerId: providerRow.id,
          videoAssetId: videoAsset.id,
          externalObjectId: key,
          path: key,
          filename: options.filename || key.split('/').pop(),
          mimeType: options.contentType || meta.mimeType || 'video/mp4',
          sizeBytes: meta.sizeBytes ? BigInt(meta.sizeBytes) : undefined,
          status: 'ACTIVE',
          purpose: 'DOWNLOAD',
        },
      });
    }

    await prisma.mediaJob.update({
      where: { id: job.id },
      data: {
        sourceAssetId: videoAsset.id,
        result: {
          videoAssetId: videoAsset.id,
          storageObjectId: storageObject?.id ?? null,
          provider: providerSlug,
          key,
          sizeBytes: meta.sizeBytes ?? null,
        } as any,
      },
    });
    await transitionJob(job.id, 'READY', { progress: 100 }).catch(() => {});
    await logJob(job.id, 'INFO', `Upload verified: ${key} (${meta.sizeBytes ?? '?'} bytes)`).catch(() => {});

    // Movie stays PROCESSING until the transcode worker flips it to READY —
    // an uploaded source is not yet a playable catalogue entry.
    await prisma.movie
      .update({ where: { id: job.movieId }, data: { status: 'PROCESSING' } })
      .catch(() => {});

    return jsonOk({
      jobId: job.id,
      status: 'READY',
      videoAssetId: videoAsset.id,
      storageObjectId: storageObject?.id ?? null,
      provider: providerSlug,
      key,
      sizeBytes: meta.sizeBytes ?? null,
      next: 'POST /api/admin/media/process with this key as inputPath to transcode to HLS',
    });
  } catch (err: any) {
    console.error('[upload/complete] persist failed:', err);
    await logJob(job.id, 'ERROR', `Could not record upload: ${err?.message || err}`).catch(() => {});
    return jsonError('Upload verified but could not be recorded in the database', 500);
  }
}
