import { NextResponse } from 'next/server';
import { resolveStream } from '../../../lib/innertube';

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_QUALITIES = new Set(['lossless', 'high', 'medium', 'low']);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const rawQuality = searchParams.get('quality') || 'lossless';
  const quality = ALLOWED_QUALITIES.has(rawQuality) ? rawQuality : 'lossless';

  if (!id || !VIDEO_ID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Valid 11-character track id is required' }, { status: 400 });
  }

  try {
    const stream = await resolveStream(id, quality);
    return NextResponse.json({
      proxyUrl: `/api/stream/proxy?id=${id}&quality=${quality}`,
      mimeType: stream.mime,
      bitrate: stream.bitrate,
      itag: stream.itag,
      contentLength: stream.contentLength
    });
  } catch (err) {
    console.error('Stream route error:', err);
    return NextResponse.json(
      { error: 'Failed to resolve audio' },
      { status: 502 }
    );
  }
}
