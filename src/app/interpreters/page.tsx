'use client';

import { useMemo, useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterpreterCard from '@/components/interpreter/InterpreterCard';
import { interpretersData as initialInterpreters, formatFollowers } from '@/lib/interpreters';
import { Search, Mic2 } from 'lucide-react';

export default function InterpretersPage() {
  const [interpreters, setInterpreters] = useState(initialInterpreters);
  const [totalMoviesCount, setTotalMoviesCount] = useState(138);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/interpreters')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setInterpreters(json.data);
          if (json.totalPlatformMovies) {
            setTotalMoviesCount(json.totalPlatformMovies);
          }
        }
      })
      .catch(() => {});
  }, []);

  const featured = useMemo(() => interpreters.filter((i) => i.featured), [interpreters]);
  const totalFollowers = useMemo(
    () => interpreters.reduce((sum, i) => sum + i.followers, 0),
    [interpreters]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return interpreters;
    return interpreters.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.tags.some((t) => t.toLowerCase().includes(term)) ||
        i.city.toLowerCase().includes(term)
    );
  }, [query, interpreters]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-24">
        <section className="container-tight pb-10 pt-8 text-center">
          <span className="eyebrow">Abasobanuzi</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            The voices behind <span className="text-primary">Agasobanuye</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            In Kinyarwanda cinema the narrator is part of the story. Follow your favourite voice and
            discover everything they have ever translated.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Interpreters', value: interpreters.length },
              { label: 'Total Movies We Have', value: `${totalMoviesCount} (616 Eps)` },
              { label: 'Featured Voices', value: featured.length },
              { label: 'Real Followers', value: formatFollowers(totalFollowers) },
            ].map((stat) => (
              <div key={stat.label} className="card-surface px-4 py-3 border border-white/10 rounded-2xl">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-tight pb-12">
          <div className="section-title">
            <h2 className="text-lg font-bold">Featured</h2>
            <Mic2 className="h-4 w-4 text-muted" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((i) => (
              <InterpreterCard key={i.id} interpreter={i} />
            ))}
          </div>
        </section>

        <section className="container-tight">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, genre or city…"
              className="w-full rounded-xl border border-white/[0.08] bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">No interpreters match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((i) => (
                <InterpreterCard key={i.id} interpreter={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
