import { PrismaClient } from '@prisma/client';
import { reportEnv } from '@/lib/env';

/**
 * Database client.
 *
 * Connection string comes exclusively from `DATABASE_URL`. There is no
 * fallback: the previous default was a live production credential committed to
 * source, which meant anyone with repository access could connect to the
 * database — and a missing environment variable went unnoticed.
 */
reportEnv();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Fail closed with an actionable message rather than connecting somewhere
    // unexpected. `auditEnv()` reports this once per process in production.
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env (or set it in your hosting dashboard) before running.'
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
