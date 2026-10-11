/**
 * Shared API helpers: typed responses, rate limiting, IP hashing and guards.
 *
 * IP resolution, hashing and rate limiting live in `@/lib/security`; this
 * module only re-exports them so route handlers keep a single import surface.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser, type CurrentUser } from '@/lib/auth';
import { getClientIp, hashIp } from '@/lib/security/clientIp';
import { consumeRateLimit, type RateLimitResult } from '@/lib/security/rateLimit';

export { getClientIp, hashIp };

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

/**
 * Fixed-window rate limit.
 *
 * Counters live in Upstash Redis when configured, so the limit holds across
 * serverless instances; otherwise they are per instance (a warning is logged
 * once in production). The caller's key usually embeds a raw address
 * (`download:203.0.113.9`) — it is hashed before reaching the store so no
 * third party ever sees an IP and no key can be reversed back to one.
 *
 * Async because the store may be remote, so every call site must `await`.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const storeKey = hashIp(key) ?? key;
  return consumeRateLimit({ key: storeKey, limit, windowMs });
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return jsonError('Too many requests', 429, { retryAfterSeconds });
}

/** Returns the admin user, or a NextResponse error to return immediately. */
export async function requireAdmin(): Promise<
  { user: CurrentUser; error: null } | { user: null; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: jsonError('Authentication required', 401) };
  if (user.role !== 'ADMIN') return { user: null, error: jsonError('Admin access required', 403) };
  return { user, error: null };
}

/** Returns the authenticated user, or a NextResponse error. */
export async function requireUser(): Promise<
  { user: CurrentUser; error: null } | { user: null; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: jsonError('Authentication required', 401) };
  return { user, error: null };
}

/** Parse and clamp a numeric query param. */
export function intParam(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}
