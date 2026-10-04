import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createMediaJob } from '@/lib/media/job-service';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const replicateSchema = z.object({
  videoAssetId: z.string().min(1),
  providers: z.array(z.string()).min(1),
});

/**
 * POST /api/admin/media/:id/replicate
 * Enqueues a REPLICATE job so the worker copies an existing asset's objects to
 * the chosen providers (spec §19). Each copy becomes its own StorageObject row.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id: movieId } = await params;

  try {
    const body = replicateSchema.parse(await request.json());
    const asset = await prisma.videoAsset.findUnique({ where: { id: body.videoAssetId } }).catch(() => null);
    if (!asset || asset.movieId !== movieId) return jsonError('Video asset not found for this movie', 404);

    const job = await createMediaJob({
      movieId,
      jobType: 'REPLICATE',
      sourceAssetId: body.videoAssetId,
      actorId: guard.user.id,
      options: { videoAssetId: body.videoAssetId, providers: body.providers },
    });
    return jsonOk(job, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to create replication job', 500);
  }
}
