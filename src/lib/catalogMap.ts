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
  'Poster500',
  'PosterPath',
  'rebelRidgePoster500',
  'polygamist2026Poster500',
  'myCountryNewAgePoster500',
  'vikingsValhallaS3Poster500',
  'fcXdJUSDiDiFupuDuNxBYvdEsTX',
  'MV5BMjA5OTc3NjExNV5BMl5BanBnXkFtZTgwNTcyNDc5MDI',
  'MV5BMzBhNmZiYmQtNGY1Ny00OWVmLTk3NDgtMWZkZmEzNjFmY2YxXkEyXkFqcGc',
  'MV5BNDExMjg0MWYtZTdmNy00MmQzLTk0NmEtY2Y0YmExMWI4YTVmXkEyXkFqcGc',
  'MV5BN2E1ZWI4YzEtMGEwNi00YmY0LThlMjEtMTM3N2NkZTk5Y2FkXkEyXkFqcGc',
  'MV5BMTQ4NTcyODc5MF5BMl5BanBnXkFtZTcwMjU2NzM2Nw',
  'qW4crfED8mpNDadSmMdi7Spzh9X',
  '4YZpsylmjHbqeWzjKpUEF8gcLUV',
  'hP5e5d1uLgL6UeZJzIuQ0zQ1zZ1',
  'vOl6LmNu2ocZhYuIAOh93DNqh9o',
  'zs2ecOqYqsaViP96a7Hn0M4iP0',
  'kb4n6Op899p8k9L80f55h11p0pL',
  'mK9k2tW6D7vD9O9w500',
  'xe70rY1uomDoo475a89uwh245Z7',
  'oBgWY00bEFeZ9N25wWVyuQddbBc',
  '9eAnMtqvzJ7YCE4eaCGfsa0E296',
  '1SWBflCgnNDVwLKm4fHnFj8V87F',
  'aM3tZ8oGjGk5r4p9fT0r8h2d3iB',
  '6yqDq2kU9yH1u8XvT5a0B3Z0w2a',
  'eWW0t42FzVj67bT3eQzH0oK0k45',
  'yvM3M0hJ9J1aH2h182QzYxMh500',
  'yrpPYK2qm9Le6GBkG3b5hv7FzC5',
  'v4B6u9q7Y9x2X1c3v5n8m0p2a4b',
  'b3Z7a8s9d0f1g2h3j4k5l6m7n8p',
  'b8t4x5u8p9a0s1d2f3g4h5j6k7l',
];

export const CURATED_TITLE_POSTERS: Record<string, string> = {
  'prison break': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
  'one piece': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=900&auto=format&fit=crop',
  'rebel ridge': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop',
  'the vampire diaries': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
  "death's game": 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=900&auto=format&fit=crop',
  'kung fu jungle': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'the polygamist': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
  'my country: the new age': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop',
  'vikings: valhalla': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop',
  'taken': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop',
  'skin trade': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=900&auto=format&fit=crop',
  'who is erin carter': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=900&auto=format&fit=crop',
  'bilal': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=900&auto=format&fit=crop',
  'vis a vis': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
  'locked up': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
  'knights of the zodiac': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=900&auto=format&fit=crop',
  'moana': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop',
  'from paris with love': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900&auto=format&fit=crop',
  'ready or not': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=900&auto=format&fit=crop',
  'hidden strike': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'maleficent': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
  'moonfall': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=900&auto=format&fit=crop',
  'deep water': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop',
  'mortal kombat': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop',
  'seven snipers': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
  'ip man': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'bad genius': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=900&auto=format&fit=crop',
  'kuch kuch hota hai': 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?q=80&w=900&auto=format&fit=crop',
  'chinese zodiac': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'ninja assassin': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'the myth': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  'pk': 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?q=80&w=900&auto=format&fit=crop',
};

export const GENRE_FALLBACKS: Record<string, string> = {
  action: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  animation: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=900&auto=format&fit=crop',
  comedy: 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?q=80&w=900&auto=format&fit=crop',
  crime: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
  drama: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
  horror: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=900&auto=format&fit=crop',
  'sci-fi': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=900&auto=format&fit=crop',
  thriller: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=900&auto=format&fit=crop',
  war: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop',
};

export function isBrokenImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return true;
  return BROKEN_PATTERNS.some((p) => url.includes(p));
}

export function sanitizeImage(rawUrl: string | null | undefined, title?: string, genre?: string): string {
  const tKey = (title || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(CURATED_TITLE_POSTERS)) {
    if (tKey.includes(key)) {
      if (!rawUrl || isBrokenImageUrl(rawUrl)) {
        return poster;
      }
    }
  }

  const gKey = (genre || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(GENRE_FALLBACKS)) {
    if (gKey.includes(key)) {
      if (!rawUrl || isBrokenImageUrl(rawUrl)) {
        return poster;
      }
    }
  }

  if (!rawUrl || isBrokenImageUrl(rawUrl)) {
    return '/fallback-poster.jpg';
  }
  return rawUrl;
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
