import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db'; // Corrected import
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Get the discount code from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!code) {
      return NextResponse.json(
        { message: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Query the database for the discount code
    const result = await sql`
      SELECT 
        id, code, description, discount_type, discount_value, 
        min_order_amount, max_discount_amount, start_date, end_date, 
        usage_limit, times_used, is_active
      FROM discount_codes
      WHERE code = ${code}
        AND is_active = TRUE
        AND start_date <= CURRENT_TIMESTAMP
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
        AND (usage_limit IS NULL OR times_used < usage_limit)
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired discount code' },
        { status: 200 } // Return 200 OK with valid: false for validation checks
      );
    }

    const discountCode = result[0];

    // Check minimum order amount
    if (subtotal < discountCode.min_order_amount) {
      return NextResponse.json(
        { 
          valid: false, 
          message: `This code requires a minimum order of $${discountCode.min_order_amount.toFixed(2)}` 
        },
        { status: 200 } // Return 200 OK with valid: false
      );
    }

    // Calculate the discount amount
    let discountAmount = 0;
    if (discountCode.discount_type === 'percentage') {
      discountAmount = subtotal * (discountCode.discount_value / 100);
      
      // Apply maximum discount if specified
      if (discountCode.max_discount_amount && discountAmount > discountCode.max_discount_amount) {
        discountAmount = discountCode.max_discount_amount;
      }
    } else if (discountCode.discount_type === 'fixed_amount') {
      discountAmount = discountCode.discount_value;
      
      // Ensure discount doesn't exceed order total
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    return NextResponse.json({
      valid: true,
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discount_type,
      discountValue: discountCode.discount_value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      message: `Discount applied: ${
        discountCode.discount_type === 'percentage' 
          ? `${discountCode.discount_value}% off` 
          : `$${discountCode.discount_value.toFixed(2)} off`
      }`
    });
  } catch (error: unknown) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { message: errorMessage || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
