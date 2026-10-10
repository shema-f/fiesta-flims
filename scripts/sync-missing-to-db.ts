import { prisma } from '../src/lib/prisma';
import catalog from '../src/data/csvCatalog.json';

async function main() {
  console.log('🔄 Checking database for missing movies and series...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fiestaflix.com' },
    update: {},
    create: {
      id: 'admin-01',
      name: 'Fiesta Flix Admin',
      email: 'admin@fiestaflix.com',
      role: 'ADMIN',
    },
  });

  const existingMovies = await prisma.movie.findMany({
    select: { title: true, slug: true },
  });
  const existingTitles = new Set(existingMovies.map((m) => m.title.toLowerCase().trim()));
  const existingSlugs = new Set(existingMovies.map((m) => m.slug.toLowerCase().trim()));

  let insertedCount = 0;

  for (const item of catalog as any[]) {
    const normTitle = item.title.toLowerCase().trim();
    if (existingTitles.has(normTitle)) {
      continue;
    }

    let baseSlug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(slug);
    existingTitles.add(normTitle);

    const isSeries = item.contentType === 'series' || (item.episodes && item.episodes.length > 0);
    const episodes = item.episodes || [];

    const poster = item.image || item.backdrop || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop';
    const backdrop = item.backdrop || poster;

    await prisma.movie.create({
      data: {
        title: item.title,
        slug,
        description: item.description || `Watch ${item.title} translated into Kinyarwanda by ${item.narrator || 'Rocky Kimomo'}.`,
        synopsis: item.description || null,
        narrator: item.narrator || 'Rocky Kimomo',
        genre: item.genre || 'Action',
        duration: isSeries ? 2700 : 7200,
        releaseYear: item.year || 2024,
        fileUrl: item.directStreamUrl || null,
        thumbnailUrl: poster,
        poster,
        backdrop,
        trailer: item.trailer || null,
        resolutions: {
          type: isSeries ? 'Series' : 'Movie',
          seasonsCount: item.seasonsCount || (isSeries ? 1 : undefined),
          episodesCount: episodes.length,
          episodes,
        },
        views: 18500 + Math.floor(Math.random() * 25000),
        downloads: 4200 + Math.floor(Math.random() * 8000),
        rating: item.rating || 8.8,
        ratingCount: 350,
        isFeatured: Boolean(item.trending),
        isActive: true,
        status: 'PUBLISHED',
        uploaderId: admin.id,
      },
    });

    insertedCount++;
    console.log(`✅ Inserted into Neon DB: "${item.title}" (${item.contentType || 'movie'})`);
  }

  const finalTotal = await prisma.movie.count();
  console.log(`\n🎉 DONE! Inserted ${insertedCount} new movies. Total in Neon DB: ${finalTotal}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error inserting missing movies:', err);
  process.exit(1);
});
