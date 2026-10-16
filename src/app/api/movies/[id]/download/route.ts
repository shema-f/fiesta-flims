import { NextRequest } from 'next/server';
import { z } from 'zod';
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
  // Optional visitor session id (?sid=) keeps guest downloads attributable.
  const sidParam = request.nextUrl.searchParams.get('sid');
  const sessionId = sidParam && /^[A-Za-z0-9_-]{8,64}$/.test(sidParam) ? sidParam : undefined;

  const limit = await checkRateLimit(`download:${getClientIp(request)}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  // Resolve slug → canonical id for storage lookup and the Download FK.
  let movieId = id;
  const movie = await prisma.movie
    .findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } })
    .catch(() => null);
  if (movie) movieId = movie.id;

  const resolved = await storageManager.getDownloadSource({
    movieId,
    quality: requestedQuality,
  });

  if (!resolved) {
    return jsonError('No download source available for this movie', 404);
  }

  void recordDownload(movieId, resolved.quality ?? requestedQuality, resolved.providerSlug, request, sessionId).catch(() => {});

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

const trackSchema = z.object({
  quality: z.string().max(40).optional(),
  source: z.string().max(40).optional(),
  // Browser session id (SessionTracker) — keeps guest downloads attributable
  // in the admin behavior report even without an account.
  sessionId: z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/).optional(),
});

/**
 * POST /api/movies/:id/download
 *
 * Download-start beacon. The UI downloads files by pointing an <a> at the
 * storage URL directly (no round-trip through this API), so without this
 * endpoint the `Download` table — and therefore every download metric in the
 * admin behavior report — stayed permanently empty. Records the event only;
 * it never hands back a URL, so it cannot be abused to resolve content.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const limit = await checkRateLimit(`download-track:${getClientIp(request)}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json().catch(() => ({}));
    const data = trackSchema.parse(body ?? {});
    // Resolve slug → canonical id (Download.movieId is a foreign key).
    const movie = await prisma.movie
      .findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } })
      .catch(() => null);
    if (!movie) return jsonOk({ recorded: false, skipped: true });
    await recordDownload(movie.id, data.quality, data.source || 'direct', request, data.sessionId);
    return jsonOk({ recorded: true });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to record download', 500);
  }
}

async function recordDownload(
  movieId: string,
  quality: string | undefined,
  providerSlug: string,
  request: NextRequest,
  sessionId?: string
) {
  const user = await getCurrentUser().catch(() => null);
  await prisma.download.create({
    data: {
      movieId,
      userId: user?.id,
      sessionId,
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
