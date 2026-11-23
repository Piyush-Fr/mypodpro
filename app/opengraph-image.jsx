import { ImageResponse } from 'next/og';

// Share preview for links (WhatsApp, X, Discord, iMessage): the click-wheel mark and the name.
export const alt = 'myPod – retro iPod music player with Cover Flow';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 96px',
          gap: 64,
          background: '#000000',
          color: '#ffffff',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Click-wheel mark: orange tile, black ring, black centre */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 60,
            background: '#ff6a2b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none'
          }}
        >
          <div
            style={{
              width: 172,
              height: 172,
              borderRadius: 999,
              border: '30px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 999, background: '#000000' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>myPod</div>
          <div style={{ fontSize: 40, color: '#b4b4b4', lineHeight: 1.3, maxWidth: 680 }}>
            Retro iPod music player with Cover Flow, in your browser
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
