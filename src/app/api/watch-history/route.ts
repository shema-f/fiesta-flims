import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError, requireUser, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** GET /api/watch-history — the signed-in user's "continue watching" list. */
export async function GET() {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const history = await prisma.watchHistory.findMany({
    where: { userId: guard.user.id, completed: false },
    orderBy: { lastWatchedAt: 'desc' },
    take: 20,
    include: {
      movie: {
        select: {
          id: true,
          slug: true,
          title: true,
          poster: true,
          thumbnailUrl: true,
          duration: true,
        },
      },
    },
  });

  return jsonOk(history);
}

const progressSchema = z.object({
  movieId: z.string().min(1),
  positionSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

/**
 * POST /api/watch-history
 *
 * Called periodically by the player (every ~10–30s) and on pause/unload, NOT on
 * every second of playback (spec §27).
 */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const limit = checkRateLimit(`watch-history:${guard.user.id}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    const data = progressSchema.parse(body);

    const record = await prisma.watchHistory.upsert({
      where: { movieId_userId: { movieId: data.movieId, userId: guard.user.id } },
      create: {
        movieId: data.movieId,
        userId: guard.user.id,
        positionSeconds: data.positionSeconds,
        durationSeconds: data.durationSeconds ?? 0,
        completed: data.completed ?? false,
      },
      update: {
        positionSeconds: data.positionSeconds,
        durationSeconds: data.durationSeconds ?? undefined,
        completed: data.completed ?? undefined,
        lastWatchedAt: new Date(),
      },
    });

    return jsonOk(record);
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to save progress', 500);
  }
}
