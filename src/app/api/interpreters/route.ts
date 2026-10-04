import { NextResponse } from 'next/server';
import { interpretersData } from '@/lib/interpreters';

export const dynamic = 'force-dynamic';

/** GET /api/interpreters — the Agasobanuye voice directory. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: interpretersData,
  });
}
