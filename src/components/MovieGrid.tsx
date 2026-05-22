import MovieCard from './MovieCard';
import { Movie } from '@/lib/movieData';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  id?: string;
  onMovieSelect?: (movie: Movie) => void;
}

export default function MovieGrid({ title, movies, id, onMovieSelect }: MovieGridProps) {
  return (
    <section id={id} className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <a href="#" className="text-primary hover:text-orange-400 font-medium transition-colors">
            See All
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onSelect={onMovieSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}
