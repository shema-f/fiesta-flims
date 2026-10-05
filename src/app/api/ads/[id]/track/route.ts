import { NextRequest, NextResponse } from 'next/server';
import { trackAdImpression, trackAdClick } from '@/lib/adsData';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (action === 'click') {
      trackAdClick(id);
    } else {
      trackAdImpression(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
