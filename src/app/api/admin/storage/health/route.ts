import { prisma } from '@/lib/prisma';
import { storageManager } from '@/lib/storage';
import { jsonOk, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/storage/health?refresh=true
 * Returns provider health. Pass `refresh=true` to run live checks now;
 * otherwise returns the last stored health from the cron monitor.
 */
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const refresh = new URL(request.url).searchParams.get('refresh') === 'true';
  if (refresh) {
    const live = await storageManager.healthCheckAll();
    return jsonOk(live);
  }

  const rows = await prisma.storageProvider.findMany({
    orderBy: { priority: 'desc' },
    select: {
      slug: true,
      name: true,
      enabled: true,
      healthStatus: true,
      latencyMs: true,
      successRate: true,
      failureCount: true,
      lastSuccessAt: true,
      lastFailureAt: true,
    },
  });
  return jsonOk(rows);
}
