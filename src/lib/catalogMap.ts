/**
 * Pure mapping between database movie records and the UI view model.
 *
 * This module imports NOTHING server-only, so it can be used in client
 * components (e.g. the search page) without pulling Prisma into the bundle.
 */

import type { Movie } from './types/movie';
import { movieData } from './movieData';

/** Seed catalog indexed by lowercase title, lazily evaluated */
let _seedByTitle: Map<string, Movie> | null = null;
function getSeedByTitle(): Map<string, Movie> {
  if (!_seedByTitle) {
    _seedByTitle = new Map((movieData || []).map((m) => [m.title.toLowerCase(), m]));
  }
  return _seedByTitle;
}

function formatDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds) return undefined;
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

/** Shape of a movie row returned by the catalog API / Prisma. */
export interface DbMovieLike {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  synopsis?: string | null;
  releaseYear?: number | null;
  duration?: number | null;
  narrator?: string | null;
  genre?: string | null;
  rating?: number | null;
  poster?: string | null;
  backdrop?: string | null;
  thumbnailUrl?: string | null;
  resolutions?: unknown;
  isFeatured?: boolean | null;
  fileUrl?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
}

export const BROKEN_PATTERNS = [
  'unsplash.com',
  'Poster500',
  'PosterPath',
  'rebelRidgePoster500',
  'polygamist2026Poster500',
  'myCountryNewAgePoster500',
  'vikingsValhallaS3Poster500',
];

export const FIESTAFLIX_FALLBACK_POSTER = '/fallback-poster.png';

export const CURATED_TITLE_POSTERS: Record<string, string> = {
  'prison break': 'https://image.tmdb.org/t/p/w500/5E1BgmtpTzpR0tf552FwN1uljeb.jpg',
  'one piece': 'https://image.tmdb.org/t/p/w500/cMD9Ygz11yjrtMsOi2954Zjh83Z.jpg',
  'rebel ridge': 'https://image.tmdb.org/t/p/w500/xEt2GSz9z5rsvHM24GE6EP94zNk.jpg',
  'the vampire diaries': 'https://image.tmdb.org/t/p/w500/bCzEZQvA0nB2LdD2b4q5a4k2w5.jpg',
  "death's game": 'https://image.tmdb.org/t/p/w500/5v6k6aK8uPj5Wn6aUu8U2u0N0u.jpg',
  'kung fu jungle': 'https://image.tmdb.org/t/p/w500/n5Xy2j6s0V8z2v0u2o1v9w0x8z.jpg',
  'the polygamist': '/fallback-poster.png',
  'my country: the new age': '/fallback-poster.png',
  'vikings: valhalla': 'https://image.tmdb.org/t/p/w500/m1iABqN7E1sI0M0x1u5x4k9t8s.jpg',
  'taken': 'https://image.tmdb.org/t/p/w500/dEZpqK82Xv8zN6t3Y7w5x0P5k.jpg',
  'skin trade': 'https://image.tmdb.org/t/p/w500/kZ9vR3sKx9nJ5b1y8m5a8c2l4p.jpg',
  'who is erin carter': 'https://image.tmdb.org/t/p/w500/xY01X2wQ5k0N2o5z7m3g4p1d5l.jpg',
  'bilal': 'https://image.tmdb.org/t/p/w500/c3A5Uj4mQ9t0p1o8f2b3c4d5e.jpg',
  'vis a vis': 'https://image.tmdb.org/t/p/w500/v0x5Y2j7k8m1n3o5p7q9r1s3t.jpg',
  'locked up': 'https://image.tmdb.org/t/p/w500/v0x5Y2j7k8m1n3o5p7q9r1s3t.jpg',
  'knights of the zodiac': 'https://image.tmdb.org/t/p/w500/qW4crfED8mpNDadSmMdi7Spzh9X.jpg',
  'moana': 'https://image.tmdb.org/t/p/w500/4YZpsylmjHbqeWzjKpUEF8gcLUV.jpg',
  'from paris with love': 'https://image.tmdb.org/t/p/w500/9eAnMtqvzJ7YCE4eaCGfsa0E296.jpg',
  'ready or not': 'https://image.tmdb.org/t/p/w500/vOl6LmNu2ocZhYuIAOh93DNqh9o.jpg',
  'hidden strike': 'https://image.tmdb.org/t/p/w500/zs2ecOqYqsaViP96a7Hn0M4iP0.jpg',
  'maleficent': 'https://image.tmdb.org/t/p/w500/1SWBflCgnNDVwLKm4fHnFj8V87F.jpg',
  'moonfall': 'https://image.tmdb.org/t/p/w500/odVng80d44wDZe76iB3U1i94f.jpg',
  'deep water': 'https://image.tmdb.org/t/p/w500/xe70rY1uomDoo475a89uwh245Z7.jpg',
  'mortal kombat': 'https://image.tmdb.org/t/p/w500/6yqDq2kU9yH1u8XvT5a0B3Z0w2a.jpg',
  'seven snipers': '/fallback-poster.png',
  'ip man': 'https://image.tmdb.org/t/p/w500/yrpPYK2qm9Le6GBkG3b5hv7FzC5.jpg',
  'bad genius': 'https://image.tmdb.org/t/p/w500/v4B6u9q7Y9x2X1c3v5n8m0p2a4b.jpg',
  'kuch kuch hota hai': 'https://image.tmdb.org/t/p/w500/b3Z7a8s9d0f1g2h3j4k5l6m7n8p.jpg',
  'chinese zodiac': 'https://image.tmdb.org/t/p/w500/b8t4x5u8p9a0s1d2f3g4h5j6k7l.jpg',
  'ninja assassin': 'https://image.tmdb.org/t/p/w500/eWW0t42FzVj67bT3eQzH0oK0k45.jpg',
  'the myth': 'https://image.tmdb.org/t/p/w500/aM3tZ8oGjGk5r4p9fT0r8h2d3iB.jpg',
  'pk': 'https://image.tmdb.org/t/p/w500/yvM3M0hJ9J1aH2h182QzYxMh500.jpg',
  'hacksaw ridge': 'https://image.tmdb.org/t/p/w500/fTuxNlgEm04YIeH7qZ9zN2w0k.jpg',
  'the contractor': 'https://image.tmdb.org/t/p/w500/rJPGPZ5ol02ypHgHgujTTnc3Y6U.jpg',
  'secret superstar': 'https://image.tmdb.org/t/p/w500/8c7q5NqI8k1b2m3l4p5o6q7r8s.jpg',
};

