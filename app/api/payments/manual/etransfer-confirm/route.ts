// app/api/payments/manual/etransfer-confirm/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { confirmManualPayment } from '@/lib/payment'; // Assuming payment lib exists
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Zod schema for validation
const etransferConfirmSchema = z.object({
    orderId: z.number().int().positive('Order ID must be a positive integer'),
    // Transaction ID might be optional or different for e-transfer
    transactionId: z.string().min(1, 'Reference or Transaction ID is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const adminUserId = authResult.userId;

        // TODO: Add role check - Ensure only Admins can call this endpoint
        if (authResult.role !== 'Admin') {
             logger.warn('Non-admin attempted manual e-transfer confirmation', { userId: adminUserId, role: authResult.role });
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validation = etransferConfirmSchema.safeParse(body);

        if (!validation.success) {
            logger.warn('Invalid e-transfer confirmation request body', { errors: validation.error.flatten().fieldErrors });
            return NextResponse.json({ message: 'Invalid input data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { orderId, transactionId } = validation.data;
        logger.info('Manual e-transfer payment confirmation request', { orderId, transactionId, adminUserId });

        // Convert orderId to string before passing
        const result = await confirmManualPayment(String(orderId), transactionId, adminUserId);

        if (!result.success) {
            logger.error('Manual e-transfer payment confirmation failed', { orderId, transactionId, message: result.message });
            return NextResponse.json({ message: result.message || 'Failed to confirm payment' }, { status: 400 }); // Or 500
        }

        logger.info('Manual e-transfer payment confirmed successfully', { orderId, transactionId, adminUserId });
        return NextResponse.json({ message: 'Payment confirmed successfully' });

    } catch (error: unknown) {
         logger.error('POST /api/payments/manual/etransfer-confirm error:', { error });
         if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
