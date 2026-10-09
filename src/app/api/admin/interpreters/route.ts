import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { interpretersData } from '@/lib/interpreters';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let interpreters = await prisma.interpreter.findMany({
      orderBy: { moviesCount: 'desc' },
    });

    // If DB is empty, fallback to catalog static dataset
    if (interpreters.length === 0) {
      return NextResponse.json({
        success: true,
        data: interpretersData,
      });
    }

    return NextResponse.json({
      success: true,
      data: interpreters,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch interpreters' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, slug, name, bio, image, rating, moviesCount } = await request.json();

    if (!slug && !id) {
      return NextResponse.json(
        { success: false, error: 'Slug or ID is required' },
        { status: 400 }
      );
    }

    const where = id ? { id } : { slug };

    const updated = await prisma.interpreter.update({
      where: where as any,
      data: {
        ...(name ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(image ? { image } : {}),
        ...(rating !== undefined ? { rating: parseFloat(String(rating)) } : {}),
        ...(moviesCount !== undefined ? { moviesCount: parseInt(String(moviesCount), 10) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Interpreter updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update interpreter' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, bio, image, rating } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await prisma.interpreter.upsert({
      where: { slug },
      update: {
        name,
        bio: bio || '',
        image: image || '/interpreters/Rocky Kimomo.png',
        rating: rating ? parseFloat(String(rating)) : 9.0,
      },
      create: {
        name,
        slug,
        bio: bio || '',
        image: image || '/interpreters/Rocky Kimomo.png',
        rating: rating ? parseFloat(String(rating)) : 9.0,
        moviesCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Interpreter created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create interpreter' },
      { status: 500 }
    );
  }
}
