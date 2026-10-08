import { PrismaClient } from '@prisma/client';
import { interpretersData } from '../src/lib/interpreters';

const NEON_URL =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('ep-xxx') &&
  !process.env.DATABASE_URL.includes('user:password')
    ? process.env.DATABASE_URL
    : 'postgresql://neondb_owner:npg_Ais3XE9DuWLz@ep-twilight-glitter-b5gdjgeo-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_URL,
    },
  },
});

async function run() {
  console.log('🔄 Syncing interpreters into Neon database with real movie counts and 0 followers...');

  // 1. Fetch live movie counts per narrator from Neon DB
  const movies = await prisma.movie.findMany({
    select: { id: true, title: true, narrator: true },
  });

  const countByInterpreter: Record<string, number> = {};

  for (const m of movies) {
    const raw = (m.narrator || '').toLowerCase();
    let key = 'Other';

    if (raw.includes('rocky')) key = 'Rocky';
    else if (raw.includes('junior giti') || raw.includes('junior')) key = 'Junior Giti';
    else if (raw.includes('sankara')) key = 'Sankara';
    else if (raw.includes('gaheza')) key = 'Gaheza';
    else if (raw.includes('savimbi')) key = 'Savimbi';
    else if (raw.includes('yanga')) key = 'Yanga';
    else if (raw.includes('genius')) key = 'Genius';
    else if (raw.includes('didier')) key = 'Didier';
    else if (raw.includes('dylan')) key = 'Dylan';
    else if (raw.includes('master p')) key = 'Master P';
    else if (raw.includes('pk') || raw.includes('p.k')) key = 'PK';
    else if (raw.includes('skov') || raw.includes('sikov')) key = 'Skov';

    countByInterpreter[key] = (countByInterpreter[key] || 0) + 1;
  }

  console.log('📊 Real movie counts from live database:', countByInterpreter);

  // 2. Upsert each interpreter in the database
  let synced = 0;
  for (const item of interpretersData) {
    const realCount =
      countByInterpreter[item.name] ||
      (item.name === 'Rocky' ? countByInterpreter['Rocky'] : 0) ||
      (item.name === 'Sankara' ? countByInterpreter['Sankara'] : 0) ||
      (item.name === 'Gaheza' ? countByInterpreter['Gaheza'] : 0) ||
      0;

    await prisma.interpreter.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        bio: item.bio,
        image: item.image,
        rating: item.rating,
        moviesCount: realCount,
      },
      create: {
        name: item.name,
        slug: item.slug,
        bio: item.bio,
        image: item.image,
        rating: item.rating,
        moviesCount: realCount,
      },
    });
    synced++;
  }

  console.log(`✅ Synced ${synced} interpreters into database with real movie counts!`);

  // Verify
  const inDb = await prisma.interpreter.findMany({
    where: { moviesCount: { gt: 0 } },
    select: { name: true, slug: true, moviesCount: true },
    orderBy: { moviesCount: 'desc' },
  });

  console.log('🏆 Active interpreters in DB:');
  console.table(inDb);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error('Error syncing interpreters:', e);
  process.exit(1);
});
