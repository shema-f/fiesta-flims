'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import type { Movie } from '@/lib/movieData';

interface MovieTileProps {
  movie: Movie;
  badge?: string;
  className?: string;
}

const FALLBACK_POSTER = '/fallback-poster.png';

/** Minimal, modern poster tile used across rails and grids. */
export default function MovieTile({ movie, badge, className }: MovieTileProps) {
  const [imgSrc, setImgSrc] = useState(movie.image);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className={`group block focus:outline-none ${className ?? ''}`}
      aria-label={movie.title}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={movie.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_POSTER)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

        {badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {badge}
          </span>
        )}

        {typeof movie.rating === 'number' && movie.rating > 0 && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-amber-400 backdrop-blur">
            <Star className="h-3 w-3 fill-amber-400" />
            {movie.rating.toFixed(1)}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <span className="flex translate-y-2 items-center justify-center rounded-xl bg-primary py-2 text-xs font-bold text-white opacity-0 shadow-glow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            Watch
          </span>
        </div>
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {movie.year}
          {movie.narrator ? ` · ${movie.narrator}` : ''}
        </p>
      </div>
    </Link>
  );
}
