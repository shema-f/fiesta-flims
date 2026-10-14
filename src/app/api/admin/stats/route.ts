import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const [
      totalMovies,
      seriesCount,
      totalInterpreters,
      totalUsers,
      pendingRequests,
      pendingClips,
      moviesAgg,
    ] = await Promise.all([
      prisma.movie.count({ where: { isActive: true } }),
      prisma.movie.count({
        where: {
          isActive: true,
          OR: [
            { title: { contains: 'Season', mode: 'insensitive' } },
            { title: { contains: 'Series', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.interpreter.count(),
      prisma.user.count(),
      prisma.movieRequest.count({ where: { isFulfilled: false } }),
      prisma.fanClip.count({ where: { isApproved: false } }),
      prisma.movie.aggregate({
        _sum: {
          viewCount: true,
          downloadCount: true,
        },
      }),
    ]);

    // Fetch real recent activity from movies and users
    const [recentMovies, recentUsers, recentDownloads] = await Promise.all([
      prisma.movie.findMany({
        where: { isActive: true },
        select: { id: true, title: true, narrator: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.user.findMany({
        select: { id: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.download.findMany({
        select: {
          id: true,
          quality: true,
          createdAt: true,
          user: { select: { name: true } },
          movie: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activity = [
      ...recentMovies.map((m) => ({
        id: `movie-${m.id}`,
        action: `Movie added: "${m.title}"`,
        user: m.narrator ? `Narrated by ${m.narrator}` : 'FiestaFlix Studio',
        time: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent',
        type: 'movie',
      })),
      ...recentUsers.map((u) => ({
        id: `user-${u.id}`,
        action: `User registered (${u.role})`,
        user: u.name,
        time: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
        type: 'user',
      })),
      ...recentDownloads.map((d) => ({
        id: `download-${d.id}`,
        action: `Download started: "${d.movie.title}"${d.quality ? ` (${d.quality})` : ''}`,
        user: d.user?.name || 'Anonymous visitor',
        time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
        type: 'download',
      })),
    ].slice(0, 6);

    // Real aggregates only — no synthetic inflation. An honest zero is more
    // useful to an admin than a padded number they cannot act on.
    const totalViews = moviesAgg._sum.viewCount || 0;
    const totalDownloads = moviesAgg._sum.downloadCount || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMovies,
        seriesCount,
        singleMoviesCount: totalMovies - seriesCount,
        totalInterpreters,
        totalUsers,
        activeUsers: totalUsers,
        totalViews,
        totalDownloads,
        pendingRequests,
        pendingClips,
        recentActivity: activity,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch backend stats',
      },
      { status: 500 }
    );
  }
}
