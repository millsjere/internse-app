import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/settings',
          '/applications',
          '/employer',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/pending-verification',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.internse.com/sitemap.xml',
  };
}
