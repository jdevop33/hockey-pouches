import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

/**
 * Endpoint to approve or reject wholesale applications
 * PATCH - Update application status (approve/reject)
 */
export async function PATCH(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    // Verify authentication and admin permissions
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: authResult.message }, { status: 401 });
    }

    // Only allow admins to approve/reject wholesale applications
    if (authResult.role !== 'Admin' && authResult.role !== 'Owner') {
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can manage wholesale applications' },
        { status: 403 }
      );
    }

    const { customerId } = params;
    if (!customerId) {
      return NextResponse.json({ message: 'Customer ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    // Validate required fields
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Update application status
    const updateResult = await sql`
      UPDATE wholesale_applications
      SET 
        status = ${status},
        notes = ${notes || null},
        updated_at = NOW(),
        updated_by = ${authResult.userId}
      WHERE customer_id = ${customerId}
      RETURNING id, status
    `;

    if (updateResult.length === 0) {
      return NextResponse.json({ message: 'Wholesale application not found' }, { status: 404 });
    }

    // If approved, update user role to Wholesale Buyer
    if (status === 'approved') {
      await sql`
        UPDATE users
        SET role = 'WholesaleBuyer', 
            updated_at = NOW()
        WHERE id = ${customerId}
      `;

      // Create a notification for the customer
      await sql`
        INSERT INTO notifications (
          user_id,
          title,
          content,
          type,
          read
        ) VALUES (
          ${customerId},
          'Wholesale Application Approved',
          'Your wholesale application has been approved! You now have access to wholesale pricing and bulk ordering.',
          'WholesaleStatus',
          false
        )
      `;
    } else {
      // Create a notification for rejected applications too
      await sql`
        INSERT INTO notifications (
          user_id,
          title,
          content,
          type,
          read
        ) VALUES (
          ${customerId},
          'Wholesale Application Status Update',
          ${notes || 'Your wholesale application could not be approved at this time.'},
          'WholesaleStatus',
          false
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Wholesale application ${status}`,
      applicationId: updateResult[0].id,
      status: updateResult[0].status,
    });
  } catch (error) {
    console.error('Error updating wholesale application:', error);
    return NextResponse.json(
      { message: 'Failed to update wholesale application' },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve wholesale application details for a specific customer
 */
export async function GET(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    // Verify authentication and admin permissions
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: authResult.message }, { status: 401 });
    }

    // Only allow admins to view wholesale applications
    if (authResult.role !== 'Admin' && authResult.role !== 'Owner') {
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can view wholesale applications' },
        { status: 403 }
      );
    }

    const { customerId } = params;
    if (!customerId) {
      return NextResponse.json({ message: 'Customer ID is required' }, { status: 400 });
    }

    // Fetch application details
    const applicationResult = await sql`
      SELECT 
        wa.*,
        u.name as customer_name,
        u.email as customer_email
      FROM wholesale_applications wa
      JOIN users u ON wa.customer_id = u.id
      WHERE wa.customer_id = ${customerId}
    `;

    if (applicationResult.length === 0) {
      return NextResponse.json({ message: 'Wholesale application not found' }, { status: 404 });
    }

    return NextResponse.json(applicationResult[0]);
  } catch (error) {
    console.error('Error fetching wholesale application:', error);
    return NextResponse.json({ message: 'Failed to fetch wholesale application' }, { status: 500 });
  }
}
