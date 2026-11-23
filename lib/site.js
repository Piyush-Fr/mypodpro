// Public address of the site, used for canonical URLs, the sitemap and share previews.
// Set NEXT_PUBLIC_SITE_URL in Vercel when a custom domain is added.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mypodpro.vercel.app').replace(/\/$/, '');

export const SITE_NAME = 'myPod';
export const SITE_TITLE = 'myPod – Retro iPod Music Player with Cover Flow';
export const SITE_DESCRIPTION =
  'myPod is a free music player in your browser with an iPod-style Cover Flow, search for songs, artists and albums, an automix queue and Classic or Modern themes. Works on desktop and mobile.';
