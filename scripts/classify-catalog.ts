/**
 * Catalogue classification pass (idempotent).
 *
 *   npx ts-node scripts/classify-catalog.ts [--dry-run]
 *
 * Two jobs, both safe to re-run:
 *
 *   1. Tags the Indian titles in the catalogue with an `Indian` genre marker.
 *      The site already ships a /genres/indian landing page, but it matched on
 *      genre text alone and Indian films carry normal genres ("Comedy, Drama,
 *      Musical, Romance"), so the page 404'd while sitting in the sitemap.
 *
 *   2. Copies real artwork onto Rwandan originals whose poster is still the
 *      shared placeholder, whenever a sibling row (the series a feature cut
 *      came from) has a usable image.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { requireDatabaseUrl } from './_database-url';

const DRY_RUN = process.argv.includes('--dry-run');
const prisma = new PrismaClient({ datasources: { db: { url: requireDatabaseUrl() } } });

/** Curated list — Bollywood, Kollywood, Tollywood, Kannada and Marathi titles. */
const INDIAN_TITLES = [
  'Bhooth Bangla- Part A',
  'Bhooth Bangla- Part B',
  'Dabangg 2',
  'Ek Ajnabee',
  'Fan',
  'Jaat',
  'Kadamban',
  'KD – The Devil',
  'KD – The Devil- Part A',
  'Kal Ho Naa Ho',
  'Kuch Kuch Hota Hai',
  'Like Stars on Earth',
  'Navya : Naye Dhadkan Naye Sawaal',
  'PK',
  'Rab Ne Bana Di Jodi - Part B',
  'Rab Ne Bana Di Jodi- Part A',
  'Raja Shivaji- Part A',
  'Raja Shivaji- Part B',
  'Saiyaara',
  'Secret Superstar',
  'Tanhaji: The Unsung Warrior',
  'Vishwanath & Sons',
  'WAR',
  'We Are Family',
];

/** Title comparison that survives the stray spaces and dashes in the data. */
function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const INDIAN_SET = new Set(INDIAN_TITLES.map(normalizeTitle));

/** Base-title key: drops the "(Feature Cut)" style suffixes siblings share. */
function baseKey(title: string): string {
  return normalizeTitle(title.replace(/\((feature cut|the series|movie)\)/gi, ''));
}

function isUsableImage(url: string | null | undefined): boolean {
  return Boolean(url) && /^https?:/i.test(url!) && !url!.includes('fallback');
}

async function tagIndianMovies(): Promise<number> {
  const rows = await prisma.movie.findMany({
    select: { id: true, title: true, genre: true },
  });
  let tagged = 0;
  for (const row of rows) {
    if (!INDIAN_SET.has(normalizeTitle(row.title))) continue;
    const genre = row.genre || '';
    if (genre.toLowerCase().split(',').some((g) => g.trim().toLowerCase() === 'indian')) continue;
    const next = genre ? `${genre}, Indian` : 'Indian';
    if (!DRY_RUN) {
      await prisma.movie.update({ where: { id: row.id }, data: { genre: next } });
    }
    tagged++;
    console.log(`  ${DRY_RUN ? '[dry] ' : ''}tag "${row.title}" → ${next}`);
  }
  return tagged;
}

async function repairRwandanPosters(): Promise<number> {
  const rows = await prisma.movie.findMany({
    select: { id: true, title: true, poster: true, thumbnailUrl: true, rightsOwner: true },
  });

  // First usable image wins per base title — the series a feature cut came
  // from almost always carries the artwork.
  const imageByBase = new Map<string, string>();
  for (const row of rows) {
    const key = baseKey(row.title);
    const image = row.poster || row.thumbnailUrl;
    if (!isUsableImage(image)) continue;
    if (!imageByBase.has(key)) imageByBase.set(key, image!);
  }

  let repaired = 0;
  for (const row of rows) {
    if (row.rightsOwner !== 'Rwandan Cinema') continue;
    if (isUsableImage(row.poster) || isUsableImage(row.thumbnailUrl)) continue;
    const image = imageByBase.get(baseKey(row.title));
    if (!image) continue;
    if (!DRY_RUN) {
      await prisma.movie.update({
        where: { id: row.id },
        data: { poster: image, thumbnailUrl: image } as Prisma.MovieUpdateInput,
      });
    }
    repaired++;
    console.log(`  ${DRY_RUN ? '[dry] ' : ''}poster "${row.title}" → ${image}`);
  }
  return repaired;
}

async function main() {
  if (DRY_RUN) console.log('[DRY RUN] no writes will be performed\n');

  console.log('1) Tagging Indian titles…');
  const tagged = await tagIndianMovies();
  console.log(`   ${tagged} title(s) ${DRY_RUN ? 'would be ' : ''}tagged\n`);

  console.log('2) Repairing Rwandan posters from sibling rows…');
  const repaired = await repairRwandanPosters();
  console.log(`   ${repaired} poster(s) ${DRY_RUN ? 'would be ' : ''}repaired`);
}

main()
  .catch((e) => {
    console.error('FAILED:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
