import { NextResponse } from 'next/server';
import { getArtistCatalog } from '../../../lib/innertube';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get('name');
  const rawId = searchParams.get('id');

  if (!rawName && !rawId) {
    return NextResponse.json({ error: 'Query parameter name or id is required' }, { status: 400 });
  }

  const name = rawName ? rawName.trim().slice(0, 150) : '';
  const id = rawId ? rawId.trim().slice(0, 100) : '';

  try {
    const catalog = await getArtistCatalog(name, id);
    return NextResponse.json(catalog);
  } catch (err) {
    console.error('Artist API failure:', err);
    return NextResponse.json(
      { error: 'Failed to fetch artist profile', artist: null, topTracks: [], albums: [] },
      { status: 500 }
    );
  }
}
