import { NextRequest, NextResponse } from 'next/server';
import { updateAd, toggleAdActive, deleteAd } from '@/lib/adsData';
import { requireAdmin, checkRateLimit, rateLimitResponse } from '@/lib/api/helpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`ad-edit:${guard.user.id}`, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const { id } = await params;
    const body = await req.json();

    if (body.toggleActive) {
      const updated = await toggleAdActive(id);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ad: updated });
    }

    const updated = await updateAd(id, body);
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
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const limit = await checkRateLimit(`ad-delete:${guard.user.id}`, 30, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const { id } = await params;
    const deleted = await deleteAd(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete ad' }, { status: 500 });
  }
}
