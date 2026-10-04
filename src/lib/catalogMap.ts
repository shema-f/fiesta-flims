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

/**
 * Convert a database movie into the UI `Movie` shape. Falls back to the seed
 * entry for display-only fields (rating, telegram links, sizes) until the
 * catalog is fully backfilled, so the UI never regresses to empty values.
 */
export function dbMovieToView(m: DbMovieLike): Movie {
  const seed = seedByTitle.get((m.title || '').toLowerCase());
  const year = m.releaseYear ?? seed?.year ?? new Date().getFullYear();

  return {
    id: m.id,
    title: m.title,
    year,
    genre: m.genre || seed?.genre || '',
    rating: Number(m.rating) || seed?.rating || 0,
    image: m.poster || m.thumbnailUrl || seed?.image || '/placeholder-poster.svg',
    backdrop: m.backdrop || seed?.backdrop || m.thumbnailUrl || undefined,
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
