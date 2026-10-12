import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCatalog } from '@/lib/catalog';
import { movieUrl, slugify } from '@/lib/slugs';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/components/seo/structuredData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GENRES } from '@/lib/genreLanding';

export const revalidate = 600;

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return { title: 'Ubwoko ntibuboneka' };

  const canonical = `${SITE_URL}/genres/${genre.slug}`;
  return {
    title: `${genre.labelRw} · Reba filime mu Kinyarwanda`,
    description: genre.descriptionRw,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${genre.labelRw} · ${SITE_NAME}`,
      description: genre.descriptionRw,
      images: [{ url: `${SITE_URL}/icon-512.png`, width: 512, height: 512, alt: genre.labelRw }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${genre.labelRw} · ${SITE_NAME}`,
      description: genre.descriptionRw,
    },
  };
}

export default async function GenreLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) notFound();

  const { movies } = await getCatalog();
  const matches = movies.filter((m) => slugify(m.genre || '').includes(slug) || (m.genre || '').toLowerCase().includes(genre.slug));

  // Thin/empty pages must not be indexed — a category with no films is a
  // doorway page, which Google Search Essentials discourages.
  if (matches.length === 0) notFound();

  const canonical = `${SITE_URL}/genres/${genre.slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Ahabanza', href: '/' },
      { name: 'Filime', href: '/movies' },
      { name: genre.labelRw },
    ]),
    collectionPageJsonLd({
      name: `${genre.labelRw} · Reba filime mu Kinyarwanda`,
      description: genre.descriptionRw,
      url: canonical,
      inLanguage: 'rw',
      count: matches.length,
    }),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <JsonLd data={jsonLd} />
      <Header />

      <main className="flex-1 pt-20 container mx-auto px-4 sm:px-6 py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 mb-4">
          <Link href="/" className="hover:text-primary">Ahabanza</Link>
          <span className="mx-1.5">/</span>
          <Link href="/movies" className="hover:text-primary">Filime</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-300">{genre.labelRw}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{genre.labelRw}</h1>
          <p className="text-zinc-300 max-w-2xl leading-relaxed">{genre.introRw}</p>
          <p className="text-xs text-zinc-500 mt-2">{matches.length} filime</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {matches.map((m) => (
            <Link key={m.id} href={movieUrl(m)} className="group block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2.5 bg-zinc-800 border border-zinc-800 group-hover:border-primary/50 transition-all">
                <Image src={m.image} alt={`${m.title} — ${genre.labelRw}`} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw" referrerPolicy="no-referrer" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h2 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{m.title}</h2>
              <p className="text-xs text-zinc-400">{m.year} • {m.narrator || genre.name}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
