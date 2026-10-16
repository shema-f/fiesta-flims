import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  jsonOk,
  jsonError,
  checkRateLimit,
  rateLimitResponse,
  getClientIp,
  deviceLabel,
} from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/track/session
 *
 * Visitor-session heartbeat. The client generates a session id once per
 * browser (persisted in localStorage) and posts here every ~30s while the tab
 * is visible; each heartbeat upserts one VisitorSession row, accumulating
 * `activeSeconds`. This is what lets the admin behavior report answer
 * "how many guests vs signed-in users, and how long did each group stay" —
 * ViewEvent/Download only cover plays and downloads, not time on site.
 *
 * Anonymous visitors are first-class: the row exists with a null userId, and
 * the first heartbeat after sign-in attaches the account. Downloads carry the
 * same session id (Download.sessionId), so a guest's downloads stay
 * attributable to this session.
 *
 * Records only: it never returns anything about the visitor, so it cannot be
 * probed for other people's data. Rate-limited generously per IP.
 */
const heartbeatSchema = z.object({
  sessionId: z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/, 'Invalid session id'),
  // Visible seconds since the previous heartbeat (client clamps; server caps).
  activeSeconds: z.number().int().min(0).max(120).optional(),
  // Path visited since the previous heartbeat — counted as page views.
  pages: z.number().int().min(0).max(20).optional(),
});

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(`session:${getClientIp(request)}`, 240, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json().catch(() => ({}));
    const data = heartbeatSchema.parse(body ?? {});
    const user = await getCurrentUser().catch(() => null);
    const device = deviceLabel(request.headers.get('user-agent'));

    const now = new Date();
    const existing = await prisma.visitorSession
      .findUnique({ where: { id: data.sessionId }, select: { id: true, userId: true } })
      .catch(() => null);

    if (existing) {
      await prisma.visitorSession.update({
        where: { id: data.sessionId },
        data: {
          activeSeconds: { increment: data.activeSeconds ?? 0 },
          pageViews: { increment: data.pages ?? 0 },
          lastSeenAt: now,
          // Attach the account on the first heartbeat after sign-in; never
          // detach (sign-out keeps history attributed to the user).
          ...(user && !existing.userId ? { userId: user.id } : {}),
        },
      });
    } else {
      await prisma.visitorSession.create({
        data: {
          id: data.sessionId,
          userId: user?.id ?? null,
          device,
          activeSeconds: data.activeSeconds ?? 0,
          pageViews: data.pages ?? 0,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      });
    }

    return jsonOk({ recorded: true });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to record session', 500);
  }
}
