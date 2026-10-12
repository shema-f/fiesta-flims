import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  // Account creation is the highest-value public write to abuse — cap it hard
  // per IP (Upstash-backed across instances when configured).
  const limit = await checkRateLimit(`signup:${getClientIp(request)}`, 5, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json();
    const { name, email, password } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'FAN',
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    // Tell "the deployment has no database" apart from a genuine server bug:
    // otherwise an unconfigured deployment just shows visitors a bare 500.
    if (!process.env.DATABASE_URL?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Sign-ups are temporarily unavailable: this deployment has no database configured (DATABASE_URL is missing).',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
