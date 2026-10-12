import { storageManager } from '@/lib/storage';
import { jsonOk, jsonError, requireAdmin, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** POST /api/admin/storage/:provider/test — run a live health check. */
export async function POST(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Runs a live network round-trip to the provider — keep it cheap even for
  // an admin session (e.g. a dashboard polling "test" on every render).
  const limit = await checkRateLimit(`provider-test:${guard.user.id}`, 20, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  const { provider } = await params;
  const health = await storageManager.healthCheckOne(provider);
  if (!health) return jsonError('Unknown provider', 404);
  return jsonOk(health);
}
