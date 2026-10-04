/**
 * Storage tiering (spec §24).
 *
 * Promotion/demotion only changes the `tier` label on a Movie. It never deletes
 * or moves bytes automatically — moving objects between providers is an explicit
 * admin action, which keeps the automation safe.
 */

import { prisma } from '@/lib/prisma';

export interface TieringConfig {
  hotViewThreshold: number;
  coldViewThreshold: number;
  coldIdleDays: number;
}

export function tieringConfig(): TieringConfig {
  return {
    hotViewThreshold: Number(process.env.TIER_HOT_VIEWS || 10_000),
    coldViewThreshold: Number(process.env.TIER_COLD_VIEWS || 10),
    coldIdleDays: Number(process.env.TIER_COLD_IDLE_DAYS || 90),
  };
}

export interface TieringReport {
  promoted: { id: string; title: string; viewCount: number }[];
  demoted: { id: string; title: string; viewCount: number }[];
  config: TieringConfig;
}

export async function runTiering(): Promise<TieringReport> {
  const config = tieringConfig();
  const idleCutoff = new Date(Date.now() - config.coldIdleDays * 24 * 60 * 60 * 1000);

  const report: TieringReport = { promoted: [], demoted: [], config };

  try {
    // Promote popular movies to HOT (never to WARM automatically — WARM is
    // an intermediate state set explicitly or by a future banding rule).
    const hotCandidates = await prisma.movie.findMany({
      where: { viewCount: { gte: config.hotViewThreshold }, tier: { not: 'HOT' } },
      select: { id: true, title: true, viewCount: true },
      take: 100,
    });
    for (const movie of hotCandidates) {
      await prisma.movie.update({ where: { id: movie.id }, data: { tier: 'HOT' } });
      report.promoted.push({ id: movie.id, title: movie.title, viewCount: movie.viewCount });
    }

    // Demote rarely-watched, long-idle movies to COLD.
    const coldCandidates = await prisma.movie.findMany({
      where: {
        viewCount: { lt: config.coldViewThreshold },
        tier: { not: 'COLD' },
        OR: [{ lastAccessedAt: { lt: idleCutoff } }, { lastAccessedAt: null }],
      },
      select: { id: true, title: true, viewCount: true },
      take: 100,
    });
    for (const movie of coldCandidates) {
      await prisma.movie.update({ where: { id: movie.id }, data: { tier: 'COLD' } });
      report.demoted.push({ id: movie.id, title: movie.title, viewCount: movie.viewCount });
    }
  } catch (err) {
    console.warn('[tiering] aborted:', (err as Error)?.message);
  }

  return report;
}
