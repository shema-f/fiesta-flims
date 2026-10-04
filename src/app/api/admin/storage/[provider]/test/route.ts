import { storageManager } from '@/lib/storage';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** POST /api/admin/storage/:provider/test — run a live health check. */
export async function POST(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { provider } = await params;
  const health = await storageManager.healthCheckOne(provider);
  if (!health) return jsonError('Unknown provider', 404);
  return jsonOk(health);
}
