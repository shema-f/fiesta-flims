import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getCatalog } from '@/lib/catalog';
import { interpretersData } from '@/lib/interpreters';
import { GENRES } from '@/lib/genreLanding';
import { movieUrl } from '@/lib/slugs';

export const revalidate = 3600; // ISR: regenerate hourly, not on every request.

/**
 * Dynamic sitemap per Google Search Essentials.
 *
 * Includes only public, indexable pages: home, catalogue, genres, narrators,
 * static legal pages and every ACTIVE published movie. Explicitly excludes
 * admin, API, auth, account, internal search and unpublished movies — those
 * are either blocked in robots.ts or simply never listed here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/movies`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/rwandan-movies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/interpreters`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/request-movie`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/content-guidelines`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const genrePages: MetadataRoute.Sitemap = GENRES.map((g) => ({
    url: `${base}/genres/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const narratorPages: MetadataRoute.Sitemap = interpretersData.map((i) => ({
    url: `${base}/interpreters/${i.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Every public, active, published/ready movie. `getCatalog` already filters
  // to isActive + status in (READY, PUBLISHED), so unpublished titles never
  // appear here.
  //
  // A sitemap that answers 500 once is enough for Search Console to log
  // "Couldn't fetch" and stop reading it, so the catalogue read is wrapped:
  // any failure (DB blip, one malformed row breaking the view mapping) still
  // returns the static, genre and narrator URLs instead of an error page.
  let moviePages: MetadataRoute.Sitemap = [];
  try {
    const { movies } = await getCatalog();
    moviePages = movies.map((m) => ({
      url: `${base}${movieUrl(m)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('[sitemap] catalogue unavailable, serving static URLs only:', (err as Error)?.message);
  }

  // Defensive dedupe: two titles sharing a slug would otherwise emit the same
  // <loc> twice, which Google reports as a sitemap parse warning.
  const seen = new Set<string>();
  const entries = [...staticPages, ...genrePages, ...narratorPages, ...moviePages].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return entries;
}
