// app/api/payments/manual/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db'; // Keep db and sql import
import { logger } from '@/lib/logger'; // Keep logger import
 // Specific imports from upstream
 // Specific imports from upstream
 // Specific imports from upstream
import { payments } from '@/lib/schema/payments'; // Need payments schema
import { tasks } from '@/lib/schema/tasks';
import { orders } from '@/lib/schema/orders';
import { users } from '@/lib/schema/users';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums
import { eq, and } from 'drizzle-orm';
// Define types based on schema enums (from stash)
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number];
type TaskCategory = typeof schema.taskCategoryEnum.enumValues[number];
type TaskStatus = typeof schema.taskStatusEnum.enumValues[number];
type TaskPriority = typeof schema.taskPriorityEnum.enumValues[number];
type TaskRelatedEntity = typeof schema.taskRelatedEntityEnum.enumValues[number];
type TaskInsert = typeof schema.tasks.$inferInsert;
export const dynamic = 'force-dynamic';
interface ManualPaymentBody {
  orderId: string; // Assuming order ID is passed as string
  paymentMethod: PaymentMethod;
  amount: number;
  transactionDetails?: string; // E.g., e-transfer sender, BTC tx id
}
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return unauthorizedResponse(authResult.message);
    }
    const userId = authResult.userId;
    const body: ManualPaymentBody = await request.json();
    const { orderId, paymentMethod, amount, transactionDetails } = body;
    // --- Validation ---
    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }
    if (!paymentMethod || (paymentMethod !== schema.paymentMethodEnum.ETransfer && paymentMethod !== schema.paymentMethodEnum.Bitcoin)) {
      return NextResponse.json({ message: 'Invalid manual payment method specified (ETransfer or Bitcoin only)' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ message: 'Valid payment amount is required' }, { status: 400 });
    }
    logger.info('Initiating manual payment recording', { userId, orderId, paymentMethod, amount });
    // --- Database Transaction ---
    await db.transaction(async (tx) => {
      // 1. Find the order
      const order = await tx.query.orders.findFirst({
        where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
        columns: { id: true, status: true, paymentStatus: true, totalAmount: true }
      });
      if (!order) {
        logger.warn('Order not found or user mismatch for manual payment', { userId, orderId });
        throw new Error('Order not found or access denied.');
      }
      // 2. Check if order is already paid or cancelled
      if (order.paymentStatus === schema.paymentStatusEnum.Completed || order.status === schema.orderStatusEnum.Cancelled || order.status === schema.orderStatusEnum.Refunded) {
        logger.warn('Attempted manual payment on already paid/cancelled order', { userId, orderId, status: order.status, paymentStatus: order.paymentStatus });
        throw new Error(`Order is already ${order.paymentStatus || order.status}.`);
      }
      // 3. Create a Payment Record
      await tx.insert(payments).values({
          orderId: orderId,
          amount: amount.toFixed(2),
          method: paymentMethod,
          status: schema.paymentStatusEnum.PendingConfirmation, // Use enum
          transactionId: transactionDetails,
          userId: userId,
      });
      logger.info('Manual payment record created', { orderId, userId, paymentMethod });
      // 5. Create Task for Admin to Confirm Payment
      const adminUser = await tx.query.users.findFirst({
        where: eq(users.role, 'Admin'), // Use imported users table
        columns: { id: true }
      });
      const task: TaskInsert = {
        title: `Confirm ${paymentMethod} for Order ${orderId}`,
        description: `User ${userId} reported manual payment of $${amount.toFixed(2)} via ${paymentMethod}. Details: ${transactionDetails || 'N/A'}`,
        category: schema.taskCategoryEnum.PaymentReview, // Use correct enum value (from stash)
        status: schema.taskStatusEnum.Pending, // Use enum
        priority: schema.taskPriorityEnum.High, // Use enum
        relatedTo: schema.taskRelatedEntityEnum.Order, // Use enum
        relatedId: orderId,
        assignedTo: adminUser?.id
      };
      await tx.insert(tasks).values(task);
      logger.info('Task created for manual payment confirmation', { orderId, userId, paymentMethod, assignedTo: adminUser?.id });
    }); // End transaction
    logger.info('Manual payment recorded successfully, pending confirmation', { userId, orderId });
    return NextResponse.json({ message: 'Payment details submitted successfully. Awaiting confirmation.' });
  } catch (error: unknown) {
    logger.error('POST /api/payments/manual error:', { error });
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
    }
    // Return specific errors caught within transaction
    if (error instanceof Error ? error.message : String(error) === 'Order not found or access denied.' || error instanceof Error ? error.message : String(error).startsWith('Order is already')) {
        return NextResponse.json({ message: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
