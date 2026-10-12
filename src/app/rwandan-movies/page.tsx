'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Download, Star, Film, Clapperboard } from 'lucide-react';

/** A Rwandan cinema original as served by GET /api/movies?origin=rwanda. */
interface RwandaTitle {
  id: string;
  slug: string;
  title: string;
  year: number;
  genre: string;
  rating: number;
  image: string;
  description?: string | null;
}

type Category = 'all' | 'Movie' | 'Documentary';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Movie', label: 'Movies' },
  { id: 'Documentary', label: 'Documentaries' },
];

function typeOf(title: RwandaTitle): 'Movie' | 'Documentary' {
  return title.genre?.toLowerCase().includes('documentary') ? 'Documentary' : 'Movie';
}

export default function RwandaCinemaPage() {
  const [category, setCategory] = useState<Category>('all');
  const [titles, setTitles] = useState<RwandaTitle[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Real catalogue from Neon — the page used to ship a hardcoded list of
  // placeholder titles whose links 404'd. The origin set is marked by
  // scripts/import-rwandan-movies.js (rightsOwner = 'Rwandan Cinema').
  useEffect(() => {
    let cancelled = false;
    fetch('/api/movies?origin=rwanda&limit=100&sortBy=title&order=asc', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => {
        if (cancelled) return;
        setTitles(Array.isArray(json?.data) ? json.data : []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (category === 'all') return titles;
    return titles.filter((t) => typeOf(t) === category);
  }, [titles, category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-10 pt-8">
          <span className="eyebrow">🇷🇼 Rwanda Cinema</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The home of <span className="text-primary">Rwandan film</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Foreign films are available everywhere — Rwandan cinema is where our identity lives.
            Originals in Kinyarwanda — watch them here, download them offline, no interpreter needed.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={
                  category === c.id
                    ? 'btn-primary px-4 py-2 text-xs'
                    : 'chip px-4 py-2 text-xs'
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="container-tight">
          {status === 'loading' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          )}

          {status === 'error' && (
            <p className="card-surface p-6 text-sm text-muted">
              We couldn&apos;t load the catalogue right now — please refresh the page.
            </p>
          )}

          {status === 'ready' && filtered.length === 0 && (
            <p className="card-surface p-6 text-sm text-muted">
              No titles in this category yet — the full Rwandan collection appears under
              &quot;All&quot;.
            </p>
          )}

          {status === 'ready' && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((title) => (
                <div key={title.id} className="group">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={title.image || '/fallback-poster.png'}
                      alt={title.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                      {typeOf(title)}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="flex items-center gap-2 text-[11px] text-white/80">
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {Number(title.rating || 0).toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{title.year}</span>
                      </div>
                      <div className="mt-2 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Link
                          href={`/movies/${title.slug}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Watch
                        </Link>
                        <Link
                          href={`/movies/${title.slug}`}
                          className="flex items-center justify-center rounded-lg border border-white/20 bg-black/40 px-2.5 py-2 text-white backdrop-blur"
                          aria-label={`Download ${title.title}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-2.5 truncate text-sm font-semibold group-hover:text-primary">
                    {title.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {title.year} · {title.genre} · Kinyarwanda
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="container-tight mt-16">
          <div className="card-surface grid gap-6 p-8 sm:grid-cols-3">
            {[
              { icon: Clapperboard, title: 'Fiesta Originals', text: 'Produce your own shorts and series — a catalogue no competitor can copy.' },
              { icon: Film, title: 'Partner studios', text: 'Give interpreters and studios an official creator page with followers.' },
              { icon: Star, title: 'Agasobanuye Awards', text: 'An annual celebration of the voices that shape Rwandan cinema.' },
            ].map((f) => (
              <div key={f.title}>
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
