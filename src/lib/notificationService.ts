import { prisma } from '@/lib/prisma';
import { interpretersData } from '@/lib/interpreters';
import { narratorMatches } from '@/lib/interpreterCounts';

export interface AppNotification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'NEW_MOVIE' | 'ANNOUNCEMENT' | 'SYSTEM' | 'COMMUNITY';
  isRead: boolean;
  link?: string;
  movieId?: string | number;
  movieTitle?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

/**
 * Notifications live in PostgreSQL only. `userId: null` marks a site-wide
 * broadcast that every visitor (signed in or not) receives — this is how an
 * admin upload reaches the whole audience. There is deliberately no seeded
 * or in-memory fallback: an unreadable database means an empty bell, never
 * fake notifications.
 */
export async function getNotifications(userId?: string): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  const rows = await prisma.notification
    .findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    .catch(() => []);

  const notifications: AppNotification[] = rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: (n.type as AppNotification['type']) || 'SYSTEM',
    // A broadcast row (userId = null) is shared by every visitor, so it has no
    // per-user read state — it renders as informational and never counts
    // towards the badge. Only a user's own rows can be unread/marked read.
    isRead: n.userId === null ? true : n.isRead,
    link: n.link || undefined,
    movieId: undefined,
    movieTitle: undefined,
    thumbnailUrl: undefined,
    createdAt: n.createdAt.toISOString(),
  }));

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };
}

export async function createNotification(params: {
  title: string;
  message: string;
  type?: 'NEW_MOVIE' | 'ANNOUNCEMENT' | 'SYSTEM' | 'COMMUNITY';
  link?: string;
  movieId?: string | number;
  movieTitle?: string;
  thumbnailUrl?: string;
  /** Omit for a site-wide broadcast visible to every visitor. */
  userId?: string;
}): Promise<AppNotification> {
  const row = await prisma.notification
    .create({
      data: {
        userId: params.userId ?? null,
        title: params.title,
        message: params.message,
        type: params.type || 'NEW_MOVIE',
        link: params.link,
        isRead: false,
      },
    })
    .catch(() => null);

  return {
    id: row?.id ?? `notif-${Date.now()}`,
    userId: params.userId ?? null,
    title: params.title,
    message: params.message,
    type: params.type || 'NEW_MOVIE',
    isRead: false,
    link: params.link,
    movieId: params.movieId,
    movieTitle: params.movieTitle,
    thumbnailUrl: params.thumbnailUrl,
    createdAt: (row?.createdAt ?? new Date()).toISOString(),
  };
}

/** Deliver a notification to every ADMIN account (never a public broadcast). */
export async function notifyAdmins(params: {
  title: string;
  message: string;
  type?: 'NEW_MOVIE' | 'ANNOUNCEMENT' | 'SYSTEM' | 'COMMUNITY';
  link?: string;
  movieTitle?: string;
}): Promise<AppNotification> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: params.title,
          message: params.message,
          type: params.type || 'ANNOUNCEMENT',
          link: params.link,
          isRead: false,
        })),
        skipDuplicates: true,
      });
    }
  } catch {
    // Database unavailable — admin reports are best-effort.
  }

  return {
    id: `notif-${Date.now()}-admins`,
    userId: null,
    title: params.title,
    message: params.message,
    type: params.type || 'ANNOUNCEMENT',
    isRead: false,
    link: params.link,
    movieTitle: params.movieTitle,
    createdAt: new Date().toISOString(),
  };
}

/** Mark one of the caller's own rows read. Scoped by userId so a user can
 *  never flip someone else's (or the shared broadcast's) read state. */
export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  await prisma.notification
    .updateMany({ where: { id, userId }, data: { isRead: true } })
    .catch(() => null);
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  await prisma.notification
    .updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
    .catch(() => null);
  return true;
}

export async function notifyNewMovieUploaded(movie: {
  id: string | number;
  title: string;
  releaseYear?: number;
  narrator?: string;
  genre?: string;
  thumbnailUrl?: string;
  rating?: number;
  slug?: string;
}): Promise<AppNotification> {
  const narratorText = movie.narrator ? ` narrated by ${movie.narrator}` : '';
  const yearText = movie.releaseYear ? ` (${movie.releaseYear})` : '';
  const link = `/movies/${movie.slug || movie.id}`;
  const title = `🎬 New Movie: ${movie.title}${yearText}`;
  const message = `Now streaming! ${movie.title}${narratorText} is available in Full HD with high-speed download links.`;

  // Followers of this film's interpreter also get a personalized copy, so
  // "Follow" on an interpreter profile has a visible result.
  try {
    const interpreter = movie.narrator
      ? interpretersData.find((i) => narratorMatches(i.name, movie.narrator))
      : undefined;
    if (interpreter) {
      const followers = await prisma.follow.findMany({
        where: { followingId: interpreter.slug, followingType: 'INTERPRETER' },
        select: { followerId: true },
      });
      if (followers.length > 0) {
        await prisma.notification
          .createMany({
            data: followers.map((f) => ({
              userId: f.followerId,
              title,
              message: `${message} — ${interpreter.name} just added this one.`,
              type: 'NEW_MOVIE',
              link,
              isRead: false,
            })),
            skipDuplicates: true,
          })
          .catch(() => null);
      }
    }
  } catch {
    // Follow table unavailable — the global broadcast below still reaches everyone.
  }

  // Site-wide broadcast: every visitor sees this in the bell when they open
  // the app, signed in or not.
  return createNotification({
    title,
    message,
    type: 'NEW_MOVIE',
    link,
    movieId: movie.id,
    movieTitle: movie.title,
    thumbnailUrl: movie.thumbnailUrl,
  });
}
