/**
 * Client IP resolution and hashing.
 *
 * `x-forwarded-for` is attacker-controlled whenever the app can be reached
 * directly, so it is only honoured when the chain is known to pass through a
 * proxy we control (Vercel/Cloudflare). Vercel also exposes `request.ip`,
 * which the platform derived itself and which cannot be spoofed from the
 * public internet — that always wins.
 */
import { createHash } from 'crypto';

/** How many trusted proxies sit in front of the app (default: one — Vercel). */
const TRUSTED_PROXY_HOPS = Math.max(0, Number(process.env.TRUSTED_PROXY_HOPS ?? 1));

/** Explicit proxy addresses to trust, comma separated (optional). */
const TRUSTED_PROXY_IPS = (process.env.TRUSTED_PROXY_IPS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Loopback, RFC1918, link-local, CGNAT and IPv6 local ranges. */
function isPrivateAddress(ip: string): boolean {
  return (
    ip === '::1' ||
    /^(::ffff:)?(127\.|10\.|192\.168\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(ip) ||
    /^(fc|fd|fe80)/i.test(ip)
  );
}

export function getClientIp(request: Request): string {
  const withIp = request as Request & { ip?: string };

  // 1. Platform-derived (Vercel). Not forgeable.
  if (withIp.ip) return withIp.ip;

  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return request.headers.get('x-real-ip') || 'unknown';

  const hops = forwarded
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (hops.length === 0) return 'unknown';

  // 2. Only trust the header if the nearest hop is a proxy we recognise.
  const nearest = hops[hops.length - 1];
  const trustedChain =
    TRUSTED_PROXY_IPS.includes(nearest) ||
    (TRUSTED_PROXY_IPS.length === 0 && isPrivateAddress(nearest));

  if (!trustedChain) return hops[0];

  // Walk back past the trusted proxies to the client that actually connected.
  const index = Math.max(0, hops.length - TRUSTED_PROXY_HOPS - 1);
  return hops[index] || hops[0];
}

/**
 * Salted hash of a client identifier.
 *
 * Raw IPs are never stored or logged. The salt must come from the
 * environment: a hard-coded default would make the hashes in the database
 * trivially reversible by anyone who has read the source.
 *
 * Returns `null` when no salt is configured in production, so callers record
 * "no identifier" rather than an unsalted (reversible) hash.
 */
export function hashIp(ip: string): string | null {
  const salt = process.env.IP_HASH_SALT?.trim();

  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[security] IP_HASH_SALT is not set — identifiers are not being recorded.');
      return null;
    }
    // Local development only, so the app still works without a .env.
    return createHash('sha256').update(`fiesta-dev:${ip}`).digest('hex').slice(0, 32);
  }

  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/** Stable, non-reversible identifier for rate-limiting and audit trails. */
export function clientKey(request: Request): string {
  return hashIp(getClientIp(request)) || 'unknown';
}
