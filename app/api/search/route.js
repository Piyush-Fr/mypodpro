import { NextResponse } from 'next/server';
import { searchComprehensive } from '../../../lib/innertube';

const ALLOWED_CATEGORIES = new Set(['all', 'songs', 'albums', 'artists']);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q');
  const rawCategory = searchParams.get('category') || 'all';
  const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : 'all';

  if (!rawQ || !rawQ.trim()) {
    return NextResponse.json({ error: 'Query parameter q is required', tracks: [], albums: [], artists: [] }, { status: 400 });
  }

  // Limit query length to prevent abusive payloads
  const q = rawQ.trim().slice(0, 150);

  try {
    const result = await searchComprehensive(q, category);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Search API failure:', err);
    return NextResponse.json(
      { error: 'Search temporarily unavailable', tracks: [], albums: [], artists: [] },
      { status: 500 }
    );
  }
}