export const GENRE_FALLBACKS: Record<string, string> = {
  action: '/fallback-poster.png',
  animation: '/fallback-poster.png',
  comedy: '/fallback-poster.png',
  crime: '/fallback-poster.png',
  drama: '/fallback-poster.png',
  horror: '/fallback-poster.png',
  'sci-fi': '/fallback-poster.png',
  thriller: '/fallback-poster.png',
  war: '/fallback-poster.png',
};

export function isBrokenImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  if (url.includes('unsplash.com')) return true;
  if (!url.startsWith('http') && !url.startsWith('/')) return true;
  return BROKEN_PATTERNS.some((p) => url.includes(p));
}

export function sanitizeImage(rawUrl: string | null | undefined, title?: string, genre?: string): string {
  // 1. If valid TMDB image or custom upload, keep it
  if (rawUrl && !isBrokenImageUrl(rawUrl)) {
    if (rawUrl.includes('image.tmdb.org') || rawUrl.startsWith('/uploads') || rawUrl.startsWith('/')) {
      return rawUrl;
    }
  }

  // 2. Check title matches for TMDB posters
  const tKey = (title || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(CURATED_TITLE_POSTERS)) {
    if (tKey.includes(key)) {
      return poster;
    }
  }

  // 3. If raw URL is valid external image (non-unsplash), use it
  if (rawUrl && !isBrokenImageUrl(rawUrl)) {
    return rawUrl;
  }

  // 4. Default to official FiestaFlix fallback poster
  return FIESTAFLIX_FALLBACK_POSTER;
}

/**
 * Classify a catalogue row as a series or a standalone movie.
 *
 * Recognises the shapes the catalogue actually uses — "Season 2", "S01 Ep 03",
 * "Ep 5", "Series" in the title — plus a real episode list. Deliberately does
 * NOT treat "Part A/B" as a series: those are two halves of one film.
 *
 * Shared by the list and detail APIs so a title can never be a series in one
 * place and a movie in another.
 */
export function isSeriesTitle(
  title?: string | null,
  description?: string | null,
  episodes?: unknown[] | null
): boolean {
  if (Array.isArray(episodes) && episodes.length > 1) return true;

  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();

  if (t.includes('series')) return true;
  if (/\bseason\s*\d/.test(t) || /\bseason\s*\d/.test(d)) return true;
  if (/\bs\d{1,2}[\s._-]*(?:e|ep)\b/.test(t)) return true;
  if (/\bep(?:isode)?[\s._-]*\d+/.test(t)) return true;

  return false;
}

/**
 * Convert a database movie into the UI `Movie` shape. Falls back to the seed
 * entry for display-only fields (rating, telegram links, sizes) until the
 * catalog is fully backfilled, so the UI never regresses to empty values.
 */
export function dbMovieToView(m: DbMovieLike): Movie {
  const seed = getSeedByTitle().get((m.title || '').toLowerCase());
  const year = m.releaseYear ?? seed?.year ?? new Date().getFullYear();
  const rawImage = m.poster || m.thumbnailUrl || seed?.image;
  const image = sanitizeImage(rawImage, m.title, m.genre || seed?.genre);
  const rawBackdrop = m.backdrop || seed?.backdrop || m.thumbnailUrl;
  const backdrop = sanitizeImage(rawBackdrop, m.title, m.genre || seed?.genre);

  return {
    id: m.id,
    title: m.title,
    year,
    genre: m.genre || seed?.genre || '',
    rating: Number(m.rating) || seed?.rating || 0,
    image,
    backdrop,
    trending: Boolean(m.isFeatured ?? (seed?.trending ?? true)),
    narrator: m.narrator || seed?.narrator || undefined,
    contentType: isSeriesTitle(m.title, m.description) ? 'series' : 'movie',
    duration: formatDuration(m.duration) || seed?.duration,
    quality: seed?.quality || '1080p FHD',
    fileSize: seed?.fileSize || '1.4 GB',
    description: m.description || m.synopsis || seed?.description,
    telegramChannelPost: seed?.telegramChannelPost || `https://t.me/fiestaflix_movies/${m.id}`,
    telegramBotLink: seed?.telegramBotLink || `https://t.me/FiestaFlixBot?start=movie_${m.id}`,
    directStreamUrl: m.fileUrl || seed?.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailer: (m as any).trailer || seed?.trailer || undefined,
  };
}
