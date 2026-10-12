import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { jsonOk, jsonError, intParam, requireAdmin, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';
import { notifyNewMovieUploaded } from '@/lib/notificationService';
import { sanitizeImage, isSeriesTitle } from '@/lib/catalogMap';

export const dynamic = 'force-dynamic';

/**
 * GET /api/movies
 *
 * Server-side search + filtering + sorting + pagination.
 * Supports:
 * - sortBy: 'rating' | 'popularity' | 'latest' | 'year' | 'title'
 * - order: 'desc' | 'asc'
 * - minRating: number (e.g. 7.0, 8.0)
 * - narrator: string
 * - genre: string
 * - year: number
 * - q: string
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q')?.trim();
  const genre = sp.get('genre')?.trim();
  const interpreter = sp.get('interpreter')?.trim();
  const narrator = sp.get('narrator')?.trim();
  const language = sp.get('language')?.trim();
  const country = sp.get('country')?.trim();
  const tier = sp.get('tier')?.trim();
  const origin = sp.get('origin')?.trim();
  const year = sp.get('year') ? parseInt(sp.get('year') as string, 10) : undefined;
  const minRating = sp.get('minRating') ? parseFloat(sp.get('minRating') as string) : undefined;
  const sortBy = sp.get('sortBy')?.trim().toLowerCase() || 'latest';
  const order = sp.get('order')?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
  const page = intParam(sp.get('page'), 1, 1, 10_000);
  const limit = intParam(sp.get('limit'), 24, 1, 100);

  // 1. Attempt Database Query
  try {
    const where: any = { isActive: true, status: { in: ['READY', 'PUBLISHED'] } };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { originalTitle: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { narrator: { contains: q, mode: 'insensitive' } },
        { genre: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (year) where.releaseYear = year;
    if (minRating) where.rating = { gte: minRating };
    if (narrator && narrator !== 'All') {
      where.narrator = { contains: narrator, mode: 'insensitive' };
    }
    if (tier) where.tier = tier;
    // Origin set: `origin=rwanda` selects the Rwandan cinema originals, which
    // are marked with a rightsOwner of 'Rwandan Cinema' by the import script.
    if (origin === 'rwanda') where.rightsOwner = 'Rwandan Cinema';
    if (genre && genre !== 'All') {
      where.OR = [
        ...(where.OR || []),
        { genre: { contains: genre, mode: 'insensitive' } },
        { genres: { some: { genre: { slug: genre.toLowerCase() } } } },
      ];
    }
    if (interpreter && interpreter !== 'All') {
      where.interpreters = { some: { interpreter: { slug: interpreter.toLowerCase() } } };
    }
    if (language) where.languages = { some: { language: { code: language } } };
    if (country) where.distributionTerritories = { has: country };

    // Dynamic orderBy
    let orderBy: any = { createdAt: order };
    if (sortBy === 'rating') {
      orderBy = [{ rating: order }, { ratingCount: 'desc' }];
    } else if (sortBy === 'popularity') {
      orderBy = [{ views: order }, { viewCount: order }, { rating: 'desc' }];
    } else if (sortBy === 'year') {
      orderBy = [{ releaseYear: order }, { createdAt: 'desc' }];
    } else if (sortBy === 'title') {
      orderBy = { title: order };
    }

    // A content-type filter is derived from fields Prisma cannot index (the
    // episode list lives inside `resolutions`), so when it is requested we scan
    // the matching rows up front and paginate in memory. That keeps
    // X-Total-Count honest instead of reporting a single page's length.
    const typeReq = sp.get('type')?.toLowerCase();
    const typeFiltered = typeReq === 'series' || typeReq === 'movie';
    const TYPE_SCAN_LIMIT: number = 2000;
    const skip = (page - 1) * limit;

    const [dbMovies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        include: {
          uploader: { select: { id: true, name: true } },
          genres: { include: { genre: true } },
          interpreters: { include: { interpreter: true } },
        },
        orderBy,
        ...(typeFiltered ? { take: TYPE_SCAN_LIMIT } : { skip, take: limit }),
      }),
      prisma.movie.count({ where }),
    ]);

    if (total > 0) {
      let filteredDbMovies = dbMovies.map((m: any) => {
        const resObj = m.resolutions && typeof m.resolutions === 'object' ? m.resolutions : null;
        const episodes = Array.isArray(resObj?.episodes) ? resObj.episodes : null;
        const isSeries = isSeriesTitle(m.title, m.description, episodes);
        const posterImg = sanitizeImage(m.poster || m.thumbnailUrl, m.title, m.genre);
        const backdropImg = sanitizeImage(m.backdrop || posterImg, m.title, m.genre);
        return {
          ...m,
          image: posterImg,
          thumbnailUrl: posterImg,
          poster: posterImg,
          backdrop: backdropImg,
          trailer: m.trailer || null,
          trailerUrl: m.trailer || null,
          year: m.releaseYear || (m.createdAt ? new Date(m.createdAt).getFullYear() : 2024),
          rating: m.rating || 8.5,
          contentType: isSeries ? 'series' : 'movie',
          type: isSeries ? 'Series' : 'Movie',
          seasonsCount: resObj?.seasonsCount || (isSeries ? 1 : undefined),
          episodesCount: episodes ? episodes.length : undefined,
          episodes: episodes || undefined,
          durationString: isSeries && episodes ? `${episodes.length} Eps` : undefined,
        };
      });

      if (typeReq === 'series') {
        filteredDbMovies = filteredDbMovies.filter((m: any) => m.contentType === 'series');
      } else if (typeReq === 'movie') {
        filteredDbMovies = filteredDbMovies.filter((m: any) => m.contentType === 'movie');
      }

      const pageRows = typeFiltered
        ? filteredDbMovies.slice(skip, skip + limit)
        : filteredDbMovies;
      const totalCount = typeFiltered ? filteredDbMovies.length : total;
      return jsonOk(pageRows, {
        headers: {
          'X-Total-Count': String(totalCount),
          'X-Page': String(page),
          'X-Limit': String(limit),
        },
      });
    }

    // The database answered but nothing matched. An empty catalogue is the
    // honest result — bundled seed data is never substituted, because Neon is
    // the single source of truth and faking rows hides a broken deployment.
    return jsonOk([], {
      headers: { 'X-Total-Count': '0', 'X-Page': String(page), 'X-Limit': String(limit) },
    });
  } catch (err) {
    console.error('[api/movies] Database query failed — serving no fallback data:', err);
    return jsonError(
      'The catalogue database is unavailable. Check DATABASE_URL and run "prisma migrate deploy".',
      503
    );
  }
}

const createMovieSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  synopsis: z.string().optional(),
  releaseYear: z.number().int().min(1888).max(2100).optional(),
  duration: z.number().int().min(0).optional(),
  narrator: z.string().optional(),
  genre: z.string().optional(),
  rating: z.number().optional(),
  fileUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  youtubeId: z.string().optional(),
  type: z.enum(['Movie', 'Series', 'movie', 'series']).optional(),
  seasonsCount: z.number().optional(),
  episodesCount: z.number().optional(),
  episodes: z.array(z.any()).optional(),
  contentRightsStatus: z
    .enum(['UNKNOWN', 'LICENSED', 'PUBLIC_DOMAIN', 'UNAUTHORIZED'])
    .optional(),
});

/** POST /api/movies — movie creation + notification broadcast (admin only). */
export async function POST(request: Request) {
  // Only admins may create catalogue entries. The old code fell back to "the
  // first user in the table" which let any signed-in (or even anonymous) caller
  // publish movies — and a phantom id could later break foreign keys.
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const uploaderId = guard.user.id;

  const limit = await checkRateLimit(`movie-create:${guard.user.id}`, 30, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {

    const body = await request.json();
    const data = createMovieSchema.parse(body);
    const isSeries = data.type === 'Series' || data.type === 'series';
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    let createdMovie: any = null;

    try {
      const resolutionsData = {
        type: isSeries ? 'Series' : 'Movie',
        seasonsCount: data.seasonsCount || (isSeries ? 1 : undefined),
        episodesCount: data.episodesCount || (data.episodes ? data.episodes.length : (isSeries ? 1 : undefined)),
        episodes: data.episodes || [],
      };

      createdMovie = await prisma.movie.create({
        data: {
          title: data.title,
          slug: `${slug}-${Date.now().toString(36)}`,
          description: data.description || `Experience ${data.title} with high-definition audio and narration by ${data.narrator || 'FiestaFlix'}.`,
          synopsis: data.synopsis || data.description,
          releaseYear: data.releaseYear || new Date().getFullYear(),
          duration: data.duration || (isSeries ? 45 * 60 : 7200),
          narrator: data.narrator || 'Rocky Kimomo',
          genre: data.genre || 'Action',
          rating: data.rating || 8.6,
          fileUrl: data.fileUrl || (data.youtubeId ? `https://www.youtube.com/watch?v=${data.youtubeId}` : null),
          thumbnailUrl: data.thumbnailUrl || '/fallback-poster.png',
          poster: data.thumbnailUrl || '/fallback-poster.png',
          backdrop: data.thumbnailUrl || '/fallback-poster.png',
          resolutions: resolutionsData,
          status: 'PUBLISHED',
          isActive: true,
          isFeatured: true,
          uploaderId: uploaderId,
        },
      });
    } catch (dbErr) {
      // Fail loudly. A "virtual movie" that exists only in the response made
      // the admin UI look successful while nothing was stored — the film then
      // silently vanished on the next page load.
      console.error('[POST /api/movies] DB create failed:', dbErr);
      return jsonError('Could not save the movie to the database. Nothing was created.', 500);
    }

    // Attach series metadata to object
    if (isSeries) {
      createdMovie.contentType = 'series';
      createdMovie.type = 'Series';
      createdMovie.seasonsCount = data.seasonsCount || 1;
      createdMovie.episodesCount = data.episodesCount || (data.episodes ? data.episodes.length : 1);
      createdMovie.episodes = data.episodes || [];
    }

    // BROADCAST NOTIFICATION TO ALL USERS FOR NEW MOVIE / SERIES UPLOAD
    const notifTitle = isSeries 
      ? `📺 Series: ${createdMovie.title} (Season ${createdMovie.seasonsCount || 1})`
      : createdMovie.title;

    const notif = await notifyNewMovieUploaded({
      id: createdMovie.id,
      title: notifTitle,
      releaseYear: createdMovie.releaseYear || undefined,
      narrator: createdMovie.narrator || undefined,
      genre: createdMovie.genre || undefined,
      thumbnailUrl: createdMovie.thumbnailUrl || undefined,
      rating: createdMovie.rating || undefined,
    });

    // Bust the cached listing/home pages so the new film shows up right away
    // instead of after the next ISR revalidation window.
    try {
      revalidatePath('/movies');
      revalidatePath('/');
      if (createdMovie.slug) revalidatePath(`/movies/${createdMovie.slug}`);
    } catch (revalidateErr) {
      console.warn('[POST /api/movies] revalidatePath failed:', revalidateErr);
    }

    return jsonOk(
      {
        movie: createdMovie,
        notification: notif,
        message: `${isSeries ? 'Series' : 'Movie'} uploaded and notification sent successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.errors[0].message, 400);
    }
    return jsonError('Failed to create movie and send notification', 500);
  }
}
