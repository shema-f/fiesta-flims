'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MovieCarousel from '@/components/MovieCarousel';
import MovieGrid from '@/components/MovieGrid';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { movieData, tvShowsData, Movie } from '@/lib/movieData';

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    alert(`Selected: ${movie.title}\nYear: ${movie.year}\nRating: ${movie.rating}`);
  };

  const trendingMovies = movieData.filter(movie => movie.trending);
  const popularMovies = movieData.filter(movie => !movie.trending);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <div id="trending">
          <MovieCarousel 
            title="Trending Now" 
            movies={trendingMovies} 
            onMovieSelect={handleMovieSelect}
          />
        </div>
        <div id="movies">
          <MovieGrid 
            title="Popular Movies" 
            movies={popularMovies} 
            onMovieSelect={handleMovieSelect}
          />
        </div>
        <div id="series">
          <MovieGrid 
            title="TV Shows" 
            movies={tvShowsData} 
            onMovieSelect={handleMovieSelect}
          />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
