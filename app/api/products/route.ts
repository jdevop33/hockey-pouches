import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Import db
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Import schema
import { count, asc, eq } from 'drizzle-orm'; // Import helpers
import { logger } from '@/lib/logger'; // Added logger

export const dynamic = 'force-dynamic'; // Don't cache this API route

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl; // Use nextUrl for searchParams
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12'); // Default limit
    const offset = (page - 1) * limit;

    logger.info(`GET /api/products - Fetching page ${page}, limit ${limit}`);

    // Use Drizzle query builder
    const productsQuery = db.query.products.findMany({
      where: eq(schema.products.isActive, true),
      orderBy: asc(schema.products.name), // Define explicit order
      limit: limit,
      offset: offset,
      // Specify columns to select if not all are needed
      // columns: { id: true, name: true, /* ... */ }
    });

    const totalQuery = db.select({ total: count() })
      .from(schema.products)
      .where(eq(schema.products.isActive, true));

    const [productsResult, totalResult] = await Promise.all([productsQuery, totalQuery]);

    const totalProducts = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalProducts / limit);

    // Ensure price is returned as number if needed by frontend
    // Drizzle returns decimal as string, so conversion might be necessary
    const formattedProducts = productsResult.map(p => ({
        ...p,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        compareAtPrice: p.compareAtPrice && typeof p.compareAtPrice === 'string' ? parseFloat(p.compareAtPrice) : p.compareAtPrice,
    }));

    return NextResponse.json({
      products: formattedProducts, // Use formatted products
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Failed to get products:', { error });
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
