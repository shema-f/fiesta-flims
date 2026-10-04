import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { jsonOk, jsonError, checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const viewSchema = z.object({
  quality: z.string().optional(),
  provider: z.string().optional(),
  sessionId: z.string().optional(),
  watchedSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  startupTimeMs: z.number().int().min(0).max(600_000).optional(),
  bufferEvents: z.number().int().min(0).max(10_000).optional(),
});

/**
 * POST /api/movies/:id/view
 * Buffering/startup/completion analytics (spec §28/§29). Aggregated, not per segment.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const limit = checkRateLimit(`view:${getClientIp(request)}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    const data = viewSchema.parse(body);
    const user = await getCurrentUser().catch(() => null);

    const event = await prisma.viewEvent.create({
      data: {
        movieId: id,
        userId: user?.id,
        sessionId: data.sessionId,
        quality: data.quality,
        provider: data.provider,
        device: request.headers.get('user-agent')?.slice(0, 120),
        watchedSeconds: data.watchedSeconds ?? 0,
        completed: data.completed ?? false,
        startupTimeMs: data.startupTimeMs,
        bufferEvents: data.bufferEvents,
      } as any,
    });

    // Bump the denormalised view counter once per view event.
    await prisma.movie
      .update({ where: { id }, data: { viewCount: { increment: 1 }, views: { increment: 1 } } })
      .catch(() => {});

    return jsonOk({ id: event?.id ?? null });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to record view', 500);
  }
}
