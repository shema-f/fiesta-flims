import HomeView from '@/components/HomeView';
import { getCatalog } from '@/lib/catalog';

// Dynamically revalidate so admin additions appear immediately!
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { movies, tvShows } = await getCatalog();

  // The latest movies are ordered by newest first, ensure they lead the trending rotation
  const trendingList = movies.filter((movie) => movie.trending);
  const trendingMovies = trendingList.length > 0 ? trendingList : movies.slice(0, 10);
  const popularMovies = movies.filter((movie) => !movie.trending);

  return (
    <HomeView
      trendingMovies={trendingMovies}
      popularMovies={popularMovies}
      tvShows={tvShows}
      allMovies={movies}
    />
  );
}
