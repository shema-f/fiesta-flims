'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieTile from '@/components/MovieTile';
import InterpreterCard from '@/components/interpreter/InterpreterCard';
import { Search as SearchIcon, X, Sparkles, Filter, Film, Mic2 } from 'lucide-react';
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

const POPULAR_SUGGESTIONS = [
  'Rocky Kimomo action',
  'Junior Giti Bollywood',
  'Sankara war movies',
  '4K Ultra HD',
  'Rwanda Cinema',
  'Comedy Agasobanuye',
  'Dylan anime',
  'Romantic dramas',
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [result, setResult] = useState<SearchResponse>({ movies: [], interpreters: [], parsed: null });
  const [status, setStatus] = useState<LoadStatus>('idle');

  useEffect(() => {
    setInputVal(query);
  }, [query]);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  const total = result.movies.length + result.interpreters.length;

  return (
    <div className="container-tight py-10">
      {/* Search Header & Interactive Bar */}
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
          Search Agasobanuye Movies & Voices
        </h1>

        {/* Dedicated Search Input Field */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition-all max-w-2xl"
        >
          <div className="pl-3 text-zinc-400">
            <SearchIcon className="w-5 h-5 text-primary" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by title, voice interpreter (Rocky, Giti...), or genre..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm sm:text-base placeholder:text-zinc-500 py-1.5 px-2"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                router.push('/search');
              }}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Query Status / Result count */}
        {query && (
          <div className="flex items-center gap-2 pt-1 text-sm text-zinc-400">
            {status === 'loading' ? (
              <span className="flex items-center gap-2 text-primary font-semibold">
                <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Searching catalog...
              </span>
            ) : (
              <p>
                Found <strong className="text-white">{total}</strong> {total === 1 ? 'match' : 'matches'} for &ldquo;<span className="text-white font-semibold">{query}</span>&rdquo;
              </p>
            )}
          </div>
        )}

        {/* AI Intent Tags */}
        {result.parsed && result.parsed.intents.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {result.parsed.intents.map((intent) => (
              <span
                key={intent}
                className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-semibold"
              >
                {intent}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Quick Searches */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Popular Searches:
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SUGGESTIONS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setInputVal(ex);
                router.push(`/search?q=${encodeURIComponent(ex)}`);
              }}
              className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <SearchIcon className="h-3 w-3 text-zinc-500" />
              <span>{ex}</span>
            </button>
          ))}
        </div>
      </div>

      {status === 'error' && (
        <div className="py-16 text-center text-sm text-zinc-400">
          Search service encountered a temporary error. Please try again.
        </div>
      )}

      {/* Matching Interpreters */}
      {result.interpreters.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Mic2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white">Voice Interpreters ({result.interpreters.length})</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.interpreters.map((i) => (
              <InterpreterCard key={i.id} interpreter={i} />
            ))}
          </div>
        </section>
      )}

      {/* Matching Movies */}
      {result.movies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white">Movies & Series ({result.movies.length})</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
            {result.movies.map((m) => (
              <MovieTile key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}

      {/* No results empty state */}
      {status === 'ready' && total === 0 && (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-8 max-w-lg mx-auto">
          <SearchIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No exact matches found</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Try checking for spelling, or search for popular interpreters like <strong>Rocky Kimomo</strong>, <strong>Junior Giti</strong>, or <strong>Sankara</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20 md:pb-0">
      <Header />
      <main className="flex-1 pt-14 sm:pt-16">
        <Suspense fallback={<div className="container-tight py-20 text-center text-sm text-zinc-400">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
