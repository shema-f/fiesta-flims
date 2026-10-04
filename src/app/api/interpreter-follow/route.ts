import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getInterpreter } from '@/lib/interpreters';
import { jsonOk, jsonError, requireUser } from '@/lib/api/helpers';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FOLLOW_TYPE = 'INTERPRETER';

/** Count stored follows for an interpreter slug (best-effort in mock env). */
async function countFollows(slug: string): Promise<number> {
  try {
    return await prisma.follow.count({ where: { followingId: slug, followingType: FOLLOW_TYPE } });
  } catch {
    return 0;
  }
}

async function isFollowing(userId: string, slug: string): Promise<boolean> {
  try {
    const row = await prisma.follow.findFirst({
      where: { followerId: userId, followingId: slug, followingType: FOLLOW_TYPE },
    });
    return Boolean(row);
  } catch {
    return false;
  }
}

/** GET /api/interpreter-follow?slug=rocky — follower count + whether the viewer follows. */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return jsonError('slug is required', 400);

  const interpreter = getInterpreter(slug);
  if (!interpreter) return jsonError('Interpreter not found', 404);

  const extra = await countFollows(slug);
  const user = await getCurrentUser().catch(() => null);
  const following = user ? await isFollowing(user.id, slug) : false;

  return jsonOk({
    slug,
    followers: interpreter.followers + extra,
    baseFollowers: interpreter.followers,
    following,
  });
}

const bodySchema = z.object({ slug: z.string().min(1) });

/** POST /api/interpreter-follow — toggle follow for the signed-in user. */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  let slug: string;
  try {
    slug = bodySchema.parse(await request.json()).slug;
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Invalid request', 400);
  }

  const interpreter = getInterpreter(slug);
  if (!interpreter) return jsonError('Interpreter not found', 404);

  try {
    const existing = await prisma.follow.findFirst({
      where: { followerId: guard.user.id, followingId: slug, followingType: FOLLOW_TYPE },
    });

    let following: boolean;
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      following = false;
    } else {
      await prisma.follow.create({
        data: { followerId: guard.user.id, followingId: slug, followingType: FOLLOW_TYPE },
      });
      following = true;
    }

    const extra = await countFollows(slug);
    return jsonOk({ slug, following, followers: interpreter.followers + extra });
  } catch {
    return jsonError('Could not update follow state', 500);
  }
}
