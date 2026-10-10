import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, photoURL, uid } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const displayName = (name || cleanEmail.split('@')[0] || 'Fiesta Fan').trim();

    // Check if user already exists in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const isAdminEmail =
      cleanEmail.includes('admin') ||
      cleanEmail === 'fistonshema250@gmail.com' ||
      cleanEmail === 'admin@fiestaflix.com';

    if (!user) {
      // Create user in database with generated internal hash for credential login compatibility
      const dummyPasswordHash = await bcrypt.hash(`firebase-${uid || Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          image: photoURL || null,
          password: dummyPasswordHash,
          role: isAdminEmail ? 'ADMIN' : 'FAN',
        },
      });
    } else {
      // Update profile picture and name if missing
      const shouldUpdateImage = photoURL && !user.image;
      const shouldUpdateRole = isAdminEmail && user.role !== 'ADMIN';

      if (shouldUpdateImage || shouldUpdateRole) {
        user = await prisma.user.update({
          where: { email: cleanEmail },
          data: {
            image: photoURL || user.image,
            role: shouldUpdateRole ? 'ADMIN' : user.role,
          },
        });
      }
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
  } catch (error: any) {
    console.error('[Firebase Sync API] Error persisting user:', error);
    // If database is temporarily unavailable or in local fallback mode, return safe user object
    const body = await req.json().catch(() => ({}));
    const cleanEmail = (body.email || 'user@fiestaflix.com').toLowerCase().trim();
    return NextResponse.json({
      success: true,
      user: {
        id: `fb-${body.uid || Date.now()}`,
        name: body.name || cleanEmail.split('@')[0] || 'Fiesta Fan',
        email: cleanEmail,
        role: cleanEmail.includes('admin') ? 'ADMIN' : 'FAN',
        image: body.photoURL || null,
      },
    });
  }
}
