import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache for resolved direct links (15 minutes TTL)
const cache = new Map<string, { directUrl: string; expiresAt: number }>();

async function resolveDirectMediaFireUrl(pageUrl: string): Promise<string | null> {
  const cached = cache.get(pageUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.directUrl;
  }

  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Primary match: downloadButton id anchor href
    const m1 = html.match(/<a[^>]*id=["']downloadButton["'][^>]*href=["']([^"']+)["']/i);
    if (m1 && m1[1] && m1[1].startsWith('http')) {
      cache.set(pageUrl, { directUrl: m1[1], expiresAt: Date.now() + 15 * 60 * 1000 });
      return m1[1];
    }

    // 2. Secondary match: mediafire download domain
    const m2 = html.match(/href=["'](https?:\/\/[^"']*download[^"']*\.mediafire\.com\/[^"']+)["']/i);
    if (m2 && m2[1]) {
      cache.set(pageUrl, { directUrl: m2[1], expiresAt: Date.now() + 15 * 60 * 1000 });
      return m2[1];
    }

    // 3. Tertiary match: any explicit direct link matching mp4/mkv/video
    const m3 = html.match(/href=["'](https?:\/\/[^"']+\.(?:mp4|mkv|avi|mov|webm)[^"']*)["']/i);
    if (m3 && m3[1]) {
      cache.set(pageUrl, { directUrl: m3[1], expiresAt: Date.now() + 15 * 60 * 1000 });
      return m3[1];
    }
  } catch (err) {
    console.warn('[api/download] Failed resolving direct link for:', pageUrl, err);
  }

  return null;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const rawUrl = sp.get('url');
  const format = sp.get('format'); // 'json' or standard redirect

  if (!rawUrl) {
    return NextResponse.json({ success: false, error: 'Missing "url" parameter' }, { status: 400 });
  }

  let directUrl = rawUrl;

  // If this is a MediaFire file landing page
  if (rawUrl.includes('mediafire.com/file/') || rawUrl.includes('mediafire.com/?')) {
    const resolved = await resolveDirectMediaFireUrl(rawUrl);
    if (resolved) {
      directUrl = resolved;
    }
  }

  // If client requested JSON (e.g. for in-player stream or background fetch)
  if (format === 'json') {
    return NextResponse.json({
      success: true,
      originalUrl: rawUrl,
      directUrl,
      isDirect: directUrl !== rawUrl,
    });
  }

  // Redirect the browser straight to the binary file download
  return NextResponse.redirect(directUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
