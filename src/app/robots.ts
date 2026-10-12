import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Robots rules per Google Search Essentials.
 *
 * We allow the whole public surface and explicitly block areas that must not
 * be indexed: admin, APIs, auth pages, account areas and internal search
 * result pages (which would otherwise dilute the catalogue in the index).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/login',
          '/signup',
          '/forgot-password',
          '/favorites',
          '/upload-clip',
          '/search',
        ],
      },
      // AI crawlers may read public pages but must not train on the video
      // endpoints or hit the APIs.
      { userAgent: ['CCBot', 'GPTBot'], disallow: ['/api/', '/admin'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
