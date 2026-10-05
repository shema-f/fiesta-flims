import { NextRequest, NextResponse } from 'next/server';
import { getAllAds, getActiveAds, createAd, AdPlacement } from '@/lib/adsData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement') as AdPlacement | null;
    const all = searchParams.get('all') === 'true';

    const ads = all ? getAllAds() : getActiveAds(placement || undefined);

    return NextResponse.json({
      success: true,
      ads,
      total: ads.length,
    });
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      headline,
      description,
      placement,
      imageUrl,
      targetUrl,
      badgeText,
      ctaText,
      isActive,
    } = body;

    if (!title || !headline || !targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, headline, and targetUrl are required' },
        { status: 400 }
      );
    }

    const newAd = createAd({
      title: title.trim(),
      headline: headline.trim(),
      description: (description || '').trim(),
      placement: placement || 'HEADER_BANNER',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      targetUrl: targetUrl.trim(),
      badgeText: badgeText || 'Sponsored',
      ctaText: ctaText || 'Learn More',
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: 'Ad campaign created successfully',
      ad: newAd,
    });
  } catch (error: any) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ad' }, { status: 500 });
  }
}
