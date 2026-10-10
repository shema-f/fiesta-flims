import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseIdToken } from '@/lib/firebaseVerify';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/firebase-sync
 *
 * Persists the signed-in Google user to our database and returns it.
 *
 * Security: the request must carry a Firebase `idToken`, which is verified
 * with Google before anything else happens. The email used to look the user up
 * is the one Google returned — never the one in the request body — and the
 * role always comes from our own database row. Nothing in the request can
 * grant elevated privileges.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const idToken = typeof body.idToken === 'string' ? body.idToken : null;
  const profile = await verifyFirebaseIdToken(idToken);

  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired credentials' },
      { status: 401 }
    );
  }

  try {
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      // No password: this account can only authenticate through Firebase.
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || profile.email.split('@')[0] || 'Fiesta Fan',
          image: profile.photoUrl,
          password: null,
          role: 'FAN',
        },
      });
    } else if (profile.photoUrl && !user.image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: profile.photoUrl },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('[Firebase Sync API] Error persisting user:', error);
    return NextResponse.json({ success: false, error: 'Could not sync account' }, { status: 500 });
  }
}
