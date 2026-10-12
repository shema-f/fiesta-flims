import { NextRequest, NextResponse } from 'next/server';
import {
  getCinemaNewsBySlug,
  incrementNewsViews,
  toggleNewsLike,
  getAllCinemaNews,
} from '@/lib/cinemaNewsData';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/api/helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = getCinemaNewsBySlug(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }

    // Increment views
    incrementNewsViews(id);

    // Find related articles (same category or shared tags)
    const allNews = getAllCinemaNews();
    const related = allNews
      .filter((n) => n.id !== article.id && (n.category === article.category || n.region === article.region))
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      article,
      related,
    });
  } catch (error: any) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Public like-toggle — cap per IP so counters cannot be farmed.
  const limit = await checkRateLimit(`news-like:${getClientIp(req)}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const { id } = await params;
    const result = toggleNewsLike(id);
    return NextResponse.json({
      success: true,
      likes: result.likes,
    });
  } catch (error: any) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
