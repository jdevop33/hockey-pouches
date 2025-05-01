import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db'; // Ensure named import
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { logger } from '@/lib/logger'; // Added logger
import { orders } from '@/lib/schema/orders';
import { discountCodes } from '@/lib/schema/discountCodes';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import schema
 // Import db for updates
import { eq, and } from 'drizzle-orm'; // Import operators
export const dynamic = 'force-dynamic';
// Define expected result types from raw sql (adjust based on actual queries)
// Or better: Refactor to use Drizzle query builder
interface OrderQueryResult {
    id: string;
    subtotal: string; // Comes back as string from DB
    discount_code: string | null;
    discount_amount: string; // Comes back as string
    total_amount: string; // Comes back as string
}
interface DiscountCodeQueryResult {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    start_date: Date;
    end_date: Date | null;
    usage_limit: number | null;
    times_used: number;
    is_active: boolean;
}
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }
    const userId = authResult.userId;
    const body = await request.json();
    const { code, orderId } = body;
    if (!code || !orderId) {
      return NextResponse.json({ message: 'Discount code and order ID are required' }, { status: 400 });
    }
    logger.info('Applying discount code', { userId, orderId, code });
    // Refactor to use Drizzle query builder for type safety
    const order = await db.query.orders.findFirst({
        where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)), // Ensure order belongs to user
        columns: { id: true, totalAmount: true, discountCode: true, discountAmount: true, status: true }
    });
    if (!order) {
      return NextResponse.json({ message: 'Order not found or does not belong to user' }, { status: 404 });
    }
    // Check if order status allows applying discount (e.g., only before payment)
    if (order.status !== 'PendingPayment' && order.status !== 'Created') {
         return NextResponse.json({ message: `Cannot apply discount to order with status: ${order.status}` }, { status: 400 });
    }
    if (order.discountCode) {
      return NextResponse.json({ message: 'A discount code is already applied to this order' }, { status: 400 });
    }
    // Validate discount code using Drizzle
    const discountCode = await db.query.discountCodes.findFirst({
        where: and(
            eq(schema.discountCodes.code, code),
            eq(schema.discountCodes.isActive, true),
            lte(schema.discountCodes.startDate, new Date()),
            or(isNull(schema.discountCodes.endDate), gte(schema.discountCodes.endDate, new Date())),
            or(isNull(schema.discountCodes.usageLimit), lt(schema.discountCodes.timesUsed, schema.discountCodes.usageLimit))
        )
    });
    if (!discountCode) {
      return NextResponse.json({ message: 'Invalid or expired discount code' }, { status: 400 });
    }
    const orderTotalNum = parseFloat(order.totalAmount);
    const minOrderAmountNum = parseFloat(discountCode.minOrderAmount || '0');
    if (orderTotalNum < minOrderAmountNum) {
      return NextResponse.json({ message: `This code requires a minimum order total of $${minOrderAmountNum.toFixed(2)}` }, { status: 400 });
    }
    let calculatedDiscountAmount = 0;
    const discountValueNum = parseFloat(discountCode.discountValue);
    if (discountCode.discountType === 'percentage') {
      calculatedDiscountAmount = orderTotalNum * (discountValueNum / 100);
      const maxDiscountNum = discountCode.maxDiscountAmount ? parseFloat(discountCode.maxDiscountAmount) : null;
      if (maxDiscountNum !== null && calculatedDiscountAmount > maxDiscountNum) {
        calculatedDiscountAmount = maxDiscountNum;
      }
    } else if (discountCode.discountType === 'fixed_amount') {
      calculatedDiscountAmount = discountValueNum;
      if (calculatedDiscountAmount > orderTotalNum) {
        calculatedDiscountAmount = orderTotalNum; // Cannot discount more than total
      }
    }
    if (calculatedDiscountAmount <= 0) {
         return NextResponse.json({ message: 'Calculated discount is zero or negative.' }, { status: 400 });
    }
    const newTotalAmount = orderTotalNum - calculatedDiscountAmount;
    // Use Drizzle transaction for updates
    await db.transaction(async (tx) => {
        await tx.update(schema.orders)
            .set({
                discountCode: code,
                discountAmount: calculatedDiscountAmount.toFixed(2),
                totalAmount: newTotalAmount.toFixed(2),
                updatedAt: new Date()
            })
            .where(eq(schema.orders.id, orderId));
        await tx.update(schema.discountCodes)
            .set({ timesUsed: sql`${schema.discountCodes.timesUsed} + 1` })
            .where(eq(schema.discountCodes.id, discountCode.id));
    });
    logger.info('Discount code applied successfully', { userId, orderId, code, discountAmount: calculatedDiscountAmount });
    return NextResponse.json({
      success: true,
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discountType,
      discountValue: discountValueNum,
      discountAmountApplied: parseFloat(calculatedDiscountAmount.toFixed(2)),
      newTotalAmount: parseFloat(newTotalAmount.toFixed(2)),
      message: `Discount applied: ${discountCode.description || code}`
    });
  } catch (error: any) {
    logger.error('Error applying discount code:', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
