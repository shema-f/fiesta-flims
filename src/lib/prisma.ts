import { PrismaClient } from '@prisma/client';

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_Ais3XE9DuWLz@ep-twilight-glitter-b5gdjgeo-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const rawUrl = process.env.DATABASE_URL;
const isDummy =
  !rawUrl ||
  rawUrl.includes('ep-xxx') ||
  rawUrl.includes('user:password') ||
  rawUrl.includes('localhost');

const activeDatabaseUrl = isDummy ? NEON_DEFAULT_URL : rawUrl;
process.env.DATABASE_URL = activeDatabaseUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
