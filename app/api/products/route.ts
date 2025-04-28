import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic'; // Don't cache this API route

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    console.log(`GET /api/products - Fetching active products from database`);

    // Fetch only active products
    const productsQuery = sql`
      SELECT
        id, name, description, flavor, strength,
        CAST(price AS FLOAT) as price,
        CAST(compare_at_price AS FLOAT) as compare_at_price,
        image_url, category, is_active
      FROM products
      WHERE is_active = TRUE
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalQuery = sql`SELECT COUNT(*) FROM products WHERE is_active = TRUE`;

    const [productsResult, totalResult] = await Promise.all([productsQuery, totalQuery]);

    const totalProducts = parseInt(totalResult[0].count as string);
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products: productsResult,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to get products from database:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
