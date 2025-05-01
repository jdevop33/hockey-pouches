// app/api/payments/manual/btc-confirm/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { confirmManualPayment } from '@/lib/payment'; // Assuming payment lib exists
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Zod schema for validation
const btcConfirmSchema = z.object({
    orderId: z.number().int().positive('Order ID must be a positive integer'),
    transactionId: z.string().min(1, 'Transaction ID is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const adminUserId = authResult.userId; // Assuming only admin can confirm

        // TODO: Add role check - Ensure only Admins can call this endpoint
        if (authResult.role !== 'Admin') {
            logger.warn('Non-admin attempted manual BTC confirmation', { userId: adminUserId, role: authResult.role });
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validation = btcConfirmSchema.safeParse(body);

        if (!validation.success) {
             logger.warn('Invalid BTC confirmation request body', { errors: validation.error.flatten().fieldErrors });
            return NextResponse.json({ message: 'Invalid input data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { orderId, transactionId } = validation.data;
        logger.info('Manual BTC payment confirmation request', { orderId, transactionId, adminUserId });

        // Convert orderId to string before passing
        const result = await confirmManualPayment(String(orderId), transactionId, adminUserId);

        if (!result.success) {
            logger.error('Manual BTC payment confirmation failed', { orderId, transactionId, message: result.message });
            return NextResponse.json({ message: result.message || 'Failed to confirm payment' }, { status: 400 }); // Or 500 depending on error type
        }

        logger.info('Manual BTC payment confirmed successfully', { orderId, transactionId, adminUserId });
        return NextResponse.json({ message: 'Payment confirmed successfully' });

    } catch (error: unknown) {
         logger.error('POST /api/payments/manual/btc-confirm error:', { error });
         if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
