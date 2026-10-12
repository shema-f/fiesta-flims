import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

/**
 * The /movies catalogue page is a client component (it owns filtering state),
 * so it cannot export `metadata` itself. This segment layout supplies the SEO
 * it needs. The `/movies/[slug]` page exports its own `alternates.canonical`,
 * which takes precedence here, so each film keeps its own canonical URL.
 *
 * The canonical is pinned to `/movies` (no query string) so the filter variants
 * linked in the nav (`/movies?type=series`, etc.) don't create duplicate
 * indexable URLs.
 */
export const metadata: Metadata = {
  title: 'Reba Filime mu Kinyarwanda — Catalogue',
  description:
    'Reba filime zisobanuye mu Kinyarwanda zose kuri Fiesta Flix — urwwarwidane, ubwiru, ubwishingizi, filime z’Indiya na filime za Rwanda. Streaming ya HD n’ikuramo offline.',
  alternates: { canonical: `${SITE_URL}/movies` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/movies`,
    title: `Reba Filime mu Kinyarwanda · ${SITE_NAME}`,
    description:
      'Catalogue y’ifilime zisobanuye mu Kinyarwanda — reba, ukuramo offline, ukurikirane ku bice.',
  },
};

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
