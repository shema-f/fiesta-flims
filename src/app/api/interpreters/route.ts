import { NextResponse } from 'next/server';
import { narratorsData } from '@/lib/narratorData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: narratorsData
  });
}
