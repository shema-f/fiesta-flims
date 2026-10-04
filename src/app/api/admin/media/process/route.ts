import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createMediaJob } from '@/lib/media/job-service';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const processSchema = z.object({
  movieId: z.string().min(1),
  inputPath: z.string().min(1),
  sourceAssetId: z.string().optional(),
  fingerprint: z.string().optional(),
  qualities: z.array(z.string()).optional(),
  providers: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/media/process
 *
 * Creates a MediaJob and returns immediately — the worker does the heavy
 * FFmpeg work (spec §9). Vercel never runs long-running transcodes.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = processSchema.parse(await request.json());
    const movie = await prisma.movie.findUnique({ where: { id: body.movieId } }).catch(() => null);
    if (!movie) return jsonError('Movie not found', 404);

    const job = await createMediaJob({
      movieId: body.movieId,
      jobType: 'TRANSCODE',
      sourceAssetId: body.sourceAssetId,
      fingerprint: body.fingerprint,
      actorId: guard.user.id,
      options: {
        inputPath: body.inputPath,
        qualities: body.qualities,
        providers: body.providers || [],
      },
    });

    // Reflect processing state so the UI never shows a movie as ready early.
    await prisma.movie
      .update({ where: { id: body.movieId }, data: { status: 'PROCESSING' } })
      .catch(() => {});

    return jsonOk(job, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to create media job', 500);
  }
}
