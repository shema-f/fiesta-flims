import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { interpretersData, TOTAL_PLATFORM_MOVIES, TOTAL_PLATFORM_EPISODES } from '@/lib/interpreters';

export const dynamic = 'force-dynamic';

/** GET /api/interpreters — the Agasobanuye voice directory with real movies and follower stats. */
export async function GET() {
  try {
    const totalPlatformMovies = await prisma.movie.count({ where: { isActive: true } });
    const dbInterpreters = await prisma.interpreter.findMany({
      orderBy: { moviesCount: 'desc' },
    });

    const countMap = new Map(dbInterpreters.map((i) => [i.slug.toLowerCase(), i.moviesCount || 0]));

    const merged = interpretersData.map((it) => {
      const dbCount = countMap.get(it.slug.toLowerCase());
      return {
        ...it,
        catalogMoviesCount: dbCount !== undefined && dbCount > 0 ? dbCount : it.catalogMoviesCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: merged,
      totalPlatformMovies: totalPlatformMovies > 0 ? totalPlatformMovies : TOTAL_PLATFORM_MOVIES,
      totalPlatformEpisodes: TOTAL_PLATFORM_EPISODES,
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: interpretersData,
      totalPlatformMovies: TOTAL_PLATFORM_MOVIES,
      totalPlatformEpisodes: TOTAL_PLATFORM_EPISODES,
    });
  }
}
