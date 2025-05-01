// app/api/admin/discount-codes/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { discountService, type UpdateDiscountCodeParams } from '@/lib/services/discount-service'; // Use service
import { discountTypeEnum } from '@/lib/schema/discounts'; // Import specific enum
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (Get Specific Discount Code) ---
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    const idNum = parseInt(params.id);
    if (isNaN(idNum)) {
      return NextResponse.json({ message: 'Invalid Discount Code ID format.' }, { status: 400 });
    }
    logger.info(`Admin GET /api/admin/discount-codes/${idNum} request`, {
      adminId: authResult.userId,
    });

    const discountCode = await discountService.getDiscountCodeById(idNum);
    if (!discountCode) {
      return NextResponse.json({ message: 'Discount code not found.' }, { status: 404 });
    }
    return NextResponse.json(discountCode);
  } catch (error: unknown) {
    logger.error(`Admin: Failed to get discount code ${params.id}:`, { error });
    return NextResponse.json(
      { message: 'Internal Server Error fetching discount code.' },
      { status: 500 }
    );
  }
}

// --- PATCH Handler (Update Discount Code - Preferred) ---

// Zod schema matching UpdateDiscountCodeParams structure (Partial of Create)
const updateDiscountCodeSchema = z
  .object({
    // code: z.string().min(3).trim().optional(), // Code change not allowed via service method
    description: z.string().nullable().optional(),
    discountType: z.enum(discountTypeEnum.enumValues).optional(),
    discountValue: z.number().positive('Discount value must be positive').optional(),
    minOrderAmount: z.number().min(0).optional().nullable(),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict();

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    const idNum = parseInt(params.id);
    if (isNaN(idNum)) {
      return NextResponse.json({ message: 'Invalid Discount Code ID format.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateDiscountCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const updateData = validation.data;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }

    logger.info(`Admin PATCH /api/admin/discount-codes/${idNum} request`, {
      adminId: authResult.userId,
      updateData,
    });

    // Call the service method
    const updatedDiscountCode = await discountService.updateDiscountCode(
      idNum,
      updateData as UpdateDiscountCodeParams
    );

    logger.info('Admin: Discount code updated successfully', {
      codeId: idNum,
      adminId: authResult.userId,
    });
    return NextResponse.json(updatedDiscountCode);
  } catch (error: unknown) {
    logger.error(`Admin: Failed to update discount code ${params.id}:`, { error });
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
    }
    if (errorMessage) {
      return NextResponse.json({ message: errorMessage }, { status: 404 });
    }
    if (errorMessage) {
      return NextResponse.json({ message: errorMessage }, { status: 409 }); // Conflict
    }
    return NextResponse.json(
      { message: 'Internal Server Error updating discount code.' },
      { status: 500 }
    );
  }
}

// --- DELETE Handler (Delete Discount Code) ---
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    const idNum = parseInt(params.id);
    if (isNaN(idNum)) {
      return NextResponse.json({ message: 'Invalid Discount Code ID format.' }, { status: 400 });
    }
    logger.info(`Admin DELETE /api/admin/discount-codes/${idNum} request`, {
      adminId: authResult.userId,
    });

    const deleted = await discountService.deleteDiscountCode(idNum);
    if (!deleted) {
      return NextResponse.json({ message: 'Discount code not found.' }, { status: 404 });
    }

    logger.info('Admin: Discount code deleted successfully', {
      codeId: idNum,
      adminId: authResult.userId,
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error: unknown) {
    logger.error(`Admin: Failed to delete discount code ${params.id}:`, { error });
    if (errorMessage) {
      return NextResponse.json({ message: errorMessage }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Internal Server Error deleting discount code.' },
      { status: 500 }
    );
  }
}
