// app/api/admin/products/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { productService, type ProductListOptions, type ProductSelect } from '@/lib/services/product-service'; // Use refactored service
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// --- GET Handler (List ALL Products for Admin) ---
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = request.nextUrl;

    // Prepare options for ProductService.getProducts
    const options: ProductListOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '15'),
      category: searchParams.get('category'),
      flavor: searchParams.get('flavor'),
      strength: searchParams.has('strength') ? parseInt(searchParams.get('strength')!) : undefined,
      minPrice: searchParams.has('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.has('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      search: searchParams.get('search'),
      // Changed default sortBy from 'id' to 'createdAt'
      sortBy: searchParams.get('sortBy') as ProductListOptions['sortBy'] || 'createdAt', 
      sortOrder: searchParams.get('sortOrder') as ProductListOptions['sortOrder'] || 'asc',
      includeInactive: true, // Admins should see inactive products
    };

    logger.info(`Admin GET /api/admin/products request`, { adminId: authResult.userId, options });

    // Call the service method
    const result = await productService.getProducts(options);

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Admin: Failed to get products:', { error });
    return NextResponse.json({ message: 'Internal Server Error retrieving products.' }, { status: 500 });
  }
}

// --- POST Handler (Create New Product) ---
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    logger.info(`Admin POST /api/admin/products request`, { adminId: authResult.userId, body });

    // Basic validation (can be expanded with Zod or similar)
    const { name, price, strength, flavor, ...restOfBody } = body;
    if (!name || typeof price !== 'number' || price < 0 || typeof strength !== 'number' || strength <= 0 || !flavor) {
        return NextResponse.json({ message: 'Missing or invalid required fields: name, price (number>=0), strength (number>0), flavor.' }, { status: 400 });
    }

    // Prepare data for ProductService.createProduct
    // Note: createProduct expects price as string/decimal, handle conversion if needed
    const productData: Omit<ProductSelect, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      price: price.toFixed(2), // Ensure price is formatted as string decimal
      strength,
      flavor,
      description: restOfBody.description || null,
      compareAtPrice: restOfBody.compare_at_price ? restOfBody.compare_at_price.toFixed(2) : null,
      imageUrl: restOfBody.image_url || null,
      category: restOfBody.category || null,
      isActive: restOfBody.is_active !== undefined ? restOfBody.is_active : true,
    };

    // Call the service method (which handles DB insert and inventory init)
    const newProduct = await productService.createProduct(productData);

    logger.info('Admin: Product created successfully', { productId: newProduct.id, adminId: authResult.userId });

    // Return the newly created product data
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: unknown) {
    logger.error('Admin: Failed to create product:', { error });
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
    }
     // Add handling for potential unique constraint errors from DB if applicable
    return NextResponse.json({ message: 'Internal Server Error creating product.' }, { status: 500 });
  }
}
