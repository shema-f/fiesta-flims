const { execSync } = require('child_process');

// Guarantee Prisma client is generated on Vercel even if Vercel overrides the build command
if (process.env.VERCEL && !process.env.PRISMA_GENERATED) {
  process.env.PRISMA_GENERATED = '1';
  try {
    console.log('[next.config.js] Generating Prisma client for Vercel...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[next.config.js] Prisma generation warning:', err && err.message ? err.message : err);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "*.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "ia.media-imdb.com",
      },
      {
        protocol: "https",
        hostname: "*.media-imdb.com",
      },
      {
        protocol: "https",
        hostname: "m.imdb.com",
      },
      {
        protocol: "https",
        hostname: "*.imdb.com",
      },
      {
        protocol: "https",
        hostname: "imdb-api.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
