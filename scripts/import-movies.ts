import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface MovieCSV {
  title: string;
  description?: string;
  narrator: string;
  genre: string;
  duration: string;
  releaseYear?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  views?: string;
  downloads?: string;
  isFeatured?: string;
  isActive?: string;
  uploaderEmail: string;
}

async function importMovies() {
  const results: MovieCSV[] = [];
  const csvPath = path.join(process.cwd(), 'movies.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('❌ movies.csv file not found!');
    console.log('💡 Please create a movies.csv file in your project root.');
    process.exit(1);
  }

  console.log('📖 Reading movies.csv...');

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`✅ Found ${results.length} movies to import`);

      for (const [index, movieData] of results.entries()) {
        try {
          // Find uploader by email
          const uploader = await prisma.user.findUnique({
            where: { email: movieData.uploaderEmail },
          });

          if (!uploader) {
            console.error(`❌ User with email ${movieData.uploaderEmail} not found! Skipping movie: ${movieData.title}`);
            continue;
          }

          // Parse data
          const duration = parseInt(movieData.duration);
          const releaseYear = movieData.releaseYear ? parseInt(movieData.releaseYear) : null;
          const views = movieData.views ? parseInt(movieData.views) : 0;
          const downloads = movieData.downloads ? parseInt(movieData.downloads) : 0;
          const isFeatured = movieData.isFeatured ? movieData.isFeatured.toLowerCase() === 'true' : false;
          const isActive = movieData.isActive ? movieData.isActive.toLowerCase() === 'true' : true;

          const slug = movieData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Create movie
          const movie = await prisma.movie.create({
            data: {
              title: movieData.title,
              slug,
              description: movieData.description || null,
              narrator: movieData.narrator,
              genre: movieData.genre,
              duration,
              releaseYear,
              fileUrl: movieData.fileUrl,
              thumbnailUrl: movieData.thumbnailUrl || null,
              resolutions: {},
              views,
              downloads,
              isFeatured,
              isActive,
              uploaderId: uploader.id,
            },
          });

          console.log(`✅ (${index + 1}/${results.length}) Imported: ${movie.title}`);
        } catch (error) {
          console.error(`❌ (${index + 1}/${results.length}) Failed to import: ${movieData.title}`);
          console.error(error);
        }
      }

      console.log('\n🎉 Import process complete!');
      await prisma.$disconnect();
      process.exit(0);
    });
}

importMovies().catch(async (error) => {
  console.error('❌ Import failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
