import { MetadataRoute } from 'next';
import sql from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  try {
    // Get all active products
    const products = await sql`
      SELECT id, name, updated_at
      FROM products
      WHERE is_active = TRUE
    `;

    // Get all distinct categories
    const categories = await sql`
      SELECT DISTINCT category
      FROM products
      WHERE is_active = TRUE AND category IS NOT NULL
    `;

    // Add product routes
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Add category routes
    const categoryRoutes = categories.map((category: any) => ({
      url: `${baseUrl}/products?category=${encodeURIComponent(category.category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Combine all routes
    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
    // Return only static routes if there's an error
    return staticRoutes;
  }
}
