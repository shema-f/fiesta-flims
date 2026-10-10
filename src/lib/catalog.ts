/**
 * Server-side catalog service — the source of truth for movies.
 *
 * Reads published movies from PostgreSQL and maps them to the UI view model.
 * When the database is empty (e.g. before the catalog is imported) it falls
 * back to the bundled seed so the site is never blank.
 */

import { prisma } from '@/lib/prisma';
import { movieData, tvShowsData, type Movie } from '@/lib/movieData';
import { dbMovieToView, type DbMovieLike } from './catalogMap';

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

/** Load the published catalog from PostgreSQL, falling back to the seed. */
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
  } catch (err) {
    console.warn('[catalog] database read failed, using seed:', (err as Error)?.message);
  }

  return { movies: movieData, tvShows: tvShowsData, source: 'seed' };
}

/** Convenience: only the movies list. */
export async function getCatalogMovies(): Promise<Movie[]> {
  const { movies } = await getCatalog();
  return movies;
}
