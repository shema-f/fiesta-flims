import { NextRequest, NextResponse } from 'next/server';
import { getAllCinemaNews, addCinemaNews } from '@/lib/cinemaNewsData';
import { requireAdmin } from '@/lib/api/helpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let articles = getAllCinemaNews();

    // Filter by category
    if (category && category.toLowerCase() !== 'all') {
      articles = articles.filter(
        (a) =>
          a.category.toLowerCase() === category.toLowerCase() ||
          (category.toLowerCase() === 'breaking' && a.isBreaking)
      );
    }

    // Filter by search term
    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.region.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'popular') {
      articles.sort((a, b) => b.views + b.likes * 5 - (a.views + a.likes * 5));
    } else {
      // Latest
      articles.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    const total = articles.length;
    const startIndex = (page - 1) * limit;
    const paginatedArticles = articles.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      articles: paginatedArticles,
    });
  } catch (error: any) {
    console.error('Error fetching cinema news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cinema news' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      category,
      region,
      authorName,
      authorRole,
      authorAvatar,
      image,
      backdrop,
      tags,
      readTime,
      isBreaking,
      isFeatured,
      relatedMovieId,
    } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) + `-${Date.now().toString().slice(-4)}`;

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Cinema News', category || 'Global'];

    const newArticle = addCinemaNews({
      slug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'Hollywood',
      region: region || 'Global',
      author: {
        name: authorName || 'Fiesta News Editor',
        role: authorRole || 'Cinema Journalist',
        avatar:
          authorAvatar ||
          '/fallback-poster.png',
      },
      readTime: readTime || '4 min read',
      image:
        image ||
        '/fallback-poster.png',
      backdrop:
        backdrop ||
        image ||
        '/fallback-poster.png',
      tags: parsedTags,
      isBreaking: !!isBreaking,
      isFeatured: !!isFeatured,
      relatedMovieId,
    });

    return NextResponse.json({
      success: true,
      message: 'Cinema news article published successfully',
      article: newArticle,
    });
  } catch (error: any) {
    console.error('Error creating cinema news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish cinema news article' },
      { status: 500 }
    );
  }
}
