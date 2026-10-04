'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogMovieCard from '@/components/CatalogMovieCard';
import type { ApiMovie } from '@/lib/apiTypes';

type LoadStatus = 'loading' | 'ready' | 'error';

// Matches the API's default page size; the catalog must never be fetched whole.
const PAGE_SIZE = 24;

export default function MoviesPage() {
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [activeGenre, setActiveGenre] = useState('All');
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMovies = useCallback(async (page = 1) => {
    const isFirstPage = page === 1;
    if (isFirstPage) setStatus('loading');
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/movies?page=${page}&limit=${PAGE_SIZE}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch movies');
      }
      const batch: ApiMovie[] = json.data ?? [];
      setMovies((prev) => (isFirstPage ? batch : [...prev, ...batch]));

      const countHeader = res.headers.get('X-Total-Count');
      if (countHeader !== null) {
        setTotal(parseInt(countHeader, 10) || 0);
      } else {
        setTotal((prev) => (isFirstPage ? batch.length : prev + batch.length));
      }
      setStatus('ready');
    } catch {
      // A failed "load more" keeps the already-loaded catalog on screen.
      if (isFirstPage) setStatus('error');
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  const genres = useMemo(
    () => ['All', ...Array.from(new Set(movies.map((movie) => movie.genre)))],
    [movies]
  );

  const filteredMovies = useMemo(() => {
    const term = query.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genre === activeGenre;
      const matchesQuery =
        term === '' ||
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term) ||
        movie.narrator.toLowerCase().includes(term) ||
        (movie.releaseYear?.toString() ?? '').includes(term);
      return matchesGenre && matchesQuery;
    });
  }, [movies, activeGenre, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">All Movies</h1>
            <p className="text-muted">
              Browse our full catalog of movies and TV shows
            </p>
          </div>

          {status === 'loading' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[2/3] bg-white/10" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📡</div>
              <h2 className="text-2xl font-bold mb-2">Couldn&apos;t load movies</h2>
              <p className="text-muted mb-6">
                We couldn&apos;t reach the movie catalog. Please try again.
              </p>
              <button
                onClick={() => loadMovies(1)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="mb-8">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full md:w-96 px-4 py-3 bg-card border border-white/10 rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeGenre === genre
                        ? 'bg-gradient-to-r from-primary to-orange-400 text-white'
                        : 'bg-card border border-white/10 text-muted hover:bg-white/10 hover:text-foreground'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {movies.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🍿</div>
                  <h2 className="text-2xl font-bold mb-2">No Movies Yet</h2>
                  <p className="text-muted">
                    The catalog is empty. Check back soon!
                  </p>
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold mb-2">No Movies Found</h2>
                  <p className="text-muted">
                    We couldn&apos;t find anything matching your search.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-muted mb-6">
                    {filteredMovies.length} title
                    {filteredMovies.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
                    {filteredMovies.map((movie) => (
                      <CatalogMovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>

                  {movies.length < total && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => loadMovies(Math.floor(movies.length / PAGE_SIZE) + 1)}
                        disabled={loadingMore}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold hover:-translate-y-1 hover:shadow-xl transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {loadingMore ? 'Loading…' : `Load more (${total - movies.length} left)`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
