import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function run() {
  const movies = await prisma.movie.findMany({
    select: { title: true, poster: true, thumbnailUrl: true },
  });

  const posterByTitle = new Map<string, string>();
  for (const m of movies) {
    if (m.title && m.poster) {
      posterByTitle.set(m.title.toLowerCase().trim(), m.poster);
    }
  }

  const csvPath = 'movies.csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/);

  let updatedLines = 0;
  const newLines = lines.map((line, idx) => {
    if (idx === 0 || !line.trim()) return line;

    // Line format: "Title","Description","Narrator","Genre","Duration","ReleaseYear","FileUrl","ThumbnailUrl",...
    const matches = line.match(/^"([^"]+)"/);
    if (!matches) return line;
    const title = matches[1].toLowerCase().trim();

    // Find if title matches or base title matches (e.g. without "- Part A" or "S01 Ep 1")
    let newPoster: string | undefined;
    for (const [key, poster] of posterByTitle.entries()) {
      if (title === key || title.startsWith(key) || key.startsWith(title)) {
        newPoster = poster;
        break;
      }
    }

    if (newPoster) {
      // Replace any broken tmdb or placeholder poster in line
      const updated = line.replace(
        /https:\/\/(image\.tmdb\.org|m\.media-amazon\.com)[^",]*/g,
        newPoster
      );
      if (updated !== line) updatedLines++;
      return updated;
    }

    return line;
  });

  fs.writeFileSync(csvPath, newLines.join('\n'));
  console.log(`[sync-posters-to-csv] Updated ${updatedLines} rows in movies.csv`);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
