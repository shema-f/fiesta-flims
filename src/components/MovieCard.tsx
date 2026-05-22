'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/movieData';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="block">
      <div 
        className="bg-card rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
        onClick={(e) => {
          if (onSelect) {
            e.preventDefault();
            onSelect(movie);
          }
        }}
      >
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <div className="flex gap-2 mb-3">
            <button className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <button className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
        {movie.trending && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-orange-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            Trending
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 truncate">{movie.title}</h3>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{movie.year}</span>
          <span>•</span>
          <span>{movie.genre}</span>
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffe66d">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {movie.rating}
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
}
