import { PrismaClient } from '@prisma/client';
import { reportEnv } from '@/lib/env';

/**
 * Database client.
 *
 * The connection string comes exclusively from `DATABASE_URL` — there is no
 * fallback, because the previous default was a live production credential
 * committed to source, which meant anyone with repository access could connect
 * to the database and a missing environment variable went unnoticed.
 *
 * The client is created lazily through a proxy: Next.js evaluates this module
 * while collecting page data during `next build`, and importing it must never
 * throw there (that crashed production builds whenever an env var was absent).
 * A missing `DATABASE_URL` surfaces on the first query instead, with an
 * actionable message, and every caller already handles a failed query.
 */
reportEnv();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // Fail closed at query time — never connect somewhere unexpected.
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        'DATABASE_URL is not set. Copy .env.example to .env (or set it in your hosting dashboard) before running.'
      );
    }
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client as object, prop) as unknown;
    // Methods such as $queryRaw and $transaction must stay bound to the client.
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
