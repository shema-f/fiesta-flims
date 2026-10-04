import { NextRequest } from 'next/server';
import { storageManager } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/movies/:id/qualities
 *
 * Returns the real qualities that exist for this movie, with their providers
 * and true sizes. Never fabricates a quality or file size (spec §14/§49).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [qualities, movie] = await Promise.all([
    storageManager.getQualities(id).catch(() => []),
    prisma.movie.findUnique({ where: { id } }).catch(() => null),
  ]);

  if (!movie && qualities.length === 0) {
    return jsonError('Movie not found', 404);
  }

  // Fall back to legacy resolutions JSON when storage isn't migrated yet.
  if (qualities.length === 0 && movie?.resolutions && typeof movie.resolutions === 'object') {
    const legacy = Object.entries(movie.resolutions as Record<string, unknown>)
      .filter(([, url]) => typeof url === 'string')
      .map(([label]) => ({ label, providers: ['legacy'], purposes: ['STREAMING'] as const, sizeBytes: undefined }));
    return jsonOk({ movieId: id, qualities: legacy, legacy: true });
  }

  return jsonOk({ movieId: id, qualities, legacy: false });
}
