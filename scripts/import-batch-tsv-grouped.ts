/**
 * Grouping-aware TSV importer (idempotent, additive — never deletes).
 *
 *   npx ts-node scripts/import-batch-tsv-grouped.ts "/path/batch.tsv" [--dry-run]
 *
 * Same 15-column, no-header TSV format as `scripts/import-tsv.ts`:
 *   title, description, narrator, genre, duration, releaseYear, fileUrl,
 *   thumbnailUrl, backdrop, trailer, views, downloads, isFeatured, isActive,
 *   uploaderEmail
 *
 * Unlike the flat importer, episode rows ("Show S01 Ep 3", "Show Ep 2") are
 * folded into a single series title with `resolutions.episodes`, matching how
 * The Polygamist / Outer Banks are stored. A season that belongs to a series
 * which already exists (e.g. Vikings S01 when Vikings S02-S05 are already in
 * the database) is merged into that row instead of creating a duplicate.
 *
 * Phase 2 re-groups loose episode rows that earlier flat imports left behind
 * as standalone movies (e.g. "Deceitful Love Ep 4") and retires those rows.
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireDatabaseUrl } from './_database-url';

const DRY_RUN = process.argv.includes('--dry-run');
const prisma = new PrismaClient({ datasources: { db: { url: requireDatabaseUrl() } } });

const COLUMNS = [
  'title', 'description', 'narrator', 'genre', 'duration', 'releaseYear',
  'fileUrl', 'thumbnailUrl', 'backdrop', 'trailer', 'views', 'downloads',
  'isFeatured', 'isActive', 'uploaderEmail',
] as const;
type Row = Record<(typeof COLUMNS)[number], string>;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseTsv(filePath: string): Row[] {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const parts = line.split('\t');
      const row = {} as Row;
      COLUMNS.forEach((c, i) => (row[c] = (parts[i] ?? '').trim()));
      if (!row.title) throw new Error(`Line ${index + 1} has no title`);
      return row;
    });
}

/** "Devious Maids S01 Ep 03" → { base: 'Devious Maids', season: 1, ep: 3 }. */
function parseEpisodeTitle(title: string): { base: string; season: number; ep: number } | null {
  const t = title.trim().replace(/\s+Final$/i, '');
  let m = t.match(/^(.*\S)\s+S(\d{1,2})\s*Ep(?:isode)?\.?\s*(\d{1,3})$/i);
  if (m) return { base: m[1].trim(), season: parseInt(m[2], 10), ep: parseInt(m[3], 10) };
  m = t.match(/^(.*\S)\s+Ep(?:isode)?\.?\s*(\d{1,3})$/i);
  if (m && m[1].trim()) return { base: m[1].trim(), season: 1, ep: parseInt(m[2], 10) };
  return null;
}

function label(row: Row): string {
  return `${row.narrator || 'unrated'} dub`;
}

function toEpisode(row: Row, parsed: { season: number; ep: number }) {
  const minutes = Math.round((parseInt(row.duration, 10) || 0) / 60);
  return {
    id: `s${parsed.season}e${parsed.ep}`,
    title: row.title.trim(),
    duration: minutes ? `${minutes}m` : undefined,
    description: row.description || undefined,
    thumbnail: row.thumbnailUrl || undefined,
    videoUrl: row.fileUrl || undefined,
    directStreamUrl: row.fileUrl || undefined,
    downloadUrl: row.fileUrl || undefined,
    quality: '1080p FHD',
    narrator: row.narrator,
    seasonNumber: parsed.season,
    episodeNumber: parsed.ep,
  };
}

type Episode = ReturnType<typeof toEpisode>;
type SeriesResolutions = {
  type?: string;
  seasonsCount?: number;
  episodesCount?: number;
  episodes?: Array<Record<string, unknown>>;
};

const epKey = (e: { seasonNumber: number; episodeNumber: number }) =>
  `${e.seasonNumber}x${e.episodeNumber}`;

