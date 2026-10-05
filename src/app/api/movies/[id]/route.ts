import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMovieOrSeries } from '@/lib/movieData';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const movie = await prisma.movie.findFirst({
      where: { id, isActive: true },
      include: { uploader: { select: { id: true, name: true } } },
    });

    if (movie) {
      return NextResponse.json({ success: true, data: movie });
    }
  } catch {
    // database not reachable, fall through to seed lookup
  }

  // Fallback to rich seed/series catalog
  const staticItem = findMovieOrSeries(id);
  if (staticItem) {
    const isSeries = staticItem.contentType === 'series' || (staticItem.duration && staticItem.duration.includes('Eps'));
    const durationSeconds = isSeries
      ? 45 * 60
      : staticItem.duration
      ? (parseInt(staticItem.duration.split('h')[0] || '1', 10) * 3600) +
        (parseInt((staticItem.duration.split('h')[1] || '').replace('m', '') || '30', 10) * 60)
      : 7200;

    const formattedItem = {
      id: String(staticItem.id),
      slug: staticItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: staticItem.title,
      description: staticItem.description || null,
      synopsis: staticItem.description || null,
      releaseYear: staticItem.year,
      duration: durationSeconds,
      rating: staticItem.rating,
      ratingCount: 1420,
      viewCount: 38400,
      views: 38400,
      downloadCount: 9200,
      narrator: staticItem.narrator || 'Rocky Kimomo',
      genre: staticItem.genre,
      fileUrl: staticItem.directStreamUrl || null,
      thumbnailUrl: staticItem.image,
      poster: staticItem.image,
      backdrop: staticItem.backdrop || staticItem.image,
      isFeatured: Boolean(staticItem.trending),
      contentType: isSeries ? 'series' : 'movie',
      type: isSeries ? 'Series' : 'Movie',
      seasonsCount: staticItem.seasonsCount || (isSeries ? 1 : undefined),
      episodesCount: staticItem.episodesCount || (staticItem.episodes ? staticItem.episodes.length : (isSeries ? 8 : undefined)),
      episodes: staticItem.episodes || null,
      telegramChannelPost: staticItem.telegramChannelPost,
      telegramBotLink: staticItem.telegramBotLink,
      uploader: { id: 'admin', name: 'FiestaFlix Studio' },
    };

    return NextResponse.json({ success: true, data: formattedItem });
  }

  return NextResponse.json(
    { success: false, error: 'Movie or Series not found' },
    { status: 404 }
  );
}
