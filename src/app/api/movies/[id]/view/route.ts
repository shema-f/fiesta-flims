import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  jsonOk,
  jsonError,
  checkRateLimit,
  rateLimitResponse,
  getClientIp,
  deviceLabel,
} from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const viewSchema = z.object({
  quality: z.string().max(40).optional(),
  provider: z.string().max(40).optional(),
  sessionId: z.string().max(80).optional(),
  watchedSeconds: z.number().int().min(0).max(86_400).optional(),
  completed: z.boolean().optional(),
  startupTimeMs: z.number().int().min(0).max(600_000).optional(),
  bufferEvents: z.number().int().min(0).max(10_000).optional(),
});

/**
 * POST /api/movies/:id/view
 *
 * Buffering/startup/completion analytics (spec §28/§29). Aggregated, not per
 * segment. The client sends one event when playback starts and then periodic
 * progress updates carrying the same `sessionId`; the update merges into the
 * original row so one play session is exactly one ViewEvent with real
 * watchedSeconds/completion — that is what the admin behavior report reads.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const limit = await checkRateLimit(`view:${getClientIp(request)}`, 240, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    const data = viewSchema.parse(body);
    const user = await getCurrentUser().catch(() => null);
    const device = deviceLabel(request.headers.get('user-agent'));

    // Pages can be opened by slug; ViewEvent.movieId is a foreign key to
    // Movie.id, so resolve the canonical id before writing anything.
    const movie = await prisma.movie
      .findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } })
      .catch(() => null);
    const movieId = movie?.id;
    if (!movieId) {
      // Not in the catalogue (seed-only dev title) — nothing to attribute to.
      return jsonOk({ id: null, skipped: true });
    }

    // Merge progress into the row created at playback start (same session).
    if (data.sessionId) {
      const existing = await prisma.viewEvent
        .findFirst({ where: { movieId, sessionId: data.sessionId } })
        .catch(() => null);

      if (existing) {
        const updated = await prisma.viewEvent.update({
          where: { id: existing.id },
          data: {
            // Never let a late/out-of-order packet shrink progress.
            watchedSeconds: Math.max(existing.watchedSeconds, data.watchedSeconds ?? 0),
            completed: existing.completed || data.completed || false,
            quality: data.quality ?? existing.quality,
            startupTimeMs: data.startupTimeMs ?? existing.startupTimeMs,
            bufferEvents: data.bufferEvents ?? existing.bufferEvents,
          },
        });
        return jsonOk({ id: updated.id, merged: true });
      }
    }

    const event = await prisma.viewEvent.create({
      data: {
        movieId,
        userId: user?.id,
        sessionId: data.sessionId,
        quality: data.quality,
        provider: data.provider,
        device,
        watchedSeconds: data.watchedSeconds ?? 0,
        completed: data.completed ?? false,
        startupTimeMs: data.startupTimeMs,
        bufferEvents: data.bufferEvents,
      } as any,
    });

    // Bump the denormalised view counter once per view event.
    await prisma.movie
      .update({ where: { id: movieId }, data: { viewCount: { increment: 1 }, views: { increment: 1 } } })
      .catch(() => {});

    return jsonOk({ id: event?.id ?? null });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to record view', 500);
  }
}
