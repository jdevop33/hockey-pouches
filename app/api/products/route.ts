import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { Product, Pagination } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  // Extract filter parameters
  const categoryFilter = searchParams.get('category');
  const flavorFilter = searchParams.get('flavor');
  const strengthFilter = searchParams.get('strength');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const searchTerm = searchParams.get('search');

  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  // Validate sort parameters to prevent SQL injection
  const validSortFields = ['name', 'price', 'created_at', 'strength'];
  const validSortOrders = ['asc', 'desc'];

  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
  const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'asc';

  console.log(`GET /api/products - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

  try {
    // Fetch only active products, apply pagination
    // NOTE: Neon driver often returns numeric types as strings, hence the CAST to FLOAT.
    // Adjust casting based on actual return types if needed.
    // Build the WHERE clause dynamically
    let whereClause = 'WHERE is_active = TRUE';
    const queryParams = [];
    let paramIndex = 1;

    if (categoryFilter) {
      whereClause += ` AND category = $${paramIndex++}`;
      queryParams.push(categoryFilter);
    }

    if (flavorFilter) {
      whereClause += ` AND flavor = $${paramIndex++}`;
      queryParams.push(flavorFilter);
    }

    if (strengthFilter) {
      whereClause += ` AND strength = $${paramIndex++}`;
      queryParams.push(strengthFilter);
    }

    if (minPrice) {
      whereClause += ` AND price >= $${paramIndex++}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      whereClause += ` AND price <= $${paramIndex++}`;
      queryParams.push(maxPrice);
    }

    if (searchTerm) {
      whereClause += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Build the ORDER BY clause
    const orderClause = `ORDER BY ${finalSortBy} ${finalSortOrder}`;

    // Construct the full query
    const productsQuery = {
      text: `
        SELECT
            id, name, description, flavor, strength,
            CAST(price AS FLOAT) as price,
            CAST(compare_at_price AS FLOAT) as compare_at_price,
            image_url, category, is_active
        FROM products
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `,
      values: [...queryParams, limit.toString(), offset.toString()],
    };

    // Fetch total count for pagination (apply same filters)
    const totalQuery = {
      text: `SELECT COUNT(*) FROM products ${whereClause}`,
      values: queryParams,
    };

    // Execute queries concurrently
    const [productsResult, totalResult] = await Promise.all([
      sql.query(productsQuery),
      sql.query(totalQuery),
    ]);

    const totalProducts = parseInt(totalResult.rows[0].count as string);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = productsResult.rows as Product[]; // Assert type

    console.log(`Fetched ${products.length} of ${totalProducts} products.`);

    return NextResponse.json({
      products: products,
      pagination: {
        page: page,
        limit: limit,
        total: totalProducts,
        totalPages: totalPages,
      },
      filters: {
        category: categoryFilter || null,
        flavor: flavorFilter || null,
        strength: strengthFilter || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        search: searchTerm || null,
      },
      sorting: {
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
