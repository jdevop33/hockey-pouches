import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { confirmManualPayment } from '@/lib/payment';

interface ConfirmPaymentBody {
  orderId?: number;
  transactionId?: string;
  notes?: string;
  txHash?: string; // Bitcoin transaction hash
}

export async function POST(request: NextRequest) {
  let orderIdForErrorLog: string | null = null; // Variable to hold orderId for logging

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    if (!authResult.role || authResult.role !== 'Admin') {
      return forbiddenResponse('Only administrators can confirm payments');
    }

    // Parse request body
    const body: ConfirmPaymentBody = await request.json();
    orderIdForErrorLog = body.orderId?.toString() || null;
    console.log('Admin: Confirm BTC payment request:', body);

    // Validate input
    if (!body.orderId || typeof body.orderId !== 'number') {
      return NextResponse.json({ message: 'Valid order ID is required' }, { status: 400 });
    }

    if (!body.transactionId || typeof body.transactionId !== 'string') {
      return NextResponse.json(
        { message: 'Valid transaction ID (BTC address) is required' },
        { status: 400 }
      );
    }

    // Confirm the payment
    const result = await confirmManualPayment(body.orderId, body.transactionId, authResult.userId!);

    if (!result.success) {
      return NextResponse.json(
        {
          message: 'Payment confirmation failed',
          error: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `Bitcoin payment confirmed for order ${body.orderId}. Status updated.`,
      orderId: body.orderId,
      transactionId: body.transactionId,
      txHash: body.txHash, // Include the Bitcoin transaction hash if provided
      status: result.status,
    });
  } catch (error) {
    const orderInfo = orderIdForErrorLog ? `for order ${orderIdForErrorLog}` : '';
    console.error(`Admin: Failed to confirm BTC payment ${orderInfo}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
