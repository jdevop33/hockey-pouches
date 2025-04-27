import { NextRequest, NextResponse } from 'next/server';

// POST - Reject a wholesale application
export async function POST(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    // TODO: Implement proper admin authentication once we create our auth service
    // For now, we'll assume the request is authorized

    const customerId = params.customerId;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Parse the rejection reason from the request body
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // TODO: Implement actual rejection logic with our custom service
    console.log(`Rejecting wholesale application for customer: ${customerId}, reason: ${reason}`);

    // Return mock success response
    return NextResponse.json({
      success: true,
      message: 'Wholesale application rejected.',
      customer: {
        id: customerId,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      },
    });
  } catch (error) {
    console.error(
      `Error rejecting wholesale application for customer ${params.customerId}:`,
      error
    );
    return NextResponse.json({ error: 'Failed to reject wholesale application' }, { status: 500 });
  }
}
