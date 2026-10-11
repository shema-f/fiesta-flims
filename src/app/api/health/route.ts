import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health — public deployment diagnostics.
 *
 * Reports *whether* the backend is configured and reachable, never a value, so
 * an operator (or the login page) can tell "wrong password" apart from "this
 * deployment has no database at all". Without this, a missing DATABASE_URL
 * surfaces to visitors as an unexplained 401/500.
 */
export async function GET() {
  const missingEnv = auditEnv().map((p) => p.key);

  let database: 'ok' | 'unreachable' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'unreachable';
  }

  const secret = process.env.NEXTAUTH_SECRET?.trim();
  const auth: 'ok' | 'disabled' = secret && secret.length >= 32 ? 'ok' : 'disabled';

  const ok = database === 'ok' && auth === 'ok' && missingEnv.length === 0;

  return NextResponse.json(
    {
      success: true,
      data: {
        ok,
        database,
        auth,
        // Variable names only — never a value.
        missingEnv,
        checkedAt: new Date().toISOString(),
      },
    },
    { headers: { 'cache-control': 'no-store' } }
  );
}
