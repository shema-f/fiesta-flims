import { NextRequest } from 'next/server';
import { getCatalog } from '@/lib/catalog';
import { interpretersData } from '@/lib/interpreters';
import { parseQuery, rankMovies, matchInterpreters } from '@/lib/search';
import { jsonOk, intParam } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=funny movies by Giti
 *
 * "What do you want to watch?" — understands interpreter, genre, recency and
 * ordering, then ranks the catalog. Falls back to plain matching.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = intParam(request.nextUrl.searchParams.get('limit'), 60, 1, 120);

  if (!q) {
    return jsonOk({ movies: [], interpreters: [], parsed: null });
  }

  const { movies } = await getCatalog();
  const parsed = parseQuery(q, interpretersData);
  const results = rankMovies(movies, parsed, limit).map((r) => ({ ...r.movie, matchReasons: r.reasons }));
  const interpreters = matchInterpreters(interpretersData, q);

  return jsonOk({ movies: results, interpreters, parsed });
}
