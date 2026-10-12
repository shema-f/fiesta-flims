import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { findMovieOrSeries } from '@/lib/movieData';
import { sanitizeImage } from '@/lib/catalogMap';
import { slugify, movieUrl } from '@/lib/slugs';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { movieJsonLd, breadcrumbJsonLd, videoObjectJsonLd } from '@/components/seo/structuredData';
import MovieDetailClient from '@/components/movie/MovieDetailClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// The catalogue changes when an admin publishes a title. ISR keeps movie pages
// fast on mobile networks while picking up new/edited films within 5 minutes —
// far better for Rwanda's mobile users than force-dynamic on every hit.
export const revalidate = 300;

interface ResolvedMovie {
  /** Database id (or seed numeric id) handed to the interactive layer. */
  id: string;
  slug: string;
  title: string;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  genre: string | null;
  narrator: string | null;
  releaseYear: number | null;
  durationSeconds: number | null;
  /** A real, playable https URL when one exists — drives VideoObject JSON-LD. */
  playableUrl: string | null;
  updatedAt: string | null;
  isSeries: boolean;
}

/**
 * Resolve the URL param to a movie. Accepts the canonical slug, a database id
 * or a legacy numeric seed id, so old links keep working — the caller then
 * redirects anything that isn't the canonical slug to avoid duplicate URLs.
 */
