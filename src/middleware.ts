/**
 * Route-level authorization.
 *
 * The API routes double-check with `requireAdmin()`, but the admin *pages* had
 * no server-side gate at all — anyone could load the dashboard markup. This
 * middleware is the outer wall: unauthenticated visitors are sent to /login,
 * authenticated non-admins are sent home, and API callers get 401/403 JSON
 * instead of a redirect.
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
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role !== 'ADMIN') {
    if (isApi) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
