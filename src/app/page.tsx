import type { Metadata } from 'next';
import HomeView, { type HomeRail } from '@/components/HomeView';
import { getCatalog } from '@/lib/catalog';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import type { Movie } from '@/lib/movieData';

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
      'Reba filime zisobanuye mu Kinyarwanda kuri internet — streaming HD, gukuramo offline, no gukunda abasobanuzi.',
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/icon-512.png`, width: 512, height: 512, alt: 'Fiesta Flix — Filime zisobanuye mu Kinyarwanda' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filime zisobanuye mu Kinyarwanda — Fiesta Flix',
    description:
      'Reba filime zisobanuye mu Kinyarwanda kuri internet — streaming HD, gukuramo offline, no gukunda abasobanuzi.',
    images: [`${SITE_URL}/icon-512.png`],
  },
};

const RWANDAN_CINEMA = 'Rwandan Cinema';

/**
 * Rwandan cinema is the reason the platform exists, so the trending rail must
 * never fill up entirely with imported titles. When none of the newest titles
 * is a Rwandan original, swap the last slot for the highest-rated one.
 */
function withRwandanInTrending(base: Movie[], all: Movie[], size = 8): Movie[] {
  if (base.some((m) => m.rightsOwner === RWANDAN_CINEMA)) return base.slice(0, size);
  const rwandan = all.filter((m) => m.rightsOwner === RWANDAN_CINEMA);
  if (rwandan.length === 0) return base.slice(0, size);
  const best = [...rwandan].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  return [...base.slice(0, size - 1), best];
}

/** Browse-by-category rails — one per classification the catalogue supports. */
function buildRails(movies: Movie[]): HomeRail[] {
  const byGenre = (needle: string) =>
    movies.filter((m) => (m.genre || '').toLowerCase().includes(needle)).slice(0, 16);

  const rails: HomeRail[] = [
    { title: '💥 Action', subtitle: 'Umugambi n’imirasire ikomeye', href: '/genres/action', movies: byGenre('action') },
    { title: '🎭 Drama', subtitle: 'Ubwiru n’imyume y’abantu', href: '/genres/drama', movies: byGenre('drama') },
    { title: '🚀 Sci-Fi', subtitle: 'Imibereho n’ikoranabuhanga', href: '/genres/sci-fi', movies: byGenre('sci-fi') },
    { title: '🎨 Animation', subtitle: 'Ifilime z’abana n’abakuru', href: '/genres/animation', movies: byGenre('animation') },
    { title: '😂 Comedy', subtitle: 'Ubwishingizi', href: '/genres/comedy', movies: byGenre('comedy') },
    { title: '❤️ Romance', subtitle: 'Uburyano', href: '/genres/romance', movies: byGenre('romance') },
    { title: '🇮🇳 Indian Films', subtitle: 'Bollywood mu Kinyarwanda', href: '/genres/indian', movies: byGenre('indian') },
    {
      title: '🇷🇼 Rwandan Films',
      subtitle: 'Filime za Rwanda — siyo buri aho ubona',
      href: '/rwandan-movies',
      movies: movies.filter((m) => m.rightsOwner === RWANDAN_CINEMA).slice(0, 16),
    },
  ];

  // A rail with one or two cards reads as broken — hide it until it has stock.
  return rails.filter((rail) => rail.movies.length >= 3);
}

export default async function HomePage() {
  const { movies, tvShows, source } = await getCatalog();

  // The Series rail used to render the bundled placeholder shows (Dark Realms,
  // City of Dreams, …) no matter what was actually published. Real series come
  // from the catalogue; the bundle only survives on the dev seed path, before
  // anything has been imported.
  const series = source === 'database' ? movies.filter((m) => m.contentType === 'series') : tvShows;
  const trendingMovies = withRwandanInTrending(movies.slice(0, 8), movies);
  const popularMovies = movies.slice(8, 24);

  return (
    <HomeView
      trendingMovies={trendingMovies}
      popularMovies={popularMovies}
      tvShows={series}
      rails={buildRails(movies)}
      allMovies={movies}
    />
  );
}
