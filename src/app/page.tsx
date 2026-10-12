import type { Metadata } from 'next';
import HomeView from '@/components/HomeView';
import { getCatalog } from '@/lib/catalog';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Filime zisobanuye mu Kinyarwanda — Fiesta Flix',
  description:
    'Reba filime zisobanuye mu Kinyarwanda kuri internet. Fiesta Flix ni aho kurwanda kwa filime — streaming, gukuramo offline, no gukunda abasobanuzi. Urwwarwidane, ubwiru, ubwishingizi, filime z’Indiya na filime za Rwanda.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Filime zisobanuye mu Kinyarwanda — Fiesta Flix',
    description:
      'Reba filime zisobanuye mu Kinyarwanda — streaming HD, gukuramo offline, no gukunda abasobanuzi.',
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/icon-512.png`, width: 512, height: 512, alt: 'Fiesta Flix — Filime zisobanuye mu Kinyarwanda' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filime zisobanuye mu Kinyarwanda — Fiesta Flix',
    description:
      'Reba filime zisobanuye mu Kinyarwanda — streaming HD, gukuramo offline, no gukunda abasobanuzi.',
    images: [`${SITE_URL}/icon-512.png`],
  },
};

export default async function HomePage() {
  const { movies, tvShows } = await getCatalog();

  return <HomeView trendingMovies={movies.slice(0, 8)} popularMovies={movies.slice(8, 24)} tvShows={tvShows} allMovies={movies} />;
}
