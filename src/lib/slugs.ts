/**
 * Slug helpers shared by the sitemap, movie detail route and internal links.
 *
 * Database movies carry a real `slug` column. The bundled seed catalogue has
 * no slug column, so we derive a stable one from the title — the same input
 * always produces the same URL, which is what canonical tags rely on.
 */

import type { Movie } from './types/movie';

/** URL-safe slug from any title (Latin + Kinyarwanda characters kept). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    // Strip combining marks but keep letters/digits; spaces & punctuation → "-".
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Canonical public URL for a movie. Prefers the DB slug when present. */
export function movieUrl(movie: { slug?: string | null; title: string; id?: number | string }): string {
  const slug = movie.slug || slugify(movie.title);
  return `/movies/${slug}`;
}
