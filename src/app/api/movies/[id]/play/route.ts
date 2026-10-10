import { NextRequest } from 'next/server';
import { storageManager } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { jsonOk, jsonError, getClientIp, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';
import { resolveDirectUrl, isMediaFireLandingPage, isUnplayableUrl } from '@/lib/media/directLink';

export const dynamic = 'force-dynamic';

/**
 * GET /api/movies/:id/play?quality=1080p
 *
 * Returns a short-lived media URL for the best available streaming source.
 * The client never learns which provider satisfied the request.
 * Vercel never proxies the video bytes (spec §22).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quality = request.nextUrl.searchParams.get('quality') || undefined;

  const limit = checkRateLimit(`play:${getClientIp(request)}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  const resolved = await storageManager.getStreamingSource({ movieId: id, quality });
  if (!resolved) {
    return jsonError('No streaming source available for this movie', 404);
  }

  // The catalogue stores MediaFire landing pages (HTML). Unwrap them to the
  // real binary before handing a URL to the <video> element — otherwise the
  // player receives an HTML document and never starts.
  let url = resolved.source.url;
  if (isMediaFireLandingPage(url)) {
    const direct = await resolveDirectUrl(url);
    if (direct === url) {
      return jsonError('Could not resolve a playable stream for this title', 502, {
        retryable: true,
      });
    }
    url = direct;
  }

  if (isUnplayableUrl(url)) {
    return jsonError('This source cannot be streamed directly — use the download options', 415);
  }

  // Best-effort view analytics (spec §28) — never block playback on this.
  void recordView(id, quality, request).catch(() => {});

  return jsonOk({
    url,
    quality: resolved.quality ?? quality ?? 'auto',
    isHls: resolved.source.isHls,
    provider: resolved.providerSlug,
    expiresAt: resolved.source.expiresAt?.toISOString(),
    availableQualities: resolved.availableQualities,
    legacy: resolved.legacy,
  });
}

async function recordView(movieId: string, quality: string | undefined, request: NextRequest) {
  const user = await getCurrentUser().catch(() => null);
  await prisma.viewEvent.create({
    data: {
      movieId,
      userId: user?.id,
      quality,
      provider: 'resolved',
      device: request.headers.get('user-agent')?.slice(0, 120),
    } as any,
  });
}
