/**
 * Rate limiting with a shared store.
 *
 * The previous implementation kept counters in a module-level `Map`, which on
 * a serverless platform means every instance keeps its own counter — the real
 * limit became `limit × number of instances`.
 *
 * With `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` set, counters live
 * in Redis and are shared by every instance. Without them (local development)
 * an in-process fallback is used, and a warning is logged once in production so
 * the weaker configuration can never go unnoticed.
 */
import { getClientIp } from './clientIp';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  limit: number;
}

export interface RateLimitOptions {
  /** Distinguishes callers, e.g. `login` or `chat:<userId>`. */
  key: string;
  limit: number;
  windowMs: number;
  /** Defaults to the caller's (hashed) IP. */
  request?: Request;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

/**
 * Atomically increments a fixed window and returns the new count and reset time.
 * Runs in Redis so the counter is shared and cannot be raced by parallel requests.
 */
const INCR_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local state = redis.call('HMGET', key, 'count', 'resetAt')
local count = tonumber(state[1] or '0')
local resetAt = tonumber(state[2] or '0')
if resetAt == 0 or now >= resetAt then
  count = 0
  resetAt = now + window
end
count = count + 1
redis.call('HMSET', key, 'count', count, 'resetAt', resetAt)
redis.call('PEXPIRE', key, math.max(1, resetAt - now))
return {count, resetAt}
`;

let warnedMissingStore = false;

function warnOnceMissingStore(): void {
  if (warnedMissingStore || process.env.NODE_ENV !== 'production') return;
  warnedMissingStore = true;
  console.error(
    '[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN are not set — falling back to per-instance ' +
      'counters. Effective limits will be multiplied by your instance count. ' +
      'See SECURITY.md.'
  );
}

// ---------------------------------------------------------------------------
// In-memory fallback (local development only)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

function memoryHit(key: string, windowMs: number): { count: number; resetAt: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, entry] of memoryStore) {
      if (entry.resetAt <= now) memoryStore.delete(k);
    }
  }

  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    memoryStore.set(key, fresh);
    return fresh;
  }

  entry.count += 1;
  return entry;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { limit, windowMs } = options;
  const identity = options.request ? getClientIp(options.request) : options.key;
  const key = `rl:${options.key}:${identity}`;

  let count = 0;
  let resetAt = Date.now() + windowMs;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await fetch(`${UPSTASH_URL}/eval`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: INCR_SCRIPT,
          keys: [key],
          args: [String(Date.now()), String(windowMs)],
        }),
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const result: number[] = json.result ?? [];
        count = Number(result[0]) || 0;
        resetAt = Number(result[1]) || Date.now() + windowMs;
      } else {
        // Store unavailable — fail open rather than taking the site down, but say so.
        console.warn('[rateLimit] Upstash request failed:', res.status);
        const entry = memoryHit(key, windowMs);
        count = entry.count;
        resetAt = entry.resetAt;
      }
    } catch (err) {
      console.warn('[rateLimit] Upstash unavailable:', (err as Error)?.message);
      const entry = memoryHit(key, windowMs);
      count = entry.count;
      resetAt = entry.resetAt;
    }
  } else {
    warnOnceMissingStore();
    const entry = memoryHit(key, windowMs);
    count = entry.count;
    resetAt = entry.resetAt;
  }

  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
    limit,
  };
}

/** Drop all in-memory counters — used by tests. */
export function resetRateLimitStore(): void {
  memoryStore.clear();
}
