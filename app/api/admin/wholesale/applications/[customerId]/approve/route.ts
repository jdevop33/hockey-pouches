import { NextRequest, NextResponse } from 'next/server';

// POST - Approve a wholesale application
export async function POST(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    // TODO: Implement proper admin authentication once we create our auth service
    // For now, we'll assume the request is authorized

    const customerId = params.customerId;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // TODO: Implement actual approval logic with our custom service
    console.log(`Approving wholesale application for customer: ${customerId}`);

    // Return mock success response
    return NextResponse.json({
      success: true,
      message: 'Wholesale application approved successfully.',
      customer: {
        id: customerId,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      `Error approving wholesale application for customer ${params.customerId}:`,
      error
    );
    return NextResponse.json({ error: 'Failed to approve wholesale application' }, { status: 500 });
  }
}
