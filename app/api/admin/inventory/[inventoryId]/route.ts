// app/api/admin/inventory/[stockLevelId]/route.ts (File Renamed Recommended)
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db } from '@/lib/db'; // Use Drizzle
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { productService } from '@/lib/services/product-service'; // For adjustments
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (Get Specific Stock Level Details) ---
export async function GET(
    request: NextRequest,
    { params }: { params: { stockLevelId: string } } // Parameter renamed
) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { stockLevelId } = params;
        if (!stockLevelId || stockLevelId.length !== 36) {
            return NextResponse.json({ message: 'Invalid Stock Level ID format.' }, { status: 400 });
        }
        logger.info(`Admin GET /api/admin/inventory/${stockLevelId} request`, { adminId: authResult.userId });

        const stockLevel = await db.query.stockLevels.findFirst({
            where: eq(schema.stockLevels.id, stockLevelId),
            with: {
                location: true,
                productVariation: {
                    with: {
                        product: true
                    }
                }
            }
        });
        if (!stockLevel) {
            return NextResponse.json({ message: 'Stock level not found.' }, { status: 404 });
        }
        const response = { ...stockLevel, availableQuantity: stockLevel.quantity - stockLevel.reservedQuantity };
        return NextResponse.json(response);
    } catch (error) {
        logger.error(`Admin: Failed to get stock level ${params.stockLevelId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error fetching stock level.' }, { status: 500 });
    }
}

// --- PATCH Handler (Manual Inventory Adjustment) ---
const adjustStockSchema = z.object({
    changeQuantity: z.number().int().refine(val => val !== 0, { message: "Change quantity cannot be zero" }),
    notes: z.string().optional(),
}).strict();

export async function PATCH(
    request: NextRequest,
    { params }: { params: { stockLevelId: string } } // Parameter renamed
) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { stockLevelId } = params;
        if (!stockLevelId || stockLevelId.length !== 36) {
            return NextResponse.json({ message: 'Invalid Stock Level ID format.' }, { status: 400 });
        }
        const body = await request.json();
        const validation = adjustStockSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { changeQuantity, notes } = validation.data;
        logger.info(`Admin PATCH /api/admin/inventory/${stockLevelId} request`, { adminId: authResult.userId, changeQuantity, notes });

        const stockLevel = await db.query.stockLevels.findFirst({
            where: eq(schema.stockLevels.id, stockLevelId),
            columns: { productVariationId: true, locationId: true }
        });
        if (!stockLevel || !stockLevel.productVariationId || !stockLevel.locationId) {
             return NextResponse.json({ message: 'Stock level not found or missing required associations.' }, { status: 404 });
        }

        const success = await productService.updateInventory({
            stockLevelId: stockLevelId,
            productVariationId: stockLevel.productVariationId,
            locationId: stockLevel.locationId,
            changeQuantity: changeQuantity,
            type: 'adjustment',
            notes: notes ? `Admin Adjustment: ${notes}` : 'Admin Adjustment',
            userId: authResult.userId,
        });
        if (!success) throw new Error('Inventory adjustment failed in service but did not throw.');

        const updatedStockLevel = await db.query.stockLevels.findFirst({ where: eq(schema.stockLevels.id, stockLevelId) });
        logger.info('Admin: Inventory adjusted successfully', { stockLevelId, adminId: authResult.userId });
        return NextResponse.json(updatedStockLevel);
    } catch (error: any) {
        logger.error(`Admin: Failed to adjust inventory for ${params.stockLevelId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        if (error.message?.includes('not found') || error.message?.includes('Insufficient stock')) {
            return NextResponse.json({ message: error.message }, { status: error.message.includes('Insufficient stock') ? 400 : 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error adjusting inventory.' }, { status: 500 });
    }
}

// DELETE commented out
