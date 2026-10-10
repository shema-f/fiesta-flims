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
