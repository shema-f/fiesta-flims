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
  // shows (best-effort — a read must never fail because of a write). Read the
  // rows ONCE and touch only the counts that actually changed: the previous
  // sequential upsert-per-interpreter turned this read endpoint into a
  // 50-roundtrip stall (30s+ against a remote database).
  try {
    const rows = await prisma.interpreter.findMany({ select: { slug: true, moviesCount: true } });
    const current = new Map(rows.map((r) => [r.slug, r.moviesCount]));
    const missing: { name: string; slug: string; moviesCount: number }[] = [];
    const changed: Promise<unknown>[] = [];
    for (const it of merged) {
      const live = stats.countsBySlug.get(it.slug);
      if (live === undefined) continue;
      if (!current.has(it.slug)) {
        missing.push({ name: it.name, slug: it.slug, moviesCount: live });
      } else if (current.get(it.slug) !== live) {
        changed.push(
          prisma.interpreter.update({ where: { slug: it.slug }, data: { moviesCount: live } })
        );
      }
    }
    if (missing.length) {
      await prisma.interpreter.createMany({ data: missing, skipDuplicates: true });
    }
    if (changed.length) await Promise.all(changed);
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
