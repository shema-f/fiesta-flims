/**
 * Shared API helpers: typed responses, rate limiting, IP hashing and guards.
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getCurrentUser, type CurrentUser } from '@/lib/auth';

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}

/** Never store raw IPs (privacy); store a salted hash instead. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'fiesta-flix';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

/**
 * Fixed-window rate limit. In-memory per server instance — good enough as a
 * first line of defence; swap for Redis/Upstash at scale.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
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
