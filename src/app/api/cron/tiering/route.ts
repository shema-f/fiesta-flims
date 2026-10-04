import { runTiering } from '@/lib/media/tiering';
import { jsonOk, jsonError } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * GET /api/cron/tiering
 * Promotes popular movies to HOT and idle ones to COLD (spec §24).
 * Never deletes anything.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return jsonError('Unauthorized', 401);
  const report = await runTiering();
  return jsonOk(report);
}
