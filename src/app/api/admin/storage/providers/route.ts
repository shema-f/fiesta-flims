import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { storageManager, getProvider } from '@/lib/storage';
import { jsonOk, jsonError, requireAdmin } from '@/lib/api/helpers';

export const dynamic = 'force-dynamic';

/** GET /api/admin/storage/providers — provider registry + health, with secrets hidden. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  await storageManager.ensureProvidersSeeded();
  const providers = await prisma.storageProvider.findMany({ orderBy: { priority: 'desc' } });

  const data = (providers || []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    enabled: p.enabled,
    priority: p.priority,
    tiers: p.tiers,
    purposes: p.purposes,
    capabilities: p.capabilities,
    configured: Boolean(getProvider(p.slug)?.isConfigured()),
    healthStatus: p.healthStatus,
    latencyMs: p.latencyMs,
    successRate: p.successRate,
    failureCount: p.failureCount,
    lastSuccessAt: p.lastSuccessAt,
    lastFailureAt: p.lastFailureAt,
  }));

  return jsonOk(data);
}

const updateSchema = z.object({
  slug: z.string().min(1),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  tiers: z.array(z.enum(['HOT', 'WARM', 'COLD'])).optional(),
  purposes: z.array(z.enum(['STREAMING', 'DOWNLOAD', 'BACKUP'])).optional(),
});

/** PATCH /api/admin/storage/providers — enable/disable or reprioritise a provider. */
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const { slug, ...patch } = updateSchema.parse(body);
    const provider = await prisma.storageProvider.update({ where: { slug }, data: patch });
    return jsonOk(provider);
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.errors[0].message, 400);
    return jsonError('Failed to update provider', 500);
  }
}
