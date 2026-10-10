/**
 * Interpreter ↔ movie attribution.
 *
 * Every number the site shows for an interpreter (card badge, profile header,
 * admin panel, API payload) is derived from *one* matcher applied to *one*
 * movie list, so the count can never disagree with the filmography shown next
 * to it. Nothing here is hardcoded — totals come from the catalogue itself.
 */

import type { Movie } from './movieData';
import { interpretersData, slugify, type Interpreter } from './interpreters';

/**
 * Extra spellings a narrator may appear under. Keys are interpreter slugs
 * (see `slugify`). Anything absent falls back to the interpreter's own name.
 */
const ALIASES: Record<string, string[]> = {
  rocky: ['rocky kimomo', 'rocky kirabiranya', 'rocky'],
  'junior-giti': ['junior giti', 'junior', 'giti'],
  yanga: ['yanga', 'nkusi thomas'],
  sankara: ['sankara da premier', 'sankara'],
  savimbi: ['savimbi'],
  gaheza: ['gaheza simba', 'gaheza'],
  dylan: ['dylan kabaka', 'dylan'],
  // slugify('P.K') strips the dot and yields 'pk' — key on that.
  pk: ['p.k', 'pk', 'p k'],
  'p-k': ['p.k', 'pk', 'p k'],
  skov: ['skov', 'sikov'],
  sikov: ['sikov', 'skov'],
  'master-p': ['master p'],
  'b-the-great': ['b the great', 'b.the great'],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** All strings a movie's narrator may use to refer to this interpreter. */
export function interpreterKeys(name: string): string[] {
  const slug = slugify(name);
  const aliases = ALIASES[slug] ?? [name];
  const keys = new Set<string>(aliases.map(normalize).filter(Boolean));
  keys.add(normalize(name));
  return [...keys];
}

/** Word-boundary match so "Sankara" never claims "Sankarani". */
function containsKey(narratorNorm: string, key: string): boolean {
  if (!key) return false;
  return new RegExp(`(^| )${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(narratorNorm);
}

/** Does this movie's narrator belong to `name`? */
export function narratorMatches(name: string, narrator: string | undefined | null): boolean {
  const norm = normalize(narrator || '');
  if (!norm) return false;
  return interpreterKeys(name).some((key) => containsKey(norm, key));
}

/**
 * The filmography for one interpreter. This is the authoritative list —
 * `countForInterpreter` is simply `filterMoviesForInterpreter(...).length`.
 */
export function filterMoviesForInterpreter(name: string, movies: Movie[]): Movie[] {
  return movies.filter((m) => narratorMatches(name, m.narrator));
}

/** Exact number of catalogue titles voiced by `name`. */
export function countForInterpreter(name: string, movies: Movie[]): number {
  return filterMoviesForInterpreter(name, movies).length;
}

export interface InterpreterStats {
  /** slug → exact title count. */
  countsBySlug: Map<string, number>;
  /** Every published title in the catalogue. */
  totalMovies: number;
  /** Every episode across movies and series. */
  totalEpisodes: number;
  /** Titles whose narrator matches no known interpreter. */
  unattributedMovies: number;
  /** Sum of all per-interpreter counts (may exceed total when two display
   *  entries are the same person — see ALIASES). */
  attributedMovies: number;
}

function episodeCount(item: Movie): number {
  if (Array.isArray(item.episodes) && item.episodes.length > 0) return item.episodes.length;
  if (typeof item.episodesCount === 'number' && item.episodesCount > 0) return item.episodesCount;
  return 0;
}

/**
 * Compute every interpreter count plus the platform totals in a single pass
 * over the catalogue.
 */
export function buildInterpreterStats(movies: Movie[], series: Movie[] = []): InterpreterStats {
  const countsBySlug = new Map<string, number>();
  let attributedMovies = 0;

  for (const interpreter of interpretersData) {
    const count = countForInterpreter(interpreter.name, movies);
    countsBySlug.set(interpreter.slug, count);
    attributedMovies += count;
  }

  const totalMovies = movies.length;
  const totalEpisodes =
    movies.reduce((sum, m) => sum + episodeCount(m), 0) +
    series.reduce((sum, s) => sum + episodeCount(s), 0);

  const unattributedMovies = movies.filter(
    (m) => !interpretersData.some((i) => narratorMatches(i.name, m.narrator))
  ).length;

  return {
    countsBySlug,
    totalMovies,
    totalEpisodes,
    unattributedMovies,
    attributedMovies,
  };
}

/** Merge live counts onto the static interpreter directory. */
export function withLiveCounts<T extends Interpreter>(
  interpreters: T[],
  stats: InterpreterStats
): T[] {
  return interpreters.map((it) => {
    const live = stats.countsBySlug.get(it.slug);
    const catalogMoviesCount = live !== undefined ? live : it.catalogMoviesCount;
    return {
      ...it,
      catalogMoviesCount,
      // Career/dub count shown as "N+ dubs" tracks the real catalogue too.
      moviesCount: catalogMoviesCount,
      totalPlatformMovies: stats.totalMovies || it.totalPlatformMovies,
      totalPlatformEpisodes: stats.totalEpisodes || it.totalPlatformEpisodes,
    };
  });
}
