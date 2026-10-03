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
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
      },
    ],
  },
};

module.exports = nextConfig;
