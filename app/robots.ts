import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/cart'],
    },
    sitemap: 'https://hockey-pouches.vercel.app/sitemap.xml',
  };
}
