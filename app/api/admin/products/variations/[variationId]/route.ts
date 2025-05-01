// app/api/admin/products/variations/[variationId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { productService, type ProductVariationSelect } from '@/lib/services/product-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Zod schema for validating variation update body
const updateVariationSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    flavor: z.string().nullable().optional(),
    strength: z.number().int().positive("Strength must be a positive integer").nullable().optional(),
    price: z.number().positive("Price must be positive").optional(),
    compareAtPrice: z.number().positive("Compare at price must be positive").nullable().optional(),
    sku: z.string().nullable().optional(),
    imageUrl: z.string().url("Invalid image URL").nullable().optional(),
    // inventoryQuantity: z.number().int().min(0).optional(), // Not directly updatable via this route - use inventory routes
    isActive: z.boolean().optional(),
}).strict();

// --- GET Handler (Get a specific variation) ---
export async function GET(request: NextRequest, { params }: { params: { variationId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const variationIdNum = parseInt(params.variationId);
        if (isNaN(variationIdNum)) {
            return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
        }

        logger.info(`Admin GET /api/admin/products/variations/${variationIdNum} request`, { adminId: authResult.userId });

        // Use service method
        const variation = await productService.getVariationById(variationIdNum);

        if (!variation) {
            return NextResponse.json({ message: 'Variation not found.' }, { status: 404 });
        }

        return NextResponse.json(variation);

    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Admin: Failed to fetch variation ${params.variationId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error fetching variation.' }, { status: 500 });
    }
}

// --- PATCH Handler (Update a variation) ---
export async function PATCH(request: NextRequest, { params }: { params: { variationId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const variationIdNum = parseInt(params.variationId);
        if (isNaN(variationIdNum)) {
            return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
        }

        // Parse and validate body
        const body = await request.json();
        const validationResult = updateVariationSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const updateData = validationResult.data;
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }

        logger.info(`Admin PATCH /api/admin/products/variations/${variationIdNum} request`, { adminId: String(authResult.userId), updateData });

        // Prepare data for service
        const serviceUpdateData: Partial<Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt'>> = {
             ...updateData,
             price: updateData.price ? updateData.price.toFixed(2) : undefined,
             compareAtPrice: updateData.compareAtPrice !== undefined ? (updateData.compareAtPrice === null ? null : updateData.compareAtPrice.toFixed(2)) : undefined,
             // Exclude inventoryQuantity - managed separately
             inventoryQuantity: undefined,
        };

        // Call service method
        const updatedVariation = await productService.updateVariation(variationIdNum, serviceUpdateData);

        logger.info('Admin: Variation updated successfully', { variationId: variationIdNum, adminId: authResult.userId });
        return NextResponse.json(updatedVariation);

    } catch (error: unknown) {
        logger.error(`Admin: Failed to update variation ${params.variationId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        // Handle potential unique constraint violation (flavor/strength)
         if (errorMessage || error.code === '23505') {
             return NextResponse.json({ message: 'A variation with this flavor and strength likely already exists for this product.' }, { status: 409 }); // Conflict
        }
        if (errorMessage) {
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating variation.' }, { status: 500 });
    }
}

// --- DELETE Handler (Delete a variation) ---
export async function DELETE(request: NextRequest, { params }: { params: { variationId: string } }) {
     try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }

        const variationIdNum = parseInt(params.variationId);
        if (isNaN(variationIdNum)) {
            return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
        }

        logger.info(`Admin DELETE /api/admin/products/variations/${variationIdNum} request`, { adminId: authResult.userId });

        // Call service method (handles cascades)
        const deleted = await productService.deleteVariation(variationIdNum);

        if (!deleted) {
             return NextResponse.json({ message: 'Variation not found.' }, { status: 404 });
        }

        logger.info('Admin: Variation deleted successfully', { variationId: variationIdNum, adminId: authResult.userId });
        // Return 204 No Content for successful deletions
        return new NextResponse(null, { status: 204 });

    } catch (error: unknown) {
        logger.error(`Admin: Failed to delete variation ${params.variationId}:`, { error });
         if (errorMessage) {
             return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error deleting variation.' }, { status: 500 });
    }
}
