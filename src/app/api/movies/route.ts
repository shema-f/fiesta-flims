import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { jsonOk, jsonError, requireAdmin, intParam } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/movies
 *
 * Server-side search + filtering + pagination (spec §31). The homepage must
 * never download the whole catalog.
 *
 * Query params: q, genre, interpreter, year, language, country, tier, page, limit
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q')?.trim();
  const genre = sp.get('genre')?.trim();
  const interpreter = sp.get('interpreter')?.trim();
  const language = sp.get('language')?.trim();
  const country = sp.get('country')?.trim();
  const tier = sp.get('tier')?.trim();
  const year = sp.get('year') ? parseInt(sp.get('year') as string, 10) : undefined;
  const page = intParam(sp.get('page'), 1, 1, 10_000);
  const limit = intParam(sp.get('limit'), 24, 1, 100);

  const where: any = { isActive: true, status: { in: ['READY', 'PUBLISHED'] } };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { originalTitle: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (year) where.releaseYear = year;
  if (tier) where.tier = tier;
  if (genre) where.genres = { some: { genre: { slug: genre } } };
  if (interpreter) where.interpreters = { some: { interpreter: { slug: interpreter } } };
  if (language) where.languages = { some: { language: { code: language } } };
  if (country) where.distributionTerritories = { has: country };

  try {
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        include: {
          uploader: { select: { id: true, name: true } },
          genres: { include: { genre: true } },
          interpreters: { include: { interpreter: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.movie.count({ where }),
    ]);

    return jsonOk(movies, {
      // camelCase pagination meta kept separate from the legacy `data` array.
      headers: {
        'X-Total-Count': String(total),
        'X-Page': String(page),
        'X-Limit': String(limit),
      },
    });
  } catch (error) {
    return jsonError('Failed to fetch movies', 500);
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
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  contentRightsStatus: z
    .enum(['UNKNOWN', 'LICENSED', 'PUBLIC_DOMAIN', 'UNAUTHORIZED'])
    .optional(),
});

/** POST /api/movies — admin-only movie creation (spec §38). */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const data = createMovieSchema.parse(body);
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const movie = await prisma.movie.create({
      data: {
        ...data,
        slug,
        status: 'DRAFT',
        uploaderId: guard.user.id,
      },
    });
    return jsonOk(movie, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.errors[0].message, 400);
    }
    return jsonError('Failed to create movie', 500);
  }
}
