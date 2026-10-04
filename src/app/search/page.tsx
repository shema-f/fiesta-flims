'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieTile from '@/components/MovieTile';
import InterpreterCard from '@/components/interpreter/InterpreterCard';
import { Search as SearchIcon } from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import type { Interpreter } from '@/lib/interpreters';

interface ParsedQuery {
  interpreters: string[];
  genre?: string;
  sort: string;
  intents: string[];
}

interface SearchResponse {
  movies: Movie[];
  interpreters: Interpreter[];
  parsed: ParsedQuery | null;
}

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

const EXAMPLES = [
  'Rocky action movies',
  'funny movies by Giti',
  'best horror',
  'newest releases',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [result, setResult] = useState<SearchResponse>({ movies: [], interpreters: [], parsed: null });
  const [status, setStatus] = useState<LoadStatus>('idle');

  useEffect(() => {
    if (!query.trim()) {
      setResult({ movies: [], interpreters: [], parsed: null });
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((json) => {
        setResult(json.data);
        setStatus('ready');
      })
      .catch((err) => {
        if ((err as Error)?.name === 'AbortError') return;
        setStatus('error');
      });
    return () => controller.abort();
  }, [query]);

  const total = result.movies.length + result.interpreters.length;

  return (
    <div className="container-tight py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What do you want to watch?
        </h1>
        {query && (
          <p className="mt-1 text-sm text-muted">
            {status === 'loading' ? 'Searching…' : `${total} result${total === 1 ? '' : 's'} for “${query}”`}
          </p>
        )}

        {result.parsed && result.parsed.intents.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.parsed.intents.map((intent) => (
              <span key={intent} className="chip">
                {intent}
              </span>
            ))}
          </div>
        )}
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Link key={ex} href={`/search?q=${encodeURIComponent(ex)}`} className="chip">
              <SearchIcon className="h-3 w-3" />
              {ex}
            </Link>
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="py-16 text-center text-sm text-muted">Search is unavailable right now.</p>
      )}

      {result.interpreters.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">Interpreters</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.interpreters.map((i) => (
              <InterpreterCard key={i.id} interpreter={i} />
            ))}
          </div>
        </section>
      )}

      {result.movies.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Movies</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {result.movies.map((movie) => (
              <MovieTile key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {status === 'ready' && total === 0 && query && (
        <div className="py-20 text-center">
          <div className="text-5xl">🔍</div>
          <h2 className="mt-4 text-xl font-bold">Nothing matched</h2>
          <p className="mt-2 text-sm text-muted">
            Try an interpreter name, a genre, or “best horror”.
          </p>
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
            <div className="container-tight py-12 text-center text-sm text-muted">Loading search…</div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
