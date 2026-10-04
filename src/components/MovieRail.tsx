import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Movie } from '@/lib/movieData';
import MovieTile from '@/components/MovieTile';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  href?: string;
}

export default function MovieRail({ title, subtitle, movies, href }: MovieRailProps) {
  if (movies.length === 0) return null;

  return (
    <section className="container-tight py-6">
      <div className="section-title">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-foreground"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {movies.map((movie) => (
          <MovieTile key={movie.id} movie={movie} className="w-36 shrink-0 sm:w-40" />
        ))}
      </div>
    </section>
  );
}
