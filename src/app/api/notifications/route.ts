import { NextRequest } from 'next/server';
import { jsonOk, jsonError, requireAdmin, requireUser, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';
import { getCurrentUser } from '@/lib/auth';
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 *
 * Resolves the viewer from the session — never from a client-supplied param,
 * so one user can never read (or mark read) another user's notifications.
 * Anonymous visitors receive the site-wide broadcasts (userId = null).
 */
export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);
    const data = await getNotifications(user?.id);
    return jsonOk(data);
  } catch {
    return jsonError('Failed to fetch notifications', 500);
  }
}

/**
 * POST /api/notifications — admin-only broadcast (or a targeted row when
 * userId is supplied). Regular fans are refused: the bell polls GET only.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`notifications:${guard.user.id}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    if (!body.title || !body.message) {
      return jsonError('Title and message are required', 400);
    }

    const notification = await createNotification({
      title: body.title,
      message: body.message,
      type: body.type || 'ANNOUNCEMENT',
      link: body.link,
      movieId: body.movieId,
      movieTitle: body.movieTitle,
      thumbnailUrl: body.thumbnailUrl,
      userId: body.userId,
    });

    return jsonOk(notification, { status: 201 });
  } catch {
    return jsonError('Failed to create notification', 500);
  }
}

/** PATCH — mark read. Any signed-in fan may mark their OWN rows; the
 *  userId always comes from the session, never from the request body. */
export async function PATCH(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`notifications:${guard.user.id}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    if (body.all) {
      await markAllNotificationsAsRead(guard.user.id);
      return jsonOk({ success: true, message: 'All marked as read' });
    }

    if (body.id) {
      await markNotificationAsRead(body.id, guard.user.id);
      return jsonOk({ success: true, message: 'Marked as read' });
    }

    return jsonError('Notification ID or all=true required', 400);
  } catch {
    return jsonError('Failed to update notification', 500);
  }
}
