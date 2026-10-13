/**
 * Import Rwandan Series into Neon / PostgreSQL database & append to movies.csv.
 *
 *   npx ts-node scripts/import-rwandan-series.ts
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { RWANDAN_SERIES_DATA } from '../src/lib/rwandanSeriesData';

const ORIGIN = 'Rwandan Cinema';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function csvQuote(val: string): string {
  return `"${(val || '').replace(/"/g, '""')}"`;
}

async function main() {
  const prisma = new PrismaClient();
  let created = 0;
  let updated = 0;

  console.log(`Starting import for ${RWANDAN_SERIES_DATA.length} Rwandan Cinema series...`);

  let adminUser = null;
  try {
    adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });
  } catch (err: any) {
    console.warn('Could not query database directly:', err?.message);
  }

  // Append to movies.csv
  const csvPath = path.join(process.cwd(), 'movies.csv');
  let csvContent = '';
  if (fs.existsSync(csvPath)) {
    csvContent = fs.readFileSync(csvPath, 'utf8');
  }

  const linesToAppend: string[] = [];

  for (const s of RWANDAN_SERIES_DATA) {
    const primaryYtId = s.featured_episode_id || s.episodes[0]?.video_id || '';
    const ytThumb = primaryYtId
      ? `https://img.youtube.com/vi/${primaryYtId}/hqdefault.jpg`
      : 'https://img.youtube.com/vi/pvlaJNKBrv8/hqdefault.jpg';
    const primaryUrl = s.episodes[0]?.url || s.playlist_url;

    // Check if in CSV
    const csvKey = `"${s.title.replace(/"/g, '""')}"`;
    if (!csvContent.includes(csvKey)) {
      // CSV format:
      // title,description,narrator,genre,duration,releaseYear,fileUrl,thumbnailUrl,backdrop,trailer,views,downloads,isFeatured,isActive,uploaderEmail
      const row = [
        csvQuote(s.title),
        csvQuote(s.description),
        '""', // NO interpreter! Authentically presented
        csvQuote(s.genre),
        String(s.episodes.length * 2700), // duration in seconds
        String(s.year || 2024),
        csvQuote(primaryUrl),
        csvQuote(ytThumb),
        csvQuote(ytThumb),
        csvQuote(primaryUrl),
        '25000',
        '8400',
        'TRUE',
        'TRUE',
        csvQuote(adminUser?.email || 'admin@fiestaflix.com'),
      ].join(',');
      linesToAppend.push(row);
    }

    // Try database upsert if DB is reachable
    if (adminUser) {
      try {
        const slug = slugify(s.title);
        const existing = await prisma.movie.findFirst({
          where: { OR: [{ title: s.title }, { slug }] },
        });

        const movieData = {
          title: s.title,
          slug: existing?.slug || slug,
          description: s.description,
          synopsis: s.description,
          narrator: '', // Authentically Rwandan, no interpreter talking over!
          genre: s.genre,
          duration: s.episodes.length * 2700,
          releaseYear: s.year || 2024,
          fileUrl: primaryUrl,
          trailer: primaryUrl,
          poster: ytThumb,
          thumbnailUrl: ytThumb,
          backdrop: ytThumb,
          rating: 9.2,
          isFeatured: true,
          isActive: true,
          status: 'PUBLISHED' as const,
          rightsOwner: ORIGIN,
          contentRightsStatus: 'LICENSED' as const,
          distributionTerritories: ['RW', 'UG', 'KE', 'CD', 'BI'],
          uploaderId: adminUser.id,
          resolutions: {
            type: 'series',
            creator: s.creator,
            channel: s.channel_name,
            seasonsCount: 1,
            episodesCount: s.episodes.length,
            episodes: s.episodes.map((ep) => {
              const epYtId =
                ep.video_id ||
                (ep.url.includes('watch?v=')
                  ? ep.url.split('watch?v=')[1]?.slice(0, 11)
                  : primaryYtId);
              return {
                episodeNumber: ep.episode_number,
                title: ep.title,
                url: ep.url,
                embedUrl: ep.embed_url,
                videoId: epYtId,
                thumbnail: epYtId
                  ? `https://img.youtube.com/vi/${epYtId}/hqdefault.jpg`
                  : ytThumb,
                quality: '1080p FHD',
              };
            }),
          },
        };

        if (existing) {
          await prisma.movie.update({
            where: { id: existing.id },
            data: movieData,
          });
          updated++;
        } else {
          await prisma.movie.create({
            data: movieData,
          });
          created++;
        }
      } catch (dbErr: any) {
        console.warn(`Could not sync ${s.title} to database:`, dbErr?.message);
      }
    }
  }

  if (linesToAppend.length > 0) {
    const trailingNewline = csvContent.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(csvPath, trailingNewline + linesToAppend.join('\n') + '\n');
    console.log(`✅ Appended ${linesToAppend.length} Rwandan series to movies.csv`);
  } else {
    console.log(`ℹ️ All series already exist in movies.csv`);
  }

  console.log(`Database sync: created ${created}, updated ${updated}`);
  await prisma.$disconnect().catch(() => {});
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});
