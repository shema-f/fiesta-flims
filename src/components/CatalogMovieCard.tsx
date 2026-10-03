'use client';

import Link from 'next/link';
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
    <Link href={`/movies/${movie.id}`} className="block">
      <div className="bg-card rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
          {movie.thumbnailUrl ? (
            <img
              src={movie.thumbnailUrl}
              alt={movie.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-white/20">
              🎬
            </div>
          )}

          {movie.isFeatured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-orange-400 px-3 py-1.5 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-full text-xs font-medium">
            {formatDuration(movie.duration)}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Now
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold mb-1 truncate">{movie.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{movie.releaseYear ?? '—'}</span>
            <span>•</span>
            <span className="truncate">{movie.genre}</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="flex items-center gap-1 text-primary font-semibold truncate">
              🎤 {movie.narrator}
            </span>
            <span className="flex items-center gap-1 text-muted flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {formatViews(movie.views)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
