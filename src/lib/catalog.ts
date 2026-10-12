/**
 * Server-side catalog service — the source of truth for movies.
 *
 * Reads published movies from PostgreSQL and maps them to the UI view model.
 * In development an empty/absent database falls back to the bundled seed so
 * `npm run dev` works before any import. Production never substitutes seed
 * data: a missing table or empty database must be visible (empty rails, a
 * red /api/health), not hidden behind fake movies.
 */

import { prisma } from '@/lib/prisma';
import { movieData, tvShowsData, type Movie } from '@/lib/movieData';
import { dbMovieToView, type DbMovieLike } from './catalogMap';

const allowSeedFallback = process.env.NODE_ENV !== 'production';

/**
 * The whole catalogue is served by default — the home page renders every
 * published title. Set `CATALOG_LIMIT` to a positive integer only when you
 * deliberately want to cap it (e.g. a very large library).
 */
const configuredLimit = Number(process.env.CATALOG_LIMIT || 0);
const CATALOG_LIMIT =
  Number.isFinite(configuredLimit) && configuredLimit > 0 ? Math.floor(configuredLimit) : 0;

export interface CatalogResult {
  movies: Movie[];
  tvShows: Movie[];
  source: 'database' | 'seed';
}

/** Load the published catalog from PostgreSQL. */
export async function getCatalog(): Promise<CatalogResult> {
  try {
    const rows = (await prisma.movie.findMany({
      where: { isActive: true, status: { in: ['READY', 'PUBLISHED'] } },
      orderBy: { createdAt: 'desc' },
      ...(CATALOG_LIMIT > 0 ? { take: CATALOG_LIMIT } : {}),
    })) as unknown as DbMovieLike[];

    if (rows && rows.length > 0) {
      const movies = rows.map(dbMovieToView);
      // Series aren't modelled separately yet, so the TV rail still uses the
      // bundle. Add a Movie.contentType field to move this fully into the DB.
      return { movies, tvShows: tvShowsData, source: 'database' };
    }

    if (allowSeedFallback) {
      return { movies: movieData, tvShows: tvShowsData, source: 'seed' };
    }

    // Production with an empty catalogue: report it loudly and serve nothing.
    console.error(
      '[catalog] Movie table is reachable but empty — serving an empty catalogue. ' +
        'Import the catalogue or check /api/health.'
    );
  } catch (err) {
    if (allowSeedFallback) {
      console.warn('[catalog] database read failed, using seed:', (err as Error)?.message);
      return { movies: movieData, tvShows: tvShowsData, source: 'seed' };
    }
    console.error(
      '[catalog] database read failed — serving an empty catalogue (no seed fallback in production):',
      (err as Error)?.message
    );
  }

  return { movies: [], tvShows: [], source: 'database' };
}

/** Convenience: only the movies list. */
export async function getCatalogMovies(): Promise<Movie[]> {
  const { movies } = await getCatalog();
  return movies;
}
