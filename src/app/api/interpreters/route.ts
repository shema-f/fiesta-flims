import { NextResponse } from 'next/server';
import { interpretersData, TOTAL_PLATFORM_MOVIES, TOTAL_PLATFORM_EPISODES } from '@/lib/interpreters';

export const dynamic = 'force-dynamic';

/** GET /api/interpreters — the Agasobanuye voice directory with real movies and follower stats. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: interpretersData,
    totalPlatformMovies: TOTAL_PLATFORM_MOVIES,
    totalPlatformEpisodes: TOTAL_PLATFORM_EPISODES,
  });
}
