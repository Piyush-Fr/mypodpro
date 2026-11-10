import { NextResponse } from 'next/server';
import { getSearchSuggestions } from '../../../../lib/innertube';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 100);
  if (!q) return NextResponse.json({ queries: [], items: [] });

  try {
    return NextResponse.json(await getSearchSuggestions(q));
  } catch (err) {
    console.error('Suggest API failure:', err);
    return NextResponse.json({ queries: [], items: [] }, { status: 500 });
  }
}
