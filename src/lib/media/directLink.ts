/**
 * Direct media link resolution.
 *
 * The catalogue stores MediaFire *landing* pages (`/file/<id>/<name>.mp4/file`),
 * which serve HTML — dropping one straight into a `<video src>` fails. This
 * module turns a landing page into the real binary URL the CDN serves.
 *
 * Shared by `/api/download` (307 redirect) and `/api/movies/:id/play`
 * (returned to the player), so both agree on what a playable URL is.
 */

interface CacheEntry {
  directUrl: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/** True when the URL points at a MediaFire file landing page, not the binary. */
export function isMediaFireLandingPage(url: string): boolean {
  return /mediafire\.com\/file\//i.test(url) || /mediafire\.com\/\?/i.test(url);
}

/** True when the URL is an HTML watch/share page that a `<video>` cannot play. */
export function isUnplayableUrl(url: string): boolean {
  if (!url) return true;
  if (isMediaFireLandingPage(url)) return true;
  return /(?:youtube\.com\/(?:watch|shorts|embed\/)|youtu\.be\/|facebook\.com\/|instagram\.com\/)/i.test(
    url
  );
}

function remember(pageUrl: string, directUrl: string): string {
  cache.set(pageUrl, { directUrl, expiresAt: Date.now() + CACHE_TTL_MS });
  return directUrl;
}

/**
 * Resolve a MediaFire landing page to its direct binary URL.
 * Returns the input unchanged when it is already direct or cannot be resolved.
 */
export async function resolveDirectUrl(url: string): Promise<string> {
  if (!url || !isMediaFireLandingPage(url)) return url;

  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.directUrl;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) return url;
    const html = await res.text();

    // 1. The explicit download button.
    const m1 = html.match(/<a[^>]*id=["']downloadButton["'][^>]*href=["']([^"']+)["']/i);
    if (m1?.[1]?.startsWith('http')) return remember(url, m1[1]);

    // 2. The CDN download host — MediaFire's real binary endpoint.
    const m2 = html.match(/https?:\/\/download\d*\.mediafire\.com\/[^"'\s\\]+/i);
    if (m2?.[0]) return remember(url, m2[0]);

    // 3. A video file link anywhere else on the page. The landing page itself
    //    contains ".mp4" in its own URL, so it must be excluded or we would
    //    "resolve" the page to itself.
    const m3 = html.match(
      /href=["'](https?:\/\/(?!www\.mediafire\.com\/file\/)[^"']+?\.(?:mp4|mkv|avi|mov|webm)(?:\?[^"']*)?)["']/i
    );
    if (m3?.[1]) return remember(url, m3[1]);
  } catch (err) {
    console.warn('[directLink] Failed resolving direct link for:', url, (err as Error)?.message);
  }

  return url;
}
