'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import { movieData } from '@/lib/movieData';
import { narratorsData } from '@/lib/narratorData';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const searchResults = (() => {
    if (!query) return { movies: [], interpreters: [] };

    const searchTerm = query.toLowerCase();
    
    const movies = movieData.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.genre.toLowerCase().includes(searchTerm) ||
      movie.narrator?.toLowerCase().includes(searchTerm) ||
      movie.year.toString().includes(searchTerm)
    );

    const interpreters = narratorsData.filter(narrator =>
      narrator.name.toLowerCase().includes(searchTerm) ||
      narrator.bio.toLowerCase().includes(searchTerm) ||
      narrator.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    return { movies, interpreters };
  })();

  const { movies, interpreters } = searchResults;
  const totalResults = movies.length + interpreters.length;

  return (
    <div className="container mx-auto px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Search Results
          {query && (
            <span className="text-muted font-normal"> for "{query}"</span>
          )}
        </h1>
        <p className="text-muted">
          {totalResults === 0 
            ? 'No results found. Try a different search term.'
            : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {interpreters.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Interpreters ({interpreters.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {interpreters.map((narrator) => (
              <div key={narrator.id} className="bg-card rounded-2xl p-5 border border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                    <img 
                      src={narrator.image} 
                      alt={narrator.name}
                      className="w-full h-full object-cover"
                    />
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
          <h2 className="text-2xl font-bold mb-6">
            Movies ({movies.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {totalResults === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-muted mb-6">
            We couldn't find anything matching "{query}".
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted">Try:</p>
            <ul className="text-sm text-muted space-y-1">
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
              <li>• Searching by genre (e.g., "Action", "Comedy")</li>
              <li>• Searching by narrator (e.g., "Rocky", "Junior Giti")</li>
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
        <Suspense fallback={<div className="container mx-auto px-6 py-12 text-center text-muted">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
