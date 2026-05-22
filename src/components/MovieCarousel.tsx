import MovieCard from './MovieCard';
import { Movie } from '@/lib/movieData';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onMovieSelect?: (movie: Movie) => void;
}

export default function MovieCarousel({ title, movies, onMovieSelect }: MovieCarouselProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <a href="#" className="text-primary hover:text-orange-400 font-medium transition-colors">
            See All
          </a>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-5 scroll-smooth">
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[200px] md:min-w-[220px]">
              <MovieCard movie={movie} onSelect={onMovieSelect} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
