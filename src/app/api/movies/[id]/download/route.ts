import { NextRequest } from 'next/server';
import { storageManager } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  jsonOk,
  jsonError,
  getClientIp,
  hashIp,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/movies/:id/download?quality=1080p
 *
 * 1. Checks whether the quality exists (never fakes a quality — spec §49).
 * 2. Selects the best download source.
 * 3. Returns a short-lived URL (signed where supported).
 * 4. Records the download event.
 * 5. Does NOT proxy the file through Vercel.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestedQuality = request.nextUrl.searchParams.get('quality') || undefined;

  const limit = checkRateLimit(`download:${getClientIp(request)}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  const resolved = await storageManager.getDownloadSource({
    movieId: id,
    quality: requestedQuality,
  });

  if (!resolved) {
    return jsonError('No download source available for this movie', 404);
  }

  void recordDownload(id, resolved.quality ?? requestedQuality, resolved.providerSlug, request).catch(() => {});

  return jsonOk({
    url: resolved.source.url,
    quality: resolved.quality ?? requestedQuality ?? 'default',
    requestedQuality: requestedQuality ?? null,
    substituted: Boolean(requestedQuality && resolved.quality && resolved.quality !== requestedQuality),
    provider: resolved.providerSlug,
    expiresAt: resolved.source.expiresAt?.toISOString(),
    supportsRange: resolved.source.supportsRange,
    availableQualities: resolved.availableQualities,
    legacy: resolved.legacy,
    sizeBytes: resolved.storageObjectId ? await getSize(resolved.storageObjectId) : null,
  });
}

async function getSize(storageObjectId: string): Promise<number | null> {
  const object = await prisma.storageObject
    .findUnique({ where: { id: storageObjectId } })
    .catch(() => null);
  if (!object?.sizeBytes) return null;
  return Number(object.sizeBytes);
}

async function recordDownload(
  movieId: string,
  quality: string | undefined,
  providerSlug: string,
  request: NextRequest
) {
  const user = await getCurrentUser().catch(() => null);
  await prisma.download.create({
    data: {
      movieId,
      userId: user?.id,
      quality,
      providerId: providerSlug,
      status: 'STARTED',
      ipHash: hashIp(getClientIp(request)),
    } as any,
  });
  // Increment denormalised counters without a read-modify-write race.
  await prisma.movie
    .update({ where: { id: movieId }, data: { downloadCount: { increment: 1 } } })
    .catch(() => {});
}
