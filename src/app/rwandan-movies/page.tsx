'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Download, Star, Film, Clapperboard, Search, Sparkles } from 'lucide-react';

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
  isFeatured?: boolean;
  contentType?: 'movie' | 'series';
  episodesCount?: number;
}

type Category = 'all' | 'Movie' | 'Series' | 'Documentary';
type SortKey = 'newest' | 'az' | 'rating';

const PAGE_SIZE = 100; // the API clamps limit to 100

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Movie', label: 'Movies' },
  { id: 'Series', label: 'Series' },
  { id: 'Documentary', label: 'Documentaries' },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'az', label: 'A–Z' },
  { id: 'rating', label: 'Top rated' },
];

function typeOf(title: RwandaTitle): 'Movie' | 'Series' | 'Documentary' {
  if (title.contentType === 'series' || (title.episodesCount && title.episodesCount > 1)) {
    return 'Series';
  }
  return title.genre?.toLowerCase().includes('documentary') ? 'Documentary' : 'Movie';
}

/**
 * Fetch every Rwandan original. The API caps `limit` at 100, so we page
 * through until X-Total-Count is satisfied — the catalogue has 100 today
 * and must not silently truncate when title 101 arrives.
 */
async function fetchAllRwandanTitles(): Promise<RwandaTitle[]> {
  const all: RwandaTitle[] = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `/api/movies?origin=rwanda&limit=${PAGE_SIZE}&page=${page}&sortBy=title&order=asc`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows: RwandaTitle[] = Array.isArray(json?.data) ? json.data : [];
    all.push(...rows);
    const total = Number(res.headers.get('x-total-count') || all.length);
    if (rows.length < PAGE_SIZE || all.length >= total) break;
  }
  return all;
}

export default function RwandaCinemaPage() {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [query, setQuery] = useState('');
  const [titles, setTitles] = useState<RwandaTitle[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Real catalogue from Neon — the page used to ship a hardcoded list of
  // placeholder titles whose links 404'd. The origin set is marked by
  // scripts/import-rwandan-movies.js (rightsOwner = 'Rwandan Cinema').
  useEffect(() => {
    let cancelled = false;
    fetchAllRwandanTitles()
      .then((rows) => {
        if (cancelled) return;
        setTitles(rows);
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
    let list = titles;
    if (category !== 'all') list = list.filter((t) => typeOf(t) === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.genre || '').toLowerCase().includes(q) ||
          String(t.year).includes(q)
      );
    }
    const sorted = [...list];
    if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    return sorted;
  }, [titles, category, query, sort]);

  const stats = useMemo(() => {
    if (titles.length === 0) return null;
    const genres = new Set(titles.map((t) => t.genre).filter(Boolean));
    const years = titles.map((t) => t.year).filter(Boolean);
    return {
      total: titles.length,
      genres: genres.size,
      from: Math.min(...years),
      to: Math.max(...years),
      featured: titles.filter((t) => t.isFeatured).length,
    };
  }, [titles]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-6 pt-8">
          <span className="eyebrow">🇷🇼 Rwanda Cinema</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The home of <span className="text-primary">Rwandan film</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Foreign films are available everywhere — Rwandan cinema is where our identity lives.
            Originals in Kinyarwanda — watch them here, download them offline, no interpreter needed.
          </p>

          {stats && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="chip">{stats.total} titles</span>
              <span className="chip">{stats.genres} genres</span>
              <span className="chip">{stats.from}–{stats.to}</span>
              {stats.featured > 0 && (
                <span className="chip border-primary/30 text-primary">
                  <Sparkles className="h-3 w-3" /> {stats.featured} trending
                </span>
              )}
            </div>
          )}
        </section>

        {/* Search + filters — sticky on mobile where the grid is long. */}
        <section className="container-tight sticky top-16 z-20 -mx-4 mb-6 bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:border-white/[0.06] sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Shakisha umutwe wa filime… (search titles)"
                aria-label="Search Rwandan movies"
                className="w-full rounded-xl border border-white/10 bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={category === c.id ? 'btn-primary px-3.5 py-2 text-xs' : 'chip px-3.5 py-2 text-xs'}
                >
                  {c.label}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort movies"
                className="chip px-3 py-2 text-xs focus:border-primary/50 focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-surface text-foreground">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
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
              {query
                ? `No titles match “${query}” — try another word.`
                : 'No titles in this category yet — the full Rwandan collection appears under “All”.'}
            </p>
          )}

          {status === 'ready' && filtered.length > 0 && (
            <>
              <p className="mb-3 text-xs text-muted" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? 'title' : 'titles'}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((title) => (
                  <div key={title.id} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-surface transition-colors group-hover:border-primary/40">
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
                      {title.isFeatured && (
                        <span className="absolute right-2.5 top-2.5 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-glow">
                          Trending
                        </span>
                      )}

                      {/* Always visible on touch — hover-only actions are
                          unreachable on phones, which is most of Rwanda. */}
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="flex items-center gap-2 text-[11px] text-white/80">
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {Number(title.rating || 0).toFixed(1)}
                          </span>
                          <span>·</span>
                          <span>{title.year}</span>
                        </div>
                        <div className="mt-2 flex gap-2 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
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
            </>
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
