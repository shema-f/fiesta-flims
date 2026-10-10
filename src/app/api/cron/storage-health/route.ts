import { storageManager } from '@/lib/storage';
import { jsonOk, jsonError } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // Fail closed: an unconfigured secret must never leave a maintenance route
  // open to the public.
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * GET /api/cron/storage-health
 * Scheduled provider health check (spec §17). Vercel Cron invokes this on a
 * schedule; it updates health, success rate and auto-adjusts provider priority.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return jsonError('Unauthorized', 401);

  await storageManager.ensureProvidersSeeded();
  const results = await storageManager.healthCheckAll();
  return jsonOk({ checked: results.length, results });
}
