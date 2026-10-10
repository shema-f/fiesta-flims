'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Send, Star, Volume2, Heart } from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion } from 'motion/react';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { isFavorite, toggleFavorite, getUserRating } = useFavorites();
  const favorited = isFavorite(movie.id);
  const userRating = getUserRating(movie.id);
  const [imgSrc, setImgSrc] = useState(movie.image);

  const displayRating = userRating !== undefined ? (userRating * 2).toFixed(1) : movie.rating;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => onSelect && onSelect(movie)}
      className="group relative bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 transition-colors duration-300 cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 flex flex-col touch-manipulation select-none"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800">
        <Image
          src={imgSrc || movie.image || '/fallback-poster.jpg'}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc('/fallback-poster.jpg')}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite Heart Button (Top-Right on Mobile & Desktop) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(movie);
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-all shadow-lg ${
            favorited
              ? 'bg-rose-500 text-white shadow-rose-500/40'
              : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10'
          }`}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Trending Badge (Top-Left) */}
        {movie.trending && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="bg-gradient-to-r from-primary to-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-md">
              Trending
            </span>
          </div>
        )}

        {/* Hover / Tap Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </div>

            {movie.telegramChannelPost && (
              <a
                href={movie.telegramChannelPost}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Download in Telegram"
                className="w-10 h-10 rounded-full bg-[#229ED9] hover:bg-[#1E8BC0] flex items-center justify-center text-white transition-all hover:scale-110 shadow-md shadow-[#229ED9]/30"
              >
                <Send className="w-4 h-4 -rotate-12 translate-x-px" />
              </a>
            )}
          </div>
        </div>

        {/* Narrator Badge at Bottom of Poster */}
        {movie.narrator && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none group-hover:opacity-0 transition-opacity">
            <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/30">
              <Volume2 className="w-3 h-3" />
              <span className="truncate">{movie.narrator}</span>
            </span>
          </div>
        )}
      </div>

      {/* Movie Details Footer */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-xs sm:text-base font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400">
            <span>{movie.year}</span>
            <span>•</span>
            <span className="truncate">{movie.genre}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{displayRating}</span>
            {userRating !== undefined && (
              <span className="text-[10px] text-zinc-400 font-normal"> (You)</span>
            )}
          </div>

          <span className="text-[10px] sm:text-[11px] text-primary font-bold">
            Watch →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
