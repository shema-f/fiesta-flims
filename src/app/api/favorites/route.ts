import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  jsonOk,
  jsonError,
  requireUser,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/favorites — the signed-in user's favorites (movie ids).
 */
export async function GET() {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const favorites = await prisma.favorite.findMany({
    where: { userId: guard.user.id },
    orderBy: { createdAt: 'desc' },
    select: { movieId: true, createdAt: true },
  });

  return jsonOk(favorites);
}

const toggleSchema = z.object({
  movieId: z.string().min(1),
  action: z.enum(['add', 'remove']),
});

/**
 * POST /api/favorites { movieId, action }
 *
 * Server-side favorite persistence. The UI keeps a localStorage copy for
 * instant/offline UX; this endpoint is what the admin behavior report reads
 * (favorites are otherwise invisible to first-party analytics). Anonymous
 * users get 401 — the client treats that as a no-op.
 */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`favorites:${guard.user.id}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    const { movieId, action } = toggleSchema.parse(body);

    if (action === 'remove') {
      await prisma.favorite
        .deleteMany({ where: { movieId, userId: guard.user.id } })
        .catch(() => {});
      return jsonOk({ favorited: false });
    }

    // Only catalogue rows can be favorited server-side (FK to Movie).
    const movie = await prisma.movie.findFirst({
      where: { OR: [{ id: movieId }, { slug: movieId }] },
      select: { id: true },
    });
    if (!movie) {
      return jsonError('Movie not found', 404);
    }

    await prisma.favorite.upsert({
      where: { movieId_userId: { movieId: movie.id, userId: guard.user.id } },
      create: { movieId: movie.id, userId: guard.user.id },
      update: {},
    });

    return jsonOk({ favorited: true });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to update favorite', 500);
  }
}
