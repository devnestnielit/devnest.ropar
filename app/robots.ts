import type { MetadataRoute } from 'next';

// BUG-18: robots.txt generation via Next.js MetadataRoute
// Accessible at /robots.txt
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devnest-ropar.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow private/admin routes from indexing
        disallow: [
          '/admin',
          '/admin/',
          '/member/dashboard',
          '/member/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
