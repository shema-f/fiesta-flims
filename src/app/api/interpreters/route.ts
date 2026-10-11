import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { interpretersData } from '@/lib/interpreters';
import { getCatalog } from '@/lib/catalog';
import { buildInterpreterStats, withLiveCounts } from '@/lib/interpreterCounts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/interpreters — the Agasobanuye voice directory.
 *
 * Counts are computed live from the same catalogue the profile pages render,
 * so "N in catalog" always equals the number of titles actually listed.
 */
export async function GET() {
  const { movies, tvShows } = await getCatalog();
  const stats = buildInterpreterStats(movies, tvShows);
  const merged = withLiveCounts(interpretersData, stats);

  // Real follower counts — everyone who clicked Follow on an interpreter.
  try {
    const grouped = await prisma.follow.groupBy({
      by: ['followingId'],
      where: { followingType: 'INTERPRETER' },
      _count: { _all: true },
    });
    const followersBySlug = new Map(grouped.map((g) => [g.followingId, g._count._all]));
    for (const it of merged) {
      const extra = followersBySlug.get(it.slug) ?? 0;
      if (extra) it.followers = (it.followers ?? 0) + extra;
    }
  } catch {
    // No database in this environment — the static counts still ship.
  }

  // Persist the computed counts so the database agrees with what the site
  // shows (best-effort — a read must never fail because of a write).
  try {
    for (const it of merged) {
      const live = stats.countsBySlug.get(it.slug);
      if (live === undefined) continue;
      await prisma.interpreter.upsert({
        where: { slug: it.slug },
        create: { name: it.name, slug: it.slug, moviesCount: live },
        update: { moviesCount: live },
      });
    }
  } catch {
    // No database in this environment — the computed counts still ship.
  }

  return NextResponse.json({
    success: true,
    data: merged,
    totalPlatformMovies: stats.totalMovies,
    totalPlatformEpisodes: stats.totalEpisodes,
    unattributedMovies: stats.unattributedMovies,
  });
}
