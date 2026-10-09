import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMovieOrSeries } from '@/lib/movieData';
import { sanitizeImage } from '@/lib/catalogMap';

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
      const safePoster = sanitizeImage(movie.poster || movie.thumbnailUrl, movie.title, movie.genre);
      const safeBackdrop = sanitizeImage(movie.backdrop || safePoster, movie.title, movie.genre);

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      releaseYear,
      genre,
      narrator,
      description,
      rating,
      fileUrl,
      thumbnailUrl,
      poster,
      backdrop,
      trailer,
      type,
      seasonsCount,
      episodesCount,
      episodes,
    } = body;

    let existing = await prisma.movie.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      const staticItem = findMovieOrSeries(id);
      let defaultAdminId = 'admin-01';
      try {
        const adminUser = await prisma.user.findFirst({ select: { id: true } });
        if (adminUser) defaultAdminId = adminUser.id;
      } catch {
        // fallback
      }

      const cleanSlug = (title || staticItem?.title || id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      existing = await prisma.movie.create({
        data: {
          title: title || staticItem?.title || 'Untitled',
          slug: `${cleanSlug}-${Date.now().toString(36)}`,
          description: description || staticItem?.description || '',
          synopsis: description || staticItem?.description || '',
          releaseYear: releaseYear ? parseInt(String(releaseYear), 10) : (staticItem?.year || 2024),
          duration: 7200,
          narrator: narrator || staticItem?.narrator || 'Rocky Kimomo',
          genre: genre || staticItem?.genre || 'Action',
          rating: rating ? parseFloat(String(rating)) : (staticItem?.rating || 8.5),
          fileUrl: fileUrl || staticItem?.directStreamUrl || null,
          thumbnailUrl: poster || thumbnailUrl || staticItem?.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
          poster: poster || staticItem?.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
          backdrop: backdrop || staticItem?.backdrop || staticItem?.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
          trailer: trailer || null,
          status: 'PUBLISHED',
          isActive: true,
          isFeatured: true,
          uploaderId: defaultAdminId,
        },
      });
    }

    const currentRes = (existing.resolutions as any) || {};
    const updatedResolutions = {
      ...currentRes,
      type: type || currentRes.type || (episodes && episodes.length > 1 ? 'Series' : 'Movie'),
      seasonsCount: seasonsCount !== undefined ? seasonsCount : currentRes.seasonsCount,
      episodesCount: episodesCount !== undefined ? episodesCount : (episodes ? episodes.length : currentRes.episodesCount),
      episodes: episodes !== undefined ? episodes : currentRes.episodes,
    };

    const updated = await prisma.movie.update({
      where: { id: existing.id },
      data: {
        ...(title ? { title } : {}),
        ...(releaseYear ? { releaseYear: parseInt(String(releaseYear), 10) } : {}),
        ...(genre !== undefined ? { genre } : {}),
        ...(narrator !== undefined ? { narrator } : {}),
        ...(description !== undefined ? { description, synopsis: description } : {}),
        ...(rating !== undefined ? { rating: parseFloat(String(rating)) } : {}),
        ...(fileUrl !== undefined ? { fileUrl } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        ...(poster !== undefined ? { poster } : {}),
        ...(backdrop !== undefined ? { backdrop } : {}),
        ...(trailer !== undefined ? { trailer } : {}),
        resolutions: updatedResolutions,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Movie updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating movie:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(request, props);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = await prisma.movie.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Soft delete by deactivating or hard delete
    await prisma.movie.update({
      where: { id: existing.id },
      data: { isActive: false, status: 'ARCHIVED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting movie:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete movie' },
      { status: 500 }
    );
  }
}

