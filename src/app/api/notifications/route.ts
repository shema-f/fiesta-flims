import { NextRequest } from 'next/server';
import { jsonOk, jsonError, requireUser } from '@/lib/api/helpers';
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || undefined;
    const data = await getNotifications(userId);
    return jsonOk(data);
  } catch (error) {
    return jsonError('Failed to fetch notifications', 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    if (!body.title || !body.message) {
      return jsonError('Title and message are required', 400);
    }

    const notification = await createNotification({
      title: body.title,
      message: body.message,
      type: body.type || 'NEW_MOVIE',
      link: body.link,
      movieId: body.movieId,
      movieTitle: body.movieTitle,
      thumbnailUrl: body.thumbnailUrl,
      userId: body.userId,
    });

    return jsonOk(notification, { status: 201 });
  } catch (error) {
    return jsonError('Failed to create notification', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    if (body.all) {
      await markAllNotificationsAsRead(body.userId);
      return jsonOk({ success: true, message: 'All marked as read' });
    }

    if (body.id) {
      await markNotificationAsRead(body.id);
      return jsonOk({ success: true, message: 'Marked as read' });
    }

    return jsonError('Notification ID or all=true required', 400);
  } catch (error) {
    return jsonError('Failed to update notification', 500);
  }
}
