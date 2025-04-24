import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET a specific discount code
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is admin or owner
    if (!['Admin', 'Owner'].includes(authResult.role)) {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions to access discount codes' },
        { status: 403 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        id, code, description, discount_type, discount_value, 
        min_order_amount, max_discount_amount, start_date, end_date, 
        usage_limit, times_used, is_active, created_at, updated_at
      FROM discount_codes
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Discount code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error(`Error fetching discount code ${params.id}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT update a discount code
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is admin or owner
    if (!['Admin', 'Owner'].includes(authResult.role)) {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions to update discount codes' },
        { status: 403 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive
    } = body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !startDate) {
      return NextResponse.json(
        { message: 'Missing required fields: code, discountType, discountValue, startDate' },
        { status: 400 }
      );
    }

    // Validate discount type
    if (!['percentage', 'fixed_amount'].includes(discountType)) {
      return NextResponse.json(
        { message: 'Invalid discount type. Must be "percentage" or "fixed_amount"' },
        { status: 400 }
      );
    }

    // Validate discount value
    const parsedDiscountValue = parseFloat(discountValue);
    if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
      return NextResponse.json(
        { message: 'Discount value must be a positive number' },
        { status: 400 }
      );
    }

    // Check if the discount code exists
    const existingCode = await sql`
      SELECT id FROM discount_codes WHERE id = ${id}
    `;

    if (existingCode.length === 0) {
      return NextResponse.json(
        { message: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Check if the code is already used by another discount code
    const duplicateCode = await sql`
      SELECT id FROM discount_codes WHERE code = ${code} AND id != ${id}
    `;

    if (duplicateCode.length > 0) {
      return NextResponse.json(
        { message: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Update the discount code
    const result = await sql`
      UPDATE discount_codes
      SET 
        code = ${code},
        description = ${description || null},
        discount_type = ${discountType},
        discount_value = ${parsedDiscountValue},
        min_order_amount = ${minOrderAmount || 0},
        max_discount_amount = ${maxDiscountAmount || null},
        start_date = ${new Date(startDate)},
        end_date = ${endDate ? new Date(endDate) : null},
        usage_limit = ${usageLimit || null},
        is_active = ${isActive !== undefined ? isActive : true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error(`Error updating discount code ${params.id}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE a discount code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is admin or owner
    if (!['Admin', 'Owner'].includes(authResult.role)) {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions to delete discount codes' },
        { status: 403 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    // Check if the discount code exists
    const existingCode = await sql`
      SELECT id FROM discount_codes WHERE id = ${id}
    `;

    if (existingCode.length === 0) {
      return NextResponse.json(
        { message: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Delete the discount code
    await sql`
      DELETE FROM discount_codes WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: 'Discount code deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting discount code ${params.id}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
