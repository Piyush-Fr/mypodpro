import './globals.css';

export const metadata = {
  title: 'myPod - Lossless Streaming & Retro Music Player',
  description: 'myPod online lossless music player with Cover Flow, interactive queue, and high-fidelity DSP audio engine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
