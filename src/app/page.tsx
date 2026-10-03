'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MovieCarousel from '@/components/MovieCarousel';
import MovieGrid from '@/components/MovieGrid';
import MoviePreviewModal from '@/components/MoviePreviewModal';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { movieData, tvShowsData, Movie } from '@/lib/movieData';
import { Send, ShieldCheck, Zap, Download, Film, Sparkles } from 'lucide-react';

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const trendingMovies = movieData.filter((movie) => movie.trending);
  const popularMovies = movieData.filter((movie) => !movie.trending);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />

        {/* Telegram Storage Spotlight Banner */}
        <section className="container mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-20">
          <div className="rounded-3xl bg-gradient-to-r from-sky-950/80 via-zinc-900 to-zinc-900 border border-sky-500/30 p-6 sm:p-8 backdrop-blur shadow-2xl shadow-sky-950/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#229ED9]/40">
                  <Send className="w-7 h-7 -rotate-12 translate-x-0.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Telegram High-Speed Movie Cloud
                    </h3>
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30">
                      Unlimited & Free
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 max-w-2xl">
                    Every movie in our catalog is backed up to Telegram channels and bots. Download in 1-click on your phone, tablet, or PC with zero file size restrictions and resumable downloads.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="https://t.me/fiestaflix_movies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-sm shadow-lg shadow-[#229ED9]/30 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4 -rotate-12" />
                  <span>Join Movie Channel</span>
                </a>
                <a
                  href="https://t.me/FiestaFlixBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Start Telegram Bot</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Movies Section */}
        <div id="trending" className="py-6">
          <MovieCarousel
            title="🔥 Trending Now (Agasobanuye)"
            movies={trendingMovies}
            onMovieSelect={handleMovieSelect}
          />
        </div>

        {/* Popular Movies Section */}
        <div id="movies" className="py-4">
          <MovieGrid
            title="🎬 All-Time Popular Movies"
            movies={popularMovies}
            onMovieSelect={handleMovieSelect}
          />
        </div>

        {/* TV Series Section */}
        <div id="series" className="py-4">
          <MovieGrid
            title="📺 Trending TV Shows & Series"
            movies={tvShowsData}
            onMovieSelect={handleMovieSelect}
          />
        </div>

        <CTA />
      </main>

      <Footer />

      {/* Modern Netflix-grade Movie Preview & Telegram Modal */}
      <MoviePreviewModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
