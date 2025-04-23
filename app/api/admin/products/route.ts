import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
// TODO: Add JWT verification for admin routes

// We can reuse the Product interface, maybe move to a shared types file later
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

// Force dynamic rendering since we might check auth headers
export const dynamic = 'force-dynamic';

// --- GET Handler (List ALL Products for Admin) --- 
export async function GET(request: NextRequest) {
  // TODO: Add Admin Auth Check here!
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '15'); 
  const offset = (page - 1) * limit;
  // TODO: Add filters (status, category, search)

  console.log(`Admin GET /api/admin/products - Page: ${page}, Limit: ${limit}`);

  try {
    // Fetch ALL products (including inactive) for admin view
    const productsQuery = sql`
        SELECT 
            id, name, description, flavor, strength, 
            CAST(price AS FLOAT) as price, 
            CAST(compare_at_price AS FLOAT) as compare_at_price, 
            image_url, category, is_active 
        FROM products 
        ORDER BY id ASC -- Or name, make parameterizable
        LIMIT ${limit} OFFSET ${offset}
    `;
    
    const totalQuery = sql`SELECT COUNT(*) FROM products`; // Count all

    const [productsResult, totalResult] = await Promise.all([productsQuery, totalQuery]);
    
    const totalProducts = parseInt(totalResult[0].count as string);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = productsResult as Product[]; 

    return NextResponse.json({ 
      products: products, 
      pagination: { page, limit, total: totalProducts, totalPages }
    });

  } catch (error) {
    console.error('Admin: Failed to get products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- POST Handler (Create New Product) --- 
export async function POST(request: NextRequest) {
  // TODO: Add Admin Auth Check here!
  
  try {
    const body = await request.json();
    console.log('Admin POST /api/admin/products request:', body);

    // --- Basic Input Validation --- 
    const { name, description, flavor, strength, price, compare_at_price, image_url, category, is_active = true } = body;
    if (!name || !price || !strength || !flavor ) { // Add other required fields as necessary
         return NextResponse.json({ message: 'Missing required fields (name, price, strength, flavor).' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
         return NextResponse.json({ message: 'Invalid price.' }, { status: 400 });
    }
     if (typeof strength !== 'number' || strength <= 0) {
         return NextResponse.json({ message: 'Invalid strength.' }, { status: 400 });
    }
    // Add more validation (string lengths, image URL format?)

    // --- Insert into products table --- 
    const insertResult = await sql`
        INSERT INTO products (name, description, flavor, strength, price, compare_at_price, image_url, category, is_active)
        VALUES (
            ${name}, 
            ${description || null}, 
            ${flavor}, 
            ${strength}, 
            ${price.toFixed(2)}, 
            ${compare_at_price || null}, 
            ${image_url || null}, 
            ${category || null}, 
            ${is_active}
        )
        RETURNING id
    `;
    
    const newProductId = insertResult[0]?.id as number | undefined;
    if (!newProductId) {
        throw new Error('Failed to create product, did not return ID.');
    }
    console.log(`Admin: Product created with ID: ${newProductId}`);

    // --- TODO: Create Initial Inventory Records --- 
    // Decide initial quantity (e.g., 0) and locations
    const initialQuantity = 0;
    const locations = ['Vancouver', 'Calgary', 'Edmonton', 'Toronto'];
    const inventoryPromises = locations.map(loc => sql`
        INSERT INTO inventory (product_id, location, quantity)
        VALUES (${newProductId}, ${loc}, ${initialQuantity})
        ON CONFLICT (product_id, location) DO NOTHING -- Avoid error if somehow exists
    `);
    await Promise.all(inventoryPromises);
    console.log(`Admin: Initial inventory records created for product ${newProductId}`);

    // --- Return Created Product Data --- 
    // Fetch the newly created product to return it (optional but good practice)
    const newProduct = await sql`
         SELECT 
            id, name, description, flavor, strength, 
            CAST(price AS FLOAT) as price, 
            CAST(compare_at_price AS FLOAT) as compare_at_price, 
            image_url, category, is_active 
        FROM products WHERE id = ${newProductId}
    `;

    return NextResponse.json(newProduct[0] as Product, { status: 201 });

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    // Handle potential unique constraint errors if any defined besides PK
    console.error('Admin: Failed to create product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
