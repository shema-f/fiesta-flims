import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, deviceLabel } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/behavior-report
 *
 * A 14-day user-behavior report for the admin studio, built entirely from
 * first-party tables (ViewEvent, Download, User, Favorite, WatchHistory) so
 * it works with zero third-party credentials. Google Analytics remains the
 * source for search terms and referrers; this endpoint answers "what did
 * people do inside the app" and turns it into concrete improvement hints.
 */

const WINDOW_DAYS = 14;
const COMPARE_DAYS = 7; // last 7 days vs the 7 before that

interface DayCount {
  day: string;
  views: number;
  downloads: number;
  users: number;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (WINDOW_DAYS - 1) * 86400_000);
    windowStart.setUTCHours(0, 0, 0, 0);
    const compareStart = new Date(windowStart.getTime() - COMPARE_DAYS * 86400_000);
    const recentStart = new Date(now.getTime() - COMPARE_DAYS * 86400_000);

    // --- Daily series (UTC day buckets, Postgres) -------------------------
    const [viewDays, downloadDays, userDays] = await Promise.all([
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "startedAt")::date AS day, count(*)::bigint AS count
        FROM "ViewEvent" WHERE "startedAt" >= ${windowStart}
        GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt")::date AS day, count(*)::bigint AS count
        FROM "Download" WHERE "createdAt" >= ${windowStart}
        GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt")::date AS day, count(*)::bigint AS count
        FROM "User" WHERE "createdAt" >= ${windowStart}
        GROUP BY 1 ORDER BY 1`,
    ]);

    const byDay = new Map<string, DayCount>();
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(windowStart.getTime() + i * 86400_000);
      byDay.set(isoDay(d), { day: isoDay(d), views: 0, downloads: 0, users: 0 });
    }
    const bump = (rows: { day: Date; count: bigint }[], key: 'views' | 'downloads' | 'users') => {
      for (const r of rows) {
        const row = byDay.get(isoDay(r.day));
        if (row) row[key] = Number(r.count);
      }
    };
    bump(viewDays, 'views');
    bump(downloadDays, 'downloads');
    bump(userDays, 'users');
    const daily = [...byDay.values()];

    // --- Period totals + 7-day-over-7-day trend ---------------------------
    const [viewsRecent, viewsPrev, downloadsRecent, downloadsPrev, usersRecent, usersPrev] =
      await Promise.all([
        prisma.viewEvent.count({ where: { startedAt: { gte: recentStart } } }),
        prisma.viewEvent.count({ where: { startedAt: { gte: compareStart, lt: recentStart } } }),
        prisma.download.count({ where: { createdAt: { gte: recentStart } } }),
        prisma.download.count({ where: { createdAt: { gte: compareStart, lt: recentStart } } }),
        prisma.user.count({ where: { createdAt: { gte: recentStart } } }),
        prisma.user.count({ where: { createdAt: { gte: compareStart, lt: recentStart } } }),
      ]);

    // --- Engagement quality ------------------------------------------------
    const [windowViews, completedViews, watchAgg, deviceGroups, qualityGroups] =
      await Promise.all([
        prisma.viewEvent.count({ where: { startedAt: { gte: windowStart } } }),
        prisma.viewEvent.count({
          where: { startedAt: { gte: windowStart }, completed: true },
        }),
        prisma.viewEvent.aggregate({
          where: { startedAt: { gte: windowStart }, watchedSeconds: { gt: 0 } },
          _avg: { watchedSeconds: true },
          _sum: { watchedSeconds: true },
        }),
        prisma.viewEvent.groupBy({
          by: ['device'],
          where: { startedAt: { gte: windowStart } },
          _count: { _all: true },
        }),
        prisma.viewEvent.groupBy({
          by: ['quality'],
          where: { startedAt: { gte: windowStart } },
          _count: { _all: true },
          orderBy: { _count: { quality: 'desc' } },
          take: 6,
        }),
      ]);

    // --- Top content -------------------------------------------------------
    const [topViewGroups, topDownloadGroups, topGenreRaw] = await Promise.all([
      prisma.viewEvent.groupBy({
        by: ['movieId'],
        where: { startedAt: { gte: windowStart } },
        _count: { _all: true },
        orderBy: { _count: { movieId: 'desc' } },
        take: 10,
      }),
      prisma.download.groupBy({
        by: ['movieId'],
        where: { createdAt: { gte: windowStart } },
        _count: { _all: true },
        orderBy: { _count: { movieId: 'desc' } },
        take: 10,
      }),
      prisma.$queryRaw<{ genre: string; count: bigint }[]>`
        SELECT COALESCE(NULLIF(TRIM(m.genre), ''), 'Unspecified') AS genre, count(*)::bigint AS count
        FROM "ViewEvent" v JOIN "Movie" m ON m.id = v."movieId"
        WHERE v."startedAt" >= ${windowStart}
        GROUP BY 1 ORDER BY count DESC LIMIT 8`,
    ]);

    const viewMovieIds = topViewGroups.map((g) => g.movieId);
    const downloadMovieIds = topDownloadGroups.map((g) => g.movieId);
    const [viewMovies, downloadMovies] = await Promise.all([
      prisma.movie.findMany({
        where: { id: { in: viewMovieIds } },
        select: { id: true, title: true, genre: true },
      }),
      prisma.movie.findMany({
        where: { id: { in: downloadMovieIds } },
        select: { id: true, title: true, genre: true },
      }),
    ]);
    const viewMovieById = new Map(viewMovies.map((m) => [m.id, m]));
    const downloadMovieById = new Map(downloadMovies.map((m) => [m.id, m]));

    const topViewed = topViewGroups.map((g) => ({
      id: g.movieId,
      title: viewMovieById.get(g.movieId)?.title ?? 'Removed title',
      genre: viewMovieById.get(g.movieId)?.genre ?? '—',
      views: g._count._all,
    }));
    const topDownloaded = topDownloadGroups.map((g) => ({
      id: g.movieId,
      title: downloadMovieById.get(g.movieId)?.title ?? 'Removed title',
      genre: downloadMovieById.get(g.movieId)?.genre ?? '—',
      downloads: g._count._all,
    }));

    // --- Audience: active vs new vs anonymous ------------------------------
    const [activeRecent, activeAllWindow, newUsersWindow, favsWindow, completionsWindow] =
      await Promise.all([
        prisma.viewEvent.findMany({
          where: { startedAt: { gte: recentStart } },
          distinct: ['userId'],
          select: { userId: true },
        }),
        prisma.viewEvent.groupBy({
          by: ['userId'],
          where: { startedAt: { gte: windowStart } },
          _count: { _all: true },
        }),
        prisma.user.count({ where: { createdAt: { gte: windowStart } } }),
        prisma.favorite.count({ where: { createdAt: { gte: windowStart } } }),
        prisma.watchHistory.count({ where: { lastWatchedAt: { gte: windowStart } } }),
      ]);

    const identifiedGroups = activeAllWindow.filter((g) => g.userId !== null);
    const returningUsers = identifiedGroups.filter(
      (g) => g._count._all > 1
    ).length;
    const anonViews = windowViews - (await countedIdentifiedViews(windowStart));
    const activeUsers7d = activeRecent.filter((r) => r.userId !== null).length;
    const activeVisitors7d = activeRecent.length; // includes anonymous sessions

    // --- Derived metrics ---------------------------------------------------
    const totalViewsWindow = daily.reduce((s, d) => s + d.views, 0);
    const totalDownloadsWindow = daily.reduce((s, d) => s + d.downloads, 0);
    const downloadConversion =
      totalViewsWindow > 0
        ? Math.round((totalDownloadsWindow / totalViewsWindow) * 1000) / 10
        : 0;
    const completionRate =
      windowViews > 0 ? Math.round((completedViews / windowViews) * 1000) / 10 : 0;
    const avgWatchSeconds = Math.round(watchAgg._avg.watchedSeconds ?? 0);
    const deviceBreakdown = (() => {
      // Rows written before the device-label change stored the raw UA; classify
      // anything that isn't already a known bucket so the panel always renders
      // comparable labels (Mobile, Desktop, …) instead of browser strings.
      const KNOWN = new Set(['Mobile', 'Desktop', 'Tablet', 'TV', 'Bot', 'Unknown', 'Other']);
      const buckets = new Map<string, number>();
      for (const g of deviceGroups) {
        const raw = g.device || 'Unknown';
        const label = KNOWN.has(raw) ? raw : deviceLabel(raw);
        buckets.set(label, (buckets.get(label) || 0) + g._count._all);
      }
      return [...buckets.entries()]
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    })();
    const qualityBreakdown = qualityGroups.map((g) => ({
      quality: g.quality || 'Auto',
      count: g._count._all,
    }));

    const viewsTrend = pctChange(viewsRecent, viewsPrev);
    const downloadsTrend = pctChange(downloadsRecent, downloadsPrev);
    const usersTrend = pctChange(usersRecent, usersPrev);

    // --- Improvement insights (the actual "report" for the admin) ----------
    type Insight = { tone: 'good' | 'warn' | 'info'; title: string; detail: string; action: string };
    const insights: Insight[] = [];

    if (viewsTrend !== null) {
      if (viewsTrend >= 10) {
        insights.push({
          tone: 'good',
          title: `Views up ${viewsTrend}% week over week`,
          detail: `${viewsRecent} plays in the last 7 days vs ${viewsPrev} before.`,
          action: 'Keep publishing cadence; pin the top titles on the home page.',
        });
      } else if (viewsTrend <= -10) {
        insights.push({
          tone: 'warn',
          title: `Views down ${Math.abs(viewsTrend)}% week over week`,
          detail: `${viewsRecent} plays vs ${viewsPrev} the week before.`,
          action: 'Refresh the trending rail and push a broadcast to re-engage visitors.',
        });
      } else {
        insights.push({
          tone: 'info',
          title: 'Viewership is steady',
          detail: `${viewsRecent} plays this week (change: ${viewsTrend}%).`,
          action: 'Test a new category or narrator spotlight to break the plateau.',
        });
      }
    }

    const mobileShare = (() => {
      const mobile = deviceBreakdown
        .filter((d) => /mobile|android|iphone/i.test(d.device))
        .reduce((s, d) => s + d.count, 0);
      const total = deviceBreakdown.reduce((s, d) => s + d.count, 0);
      return total > 0 ? Math.round((mobile / total) * 100) : 0;
    })();
    if (mobileShare >= 60) {
      insights.push({
        tone: 'info',
        title: `${mobileShare}% of plays come from phones`,
        detail: 'Device data comes from the player itself.',
        action: 'Prioritize mobile: thumb-reach buttons, poster taps, and light-weight thumbnails.',
      });
    }

    if (downloadConversion > 0 && downloadConversion < 8) {
      insights.push({
        tone: 'info',
        title: `Only ${downloadConversion}% of views turn into downloads`,
        detail: `${totalDownloadsWindow} downloads from ${totalViewsWindow} plays.`,
        action: 'Streaming is the habit — keep the Download button visible right after playback starts.',
      });
    } else if (downloadConversion >= 8) {
      insights.push({
        tone: 'good',
        title: `Healthy download rate: ${downloadConversion}%`,
        detail: `${totalDownloadsWindow} downloads from ${totalViewsWindow} plays.`,
        action: 'Downloads matter to this audience — cache hot files closer to the edge.',
      });
    }

    if (completionRate > 0 && completionRate < 45) {
      insights.push({
        tone: 'warn',
        title: `Completion rate is ${completionRate}%`,
        detail: 'Many sessions start but never reach the end.',
        action: 'Check startup/buffering on the affected titles and trim heavy default quality on mobile.',
      });
    } else if (completionRate >= 45) {
      insights.push({
        tone: 'good',
        title: `Completion rate is ${completionRate}%`,
        detail: `Average watched time: ${avgWatchSeconds}s per play.`,
        action: 'Strong engagement — surface sequels/episodes next in a "Continue watching" rail.',
      });
    }

    if (topViewed.length > 0) {
      const top3 = topViewed.slice(0, 3).reduce((s, t) => s + t.views, 0);
      const share = totalViewsWindow > 0 ? Math.round((top3 / totalViewsWindow) * 100) : 0;
      insights.push({
        tone: share >= 60 ? 'warn' : 'info',
        title: `Top 3 titles drive ${share}% of all plays`,
        detail: topViewed
          .slice(0, 3)
          .map((t) => `${t.title} (${t.views})`)
          .join(', '),
        action:
          share >= 60
            ? 'Demand is concentrated — diversify the home page with mid-tail rails.'
            : 'Interest is well spread — good catalog depth; keep genre landing pages updated.',
      });
    }

    const topGenre = topGenreRaw[0];
    if (topGenre) {
      insights.push({
        tone: 'info',
        title: `"${topGenre.genre}" is the hottest genre`,
        detail: `${Number(topGenre.count)} plays in the window.`,
        action: `Give it a dedicated rail on the home page and a genre landing page if missing.`,
      });
    }

    if (returningUsers > 0 && activeUsers7d > 0) {
      const returnRate = Math.round((returningUsers / Math.max(activeUsers7d, 1)) * 100);
      insights.push({
        tone: returnRate >= 30 ? 'good' : 'warn',
        title: `${returnRate}% of signed-in viewers are returning`,
        detail: `${returningUsers} viewers with more than one session in the window.`,
        action:
          returnRate >= 30
            ? 'Loyalty is real — reward it with a favorites reminder and push-style broadcasts.'
            : 'Repeat visits are low — surface "Continue watching" and favorites on the home page.',
      });
    }

    // --- Visitors: guests vs signed-in users, time spent ------------------
    // VisitorSession rows are written by the SessionTracker heartbeat, so
    // this covers ALL site time (browse + idle-browsing pages), not just
    // playback. Downloads/favorites are attributed by userId when signed in
    // and by sessionId otherwise, so guest behaviour stays visible too.
    const sessionWhere = { lastSeenAt: { gte: windowStart } };
    const [sessionGroups, guestSessions, userSessions, windowFavGroups, windowDownloadRows] =
      await Promise.all([
        prisma.visitorSession.groupBy({
          by: ['userId'],
          where: sessionWhere,
          _count: { _all: true },
          _sum: { activeSeconds: true },
        }),
        prisma.visitorSession.aggregate({
          where: { ...sessionWhere, userId: null },
          _count: { _all: true },
          _sum: { activeSeconds: true },
        }),
        prisma.visitorSession.aggregate({
          where: { ...sessionWhere, userId: { not: null } },
          _count: { _all: true },
          _sum: { activeSeconds: true },
        }),
        prisma.favorite.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: windowStart } },
          _count: { _all: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),
        prisma.download.findMany({
          where: { createdAt: { gte: windowStart } },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            quality: true,
            providerId: true,
            createdAt: true,
            userId: true,
            sessionId: true,
            movie: { select: { title: true } },
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

    // Guest-vs-user download counts over the whole window.
    const allWindowDownloads = await prisma.download.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { userId: true, sessionId: true },
    });
    const guestDownloads = allWindowDownloads.filter((d) => d.userId === null).length;
    const userDownloads = allWindowDownloads.length - guestDownloads;
    const favUserIds = windowFavGroups.map((g) => g.userId);
    const favUsers = await prisma.user.findMany({
      where: { id: { in: favUserIds } },
      select: { id: true, name: true, email: true },
    });
    const favUserById = new Map(favUsers.map((u) => [u.id, u]));

    const guestsActiveSeconds = Number(guestSessions._sum.activeSeconds ?? 0);
    const usersActiveSeconds = Number(userSessions._sum.activeSeconds ?? 0);
    const visitors = {
      guests: {
        sessions: guestSessions._count._all,
        totalSeconds: guestsActiveSeconds,
        avgSeconds:
          guestSessions._count._all > 0
            ? Math.round(guestsActiveSeconds / guestSessions._count._all)
            : 0,
        downloads: guestDownloads,
      },
      users: {
        sessions: userSessions._count._all,
        totalSeconds: usersActiveSeconds,
        avgSeconds:
          userSessions._count._all > 0
            ? Math.round(usersActiveSeconds / userSessions._count._all)
            : 0,
        downloads: userDownloads,
        favorites: windowFavGroups.reduce((s, g) => s + g._count._all, 0),
      },
      totalSessions: sessionGroups.reduce((s, g) => s + g._count._all, 0),
    };

    const topFavoriters = windowFavGroups.map((g) => ({
      name: favUserById.get(g.userId)?.name ?? 'Removed user',
      email: favUserById.get(g.userId)?.email ?? '—',
      favorites: g._count._all,
    }));

    // Recent downloads with WHO did it (name for users, "Guest" otherwise)
    // and HOW (quality + provider) — the admin literally asked for this.
    const recentDownloads = windowDownloadRows.map((d) => ({
      movie: d.movie?.title ?? 'Removed title',
      quality: d.quality || 'default',
      provider: d.providerId || '—',
      who: d.user ? d.user.name : 'Guest',
      userType: d.userId ? ('USER' as const) : ('GUEST' as const),
      at: d.createdAt.toISOString(),
    }));

    // Extra insight: is the audience mostly guests, and do they stay?
    if (visitors.guests.sessions + visitors.users.sessions > 0) {
      const guestShare = Math.round(
        (visitors.guests.sessions / Math.max(visitors.totalSessions, 1)) * 100
      );
      if (guestShare >= 60) {
        insights.push({
          tone: 'info',
          title: `${guestShare}% of visits come from guests`,
          detail: `Guests stay ~${visitors.guests.avgSeconds}s on average (signed-in: ~${visitors.users.avgSeconds}s).`,
          action: 'Consider a light sign-in prompt mid-browse to convert the biggest guest sessions into accounts.',
        });
      } else {
        insights.push({
          tone: 'good',
          title: `${100 - guestShare}% of visits are signed-in fans`,
          detail: `Signed-in users stay ~${visitors.users.avgSeconds}s and favorited ${visitors.users.favorites} titles this window.`,
          action: 'Loyalty is real — keep favorites and continue-watching prominent for returning fans.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        window: {
          days: WINDOW_DAYS,
          from: isoDay(windowStart),
          to: isoDay(now),
        },
        totals: {
          views14d: totalViewsWindow,
          downloads14d: totalDownloadsWindow,
          newUsers14d: newUsersWindow,
          favorites14d: favsWindow,
          watchSessions14d: completionsWindow,
          trend7d: { views: viewsTrend, downloads: downloadsTrend, newUsers: usersTrend },
          recent7d: {
            views: viewsRecent,
            downloads: downloadsRecent,
            newUsers: usersRecent,
          },
        },
        quality: {
          completionRate,
          avgWatchSeconds,
          downloadConversion,
          deviceBreakdown,
          qualityBreakdown,
          mobileShare,
        },
        audience: {
          activeVisitors7d,
          activeUsers7d,
          returningUsers,
          anonymousViewShare:
            windowViews > 0
              ? Math.round((Math.max(anonViews, 0) / windowViews) * 100)
              : 0,
        },
        visitors,
        topFavoriters,
        recentDownloads,
        daily,
        topViewed,
        topDownloaded,
        topGenres: topGenreRaw.map((g) => ({ genre: g.genre, views: Number(g.count) })),
        insights,
      },
    });
  } catch (error: any) {
    console.error('Error building behavior report:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to build behavior report' },
      { status: 500 }
    );
  }
}

/** Views in the window from signed-in users (for the anonymous-share metric). */
async function countedIdentifiedViews(windowStart: Date): Promise<number> {
  const row = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*)::bigint AS count FROM "ViewEvent"
    WHERE "startedAt" >= ${windowStart} AND "userId" IS NOT NULL`;
  return Number(row[0]?.count ?? 0);
}
