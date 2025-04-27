import { NextRequest, NextResponse } from 'next/server';
import { wholesaleService } from '../../../../../../../lib/services/wholesale-service';
import { requireAdminAuth } from '../../../../../../../lib/medusa-client';
import { z } from 'zod';

// Validation schema for rejection request
const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

// POST - Reject a wholesale application
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

    // Parse request body
    const body = await request.json();

    try {
      // Validate rejection reason
      const { reason } = rejectSchema.parse(body);

      // Reject the application
      const result = await wholesaleService.rejectApplication(customerId, reason);

      return NextResponse.json(result);
    } catch (validationError: unknown) {
      // Handle validation errors
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationError.errors,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error(
      `Error rejecting wholesale application for customer ${params.customerId}:`,
      error
    );
    return NextResponse.json({ error: 'Failed to reject wholesale application' }, { status: 500 });
  }
}
