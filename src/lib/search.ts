/**
 * "What do you want to watch?" search.
 *
 * Turns a free-text Agasobanuye query — "funny movies by Giti", "newest Rocky
 * releases", "best horror" — into structured intent (interpreter + genre +
 * ordering), then ranks the catalog against it.
 *
 * Pure and client-safe: it operates on the UI view models only.
 */

import type { Movie } from './movieData';
import type { Interpreter } from './interpreters';

export type SortMode = 'relevance' | 'newest' | 'rating' | 'popular';

export interface ParsedQuery {
  raw: string;
  interpreters: string[];
  genre?: string;
  minYear?: number;
  sort: SortMode;
  keywords: string[];
  /** Human-readable chips explaining how the query was understood. */
  intents: string[];
}

/** Colloquial words → canonical genre. */
const GENRE_SYNONYMS: Record<string, string> = {
  funny: 'Comedy',
  comedy: 'Comedy',
  comedies: 'Comedy',
  laugh: 'Comedy',
  action: 'Action',
  fight: 'Action',
  scary: 'Horror',
  horror: 'Horror',
  terrifying: 'Horror',
  romantic: 'Romance',
  romance: 'Romance',
  love: 'Romance',
  drama: 'Drama',
  thriller: 'Thriller',
  suspense: 'Thriller',
  'sci-fi': 'Sci-Fi',
  scifi: 'Sci-Fi',
  'science fiction': 'Sci-Fi',
  space: 'Sci-Fi',
  adventure: 'Adventure',
  fantasy: 'Fantasy',
  animation: 'Animation',
  animated: 'Animation',
  cartoon: 'Animation',
  family: 'Family',
  kids: 'Family',
  documentary: 'Documentary',
  crime: 'Crime',
};

const STOP = new Set([
  'movie', 'movies', 'film', 'films', 'series', 'show', 'shows', 'agasobanuye',
  'the', 'a', 'an', 'by', 'with', 'and', 'of', 'in', 'me', 'my', 'want', 'watch',
  'best', 'top', 'good', 'great', 'new', 'newest', 'latest', 'recent', 'like',
  'similar', 'narrated', 'narrator', 'interpreter', 'umusobanuzi',
]);

/** Common words that appear inside interpreter names but shouldn't trigger a match on their own. */
const NAME_TOKEN_STOP = new Set(['the', 'great', 'nice', 'fire', 'king', 'man', 'ice']);

/** Parse a free-text query into structured intent. */
export function parseQuery(raw: string, interpreters: Interpreter[]): ParsedQuery {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const intents: string[] = [];

  const matchedInterpreters: string[] = [];
  for (const person of interpreters) {
    const name = person.name.toLowerCase();
    if (lower.includes(name)) {
      matchedInterpreters.push(person.name);
      continue;
    }
    // Fall back to distinctive name tokens ("Giti" -> "Junior Giti").
    const tokenHit = name
      .split(/\s+/)
      .some((t) => t.length >= 4 && !NAME_TOKEN_STOP.has(t) && new RegExp(`\\b${escapeRegex(t)}\\b`).test(lower));
    if (tokenHit) matchedInterpreters.push(person.name);
  }
  // Prefer the longest match (e.g. "Junior Giti" over a bare "Giti").
  matchedInterpreters.sort((a, b) => b.length - a.length);
  const interpreters2 = matchedInterpreters.slice(0, 2);
  if (interpreters2.length) intents.push(`Umusobanuzi: ${interpreters2.join(', ')}`);

  let genre: string | undefined;
  for (const [word, canonical] of Object.entries(GENRE_SYNONYMS)) {
    if (new RegExp(`\\b${escapeRegex(word)}\\b`).test(lower)) {
      genre = canonical;
      break;
    }
  }
  if (genre) intents.push(`Genre: ${genre}`);

  let sort: SortMode = 'relevance';
  if (/(newest|latest|recent|new)\b/.test(lower)) {
    sort = 'newest';
    intents.push('Sorted by newest');
  } else if (/(best|top|highest rated|highly rated)\b/.test(lower)) {
    sort = 'rating';
    intents.push('Sorted by rating');
  } else if (/(popular|trending|most watched|hot)\b/.test(lower)) {
    sort = 'popular';
    intents.push('Sorted by popularity');
  }

  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const minYear = yearMatch ? parseInt(yearMatch[0], 10) : undefined;
  if (yearMatch) intents.push(`From ${minYear}`);

  const keywords = lower
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

  return { raw: text, interpreters: interpreters2, genre, minYear, sort, keywords, intents };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface SearchResult {
  movie: Movie;
  score: number;
  reasons: string[];
  interpreterHit: boolean;
}

/** Rank catalog movies against a parsed query. */
export function rankMovies(movies: Movie[], parsed: ParsedQuery, limit = 60): SearchResult[] {
  const strict = parsed.interpreters.length > 0 || Boolean(parsed.genre) || parsed.keywords.length > 0;
  const scored: SearchResult[] = [];

  for (const movie of movies) {
    let score = 0;
    const reasons: string[] = [];
    let interpreterHit = false;

    if (parsed.interpreters.length) {
      const narrator = (movie.narrator || '').toLowerCase();
      const hit = parsed.interpreters.find((name) =>
        name
          .toLowerCase()
          .split(/\s+/)
          .some((t) => t.length >= 3 && narrator.includes(t))
      );
      if (hit) {
        score += 6;
        reasons.push(hit);
        interpreterHit = true;
      }
    }

    if (parsed.genre && (movie.genre || '').toLowerCase().includes(parsed.genre.toLowerCase())) {
      score += 4;
      reasons.push(movie.genre);
    }

    if (parsed.minYear && movie.year >= parsed.minYear) {
      score += 2;
      reasons.push(`${movie.year}`);
    }

    const haystack = `${movie.title} ${movie.genre} ${movie.narrator || ''} ${movie.description || ''}`.toLowerCase();
    for (const kw of parsed.keywords) {
      if (kw.length < 3) continue;
      if ((movie.title || '').toLowerCase().includes(kw)) score += 3;
      else if (haystack.includes(kw)) score += 1;
    }

    // When the query carries intent, only return actual matches.
    if (strict && score <= 0) continue;
    scored.push({ movie, score, reasons, interpreterHit });
  }

  return scored
    .sort((a, b) => {
      if (parsed.interpreters.length && a.interpreterHit !== b.interpreterHit) {
        return a.interpreterHit ? -1 : 1;
      }
      if (parsed.sort === 'newest') {
        return b.movie.year - a.movie.year || b.score - a.score || b.movie.rating - a.movie.rating;
      }
      if (parsed.sort === 'rating') {
        return b.movie.rating - a.movie.rating || b.score - a.score;
      }
      return b.score - a.score || b.movie.rating - a.movie.rating;
    })
    .slice(0, limit);
}

/** Interpreters matching a free-text query (name / tags). */
export function matchInterpreters(interpreters: Interpreter[], raw: string): Interpreter[] {
  const term = raw.trim().toLowerCase();
  if (!term) return [];
  return interpreters
    .filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.tags.some((t) => t.toLowerCase().includes(term)) ||
        i.specialties.some((t) => t.toLowerCase().includes(term))
    )
    .slice(0, 8);
}
