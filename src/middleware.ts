/**
 * Route-level authorization.
 *
 * The API routes double-check with `requireAdmin()`, but the admin *pages* had
 * no server-side gate at all — anyone could load the dashboard markup. This
 * middleware is the outer wall for the API (401/403 JSON).
 *
 * Admin *pages* are different: /admin renders its own credential form to an
 * anonymous visitor and an "Admins only" panel to a signed-in fan, so the
 * dashboard markup never ships without an admin session. Redirecting those
 * visitors to /login hid the reason and left the admin with no way in — so
 * pages pass through and the page-level gate decides.
 *
 * It only ever *denies*; every route keeps its own checks too (defence in depth).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function sessionRole(request: NextRequest): Promise<'ADMIN' | 'FAN' | null> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) return null;
    return token.role === 'ADMIN' ? 'ADMIN' : 'FAN';
  } catch {
    // Missing/invalid secret or malformed token — treat as anonymous.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const role = await sessionRole(request);

  if (!role) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Page request — let /admin render its own sign-in panel.
    return NextResponse.next();
  }

  if (role !== 'ADMIN') {
    if (isApi) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    // Page request — /admin renders its own "Admins only" panel.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
