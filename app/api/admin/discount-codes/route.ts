// app/api/admin/discount-codes/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { discountService, type ListDiscountCodesOptions, type CreateDiscountCodeParams } from '@/lib/services/discount-service'; // Use new service
import * as schema from '@/lib/schema'; // Import schema for enum
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (List Discount Codes) ---
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') { // Assuming only Admin can list/manage
            return forbiddenResponse('Admin access required');
        }
        logger.info(`Admin GET /api/admin/discount-codes request`, { adminId: authResult.userId });

        const searchParams = request.nextUrl.searchParams;
        const options: ListDiscountCodesOptions = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
            search: searchParams.get('search') ?? undefined,
        };

        const result = await discountService.listDiscountCodes(options);
        return NextResponse.json(result);

    } catch (error: unknown) {
        logger.error('Admin: Error fetching discount codes:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching discount codes.' }, { status: 500 });
    }
}

// --- POST Handler (Create Discount Code) ---

const createDiscountCodeSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").trim(),
    description: z.string().optional().nullable(),
    discountType: z.enum(schema.discountTypeEnum.enumValues),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderAmount: z.number().min(0).optional().nullable(),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.coerce.date(), // Coerce string input to Date
    endDate: z.coerce.date().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required to create discount codes');
        }

        const body = await request.json();
        const validation = createDiscountCodeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        logger.info(`Admin POST /api/admin/discount-codes request`, { adminId: authResult.userId, body: validation.data });

        // Data is validated, call the service
        const newDiscountCode = await discountService.createDiscountCode(validation.data as CreateDiscountCodeParams);

        logger.info('Admin: Discount code created successfully', { codeId: newDiscountCode.id, adminId: authResult.userId });
        return NextResponse.json(newDiscountCode, { status: 201 });

    } catch (error: unknown) {
        logger.error('Admin: Error creating discount code:', { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        if (errorMessage === 'Discount code already exists.') {
            return NextResponse.json({ message: errorMessage }, { status: 409 }); // Conflict
        }
        return NextResponse.json({ message: 'Internal Server Error creating discount code.' }, { status: 500 });
    }
}
