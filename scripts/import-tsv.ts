/**
 * Idempotent TSV importer.
 *
 *   npx ts-node scripts/import-tsv.ts "/path/to/batch.tsv"
 *
 * The TSV is column-compatible with `movies.csv` (no header row):
 *   title, description, narrator, genre, duration, releaseYear, fileUrl,
 *   thumbnailUrl, backdrop, trailer, views, downloads, isFeatured, isActive,
 *   uploaderEmail
 *
 * Two things happen, both safe to re-run:
 *   1. rows missing from `movies.csv` are appended (deduped by title);
 *   2. rows missing from PostgreSQL are inserted (deduped by title, and by
 *      slug if a different title already owns it).
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const COLUMNS = [
  'title',
  'description',
  'narrator',
  'genre',
  'duration',
  'releaseYear',
  'fileUrl',
  'thumbnailUrl',
  'backdrop',
  'trailer',
  'views',
  'downloads',
  'isFeatured',
  'isActive',
  'uploaderEmail',
] as const;

type Row = Record<(typeof COLUMNS)[number], string>;

/** Same fallback the other scripts use so the import works without a local .env. */
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Ais3XE9DuWLz@ep-twilight-glitter-b5gdjgeo-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseTsv(filePath: string): Row[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const parts = line.split('\t');
      const row = {} as Row;
      COLUMNS.forEach((column, i) => {
        row[column] = (parts[i] ?? '').trim();
      });
      if (!row.title) throw new Error(`Line ${index + 1} has no title`);
      return row;
    });
}

function csvQuote(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function appendToCsv(rows: Row[]): number {
  const csvPath = path.join(process.cwd(), 'movies.csv');
  const existing = fs.readFileSync(csvPath, 'utf8');
  let appended = 0;
  const lines: string[] = [];

  for (const row of rows) {
    if (existing.includes(`"${row.title.replace(/"/g, '""')}"`)) continue;
    lines.push(COLUMNS.map((column) => csvQuote(row[column])).join(','));
    appended++;
  }

  if (lines.length > 0) {
    const needsLeadingNewline = !existing.endsWith('\n');
    fs.appendFileSync(csvPath, (needsLeadingNewline ? '\n' : '') + lines.join('\n') + '\n');
  }
  return appended;
}

async function insertIntoDb(rows: Row[]): Promise<{ inserted: number; skipped: number }> {
  const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  let inserted = 0;
  let skipped = 0;

  try {
    const uploader = await prisma.user.findUnique({
      where: { email: rows[0]?.uploaderEmail || 'admin@fiestaflix.com' },
    });
    if (!uploader) throw new Error(`Uploader ${rows[0]?.uploaderEmail} not found in the database`);

    for (const row of rows) {
      const already = await prisma.movie.findFirst({ where: { title: row.title } });
      if (already) {
        skipped++;
        continue;
      }

      let slug = slugify(row.title);
      const slugTaken = await prisma.movie.findFirst({ where: { slug } });
      if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;

      await prisma.movie.create({
        data: {
          title: row.title,
          slug,
          description: row.description || null,
          synopsis: row.description || null,
          narrator: row.narrator,
          genre: row.genre,
          duration: parseInt(row.duration, 10) || 0,
          releaseYear: row.releaseYear ? parseInt(row.releaseYear, 10) : null,
          fileUrl: row.fileUrl || null,
          poster: row.thumbnailUrl || null,
          thumbnailUrl: row.thumbnailUrl || null,
          backdrop: row.backdrop || row.thumbnailUrl || null,
          trailer: row.trailer || null,
          resolutions: {},
          views: parseInt(row.views, 10) || 0,
          downloads: parseInt(row.downloads, 10) || 0,
          isFeatured: row.isFeatured.toLowerCase() === 'true',
          isActive: row.isActive.toLowerCase() !== 'false',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          uploaderId: uploader.id,
        },
      });
      inserted++;
    }
  } finally {
    await prisma.$disconnect();
  }

  return { inserted, skipped };
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: npx ts-node scripts/import-tsv.ts <path-to-file.tsv>');
    process.exit(1);
  }
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const rows = parseTsv(resolved);
  console.log(`Parsed ${rows.length} rows from ${path.basename(resolved)}`);

  const appended = appendToCsv(rows);
  console.log(`movies.csv: appended ${appended} (skipped ${rows.length - appended} existing)`);

  const { inserted, skipped } = await insertIntoDb(rows);
  console.log(`database  : inserted ${inserted}, skipped ${skipped} already present`);

  console.log('✅ Import complete.');
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
