import { prisma } from '@/lib/prisma';

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

// Global in-memory storage fallback to ensure reliable operation
// across all environments even when PostgreSQL connection is unavailable.
declare global {
  // eslint-disable-next-line no-var
  var __fiesta_notifications: AppNotification[] | undefined;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🎬 New Movie Alert: Echoes of Tomorrow (2025)',
    message: 'Sci-Fi blockbuster narrated by Rocky Kimomo is now streaming in Full HD 1080p!',
    type: 'NEW_MOVIE',
    isRead: false,
    link: '/movies/1',
    movieId: 1,
    movieTitle: 'Echoes of Tomorrow',
    thumbnailUrl: '/fallback-poster.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
  },
  {
    id: 'notif-2',
    title: '🔥 Rwandan Cinema: Bamporiki (2024)',
    message: 'Acclaimed Rwandan cultural drama is now available with crystal-clear audio and subtitles.',
    type: 'NEW_MOVIE',
    isRead: false,
    link: '/movies/4',
    movieId: 4,
    movieTitle: 'Bamporiki',
    thumbnailUrl: '/fallback-poster.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'notif-3',
    title: '⭐ New Interpreter Added: Sankara Live Hub',
    message: 'Sankara has added 4 new action films to the catalog with high-speed Telegram downloads.',
    type: 'ANNOUNCEMENT',
    isRead: true,
    link: '/interpreters',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

function getStore(): AppNotification[] {
  if (!globalThis.__fiesta_notifications) {
    globalThis.__fiesta_notifications = [...INITIAL_NOTIFICATIONS];
  }
  return globalThis.__fiesta_notifications;
}

export async function getNotifications(userId?: string): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  try {
    if (userId) {
      const dbNotifs = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      if (dbNotifs && dbNotifs.length > 0) {
        const notifications: AppNotification[] = dbNotifs.map((n) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: (n.type as AppNotification['type']) || 'SYSTEM',
          isRead: n.isRead,
          link: n.link || undefined,
          createdAt: n.createdAt.toISOString(),
        }));
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        return { notifications, unreadCount };
      }
    }
  } catch {
    // Database unavailable, gracefully fall through to in-memory store
  }

  const store = getStore();
  const sorted = [...store].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const unreadCount = sorted.filter((n) => !n.isRead).length;
  return { notifications: sorted, unreadCount };
}

export async function createNotification(params: {
  title: string;
  message: string;
  type?: 'NEW_MOVIE' | 'ANNOUNCEMENT' | 'SYSTEM' | 'COMMUNITY';
  link?: string;
  movieId?: string | number;
  movieTitle?: string;
  thumbnailUrl?: string;
  userId?: string;
}): Promise<AppNotification> {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: params.title,
    message: params.message,
    type: params.type || 'NEW_MOVIE',
    isRead: false,
    link: params.link,
    movieId: params.movieId,
    movieTitle: params.movieTitle,
    thumbnailUrl: params.thumbnailUrl,
    createdAt: new Date().toISOString(),
    userId: params.userId || null,
  };

  const store = getStore();
  store.unshift(newNotif);

  // If DB available and userId provided, persist
  try {
    if (params.userId) {
      await prisma.notification.create({
        data: {
          id: newNotif.id,
          userId: params.userId,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          link: newNotif.link,
          isRead: false,
        },
      });
    } else {
      // Broadcast to all users in DB if any
      const users = await prisma.user.findMany({ select: { id: true }, take: 100 });
      if (users.length > 0) {
        await prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            link: newNotif.link,
            isRead: false,
          })),
          skipDuplicates: true,
        });
      }
    }
  } catch {
    // Database write failed, safe to ignore since stored in-memory
  }

  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const store = getStore();
  const target = store.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
  }

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  } catch {
    // Ignore DB error
  }

  return true;
}

export async function markAllNotificationsAsRead(userId?: string): Promise<boolean> {
  const store = getStore();
  store.forEach((n) => {
    n.isRead = true;
  });

  try {
    if (userId) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }
  } catch {
    // Ignore DB error
  }

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
}): Promise<AppNotification> {
  const narratorText = movie.narrator ? ` narrated by ${movie.narrator}` : '';
  const yearText = movie.releaseYear ? ` (${movie.releaseYear})` : '';

  return createNotification({
    title: `🎬 New Movie: ${movie.title}${yearText}`,
    message: `Now streaming! ${movie.title}${narratorText} is available in Full HD with high-speed download links.`,
    type: 'NEW_MOVIE',
    link: `/movies/${movie.id}`,
    movieId: movie.id,
    movieTitle: movie.title,
    thumbnailUrl: movie.thumbnailUrl,
  });
}
