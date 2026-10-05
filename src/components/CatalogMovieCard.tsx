'use client';

import Link from 'next/link';
import { Play, Volume2, Eye, Film, Star, Tv } from 'lucide-react';
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

function formatViews(views: number | undefined) {
  if (!views) return '12.4K';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export default function CatalogMovieCard({ movie }: CatalogMovieCardProps) {
  const ratingVal = movie.rating ? movie.rating.toFixed(1) : '8.5';
  const viewsVal = movie.views || movie.viewCount || 15400;

  const anyMovie = movie as any;
  const isSeries =
    anyMovie.contentType === 'series' ||
    anyMovie.type === 'Series' ||
    anyMovie.type === 'series' ||
    (typeof anyMovie.durationString === 'string' && (anyMovie.durationString.includes('Eps') || anyMovie.durationString.includes('Season'))) ||
    (movie.id && Number(movie.id) >= 101 && Number(movie.id) <= 106);

  const durationLabel = isSeries
    ? anyMovie.durationString || (anyMovie.episodesCount ? `Season ${anyMovie.seasonsCount || 1} (${anyMovie.episodesCount} Eps)` : 'Series')
    : formatDuration(movie.duration);

  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <div className="bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full">
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800">
          {movie.thumbnailUrl || movie.poster ? (
            <img
              src={movie.thumbnailUrl || movie.poster || ''}
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

          {/* Rating Badge Top Left */}
          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur text-amber-400 px-2 py-0.5 rounded-full text-xs font-black border border-amber-400/30 flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingVal}</span>
          </div>

          {/* Content Type Badge Top Right: Movie vs Series */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
            {isSeries ? (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-900/50">
                <Tv className="w-3 h-3" />
                Series
              </span>
            ) : (
              <span className="bg-black/70 backdrop-blur border border-white/20 text-zinc-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                Movie
              </span>
            )}

            {movie.isFeatured && (
              <span className="bg-gradient-to-r from-primary to-orange-400 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md">
                Featured
              </span>
            )}
          </div>

          {/* Duration or Seasons/Episodes Pill Bottom Right */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur text-zinc-300 px-2 py-1 rounded-md text-[11px] font-semibold border border-zinc-700/60 flex items-center gap-1">
            {isSeries && <Tv className="w-3 h-3 text-purple-400" />}
            <span>{durationLabel}</span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold shadow-lg shadow-primary/40">
              <Play className="w-4 h-4 fill-current" />
              {isSeries ? 'Watch Episodes' : 'Watch Movie'}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isSeries ? 'text-purple-400' : 'text-primary'}`}>
                {isSeries ? 'TV Series' : 'Feature Film'}
              </span>
            </div>
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
              <span className="truncate">{movie.narrator || 'Rocky Kimomo'}</span>
            </span>
            <span className="flex items-center gap-1 text-zinc-400 shrink-0 font-medium">
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              {formatViews(viewsVal)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
