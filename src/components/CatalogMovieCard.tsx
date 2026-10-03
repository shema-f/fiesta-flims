'use client';

import Link from 'next/link';
import { Play, Volume2, Eye, Send, Film } from 'lucide-react';
import type { ApiMovie } from '@/lib/apiTypes';

interface CatalogMovieCardProps {
  movie: ApiMovie;
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export default function CatalogMovieCard({ movie }: CatalogMovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <div className="bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full">
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800">
          {movie.thumbnailUrl ? (
            <img
              src={movie.thumbnailUrl}
              alt={movie.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-2">
              <Film className="w-10 h-10 stroke-1" />
              <span className="text-xs uppercase font-bold tracking-wider">No Poster</span>
            </div>
          )}

          {movie.isFeatured && (
            <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-primary to-orange-400 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-md">
              Featured
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur text-zinc-300 px-2 py-1 rounded-md text-[11px] font-semibold border border-zinc-700/60">
            {formatDuration(movie.duration)}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold shadow-lg shadow-primary/40">
              <Play className="w-4 h-4 fill-current" />
              Watch Now
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{movie.releaseYear ?? '2025'}</span>
              <span>•</span>
              <span className="truncate">{movie.genre}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{movie.narrator}</span>
            </span>
            <span className="flex items-center gap-1 text-zinc-400 shrink-0">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(movie.views)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