async function resolveMovie(param: string): Promise<ResolvedMovie | null> {
  // 1. Database: match slug OR id (active, published/ready only — never expose
  //    unpublished or archived films, which would be a soft-404 to Google).
  try {
    const db = await prisma.movie.findFirst({
      where: {
        OR: [{ slug: param }, { id: param }],
        isActive: true,
        status: { in: ['READY', 'PUBLISHED'] },
      },
    });
    if (db) {
      const resObj = db.resolutions && typeof db.resolutions === 'object' ? (db.resolutions as any) : null;
      const episodes = Array.isArray(resObj?.episodes) ? resObj.episodes : [];
      const isSeries = episodes.length > 1 || /\bseason\s*\d/i.test(db.title || '');
      const poster = sanitizeImage(db.poster || db.thumbnailUrl, db.title, db.genre);
      const backdrop = sanitizeImage(db.backdrop || poster, db.title, db.genre);
      const playable =
        (typeof db.fileUrl === 'string' && /^https?:\/\//i.test(db.fileUrl) ? db.fileUrl : null) ||
        (typeof resObj?.['1080p'] === 'string' ? resObj['1080p'] : null) ||
        null;
      return {
        id: db.id,
        slug: db.slug,
        title: db.title,
        description: db.description || db.synopsis || null,
        poster,
        backdrop,
        genre: db.genre || null,
        narrator: db.narrator || null,
        releaseYear: db.releaseYear ?? null,
        durationSeconds: db.duration > 0 ? db.duration : null,
        playableUrl: playable,
        updatedAt: db.updatedAt ? new Date(db.updatedAt).toISOString() : null,
        isSeries,
      };
    }
  } catch {
    // Database unreachable — fall through to the seed catalogue.
  }

  // 2. Seed catalogue: findMovieOrSeries matches numeric id OR title-slug.
  const seed = findMovieOrSeries(param);
  if (seed) {
    const isSeries = seed.contentType === 'series' || Boolean(seed.episodes && seed.episodes.length > 1);
    const durationSeconds = seed.duration
      ? (parseInt(seed.duration.split('h')[0] || '0', 10) || 0) * 3600 +
        (parseInt((seed.duration.split('h')[1] || '').replace('m', '') || '0', 10) || 0) * 60 ||
        null
      : null;
    return {
      id: String(seed.id),
      slug: slugify(seed.title),
      title: seed.title,
      description: seed.description || null,
      poster: sanitizeImage(seed.image, seed.title, seed.genre),
      backdrop: sanitizeImage(seed.backdrop || seed.image, seed.title, seed.genre),
      genre: seed.genre || null,
      narrator: seed.narrator || null,
      releaseYear: seed.year ?? null,
      durationSeconds,
      playableUrl: seed.directStreamUrl && /^https?:\/\//i.test(seed.directStreamUrl) ? seed.directStreamUrl : null,
      updatedAt: null,
      isSeries,
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const movie = await resolveMovie(decodeURIComponent(slug));
  if (!movie) return { title: 'Filime ntibashije kuboneka' };

  const canonical = `${SITE_URL}${movieUrl(movie)}`;
  const title = movie.title;
  // Unique, natural Kinyarwanda description per film — never a duplicated stub.
  const description = movie.description
    ? `${movie.description} Reba ${title} mu Kinyarwanda${
        movie.narrator ? `, agasobanuye na ${movie.narrator}` : ''
      } kuri ${SITE_NAME}.`
    : `Reba filime ${title} mu Kinyarwanda${movie.narrator ? `, agasobanuye na ${movie.narrator}` : ''} kuri ${SITE_NAME}. Streaming ya HD n'ikuramo offline.`;

  const images = movie.poster ? [{ url: movie.poster, width: 500, height: 750, alt: title }] : [];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'video.movie',
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: movie.poster ? [movie.poster] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const param = decodeURIComponent(slug);
  const movie = await resolveMovie(param);

  // Unavailable / inactive / unpublished → real 404, not a placeholder page.
  if (!movie) notFound();

  const canonicalSlug = movie.slug || slugify(movie.title);
  // Any legacy or non-canonical URL (numeric id, database id, off-slug) 301s to
  // the single stable slug URL so Google indexes one page per movie.
  if (param !== canonicalSlug) {
    permanentRedirect(movieUrl(movie));
  }

  const canonical = `${SITE_URL}/movies/${canonicalSlug}`;

  // Structured data from real fields only — no fabricated ratings or reviews.
  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: 'Ahabanza', href: '/' },
      { name: 'Filime', href: '/movies' },
      { name: movie.title },
    ]),
    movieJsonLd({
      title: movie.title,
      description: movie.description,
      image: movie.poster,
      durationSeconds: movie.durationSeconds,
      genre: movie.genre,
      releaseYear: movie.releaseYear,
      datePublished: movie.releaseYear ? `${movie.releaseYear}-01-01` : null,
      url: `/movies/${canonicalSlug}`,
      narrator: movie.narrator,
    }),
  ];

  // VideoObject only when the page actually has a playable video AND we have a
  // real thumbnail — omit rather than emit something misleading.
  if (movie.playableUrl && movie.poster) {
    const video = videoObjectJsonLd({
      name: movie.title,
      description: movie.description,
      thumbnailUrl: movie.poster,
      contentUrl: movie.playableUrl,
      uploadDate: movie.updatedAt,
      durationSeconds: movie.durationSeconds,
    });
    if (video) jsonLd.push(video);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <JsonLd data={jsonLd} />
      <Header />

      {/* Server-rendered, crawlable essentials. Google sees the title, Kinyarwanda
          synopsis, narrator, genre and year in the HTML — not an empty shell. */}
      <main className="flex-1 pt-20">
        <article className="container mx-auto px-4 sm:px-6 py-8">
          <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 mb-4">
            <Link href="/movies" className="hover:text-primary">
              Filime
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-zinc-300">{movie.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8">
            {movie.poster && (
              <Image
                src={movie.poster}
                alt={`${movie.title} — filime isobanuye mu Kinyarwanda`}
                width={300}
                height={450}
                priority
                referrerPolicy="no-referrer"
                className="w-48 sm:w-60 md:w-72 rounded-2xl border border-zinc-800 shadow-2xl object-cover shrink-0"
              />
            )}

            <div className="flex-1 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {movie.genre && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-semibold uppercase tracking-wide">{movie.genre}</span>
                  </>
                )}
                {movie.isSeries && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300 font-semibold">Filime z&apos;ibice (Series)</span>
                  </>
                )}
              </div>

              {movie.narrator && (
                <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold w-fit">
                  Agasobanuye na: <strong className="text-emerald-300">{movie.narrator}</strong>
                </p>
              )}

              {movie.description && (
                <p className="text-zinc-300 leading-relaxed max-w-2xl">{movie.description}</p>
              )}
            </div>
          </div>
        </article>

        {/* Interactive layer: player, downloads, favorites, comments. Mounts after
            the crawlable content so a slow network never hides the essentials. */}
        <MovieDetailClient movieId={movie.id} />
      </main>

      <Footer />
    </div>
  );
}
