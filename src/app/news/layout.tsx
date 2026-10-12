import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

/**
 * The news index and news-detail pages are client components, so neither can
 * export `metadata` directly. This segment layout supplies the SEO both need.
 *
 * Canonical is pinned to `/news` so the filter/search variants that already
 * exist in the UI (`/news?region=...`, `/news?search=...`, category pills)
 * never get indexed as separate URLs — Google should index one page, not the
 * dozen filter combinations.
 *
 * Note: the news-detail route (`/news/[slug]/page.tsx`) is a client component
 * too. If you later convert it to a server component, give it its own
 * `alternates.canonical`; until then the index canonical above is the best
 * available signal for the section as a whole.
 */
export const metadata: Metadata = {
  title: 'FiestaFlix News — Agasobanuye & Cinema Scoops',
  description:
    'Agasobanuye news, Hollywood scoops, Rwandan cinema, African and Asian films — clear readable cinema journalism in Kinyarwanda and English on Fiesta Flix.',
  alternates: { canonical: `${SITE_URL}/news` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/news`,
    title: `FiestaFlix News · ${SITE_NAME}`,
    description:
      'Agasobanuye, Hollywood, Rwandan and global cinema news — the latest scoops on FiestaFlix.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FiestaFlix News — Agasobanuye & Cinema Scoops',
    description:
      'Agasobanuye, Hollywood, Rwandan and global cinema news on FiestaFlix.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
