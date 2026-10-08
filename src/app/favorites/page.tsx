'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoviePreviewModal from '@/components/MoviePreviewModal';
import { useFavorites } from '@/contexts/FavoritesContext';
import { movieData, type Movie } from '@/lib/movieData';
import { sanitizeImage } from '@/lib/catalogMap';
import { Heart, Play, Download, Send, Star, Volume2, Trash2, Film, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFavorites = favorites.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.narrator && m.narrator.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 mb-2">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>My Saved Watchlist</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Favorite Movies & Series
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {favorites.length} {favorites.length === 1 ? 'title' : 'titles'} saved for offline watching and quick access
              </p>
            </div>

            {favorites.length > 0 && (
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter your favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>

          {/* Favorites List or Empty State */}
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center max-w-lg mx-auto space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                <Heart className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Your Watchlist is Empty</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Tap the heart icon on any movie card or detail page to save it here for fast playback and instant Telegram download links.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/movies"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105"
                >
                  <Film className="w-4 h-4" />
                  <span>Explore Movies Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Suggestions to add */}
              <div className="pt-8 border-t border-zinc-800 text-left">
                <h3 className="text-sm font-bold text-zinc-300 mb-4">
                  Trending Recommendations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {movieData.slice(0, 3).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie)}
                      className="group cursor-pointer bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 hover:border-primary/40 transition-colors flex items-center gap-2.5"
                    >
                      <div className="relative w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                        <Image
                          src={movie.image}
                          alt={movie.title}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate group-hover:text-primary">
                          {movie.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">{movie.genre}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-8">
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <p>No movies matched your search &quot;{searchQuery}&quot;.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  <AnimatePresence>
                    {filteredFavorites.map((movie) => (
                      <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="group relative bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/20 flex flex-col"
                      >
                        {/* Poster */}
                        <div
                          onClick={() => setSelectedMovie(movie)}
                          className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800 cursor-pointer"
                        >
                          <Image
                            src={sanitizeImage(movie.image, movie.title, movie.genre)}
                            alt={movie.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            referrerPolicy="no-referrer"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(movie.id);
                            }}
                            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur transition-colors shadow-md"
                            title="Remove from favorites"
                            aria-label="Remove from favorites"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Narrator badge */}
                          {movie.narrator && (
                            <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                              <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30">
                                <Volume2 className="w-3 h-3" />
                                <span className="truncate">{movie.narrator}</span>
                              </span>
                            </div>
                          )}

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3.5 flex flex-col flex-1 justify-between">
                          <div>
                            <h3
                              onClick={() => setSelectedMovie(movie)}
                              className="text-sm sm:text-base font-bold text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                            >
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span className="truncate">{movie.genre}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/80">
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{movie.rating}</span>
                            </div>

                            {movie.telegramChannelPost && (
                              <a
                                href={movie.telegramChannelPost}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Download in Telegram"
                                className="text-xs text-[#229ED9] hover:underline font-semibold flex items-center gap-1"
                              >
                                <Send className="w-3 h-3 -rotate-12" />
                                <span>Telegram</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <MoviePreviewModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
