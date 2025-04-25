import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/checkout/',
        '/cart/',
        '/login/',
        '/register/',
        '/account/',
        '/reset-password/',
        '/verify-email/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
