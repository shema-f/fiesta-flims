import HomeView from '@/components/HomeView';
import { getCatalog } from '@/lib/catalog';

// Cache the catalog for a minute; the data is read-heavy and safe to cache.
export const revalidate = 60;

export default async function Home() {
  const { movies, tvShows } = await getCatalog();

  const trendingMovies = movies.filter((movie) => movie.trending);
  const popularMovies = movies.filter((movie) => !movie.trending);

  return (
    <HomeView trendingMovies={trendingMovies} popularMovies={popularMovies} tvShows={tvShows} />
  );
}
