/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  /**
   * Baseline security headers for every response.
   *
   * A full Content-Security-Policy is intentionally omitted until the admin
   * panel and player are audited for inline script usage — shipping a CSP that
   * silently breaks would just get it removed. These are safe today.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ];
  },

  images: {
    // Explicit allow-list. The previous catch-all `hostname: "**"` let any
    // origin through, which turned the image optimiser into an open proxy.
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: '*.media-amazon.com' },
      { protocol: 'https', hostname: 'media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'ia.media-imdb.com' },
      { protocol: 'https', hostname: '*.media-imdb.com' },
      { protocol: 'https', hostname: 'm.imdb.com' },
      { protocol: 'https', hostname: '*.imdb.com' },
      { protocol: 'https', hostname: 'imdb-api.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'api.themoviedb.org' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: '*.gstatic.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'hgcloud.to' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'commondatastorage.googleapis.com' },
      { protocol: 'https', hostname: '*.storage.googleapis.com' },
    ],
  },
};

module.exports = nextConfig;
