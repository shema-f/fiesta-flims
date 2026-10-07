/**
 * Pure mapping between database movie records and the UI view model.
 *
 * This module imports NOTHING server-only, so it can be used in client
 * components (e.g. the search page) without pulling Prisma into the bundle.
 */

import { movieData, type Movie } from './movieData';

/** Seed catalog indexed by lowercase title, used to enrich DB rows while the catalog is being migrated. */
const seedByTitle = new Map(movieData.map((m) => [m.title.toLowerCase(), m]));

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
  status?: string | null;
  createdAt?: string | Date | null;
}

const BROKEN_PATTERNS = [
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
];

const CURATED_TITLE_POSTERS: Record<string, string> = {
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
  'who is erin carter?': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=900&auto=format&fit=crop',
};

function sanitizeImage(rawUrl: string | null | undefined, title: string): string {
  const tKey = (title || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(CURATED_TITLE_POSTERS)) {
    if (tKey.includes(key)) {
      if (!rawUrl || BROKEN_PATTERNS.some((p) => rawUrl.includes(p))) {
        return poster;
      }
    }
  }
  if (!rawUrl || BROKEN_PATTERNS.some((p) => rawUrl.includes(p))) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop';
  }
  return rawUrl;
}

/**
 * Convert a database movie into the UI `Movie` shape. Falls back to the seed
 * entry for display-only fields (rating, telegram links, sizes) until the
 * catalog is fully backfilled, so the UI never regresses to empty values.
 */
export function dbMovieToView(m: DbMovieLike): Movie {
  const seed = seedByTitle.get((m.title || '').toLowerCase());
  const year = m.releaseYear ?? seed?.year ?? new Date().getFullYear();
  const rawImage = m.poster || m.thumbnailUrl || seed?.image;
  const image = sanitizeImage(rawImage, m.title);
  const rawBackdrop = m.backdrop || seed?.backdrop || m.thumbnailUrl;
  const backdrop = sanitizeImage(rawBackdrop, m.title);

  return {
    id: m.id,
    title: m.title,
    year,
    genre: m.genre || seed?.genre || '',
    rating: Number(m.rating) || seed?.rating || 0,
    image,
    backdrop,
    trending: Boolean(m.isFeatured ?? seed?.trending),
    narrator: m.narrator || seed?.narrator || undefined,
    duration: formatDuration(m.duration) || seed?.duration,
    quality: seed?.quality,
    fileSize: seed?.fileSize,
    description: m.description || m.synopsis || seed?.description,
    telegramChannelPost: seed?.telegramChannelPost,
    telegramBotLink: seed?.telegramBotLink,
    directStreamUrl: seed?.directStreamUrl,
  };
}
