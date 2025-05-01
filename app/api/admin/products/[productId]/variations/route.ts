// app/api/admin/products/[productId]/variations/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { productService, type ProductVariationSelect } from '@/lib/services/product-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Zod schema for validating create variation body
const createVariationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    flavor: z.string().nullable().optional(),
    strength: z.number().int().positive("Strength must be a positive integer").nullable().optional(),
    price: z.number().positive("Price must be a positive number"),
    compareAtPrice: z.number().positive().nullable().optional(),
    sku: z.string().nullable().optional(),
    imageUrl: z.string().url("Invalid image URL").nullable().optional(),
    // inventoryQuantity: z.number().int().min(0).default(0), // Let service handle init
    isActive: z.boolean().default(true),
}).strict();

// --- GET Handler (List all variations for a product) ---
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const productIdNum = parseInt(params.productId);
        if (isNaN(productIdNum)) {
            return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
        }

        logger.info(`Admin GET /api/admin/products/${productIdNum}/variations request`, { adminId: authResult.userId });

        // Use service to get variations (includes check if product exists implicitly)
        // Admins likely want to see inactive variations too
        const variations = await productService.getProductVariations(productIdNum, true);

        return NextResponse.json(variations);

    } catch (error: unknown) {
        logger.error(`Admin: Failed to fetch variations for product ${params.productId}:`, { error });
         if (errorMessage) { // Check if service threw product not found
             return NextResponse.json({ message: errorMessage }, { status: 404 });
         }
        return NextResponse.json({ message: 'Internal Server Error fetching variations.' }, { status: 500 });
    }
}

// --- POST Handler (Add a new variation to a product) ---
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const productIdNum = parseInt(params.productId);
        if (isNaN(productIdNum)) {
            return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = createVariationSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const variationData = validationResult.data;
        logger.info(`Admin POST /api/admin/products/${productIdNum}/variations request`, { adminId: String(authResult.userId), variationData });

        // Prepare data for service
        const serviceData: Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'inventoryQuantity'> = {
            name: variationData.name,
            flavor: variationData.flavor ?? null,
            strength: variationData.strength ?? null,
            price: variationData.price.toFixed(2),
            compareAtPrice: variationData.compareAtPrice ? variationData.compareAtPrice.toFixed(2) : null,
            sku: variationData.sku ?? null,
            imageUrl: variationData.imageUrl ?? null,
            isActive: $1?.$2,
            // Exclude inventoryQuantity - service handles initialization
        };

        // Call the service method (handles product existence check & inventory init)
        const createdVariation = await productService.createVariation(productIdNum, serviceData);

        logger.info('Admin: Variation created successfully', { variationId: createdVariation.id, productId: productIdNum, adminId: authResult.userId });
        return NextResponse.json(createdVariation, { status: 201 });

    } catch (error: unknown) {
        logger.error(`Admin: Failed to add variation to product ${params.productId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        // Handle unique constraint error (e.g., duplicate flavor/strength for product)
        if (errorMessage || error.code === '23505') {
             return NextResponse.json({ message: 'A variation with this flavor and strength likely already exists for this product.' }, { status: 409 }); // Conflict
        }
         if (errorMessage && errorMessage) {
            return NextResponse.json({ message: errorMessage }, { status: 404 }); // Product not found
        }
        return NextResponse.json({ message: 'Internal Server Error creating variation.' }, { status: 500 });
    }
}
