import { NextRequest, NextResponse } from 'next/server';
import { wholesaleService } from '../../../../../../../lib/services/wholesale-service';
import { requireAdminAuth } from '../../../../../../../lib/medusa-client';

// POST - Approve a wholesale application
export async function POST(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    // Check admin authorization
    const isAuthorized = await requireAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = params.customerId;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Approve the application
    const result = await wholesaleService.approveApplication(customerId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      `Error approving wholesale application for customer ${params.customerId}:`,
      error
    );
    return NextResponse.json({ error: 'Failed to approve wholesale application' }, { status: 500 });
  }
}
