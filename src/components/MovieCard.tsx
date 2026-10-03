'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Download, Send, Star, Volume2 } from 'lucide-react';
import type { Movie } from '@/lib/movieData';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      className="group relative bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 flex flex-col"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform"
              aria-label={`Play ${movie.title}`}
            >
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </button>

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

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {movie.trending ? (
            <span className="bg-gradient-to-r from-primary to-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-md">
              Trending
            </span>
          ) : <span />}

          {movie.quality && (
            <span className="bg-black/75 backdrop-blur text-zinc-200 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-zinc-700/60">
              {movie.quality}
            </span>
          )}
        </div>

        {/* Narrator Badge at Bottom of Poster */}
        {movie.narrator && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none group-hover:opacity-0 transition-opacity">
            <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-500/30">
              <Volume2 className="w-3 h-3" />
              <span className="truncate">{movie.narrator}</span>
            </span>
          </div>
        )}
      </div>

      {/* Movie Details Footer */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">
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

          <span className="text-[11px] text-zinc-400 group-hover:text-primary transition-colors font-medium">
            Quick Preview →
          </span>
        </div>
      </div>
    </div>
  );
}
