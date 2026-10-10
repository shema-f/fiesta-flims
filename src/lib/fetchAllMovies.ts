import type { ApiMovie } from '@/lib/apiTypes';

/** Hard cap enforced by GET /api/movies for a single response. */
const PAGE_SIZE = 100;
/** Safety valve — never pull more than 10k rows in one load. */
const MAX_PAGES = 100;

export interface FetchAllMoviesOptions {
  params?: Record<string, string | undefined>;
  signal?: AbortSignal;
}

export interface AllMovies {
  movies: ApiMovie[];
  /** Server-reported total for the query (not just what we received). */
  total: number;
}

/**
 * Page through GET /api/movies until the whole catalogue is loaded.
 *
 * The endpoint caps a single response at 100 rows, so anything that needs
 * *every* title — the admin dashboard, the client-side filters on /movies —
 * must loop rather than request `?limit=300` and silently get 100 back.
 */
export async function fetchAllMovies(options: FetchAllMoviesOptions = {}): Promise<AllMovies> {
  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(options.params || {})) {
    if (value !== undefined && value !== null && value !== '') base.set(key, value);
  }

  const movies: ApiMovie[] = [];
  let total = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams(base);
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));

    const res = await fetch(`/api/movies?${params.toString()}`, {
      cache: 'no-store',
      signal: options.signal,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch movies');
    }

    const batch: ApiMovie[] = Array.isArray(json.data) ? json.data : [];
    movies.push(...batch);

    const header = res.headers.get('X-Total-Count');
    total = header !== null ? parseInt(header, 10) || movies.length : movies.length;

    // A short page means the catalogue is exhausted; so does holding
    // everything the server says exists.
    if (batch.length < PAGE_SIZE || movies.length >= total) break;
  }

  return { movies, total };
}
