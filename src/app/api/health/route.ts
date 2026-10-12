import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditEnv, isProduction } from '@/lib/env';
import { PROVIDER_DEFINITIONS, getProvider } from '@/lib/storage/provider-registry';

export const dynamic = 'force-dynamic';

type CheckState = 'ok' | 'missing' | 'stuck' | 'untracked' | 'unreachable';

/**
 * A migration row that started but never finished (and is not being written
 * right now) means `prisma migrate deploy` crashed — schema drift waiting to
 * happen. Anything newer than the 5-minute grace window is considered stuck.
 * (The window is inlined below: Prisma parameter placeholders cannot appear
 * inside a SQL string literal like '5 minutes'.)
 */

/**
 * GET /api/health — deployment diagnostics.
 *
 * Verifies the things that actually break this site in production:
 *   1. database connection
 *   2. the Movie table exists (migrations ran)
 *   3. migration state is sane (no crashed/stuck migrations)
 *   4. the catalogue has rows (Neon is the source of truth — an empty table
 *      with a "healthy" site means we are serving placeholder data)
 *   5. which storage providers have credentials
 *
 * Reports *whether* each check passed and names env vars, never a value.
 * Returns 503 when the deployment is unhealthy so uptime monitors alert.
 */
export async function GET() {
  const missingEnv = auditEnv().map((p) => p.key);

  // 1. Connection -----------------------------------------------------------
  let database: 'ok' | 'unreachable' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'unreachable';
  }

  // 2. Movie table + 4. row count ------------------------------------------
  let movieTable: CheckState = database === 'ok' ? 'ok' : 'unreachable';
  let movieCount: number | null = null;
  if (database === 'ok') {
    try {
      movieCount = await prisma.movie.count();
    } catch (err: any) {
      // P2021 = table does not exist, P2022 = column missing → migrations not applied.
      if (err?.code === 'P2021' || err?.code === 'P2022') {
        movieTable = 'missing';
      } else {
        database = 'unreachable';
        movieTable = 'unreachable';
      }
    }
  }

  // 3. Migration state ------------------------------------------------------
  let migrations: CheckState = database === 'ok' ? 'ok' : 'unreachable';
  let stuckMigrations = 0;
  if (database === 'ok') {
    try {
      const tracked = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
        ) AS exists`;
      if (!tracked[0]?.exists) {
        migrations = 'untracked';
      } else {
        const stuck = await prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*)::int AS count FROM _prisma_migrations
          WHERE started_at IS NOT NULL
            AND finished_at IS NULL
            AND rolled_back_at IS NULL
            AND started_at < now() - interval '5 minutes'`;
        stuckMigrations = Number(stuck[0]?.count ?? 0);
        if (stuckMigrations > 0) migrations = 'stuck';
      }
    } catch {
      migrations = 'unreachable';
    }
  }

  // 5. Storage providers (credential presence only — no network calls) ------
  const storage = PROVIDER_DEFINITIONS.map((d) => ({
    slug: d.slug,
    configured: Boolean(getProvider(d.slug)?.isConfigured()),
  }));

  const secret = process.env.NEXTAUTH_SECRET?.trim();
  const auth: 'ok' | 'disabled' = secret && secret.length >= 32 ? 'ok' : 'disabled';

  const envOk = missingEnv.length === 0;
  const migrationsOk = migrations === 'ok' || (!isProduction && migrations === 'untracked');
  const catalogOk = !isProduction || (movieCount !== null && movieCount > 0);
  const ok =
    database === 'ok' &&
    movieTable === 'ok' &&
    migrationsOk &&
    catalogOk &&
    auth === 'ok' &&
    envOk;

  return NextResponse.json(
    {
      success: true,
      data: {
        ok,
        database,
        movieTable,
        migrations,
        stuckMigrations,
        movieCount,
        catalogEmpty: movieCount === 0,
        storage,
        auth,
        // Variable names only — never a value.
        missingEnv,
        checkedAt: new Date().toISOString(),
      },
    },
    {
      status: ok ? 200 : 503,
      headers: { 'cache-control': 'no-store' },
    }
  );
}
