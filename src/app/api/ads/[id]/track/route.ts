import { NextRequest, NextResponse } from 'next/server';
import { trackAdImpression, trackAdClick } from '@/lib/adsData';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/api/helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Impressions fire on every page view, so this is a high-frequency public
  // write — generous cap, but enough to stop counter inflation scripts.
  const limit = await checkRateLimit(`ad-track:${getClientIp(req)}`, 120, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const { id } = await params;
    const { action } = await req.json();

    if (action === 'click') {
      await trackAdClick(id);
    } else {
      await trackAdImpression(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
