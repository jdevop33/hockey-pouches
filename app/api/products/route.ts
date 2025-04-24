import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { Product, Pagination } from '@/types';
import { cachedQuery, CACHE_DURATIONS, buildPaginationQuery } from '@/lib/dbOptimization';
import { monitoredQuery } from '@/lib/dbMonitoring';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
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
    // Build conditions array for WHERE clause
    const conditions = ['is_active = TRUE'];
    const params = [];

    if (categoryFilter) {
      conditions.push('category = $' + (params.length + 1));
      params.push(categoryFilter);
    }

    if (flavorFilter) {
      conditions.push('flavor = $' + (params.length + 1));
      params.push(flavorFilter);
    }

    if (strengthFilter) {
      conditions.push('strength = $' + (params.length + 1));
      params.push(parseInt(strengthFilter));
    }

    if (minPrice) {
      conditions.push('price >= $' + (params.length + 1));
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push('price <= $' + (params.length + 1));
      params.push(parseFloat(maxPrice));
    }

    if (searchTerm) {
      conditions.push(
        '(name ILIKE $' +
          (params.length + 1) +
          ' OR description ILIKE $' +
          (params.length + 1) +
          ')'
      );
      params.push(`%${searchTerm}%`);
    }

    // Build the ORDER BY clause
    const orderClause = `${finalSortBy} ${finalSortOrder}`;

    // Use the optimized pagination query builder
    const selectFields = `
      id, name, description, flavor, strength,
      CAST(price AS FLOAT) as price,
      CAST(compare_at_price AS FLOAT) as compare_at_price,
      image_url, category, is_active
    `;

    // Generate a cache key based on the query parameters
    const cacheKey = `products_${page}_${limit}_${conditions.join('_')}_${orderClause}`;

    // Use cached query for better performance
    const { products, totalProducts, totalPages } = await cachedQuery(
      cacheKey,
      async () => {
        // Build the pagination query
        const {
          query,
          countQuery,
          params: queryParams,
          countParams,
        } = buildPaginationQuery({
          table: 'products',
          selectFields,
          whereConditions: conditions,
          whereParams: params,
          orderBy: orderClause,
          page,
          limit,
        });

        // Execute queries with monitoring
        const [productsResult, totalResult] = await Promise.all([
          monitoredQuery(query, queryParams),
          monitoredQuery(countQuery, countParams),
        ]);

        const totalProducts = parseInt(totalResult[0].total as string);
        const totalPages = Math.ceil(totalProducts / limit);

        return {
          products: productsResult as Product[],
          totalProducts,
          totalPages,
        };
      },
      CACHE_DURATIONS.SHORT // Cache for a short time since product data changes frequently
    );

    console.log(`Fetched ${products.length} of ${totalProducts} products.`);

    // Fetch available filters with caching
    const filtersCacheKey = 'products_filters';
    const availableFilters = await cachedQuery(
      filtersCacheKey,
      async () => {
        const [flavorsResult, strengthsResult, categoriesResult, priceRangeResult] =
          await Promise.all([
            monitoredQuery(
              'SELECT DISTINCT flavor FROM products WHERE flavor IS NOT NULL ORDER BY flavor'
            ),
            monitoredQuery(
              'SELECT DISTINCT strength FROM products WHERE strength IS NOT NULL ORDER BY strength'
            ),
            monitoredQuery(
              'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
            ),
            monitoredQuery(
              'SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE is_active = TRUE'
            ),
          ]);

        return {
          flavors: flavorsResult.map(row => row.flavor),
          strengths: strengthsResult.map(row => row.strength),
          categories: categoriesResult.map(row => row.category),
          priceRange: {
            min: parseFloat(priceRangeResult[0].min_price),
            max: parseFloat(priceRangeResult[0].max_price),
          },
        };
      },
      CACHE_DURATIONS.MEDIUM // Cache filters longer since they change less frequently
    );

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
    logger.error(
      'Failed to get products',
      {
        page,
        limit,
        filters: {
          category: categoryFilter,
          flavor: flavorFilter,
          strength: strengthFilter,
          price: { min: minPrice, max: maxPrice },
          search: searchTerm,
        },
      },
      error
    );
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
});
