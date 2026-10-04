'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Download, 
  Send, 
  Star, 
  Volume2, 
  Clock, 
  HardDrive, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Pause,
  PlayCircle
} from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';

interface TrendingShowcaseProps {
  movies: Movie[];
  onSelectMovie?: (movie: Movie) => void;
}

export default function TrendingShowcase({ movies, onSelectMovie }: TrendingShowcaseProps) {
  const trendingMovies = movies;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const activeMovie = trendingMovies[currentIndex] || trendingMovies[0];
  const favorited = activeMovie ? isFavorite(activeMovie.id) : false;

  // 3-second automated rotation timer
  useEffect(() => {
    if (isPaused || trendingMovies.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, trendingMovies.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length);
  };

  if (!activeMovie) return null;

  return (
    <section 
      className="container mx-auto px-4 sm:px-6 my-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-primary/10">
        {/* 3-Second Visual Progress Countdown Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/80 z-30 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? '0%' : '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-primary via-orange-400 to-amber-300"
          />
        </div>

        {/* Ambient Blur Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMovie.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={activeMovie.backdrop || activeMovie.image}
                alt={activeMovie.title}
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-cover filter blur-2xl brightness-75 scale-110"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          {/* Top Label & Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                Trending Showcase • 3s Live Rotation
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
                {isPaused ? '(Paused on hover)' : 'Auto-switching every 3s'}
              </span>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700/60 transition-colors"
                aria-label="Previous trending movie"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700/60 transition-colors"
                aria-label="Next trending movie"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Showcase Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Animated High-Res Poster with 3D Depth */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMovie.id}
                  initial={{ opacity: 0, y: 20, rotateY: -15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, rotateY: 15, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  onClick={() => onSelectMovie && onSelectMovie(activeMovie)}
                  className="group relative w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 border-2 border-primary/40 cursor-pointer bg-zinc-900"
                >
                  <Image
                    src={activeMovie.image}
                    alt={activeMovie.title}
                    fill
                    priority
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Rating Tag */}
                  <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur px-2.5 py-1 rounded-lg text-amber-400 text-xs font-black flex items-center gap-1 border border-amber-400/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{activeMovie.rating}</span>
                  </div>

                  {/* Quality Pill */}
                  {activeMovie.quality && (
                    <div className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md">
                      {activeMovie.quality}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/50 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Movie Description & Info */}
            <div className="md:col-span-8 lg:col-span-9 space-y-4 text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMovie.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-zinc-400">
                    <span className="font-bold text-zinc-200">{activeMovie.year}</span>
                    <span>•</span>
                    <span className="text-primary font-extrabold uppercase">{activeMovie.genre}</span>
                    {activeMovie.duration && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeMovie.duration}
                        </span>
                      </>
                    )}
                    {activeMovie.fileSize && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {activeMovie.fileSize}
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {activeMovie.title}
                  </h2>

                  {/* Narrator Pill */}
                  {activeMovie.narrator && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold backdrop-blur">
                      <Volume2 className="w-4 h-4" />
                      <span>Agasobanuye: <strong className="text-emerald-300 font-extrabold">{activeMovie.narrator}</strong></span>
                    </div>
                  )}

                  <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    {activeMovie.description ||
                      'Stream in full HD with authentic Kinyarwanda narration or download instantly via Telegram without speed limits.'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectMovie && onSelectMovie(activeMovie)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch Preview</span>
                    </button>

                    {activeMovie.telegramChannelPost && (
                      <a
                        href={activeMovie.telegramChannelPost}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#229ED9]/25 transition-all hover:scale-105"
                      >
                        <Send className="w-4 h-4 -rotate-12" />
                        <span>Download in Telegram</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavorite(activeMovie)}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all border ${
                        favorited
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
                          : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                      <span>{favorited ? 'Favorited' : 'Save'}</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Thumbnails Indicator (Click to jump) */}
              <div className="flex items-center justify-center md:justify-start gap-2 pt-4">
                {trendingMovies.map((movie, idx) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-16 h-10 border-2 border-primary ring-2 ring-primary/40 scale-105'
                        : 'w-10 h-7 opacity-50 hover:opacity-100 border border-zinc-700'
                    }`}
                    title={movie.title}
                  >
                    <Image
                      src={movie.image}
                      alt={movie.title}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
