// app/api/admin/products/[productId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth'; // Use shared auth verification
import { productService, type ProductSelect } from '@/lib/services/product-service'; // Use refactored service
import { logger } from '@/lib/logger';
import { z } from 'zod'; // For input validation

export const dynamic = 'force-dynamic';

// Zod schema for validating update body
const updateProductSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().nullable().optional(),
    flavor: z.string().nullable().optional(),
    strength: z.number().int().positive("Strength must be a positive number").nullable().optional(),
    price: z.number().positive("Price must be positive").optional(),
    compareAtPrice: z.number().positive("Compare at price must be positive").nullable().optional(),
    imageUrl: z.string().url("Invalid image URL").nullable().optional(),
    category: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
}).strict(); // Disallow extra fields

// --- GET Handler (Retrieve Single Product) ---
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const productId = parseInt(params.productId);
        if (isNaN(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
        }

        logger.info(`Admin GET /api/admin/products/${productId} request`, { adminId: authResult.userId });

        // Use ProductService to get the product (includes variations by default)
        const product = await productService.getProductById(productId);

        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json(product);

    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
        logger.error(`Admin: Failed to retrieve product ${params.productId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error retrieving product.' }, { status: 500 });
    }
}

// --- PUT/PATCH Handler (Update Existing Product) ---
// Using PATCH is often semantically better for partial updates
export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
     try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const productId = parseInt(params.productId);
        if (isNaN(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
        }

        // Parse and validate the request body
        const body = await request.json();
        const validationResult = updateProductSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const updateData = validationResult.data;

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }

        logger.info(`Admin PATCH /api/admin/products/${productId} request`, { adminId: String(authResult.userId), updateData });

        // Prepare data for service (handle price formatting)
        const serviceUpdateData: Partial<Omit<ProductSelect, 'id' | 'createdAt'>> = {
            ...updateData,
            price: updateData.price ? updateData.price.toFixed(2) : undefined,
            compareAtPrice: updateData.compareAtPrice !== undefined ? (updateData.compareAtPrice === null ? null : updateData.compareAtPrice.toFixed(2)) : undefined,
        };

        // Call the service method
        const updatedProduct = await productService.updateProduct(productId, serviceUpdateData);

        logger.info('Admin: Product updated successfully', { productId, adminId: authResult.userId });
        return NextResponse.json(updatedProduct);

    } catch (error: unknown) {
        logger.error(`Admin: Failed to update product ${params.productId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
         if (errorMessage) { // Check if service threw not found error
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating product.' }, { status: 500 });
    }
}

// --- DELETE Handler (Soft Delete Product) ---
export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const productId = parseInt(params.productId);
        if (isNaN(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
        }

        logger.info(`Admin DELETE /api/admin/products/${productId} request (Soft Delete)`, { adminId: authResult.userId });

        // Perform soft delete by updating isActive to false using the service
        const updatedProduct = await productService.updateProduct(productId, { isActive: false });

        if (!updatedProduct) { // Should not happen if updateProduct throws on not found, but check anyway
             return NextResponse.json({ message: 'Product not found for deactivation.' }, { status: 404 });
        }

        logger.info('Admin: Product deactivated successfully', { productId, adminId: authResult.userId });
        return NextResponse.json({ message: `Product ${productId} deactivated successfully.` }); // Use 200 OK or 204 No Content

    } catch (error: unknown) {
        logger.error(`Admin: Failed to deactivate product ${params.productId}:`, { error });
        if (errorMessage) {
             return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error deactivating product.' }, { status: 500 });
    }
}