function mergeEpisodes(
  existing: Array<Record<string, unknown>>,
  incoming: Episode[]
): Episode[] {
  // Some legacy rows were imported with broken numbering (every episode saved
  // as the same season×episode, e.g. Berlin's five episodes all "2x18"),
  // which would silently collapse them into one on merge. Renumber any group
  // of colliding keys by its stored order before deduping.
  const parsedExisting = existing.map((raw) => ({
    raw,
    season: Number((raw as any).seasonNumber || 1),
    ep: Number((raw as any).episodeNumber || 0),
  }));
  const collisions = new Map<string, number>();
  for (const e of parsedExisting) {
    const k = `${e.season}x${e.ep}`;
    collisions.set(k, (collisions.get(k) || 0) + 1);
  }
  const seenPerKey = new Map<string, number>();
  const byKey = new Map<string, Episode>();
  for (const e of parsedExisting) {
    const k = `${e.season}x${e.ep}`;
    const seen = seenPerKey.get(k) || 0;
    seenPerKey.set(k, seen + 1);
    const epNumber = (collisions.get(k) || 0) > 1 ? seen + 1 : e.ep;
    if (!epNumber) continue;
    byKey.set(`${e.season}x${epNumber}`, {
      ...(e.raw as unknown as Episode),
      seasonNumber: e.season,
      episodeNumber: epNumber,
    });
  }
  for (const e of incoming) if (!byKey.has(epKey(e))) byKey.set(epKey(e), e);
  return [...byKey.values()].sort(
    (a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber
  );
}

async function uniqueSlug(base: string, narrator: string): Promise<string> {
  const root = slugify(base);
  const taken = await prisma.movie.findFirst({ where: { slug: root } });
  if (!taken) return root;
  return `${root}-${slugify(narrator)}`;
}

async function ensureSeriesParent(
  base: string,
  rows: Row[],
  uploaderId: string
): Promise<{ id: string; title: string; created: boolean }> {
  const existing = await prisma.movie.findFirst({
    where: { title: { equals: base, mode: 'insensitive' } },
    select: { id: true, title: true, slug: true },
  });
  if (existing) return { id: existing.id, title: existing.title, created: false };

  const first = rows[0];
  const slug = await uniqueSlug(base, first.narrator);
  if (DRY_RUN) return { id: `dry-${slug}`, title: base, created: true };

  const created = await prisma.movie.create({
    data: {
      title: base,
      slug,
      description: first.description || null,
      synopsis: first.description || null,
      narrator: first.narrator,
      genre: first.genre,
      duration: parseInt(first.duration, 10) || 0,
      releaseYear: first.releaseYear ? parseInt(first.releaseYear, 10) : null,
      fileUrl: first.fileUrl || null,
      poster: first.thumbnailUrl || null,
      thumbnailUrl: first.thumbnailUrl || null,
      backdrop: first.backdrop || first.thumbnailUrl || null,
      trailer: first.trailer || null,
      resolutions: { type: 'Series', seasonsCount: 1, episodesCount: 0, episodes: [] },
      views: parseInt(first.views, 10) || 0,
      downloads: parseInt(first.downloads, 10) || 0,
      isFeatured: first.isFeatured.toLowerCase() === 'true',
      isActive: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      uploaderId,
    },
    select: { id: true, title: true },
  });
  return { id: created.id, title: created.title, created: true };
}

async function applyEpisodes(
  movieId: string,
  incoming: Episode[]
): Promise<{ total: number; seasons: number; added: number }> {
  const row = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { resolutions: true },
  });
  const res = (row?.resolutions || {}) as SeriesResolutions;
  const existing = Array.isArray(res.episodes) ? res.episodes : [];
  const merged = mergeEpisodes(existing, incoming);
  const seasons = merged.reduce((max, e) => Math.max(max, e.seasonNumber || 1), 1);
  const next: SeriesResolutions = {
    ...res,
    type: 'Series',
    seasonsCount: Math.max(seasons, Number(res.seasonsCount || 1)),
    episodesCount: merged.length,
    episodes: merged as unknown as Array<Record<string, unknown>>,
  };
  if (!DRY_RUN) {
    await prisma.movie.update({ where: { id: movieId }, data: { resolutions: next as Prisma.InputJsonValue } });
  }
  return { total: merged.length, seasons: next.seasonsCount!, added: merged.length - existing.length };
}

