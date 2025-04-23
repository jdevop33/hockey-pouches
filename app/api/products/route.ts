import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db'; // Use path alias, ensure tsconfig is correct

// Define Product type based on DB schema 
interface Product {
    id: number;
    name: string;
    description?: string | null;
    flavor?: string | null;
    strength?: number | null;
    price: number; 
    compare_at_price?: number | null;
    image_url?: string | null;
    category?: string | null;
    is_active: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12'); 
  const offset = (page - 1) * limit;

  // TODO: Implement filtering (category, flavor, strength), sorting from searchParams
  // Example filter placeholders:
  const categoryFilter = searchParams.get('category');
  const flavorFilter = searchParams.get('flavor');
  // ... add more filters and incorporate them into the WHERE clause ...
  
  console.log(`GET /api/products - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

  try {
    // Fetch only active products, apply pagination
    // NOTE: Neon driver often returns numeric types as strings, hence the CAST to FLOAT.
    // Adjust casting based on actual return types if needed.
    const productsQuery = sql`
        SELECT 
            id, name, description, flavor, strength, 
            CAST(price AS FLOAT) as price, 
            CAST(compare_at_price AS FLOAT) as compare_at_price, 
            image_url, category, is_active 
        FROM products 
        WHERE is_active = TRUE 
        -- TODO: Add dynamic WHERE clauses for filters here
        ORDER BY name ASC -- TODO: Parameterize sorting
        LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Fetch total count for pagination (apply same filters)
    // TODO: Add dynamic WHERE clauses for filters here too
    const totalQuery = sql`SELECT COUNT(*) FROM products WHERE is_active = TRUE`;

    // Execute queries concurrently
    const [productsResult, totalResult] = await Promise.all([productsQuery, totalQuery]);
    
    const totalProducts = parseInt(totalResult[0].count as string);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = productsResult as Product[]; // Assert type

    console.log(`Fetched ${products.length} of ${totalProducts} products.`);

    return NextResponse.json({ 
      products: products, 
      pagination: { 
        page: page, 
        limit: limit, 
        total: totalProducts, 
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
