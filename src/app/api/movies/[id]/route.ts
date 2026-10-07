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
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: { uploader: { select: { id: true, name: true } } },
    });

    if (movie) {
      const resObj = movie.resolutions && typeof movie.resolutions === 'object' ? (movie.resolutions as any) : null;
      const episodes = Array.isArray(resObj?.episodes) ? resObj.episodes : null;
      const isSeries = Boolean(
        (episodes && episodes.length > 1) ||
        movie.description?.toLowerCase().includes('season') ||
        movie.title?.toLowerCase().includes('season') ||
        movie.title?.toLowerCase().includes('series')
      );
      const isBroken = (url?: string | null) =>
        !url ||
        url.includes('rebelRidgePoster500') ||
        url.includes('polygamist2026Poster500') ||
        url.includes('myCountryNewAgePoster500') ||
        url.includes('vikingsValhallaS3Poster500') ||
        url.includes('fcXdJUSDiDiFupuDuNxBYvdEsTX') ||
        url.includes('MV5BMjA5OTc3NjExNV5BMl5BanBnXkFtZTgwNTcyNDc5MDI') ||
        url.includes('MV5BMzBhNmZiYmQtNGY1Ny00OWVmLTk3NDgtMWZkZmEzNjFmY2YxXkEyXkFqcGc') ||
        url.includes('MV5BNDExMjg0MWYtZTdmNy00MmQzLTk0NmEtY2Y0YmExMWI4YTVmXkEyXkFqcGc') ||
        url.includes('MV5BN2E1ZWI4YzEtMGEwNi00YmY0LThlMjEtMTM3N2NkZTk5Y2FkXkEyXkFqcGc') ||
        url.includes('MV5BMTQ4NTcyODc5MF5BMl5BanBnXkFtZTcwMjU2NzM2Nw');

      const safePoster = isBroken(movie.poster)
        ? (isBroken(movie.thumbnailUrl) ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop' : movie.thumbnailUrl!)
        : movie.poster!;

      const safeBackdrop = isBroken(movie.backdrop) ? safePoster : movie.backdrop!;

      return NextResponse.json({
        success: true,
        data: {
          ...movie,
          image: safePoster,
          poster: safePoster,
          thumbnailUrl: safePoster,
          backdrop: safeBackdrop,
          trailer: movie.trailer || null,
          trailerUrl: movie.trailer || null,
          year: movie.releaseYear || (movie.createdAt ? new Date(movie.createdAt).getFullYear() : 2024),
          contentType: isSeries ? 'series' : 'movie',
          type: isSeries ? 'Series' : 'Movie',
          seasonsCount: resObj?.seasonsCount || (isSeries ? 1 : undefined),
          episodesCount: episodes ? episodes.length : undefined,
          episodes: episodes || undefined,
          durationString: isSeries && episodes ? `${episodes.length} Eps` : undefined,
        },
      });
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