async function main() {
  const file = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'));
  if (!file) throw new Error('Usage: npx ts-node scripts/import-batch-tsv-grouped.ts <batch.tsv> [--dry-run]');
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);

  const rows = parseTsv(resolved);
  const uploader = await prisma.user.findUnique({ where: { email: 'admin@fiestaflix.com' } });
  if (!uploader) throw new Error('admin@fiestaflix.com user missing');

  // ---- classify rows -------------------------------------------------------
  const seriesGroups = new Map<string, Row[]>();
  const movieRows: Row[] = [];
  for (const row of rows) {
    const parsed = parseEpisodeTitle(row.title);
    if (parsed) {
      const key = parsed.base;
      if (!seriesGroups.has(key)) seriesGroups.set(key, []);
      seriesGroups.get(key)!.push(row);
    } else {
      movieRows.push(row);
    }
  }

  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Parsed ${rows.length} rows → ${movieRows.length} movies, ` +
    `${seriesGroups.size} series groups (${[...seriesGroups.values()].reduce((n, g) => n + g.length, 0)} episode rows)`);

  // ---- phase 1: series groups ---------------------------------------------
  let createdSeries = 0;
  let mergedSeries = 0;
  for (const [base, group] of [...seriesGroups.entries()].sort()) {
    const parsedGroup = group
      .map((row) => ({ row, parsed: parseEpisodeTitle(row.title)! }))
      .sort((a, b) => a.parsed.season - b.parsed.season || a.parsed.ep - b.parsed.ep);
    const episodes = parsedGroup.map(({ row, parsed }) => toEpisode(row, parsed));

    const parent = await ensureSeriesParent(base, group, uploader.id);
    if (parent.created) createdSeries++;
    const res = await applyEpisodes(parent.id, episodes);
    if (!parent.created) mergedSeries++;

    const dupes = episodes.length - res.added;
    console.log(
      `  ${parent.created ? 'CREATE' : 'MERGE '} "${parent.title}" — +${res.added} episodes` +
        `${dupes > 0 ? ` (${dupes} already present, skipped)` : ''} → ${res.total} total across ${res.seasons} season(s)`
    );
  }

  // ---- phase 2: plain movies ------------------------------------------------
  let createdMovies = 0;
  let skippedExact = 0;
  let slugSuffixed = 0;
  for (const row of movieRows) {
    const sameTitle = await prisma.movie.findFirst({
      where: { title: { equals: row.title.trim(), mode: 'insensitive' } },
      select: { fileUrl: true },
    });
    if (sameTitle && (sameTitle.fileUrl || '') === row.fileUrl) {
      skippedExact++;
      continue;
    }
    let slug = slugify(row.title);
    if (await prisma.movie.findFirst({ where: { slug } })) {
      slug = `${slug}-${slugify(row.narrator)}`;
      slugSuffixed++;
    }
    if (!DRY_RUN) {
      await prisma.movie.create({
        data: {
          title: row.title.trim(),
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
    }
    createdMovies++;
  }
  console.log(`  Movies: ${createdMovies} created, ${skippedExact} exact duplicates skipped, ` +
    `${slugSuffixed} slug-suffixed (same title, different dub)`);

  // ---- phase 3: regroup loose episode rows left by flat imports -------------
  console.log('\nPhase 3 — regrouping loose episode rows already in the database…');
  const all = await prisma.movie.findMany({
    where: { isActive: true, status: { in: ['READY', 'PUBLISHED'] } },
    select: { id: true, title: true, slug: true, description: true, narrator: true, genre: true,
      duration: true, releaseYear: true, fileUrl: true, poster: true, thumbnailUrl: true,
      resolutions: true },
  });
  const loose = all.filter((m) => {
    const res = (m.resolutions || {}) as SeriesResolutions;
    const hasEps = Array.isArray(res.episodes) && res.episodes.length > 1;
    return !hasEps && parseEpisodeTitle(m.title);
  });
  const looseByBase = new Map<string, typeof loose>();
  for (const m of loose) {
    const base = parseEpisodeTitle(m.title)!.base;
    if (!looseByBase.has(base)) looseByBase.set(base, []);
    looseByBase.get(base)!.push(m);
  }

  for (const [base, members] of [...looseByBase.entries()].sort()) {
    const sorted = members
      .map((m) => ({ m, parsed: parseEpisodeTitle(m.title)! }))
      .sort((a, b) => a.parsed.season - b.parsed.season || a.parsed.ep - b.parsed.ep);
    const episodes: Episode[] = sorted.map(({ m, parsed }) => {
      const minutes = Math.round((m.duration || 0) / 60);
      return {
        id: `s${parsed.season}e${parsed.ep}`,
        title: m.title.trim(),
        duration: minutes ? `${minutes}m` : undefined,
        description: m.description || undefined,
        thumbnail: m.poster || m.thumbnailUrl || undefined,
        videoUrl: m.fileUrl || undefined,
        directStreamUrl: m.fileUrl || undefined,
        downloadUrl: m.fileUrl || undefined,
        quality: '1080p FHD',
        narrator: m.narrator,
        seasonNumber: parsed.season,
        episodeNumber: parsed.ep,
      };
    });

    // Seed the parent's scalar fields from the first retired row so a brand-new
    // series row (one that has no grouped parent yet) gets real metadata.
    const seed: Row = {
      title: base,
      description: sorted[0].m.description || '',
      narrator: sorted[0].m.narrator || '',
      genre: sorted[0].m.genre || '',
      duration: String(sorted[0].m.duration || 0),
      releaseYear: String(sorted[0].m.releaseYear || ''),
      fileUrl: sorted[0].m.fileUrl || '',
      thumbnailUrl: sorted[0].m.poster || sorted[0].m.thumbnailUrl || '',
      backdrop: '',
      trailer: '',
      views: '0',
      downloads: '0',
      isFeatured: 'false',
      isActive: 'true',
      uploaderEmail: 'admin@fiestaflix.com',
    };
    const parent = await ensureSeriesParent(base, [seed], uploader.id);
    const res = await applyEpisodes(parent.id, episodes);
    if (!DRY_RUN) {
      await prisma.movie.updateMany({
        where: { id: { in: sorted.map(({ m }) => m.id) } },
        data: { isActive: false },
      });
    }
    console.log(
      `  "${parent.title}" ← ${sorted.length} loose rows folded in (now ${res.total} episodes, ` +
        `${res.seasons} season(s)); ${sorted.length} standalone rows retired`
    );
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] no writes performed.' : 'Done.'}`);
}

main()
  .catch((e) => { console.error('FAILED:', e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
