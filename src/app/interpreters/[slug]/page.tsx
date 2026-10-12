import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { movieUrl } from '@/lib/slugs';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { getCatalog } from '@/lib/catalog';
import { getInterpreter, interpretersData } from '@/lib/interpreters';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, personJsonLd } from '@/components/seo/structuredData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 600;

export function generateStaticParams() {
  return interpretersData.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const interpreter = getInterpreter(slug);
  if (!interpreter) return { title: 'Umusobanuzi ntibuboneka' };

  const canonical = `${SITE_URL}/interpreters/${interpreter.slug}`;
  return {
    title: `${interpreter.name} — Umusobanuzi w’ifilime mu Kinyarwanda`,
    description:
      `${interpreter.name} ni umusobanuzi w’ifilime mu Kinyarwanda kuri ${SITE_NAME}. ${interpreter.bio.slice(0, 140)}…`,
    alternates: { canonical },
    openGraph: {
      type: 'profile',
      url: canonical,
      title: `${interpreter.name} — Umusobanuzi w’ifilime`,
      description: interpreter.bio.slice(0, 160),
      images: [{ url: interpreter.image, width: 500, height: 500, alt: interpreter.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${interpreter.name} — Umusobanuzi w’ifilime`,
      description: interpreter.bio.slice(0, 160),
    },
  };
}

export default async function InterpreterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const interpreter = getInterpreter(slug);
  if (!interpreter) notFound();

  const { movies } = await getCatalog();
  const filmography = movies.filter((m) => (m.narrator || '').toLowerCase() === interpreter.name.toLowerCase());

  const canonical = `${SITE_URL}/interpreters/${interpreter.slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Ahabanza', href: '/' },
      { name: 'Abasobanuzi', href: '/interpreters' },
      { name: interpreter.name },
    ]),
    personJsonLd({
      name: interpreter.name,
      description: interpreter.bio,
      image: interpreter.image,
      url: canonical,
      jobTitle: 'Umusobanuzi w’ifilime mu Kinyarwanda',
      worksFor: { name: SITE_NAME },
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
          <Link href="/interpreters" className="hover:text-primary">Abasobanuzi</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-300">{interpreter.name}</span>
        </nav>

        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative h-28 w-28 shrink-0 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-800">
              <Image src={interpreter.image} alt={interpreter.name} fill sizes="112px" className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{interpreter.name}</h1>
              <p className="mt-1 text-sm text-primary font-semibold">Umusobanuzi w’ifilime mu Kinyarwanda</p>
              <p className="mt-3 text-zinc-300 leading-relaxed max-w-2xl">{interpreter.bio}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
                <span>{filmography.length} ifilime mu katalog</span>
                {interpreter.tags?.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">{t}</span>) ?? []}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-black text-white tracking-tight mb-4">Ifilime zisobanuye na {interpreter.name}</h2>
          {filmography.length === 0 ? (
            <p className="text-zinc-400 text-sm">Hano ifilime zisobanuye na {interpreter.name} zihari muri katalog ya Fiesta Flix.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filmography.map((m) => (
                <Link key={m.id} href={movieUrl(m)} className="group block">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 bg-zinc-800 border border-zinc-800 group-hover:border-primary/50 transition-all">
                    <Image src={m.image} alt={`${m.title} — na ${interpreter.name}`} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw" referrerPolicy="no-referrer" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-primary">{m.title}</h3>
                  <p className="text-xs text-zinc-400">{m.year} • {m.genre}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}