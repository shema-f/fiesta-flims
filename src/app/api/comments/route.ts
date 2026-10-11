import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, getClientIp, jsonError, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const ALLOWED_TARGETS = new Set(['movie', 'interpreter', 'news']);

interface CommentRow {
  id: string;
  content: string;
  author: string;
  isGuest: boolean;
  createdAt: string;
}

function toView(row: {
  id: string;
  content: string;
  createdAt: Date;
  guestName: string | null;
  user: { name: string | null } | null;
}): CommentRow {
  return {
    id: row.id,
    content: row.content,
    author: row.user?.name || row.guestName || 'Guest',
    isGuest: !row.user,
    createdAt: row.createdAt.toISOString(),
  };
}

/** GET /api/comments?targetId=101&targetType=movie — newest first. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId')?.trim();
  const targetType = searchParams.get('targetType')?.trim() || 'movie';

  if (!targetId) return jsonError('targetId is required');
  if (!ALLOWED_TARGETS.has(targetType)) return jsonError('Unsupported targetType');

  try {
    const rows = await prisma.comment.findMany({
      where: { targetId, targetType },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: rows.map(toView) });
  } catch {
    // Database unavailable — never break the page over a comment thread.
    return NextResponse.json({ success: true, data: [] });
  }
}

/** POST /api/comments — signed-in users comment as themselves, guests by name. */
export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(`comment:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  let body: {
    targetId?: string;
    targetType?: string;
    content?: string;
    name?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body');
  }

  const targetId = body.targetId?.trim();
  const targetType = body.targetType?.trim() || 'movie';
  const content = body.content?.trim();
  const guestName = body.name?.trim();

  if (!targetId) return jsonError('targetId is required');
  if (!ALLOWED_TARGETS.has(targetType)) return jsonError('Unsupported targetType');
  if (!content) return jsonError('Comment text is required');
  if (content.length > 2000) return jsonError('Comment is too long (2000 characters max)');

  const user = await getCurrentUser().catch(() => null);

  // Guests must leave a name so their comment is attributable.
  if (!user && !guestName) return jsonError('Please enter your name to comment', 400);
  if (guestName && guestName.length > 60) return jsonError('Name is too long (60 characters max)');

  try {
    const created = await prisma.comment.create({
      data: {
        content,
        targetType,
        targetId,
        userId: user?.id ?? null,
        guestName: user ? null : guestName ?? null,
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: toView(created) }, { status: 201 });
  } catch {
    return jsonError('Could not save your comment right now. Please try again later.', 500);
  }
}
