/**
 * Seed the StorageProvider table with every known provider (disabled by default).
 * Run after migrations: `npm run db:seed-providers`
 */

import { prisma } from '../src/lib/prisma';
import { storageManager } from '../src/lib/storage';

async function main() {
  await storageManager.ensureProvidersSeeded();
  const providers = await prisma.storageProvider.findMany({ orderBy: { priority: 'desc' } });
  console.log(`[seed-providers] ${providers.length} providers present:`);
  for (const p of providers as any[]) {
    console.log(`  - ${p.slug} (priority ${p.priority}, enabled=${p.enabled})`);
  }
  await prisma.$disconnect().catch(() => {});
}

main().catch((err) => {
  console.error('[seed-providers] failed:', err);
  process.exit(1);
});
