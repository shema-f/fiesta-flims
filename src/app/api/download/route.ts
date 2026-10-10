import { NextRequest, NextResponse } from 'next/server';
import { resolveDirectUrl, isMediaFireLandingPage } from '@/lib/media/directLink';

export const dynamic = 'force-dynamic';

/**
 * GET /api/download?url=…
 *
 * Resolves a catalogue link to a playable/downloadable binary and hands the
 * browser a 307 straight to it. MediaFire landing pages are unwrapped first;
 * everything else is passed through unchanged.
 *
 * `?format=json` returns the resolved URL instead of redirecting, so callers
 * (the player) can inspect it before committing to it.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const rawUrl = sp.get('url');
  const format = sp.get('format'); // 'json' or standard redirect

  if (!rawUrl) {
    return NextResponse.json({ success: false, error: 'Missing "url" parameter' }, { status: 400 });
  }

  let directUrl = rawUrl;

  if (isMediaFireLandingPage(rawUrl)) {
    directUrl = await resolveDirectUrl(rawUrl);
  }

  const isDirect = directUrl !== rawUrl;

  // If client requested JSON (e.g. for in-player stream or background fetch)
  if (format === 'json') {
    return NextResponse.json({
      success: true,
      originalUrl: rawUrl,
      directUrl,
      isDirect,
      resolved: isDirect,
    });
  }

  // Redirect the browser straight to the binary file download / stream.
  return NextResponse.redirect(directUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
