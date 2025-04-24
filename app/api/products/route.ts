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
    // Build dynamic filter conditions for SQL tagged template
    let conditions = ['is_active = TRUE'];
    let params = [];
    let index = 1;

    if (categoryFilter) {
      conditions.push(`category = $${index}`);
      params.push(categoryFilter);
      index++;
    }

    if (flavorFilter) {
      conditions.push(`flavor = $${index}`);
      params.push(flavorFilter);
      index++;
    }

    if (strengthFilter) {
      conditions.push(`strength = $${index}`);
      params.push(parseInt(strengthFilter));
      index++;
    }

    if (minPrice) {
      conditions.push(`price >= $${index}`);
      params.push(parseFloat(minPrice));
      index++;
    }

    if (maxPrice) {
      conditions.push(`price <= $${index}`);
      params.push(parseFloat(maxPrice));
      index++;
    }

    if (searchTerm) {
      conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
      params.push(`%${searchTerm}%`);
      index++;
    }

    // Combine all conditions
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Execute queries concurrently
    const productsQuery = `
      SELECT
          id, name, description, flavor, strength,
          CAST(price AS FLOAT) as price,
          CAST(compare_at_price AS FLOAT) as compare_at_price,
          image_url, category, is_active
      FROM products
      ${whereClause}
      ORDER BY ${finalSortBy} ${finalSortOrder}
      LIMIT $${index} OFFSET $${index + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM products
      ${whereClause}
    `;

    // Add pagination parameters
    params.push(limit);
    params.push(offset);

    const [productsResult, totalResult] = await Promise.all([
      sql.query(productsQuery, params),
      sql.query(countQuery, params.slice(0, -2)), // Exclude pagination params
    ]);

    const totalProducts = parseInt(totalResult.rows[0].count as string);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = productsResult.rows as Product[]; // Assert type

    console.log(`Fetched ${products.length} of ${totalProducts} products.`);

    // Fetch available filters
    const [flavorsResult, strengthsResult, categoriesResult, priceRangeResult] = await Promise.all([
      sql.query(`SELECT DISTINCT flavor FROM products WHERE flavor IS NOT NULL ORDER BY flavor`),
      sql.query(
        `SELECT DISTINCT strength FROM products WHERE strength IS NOT NULL ORDER BY strength`
      ),
      sql.query(
        `SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category`
      ),
      sql.query(
        `SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE is_active = TRUE`
      ),
    ]);

    const availableFilters = {
      flavors: flavorsResult.rows.map(row => row.flavor),
      strengths: strengthsResult.rows.map(row => row.strength),
      categories: categoriesResult.rows.map(row => row.category),
      priceRange: {
        min: parseFloat(priceRangeResult.rows[0].min_price),
        max: parseFloat(priceRangeResult.rows[0].max_price),
      },
    };

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
        strength: strengthFilter ? parseInt(strengthFilter) : null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        search: searchTerm || null,
      },
      availableFilters: availableFilters,
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
