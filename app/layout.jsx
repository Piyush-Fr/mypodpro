import './globals.css';

export const metadata = {
  title: 'myPod - Lossless Streaming & Retro Music Player',
  description: 'myPod online lossless music player with Cover Flow, interactive queue, and high-fidelity DSP audio engine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        {children}
        {/* Phones get this screen instead of the app (globals.css: MOBILE GATE) */}
        <div className="mobile-gate" role="alert">
          <p className="mobile-gate-brand">myPod Pro</p>
          <h1 className="mobile-gate-title">Coming soon on mobile</h1>
          <p className="mobile-gate-text">myPod is desktop-only for now. Open it on a computer or tablet to listen.</p>
        </div>
      </body>
    </html>
  );
}
