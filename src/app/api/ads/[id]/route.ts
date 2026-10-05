import { NextRequest, NextResponse } from 'next/server';
import { updateAd, toggleAdActive, deleteAd } from '@/lib/adsData';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.toggleActive) {
      const updated = toggleAdActive(id);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ad: updated });
    }

    const updated = updateAd(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ad: updated });
  } catch (error: any) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ad' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteAd(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete ad' }, { status: 500 });
  }
}
