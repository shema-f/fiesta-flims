'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import type { Movie } from '@/lib/movieData';
import { dbMovieToView, type DbMovieLike } from '@/lib/catalogMap';
import type { Narrator } from '@/lib/narratorData';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [interpreters, setInterpreters] = useState<Narrator[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');

  useEffect(() => {
    if (!query) {
      setMovies([]);
      setInterpreters([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setStatus('loading');
      try {
        const [moviesRes, interpretersRes] = await Promise.all([
          fetch(`/api/movies?q=${encodeURIComponent(query)}&limit=50`, {
            cache: 'no-store',
            signal: controller.signal,
          }),
          fetch('/api/interpreters', { signal: controller.signal }),
        ]);

        const moviesJson = moviesRes.ok ? await moviesRes.json() : { data: [] };
        const interpretersJson = interpretersRes.ok ? await interpretersRes.json() : { data: [] };
        const term = query.toLowerCase();

        setMovies(((moviesJson.data ?? []) as DbMovieLike[]).map(dbMovieToView));
        setInterpreters(
          ((interpretersJson.data ?? []) as Narrator[]).filter(
            (n) =>
              n.name.toLowerCase().includes(term) ||
              n.bio.toLowerCase().includes(term) ||
              n.tags.some((tag) => tag.toLowerCase().includes(term))
          )
        );
        setStatus('ready');
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setStatus('error');
      }
    };

    void run();
    return () => controller.abort();
  }, [query]);

  const totalResults = movies.length + interpreters.length;

  return (
    <div className="container mx-auto px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Search Results
          {query && <span className="text-muted font-normal"> for &quot;{query}&quot;</span>}
        </h1>
        <p className="text-muted">
          {status === 'loading'
            ? 'Searching…'
            : totalResults === 0
              ? 'No results found. Try a different search term.'
              : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
        </p>
      </div>

      {interpreters.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Interpreters ({interpreters.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {interpreters.map((narrator) => (
              <div
                key={narrator.id}
                className="bg-card rounded-2xl p-5 border border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={narrator.image} alt={narrator.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-center mb-2">{narrator.name}</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffe66d">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="font-bold">{narrator.rating}</span>
                </div>
                <p className="text-muted text-xs text-center mb-3">{narrator.moviesCount} movies</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {narrator.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {movies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Movies ({movies.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {status === 'ready' && totalResults === 0 && query && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-muted mb-6">We couldn&apos;t find anything matching &quot;{query}&quot;.</p>
          <div className="space-y-2">
            <p className="text-sm text-muted">Try:</p>
            <ul className="text-sm text-muted space-y-1">
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
              <li>• Searching by genre (e.g., &quot;Action&quot;, &quot;Comedy&quot;)</li>
              <li>• Searching by narrator (e.g., &quot;Rocky&quot;, &quot;Junior Giti&quot;)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16">
        <Suspense
          fallback={
            <div className="container mx-auto px-6 py-12 text-center text-muted">Loading search...</div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
