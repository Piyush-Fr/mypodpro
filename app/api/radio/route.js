import { NextResponse } from 'next/server';
import { getRadioTracks } from '../../../lib/innertube';

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !VIDEO_ID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Valid 11-character video ID is required' }, { status: 400 });
  }

  try {
    const tracks = await getRadioTracks(id);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Radio API error:', err);
    return NextResponse.json({ error: 'Failed to generate radio tracks', tracks: [] }, { status: 500 });
  }
}
