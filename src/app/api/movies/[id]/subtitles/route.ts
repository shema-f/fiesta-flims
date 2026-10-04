import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

interface SubtitleDto {
  id: string;
  language: string;
  label: string;
  url: string;
  isDefault: boolean;
}

/**
 * GET /api/movies/:id/subtitles
 * Returns sidecar subtitle tracks across all video assets of the movie.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let subtitles: SubtitleDto[] = [];
  try {
    const assets = await prisma.videoAsset.findMany({
      where: { movieId: id },
      include: { subtitles: true },
    });
    subtitles = (assets || []).flatMap((asset: any) =>
      (asset.subtitles || []).map((s: any) => ({
        id: s.id,
        language: s.language,
        label: s.label,
        url: s.url,
        isDefault: Boolean(s.isDefault),
      }))
    );
  } catch {
    subtitles = [];
  }

  return jsonOk({ movieId: id, subtitles });
}
