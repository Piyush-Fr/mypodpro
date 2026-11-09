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
      <body>{children}</body>
    </html>
  );
}
