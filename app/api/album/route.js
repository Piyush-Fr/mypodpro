import { NextResponse } from 'next/server';
import { getAlbumDetails } from '../../../lib/innertube';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get('id');
  const rawTitle = searchParams.get('title');
  const rawArtist = searchParams.get('artist');

  if (!rawId && !rawTitle) {
    return NextResponse.json({ error: 'Query parameter id or title is required' }, { status: 400 });
  }

  const id = rawId ? rawId.trim().slice(0, 100) : '';
  const title = rawTitle ? rawTitle.trim().slice(0, 150) : '';
  const artist = rawArtist ? rawArtist.trim().slice(0, 150) : '';

  try {
    const album = await getAlbumDetails(id, title, artist);
    if (!album) {
      return NextResponse.json({ error: 'Album not found', album: null }, { status: 404 });
    }
    return NextResponse.json({ album });
  } catch (err) {
    console.error('Album API failure:', err);
    return NextResponse.json(
      { error: 'Failed to fetch album details', album: null },
      { status: 500 }
    );
  }
}
