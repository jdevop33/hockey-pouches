import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all discount codes
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    
    // Build the query
    let query = `
      SELECT 
        id, code, description, discount_type, discount_value, 
        min_order_amount, max_discount_amount, start_date, end_date, 
        usage_limit, times_used, is_active, created_at, updated_at
      FROM discount_codes
    `;
    
    const queryParams: any[] = [];
    const conditions: string[] = [];
    
    // Add filters
    if (isActive !== null) {
      queryParams.push(isActive === 'true');
      conditions.push(`is_active = $${queryParams.length}`);
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(code ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ORDER BY
    query += ` ORDER BY created_at DESC`;
    
    // Execute the query
    const result = await sql.query(query, queryParams);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST create a new discount code
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is admin or owner
    if (!['Admin', 'Owner'].includes(authResult.role)) {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions to create discount codes' },
        { status: 403 }
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

    // Check if code already exists
    const existingCode = await sql`
      SELECT id FROM discount_codes WHERE code = ${code}
    `;

    if (existingCode.length > 0) {
      return NextResponse.json(
        { message: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Insert the new discount code
    const result = await sql`
      INSERT INTO discount_codes (
        code, description, discount_type, discount_value, 
        min_order_amount, max_discount_amount, start_date, end_date, 
        usage_limit, is_active
      ) VALUES (
        ${code}, 
        ${description || null}, 
        ${discountType}, 
        ${parsedDiscountValue}, 
        ${minOrderAmount || 0}, 
        ${maxDiscountAmount || null}, 
        ${new Date(startDate)}, 
        ${endDate ? new Date(endDate) : null}, 
        ${usageLimit || null}, 
        ${isActive !== undefined ? isActive : true}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount code:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
