import { NextResponse } from 'next/server';
import { resolveStream } from '../../../../lib/innertube';

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_QUALITIES = new Set(['lossless', 'high', 'medium', 'low']);

/**
 * Validate that resolved stream URL belongs to legitimate Google/YouTube audio CDNs
 * to prevent SSRF against internal network or metadata services.
 */
function isAllowedAudioUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith('.googlevideo.com') ||
      host.endsWith('.youtube.com') ||
      host === 'googlevideo.com' ||
      host === 'youtube.com'
    );
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const rawQuality = searchParams.get('quality') || 'lossless';
  const quality = ALLOWED_QUALITIES.has(rawQuality) ? rawQuality : 'lossless';

  if (!id || !VIDEO_ID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Valid 11-character video ID is required' }, { status: 400 });
  }

  try {
    let stream = await resolveStream(id, quality);
    if (!stream?.url || !isAllowedAudioUrl(stream.url)) {
      return NextResponse.json({ error: 'Invalid audio stream endpoint' }, { status: 502 });
    }

    const rangeHeader = request.headers.get('range');
    const headersToSend = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    if (rangeHeader) {
      headersToSend['Range'] = rangeHeader;
    }

    let remoteRes = await fetch(stream.url, {
      headers: headersToSend
    });

    // If stream URL expired or forbidden, force fresh stream resolution and retry
    if (remoteRes.status === 403) {
      try {
        stream = await resolveStream(id, quality, true);
        if (stream?.url && isAllowedAudioUrl(stream.url)) {
          remoteRes = await fetch(stream.url, {
            headers: headersToSend
          });
        }
      } catch {}
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=7200');

    const contentType = remoteRes.headers.get('content-type') || stream.mime || 'audio/webm';
    responseHeaders.set('Content-Type', contentType);

    const contentLength = remoteRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = remoteRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    return new Response(remoteRes.body, {
      status: remoteRes.status,
      headers: responseHeaders
    });
  } catch (err) {
    console.error('Audio stream proxy error:', err);
    return NextResponse.json(
      { error: 'Failed to stream audio' },
      { status: 502 }
    );
  }
}

export { GET as HEAD };

