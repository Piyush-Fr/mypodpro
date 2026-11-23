import { SITE_URL } from '@/lib/site';

// One page today; add entries here when the site gets more pages (an about or landing page).
export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    }
  ];
}
