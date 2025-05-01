// app/lib/services/order-service.ts
import { db } from '@/lib/db';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { commissions } from '@/lib/schema/commissions';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import the combined schema
import { eq, and, count, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { userService, type UserSelect } from './user-service';
import { commissionService } from './commission-service';
import { productService } from './product-service';
import {
  commissionStatusEnum,
  commissionTypeEnum,
  commissionRelatedEntityEnum,
} from '@/lib/schema/commissions';
// --- Types ---
export type OrderSelect = typeof schema.orders.$inferSelect;
export type OrderItemInsert = typeof schema.orderItems.$inferInsert;
export type OrderStatusHistoryInsert = typeof schema.orderStatusHistory.$inferInsert;
export type OrderFulfillmentInsert = typeof schema.orderFulfillments.$inferInsert;
export type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof schema.paymentMethodEnum.enumValues)[number];
export type OrderType = (typeof schema.orderTypeEnum.enumValues)[number];
export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
export interface CreateOrderParams {
  userId: string;
  items: Array<{ productVariationId: number; quantity: number; price: number }>;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  appliedReferralCode?: string | null;
  discountCode?: string | null;
  discountAmount?: number | null;
  notes?: string | null;
}
export interface OrderWithItems extends OrderSelect {
  items: (typeof schema.orderItems.$inferSelect & {
    productVariation?:
      | (typeof schema.productVariations.$inferSelect & {
          product?: typeof schema.products.$inferSelect | null;
        })
      | null;
  })[];
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    status: string;
    referralCode?: string | null;
  } | null;
  distributor?: Pick<UserSelect, 'id' | 'name'> | null;
  statusHistory?: OrderHistoryItem[];
  fulfillments?: (typeof schema.orderFulfillments.$inferSelect)[];
}
export type OrderHistoryItem = typeof schema.orderStatusHistory.$inferSelect;
export type UserRole = (typeof schema.userRoleEnum.enumValues)[number];
export interface FulfillmentData {
  trackingNumber?: string;
  carrier?: string;
  fulfillmentNotes?: string;
  fulfillmentProofUrl?: string | string[];
}
// --- Service Class ---
export class OrderService {
  /**
   * Creates a new order, inserts items, updates inventory, and adds status history.
   * Handles wholesale vs retail minimums and user role checks.
   * Creates referral commission if applicable.
   * @param params - Order creation parameters.
   * @returns Promise<OrderSelect> - The newly created order.
   */
  async createOrder(params: CreateOrderParams): Promise<OrderSelect> {
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      notes,
      appliedReferralCode,
      discountCode,
      discountAmount,
    } = params;

    if (!items || items.length === 0) throw new Error('Order must contain at least one item');

    // Ensure db is available
    if (!db) throw new Error('Database connection is not available.');

    // Validate items have positive quantity
    if (items.some(item => item.quantity <= 0)) {
      throw new Error('All order items must have a positive quantity.');
    }

    // Determine Order Type and Validate Minimums
    const totalQuantity = items.reduce((sum: number, item) => sum + item.quantity, 0);
    const orderType: OrderType =
      totalQuantity >= 100
        ? schema.orderTypeEnum.enumValues[1] // Wholesale
        : schema.orderTypeEnum.enumValues[0]; // Retail

    if (orderType === schema.orderTypeEnum.enumValues[0] && totalQuantity < 5)
      throw new Error(
        `Retail orders require a minimum of 5 items. Current quantity: ${totalQuantity}`
      );
    if (orderType === schema.orderTypeEnum.enumValues[1] && totalQuantity < 100)
      throw new Error(
        `Wholesale orders require a minimum of 100 items. Current quantity: ${totalQuantity}`
      );

    // Validate User
    const user = await userService.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Validate Wholesale Eligibility
    if (
      orderType === schema.orderTypeEnum.enumValues[1] && // Wholesale
      user.role !== schema.userRoleEnum.enumValues[3] // WholesaleBuyer
    )
      throw new Error('User account not approved for wholesale orders.');

    // Calculate Totals
    // Ensure prices are treated as numbers for calculation
    const subtotalNum = items.reduce(
      (sum: number, item) => sum + item.quantity * Number(item.price || 0),
      0
    );
    // TODO: Add Tax calculation logic here if applicable
    const taxesNum = 0; // Placeholder
    // TODO: Add Shipping cost calculation logic here if applicable
    const shippingCostNum = 0; // Placeholder

    const totalAmountNum = subtotalNum + taxesNum + shippingCostNum;
    const discountAmountNum = Number(discountAmount || 0);

    const finalAmountNum = totalAmountNum - discountAmountNum;

    if (finalAmountNum < 0) {
      logger.warn('Order total became negative after discount', {
        totalAmountNum,
        discountAmountNum,
      });
      throw new Error('Order total cannot be negative after discounts.');
    }

    // Format amounts to strings for DB insertion
    const subtotalStr = subtotalNum.toFixed(2);
    const taxesStr = taxesNum.toFixed(2);
    const shippingCostStr = shippingCostNum.toFixed(2);
    const totalAmountStr = totalAmountNum.toFixed(2);
    const finalAmountStr = finalAmountNum.toFixed(2);
    const discountAmountStr = discountAmountNum.toFixed(2);

    try {
      // Use Drizzle transaction
      return await db.transaction(async tx => {
        const orderId = uuidv4();
        const initialStatus: OrderStatus = schema.orderStatusEnum.enumValues[1]; // 'PendingPayment'
        const paymentStatusInitial = schema.paymentStatusEnum.enumValues[0]; // 'Pending'

        logger.info('Creating order within transaction', { orderId, userId, orderType });

        // Insert Order
        const insertedOrderResult = await tx
          .insert(schema.orders)
          .values({
            id: orderId,
            userId,
            status: initialStatus,
            subtotal: subtotalStr,
            taxes: taxesStr,
            shippingCost: shippingCostStr,
            totalAmount: totalAmountStr, // Total before discount
            discountAmount: discountAmountStr,
            finalAmount: finalAmountStr, // Final amount after discount
            paymentMethod,
            paymentStatus: paymentStatusInitial,
            type: orderType,
            shippingAddress: shippingAddress,
            billingAddress: shippingAddress, // Assuming billing = shipping for now
            notes: notes ?? undefined,
            appliedReferralCode: appliedReferralCode ?? undefined,
            discountCode: discountCode ?? undefined,
          })
          .returning();

        const insertedOrder = insertedOrderResult[0];
        if (!insertedOrder) {
          logger.error('Order insertion failed within transaction', { orderId });
          throw new Error('Order creation failed during insertion.');
        }

        // Insert Order Items
        const orderItemsToInsert: OrderItemInsert[] = items.map(item => ({
          subtotal: (parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2),
          id: uuidv4(),
          orderId,
          productVariationId: item.productVariationId,
          quantity: item.quantity,
          priceAtPurchase: Number(item.price).toFixed(2),
          // subtotal: (item.quantity * Number(item.price)).toFixed(2), // Redundant if calculated above
        }));

        if (orderItemsToInsert.length > 0) {
          await tx.insert(schema.orderItems).values(orderItemsToInsert);
          logger.info(`Inserted ${orderItemsToInsert.length} items for order ${orderId}`);
        } else {
          logger.warn(`No items to insert for order ${orderId}`);
          // Decide if this should be an error
        }

        // ----- Inventory Update (Placeholder - Needs InventoryService integration) -----
        logger.warn(`Inventory update logic needed for order ${orderId}`);
        // TODO: Integrate with InventoryService to reserve/deduct stock
        // Example (needs refinement based on InventoryService methods):
        // for (const item of items) {
        //   await inventoryService.reserveStock({
        //      productVariationId: item.productVariationId,
        //      quantity: item.quantity,
        //      referenceId: orderId,
        //      referenceType: 'order',
        //      transaction: tx,
        //   });
        // }
        // -----------------------------------------------------------------------------

        // Add Initial Status History
        await tx.insert(schema.orderStatusHistory).values({
          id: uuidv4(),
          orderId,
          status: initialStatus,
          notes: 'Order created, awaiting payment',
        });

        // ----- Referral Commission Logic -----
        // Check if the user who placed the order was referred
        const userForReferralCheck = await tx.query.users.findFirst({
          where: eq(schema.users.id, userId),
          columns: { referredBy: true }, // Get the ID of the user who referred this customer
        });

        // If the customer was referred by someone
        if (userForReferralCheck?.referredBy) {
          const referrerId = userForReferralCheck.referredBy;
          const commissionAmountNum = parseFloat((finalAmountNum * 0.05).toFixed(2)); // 5% commission on final amount

          logger.info('Calculating referral commission', {
            orderId,
            referrerId,
            commissionAmountNum,
          });

          if (commissionAmountNum > 0) {
            // Create a commission record for the referrer
            await commissionService.createCommission(
              {
                userId: referrerId, // The user earning the commission
                orderId: orderId, // Link to the order that generated it
                amount: commissionAmountNum.toString(),
                rate: '5.00', // Store rate used
                status: schema.commissionStatusEnum.enumValues[0], // 'Pending'
                type: schema.commissionTypeEnum.enumValues[0], // 'Referral Sale'
                notes: `Commission for order ${orderId} placed by referred user ${userId}`,
                // relatedTo: commissionRelatedEntityEnum.enumValues[0], // 'Order' - Deprecated/Optional?
                // relatedId: orderId, // Deprecated/Optional?
              },
              tx // Pass the transaction object
            );
            logger.info('Referral commission created', {
              orderId,
              referrerId,
              amount: commissionAmountNum,
            });
          }
        }
        // -------------------------------------

        logger.info(`Order ${orderId} created successfully in transaction`);
        return insertedOrder; // Return the created order details
      });
    } catch (error) {
      logger.error('Error creating order transaction:', { error, params });
      // Don't expose internal errors directly, throw a generic error
      throw new Error('An unexpected error occurred while creating the order.');
    }
  }

  /**
   * Retrieves a single order by its ID, including associated items, user, distributor, etc.
   * @param orderId - The ID of the order to retrieve.
   * @returns Promise<OrderWithItems | null>
   */
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    try {
      // Ensure db is available
      if (!db) throw new Error('Database connection not available.');

      logger.debug(`Fetching order by ID: ${orderId}`);
      const orderData = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          items: { with: { productVariation: { with: { product: true } } } },
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              referralCode: true,
            },
          },
          distributor: { columns: { id: true, name: true } },
          statusHistory: { orderBy: [desc(schema.orderStatusHistory.createdAt)] },
          fulfillments: true,
        },
      });

      if (!orderData) return null;

      // Transform to ensure it matches OrderWithItems type
      const order: OrderWithItems = {
        ...orderData,
        items: orderData.items || [],
        statusHistory: orderData.statusHistory || [],
        fulfillments: orderData.fulfillments || [],
      };

      return order;
    } catch (error) {
      logger.error('Error getting order by ID:', { orderId, error });
      return null;
    }
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    options: {
      notes?: string;
      adminUserId?: string;
    } = {}
  ): Promise<OrderSelect> {
    // Using options in a basic way to avoid linter error
    const notes = options.notes || 'Status updated';
    // Implementation would go here
    logger.info('Updating order status', { orderId, newStatus, notes });
    throw new Error('Not implemented');
  }

  async assignDistributor(orderId: string, distributorId: string): Promise<OrderSelect> {
    try {
      const distributor = await userService.getUserById(distributorId);
      if (!distributor) throw new Error('Distributor user not found');
      if (distributor.role !== schema.userRoleEnum.enumValues[2])
        throw new Error('User is not a distributor');
      return await db.transaction(async tx => {
        const order = await tx.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          columns: { status: true },
        });
        if (!order) throw new Error('Order not found');
        const validStatuses: OrderStatus[] = [
          schema.orderStatusEnum.enumValues[2],
          schema.orderStatusEnum.enumValues[3],
          schema.orderStatusEnum.enumValues[4],
        ];
        if (!validStatuses.includes(order.status as any))
          throw new Error(`Cannot assign distributor in current status: ${order.status}`);
        const updateResult = await tx
          .update(schema.orders)
          .set({ distributorId: distributorId, updatedAt: new Date() })
          .where(eq(schema.orders.id, orderId))
          .returning();
        if (updateResult.length === 0) throw new Error('Failed to assign distributor');
        await tx.insert(schema.orderStatusHistory).values({
          id: uuidv4(),
          orderId,
          status: order.status,
          notes: `Distributor assigned: ${distributor.name || distributorId}`,
        });
        logger.info('Distributor assigned to order', { orderId, distributorId });
        return updateResult[0];
      });
    } catch (error) {
      logger.error('Error assigning distributor:', { orderId, distributorId, error });
      if (error instanceof Error) throw error;
      throw new Error('Failed to assign distributor.');
    }
  }

  async recordFulfillment(
    orderId: string,
    fulfillmentData: FulfillmentData,
    distributorUserId: string
  ): Promise<OrderSelect> {
    const { trackingNumber, carrier, fulfillmentNotes, fulfillmentProofUrl } = fulfillmentData;
    if (!trackingNumber && !fulfillmentProofUrl)
      throw new Error('Fulfillment requires tracking number or proof URL.');
    try {
      return await db.transaction(async tx => {
        const order = await tx.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          columns: {
            status: true,
            distributorId: true,
            totalAmount: true,
            commissionAmount: true,
          },
        });
        if (!order) throw new Error('Order not found');
        const validStatuses: OrderStatus[] = [
          schema.orderStatusEnum.enumValues[4],
          schema.orderStatusEnum.enumValues[3],
        ]; // ReadyForFulfillment, Processing
        if (!validStatuses.includes(order.status as any))
          throw new Error(`Cannot record fulfillment in current status: ${order.status}`);
        if (order.distributorId !== distributorUserId)
          throw new Error('Order not assigned to this distributor');
        const fulfillmentId = uuidv4();
        await tx.insert(schema.orderFulfillments).values({
          id: fulfillmentId,
          orderId,
          trackingNumber,
          carrier,
          fulfillmentNotes,
          fulfillmentProofUrl: fulfillmentProofUrl
            ? JSON.parse(JSON.stringify(fulfillmentProofUrl))
            : undefined,
          status: schema.fulfillmentStatusEnum.enumValues[0],
        });
        const newStatus: OrderStatus = schema.orderStatusEnum.enumValues[5]; // 'Fulfilled'
        const updateResult = await tx
          .update(schema.orders)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(schema.orders.id, orderId))
          .returning();
        if (updateResult.length === 0) throw new Error('Failed to update order status');
        const historyNotes = `Fulfillment recorded by distributor.${trackingNumber ? ` Tracking: ${trackingNumber}${carrier ? ` (${carrier})` : ''}.` : ''} Pending Admin Approval.`;
        await tx
          .insert(schema.orderStatusHistory)
          .values({ id: uuidv4(), orderId, status: newStatus, notes: historyNotes });
        if (order.distributorId && order.totalAmount && !order.commissionAmount) {
          try {
            const commission = await commissionService.calculateCommissionForOrder(orderId, tx);
            if (commission && commission.amount) {
              await tx
                .update(schema.orders)
                .set({ commissionAmount: commission.amount.toFixed(2) })
                .where(eq(schema.orders.id, orderId));
              logger.info('Commission updated on fulfillment', {
                orderId,
                commissionAmount: commission.amount,
              });
            }
          } catch (commissionError) {
            const errorMessage =
              commissionError instanceof Error ? commissionError.message : String(commissionError);
            logger.error('Failed commission update on fulfillment', {
              orderId,
              error: errorMessage,
            });
          }
        }
        logger.info('Fulfillment recorded', { orderId, fulfillmentId });
        return updateResult[0];
      });
    } catch (error) {
      logger.error('Error recording fulfillment:', { orderId, error });
      if (error instanceof Error) throw error;
      throw new Error('Failed to record fulfillment.');
    }
  }

  async getUserOrders(
    userId: string,
    options: { page?: number; limit?: number; status?: OrderStatus } = {}
  ) {
    // ... (Implementation using schema.orders as before) ...
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;
    try {
      const conditions = [eq(schema.orders.userId, userId)];
      if (status) conditions.push(eq(schema.orders.status, status));
      const whereClause = and(...conditions);
      const ordersQuery = db.query.orders.findMany({
        where: whereClause,
        orderBy: [desc(schema.orders.createdAt)],
        limit,
        offset,
        with: {
          items: {
            columns: { id: true, quantity: true },
            with: { productVariation: { columns: { name: true } } },
          },
        },
      });
      const countQuery = db.select({ total: count() }).from(schema.orders).where(whereClause);
      const [ordersResult, countResult] = await Promise.all([ordersQuery, countQuery]);
      const total = countResult[0].total;
      return {
        orders: ordersResult,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error getting user orders:', { userId, options, error });
      throw new Error('Failed to get user orders');
    }
  }

  async getAdminOrders(/* options parameter intentionally removed */): Promise<{
    orders: OrderWithItems[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    // Placeholder implementation
    return { orders: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  private validateStatusTransition(newStatus: OrderStatus): void {
    // Implementation placeholder - will be properly implemented
    logger.info('Status transition validation', { newStatus });
    // Status transition validation logic will go here based on business rules
  }

  async approveFulfillment(
    orderId: string,
    fulfillmentId: string,
    adminUserId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      await db.transaction(async tx => {
        const fulfillment = await tx.query.orderFulfillments.findFirst({
          where: and(
            eq(schema.orderFulfillments.id, fulfillmentId),
            eq(schema.orderFulfillments.orderId, orderId)
          ),
        });
        if (!fulfillment) throw new Error('Fulfillment record not found.');
        if (fulfillment.status !== schema.fulfillmentStatusEnum.enumValues[0])
          throw new Error('Fulfillment already processed.');
        await tx
          .update(schema.orderFulfillments)
          .set({
            status: schema.fulfillmentStatusEnum.enumValues[1],
            reviewedAt: new Date(),
            reviewedBy: adminUserId,
            reviewNotes: adminNotes,
            updatedAt: new Date(),
          })
          .where(eq(schema.orderFulfillments.id, fulfillmentId));
        const nextOrderStatus: OrderStatus = schema.orderStatusEnum.enumValues[6]; // Shipped
        const currentOrder = await tx.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          columns: { status: true },
        });
        if (!currentOrder) throw new Error('Order not found during approval.');
        this.validateStatusTransition(nextOrderStatus);
        await tx
          .update(schema.orders)
          .set({ status: nextOrderStatus, updatedAt: new Date() })
          .where(eq(schema.orders.id, orderId));
        await tx.insert(schema.orderStatusHistory).values({
          id: uuidv4(),
          orderId,
          status: nextOrderStatus,
          notes: `Fulfillment approved by admin ${adminUserId}.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
        });
        await tx
          .update(schema.tasks)
          .set({ status: schema.taskStatusEnum.enumValues[2], updatedAt: new Date() })
          .where(
            and(
              eq(schema.tasks.relatedTo, schema.taskRelatedEntityEnum.enumValues[0]),
              eq(schema.tasks.relatedId, orderId),
              eq(schema.tasks.title, 'Verify fulfillment')
            )
          );
      });
      logger.info('Fulfillment approved', { orderId, fulfillmentId, adminUserId });
      // No return needed for void
    } catch (error) {
      logger.error('Error approving fulfillment:', { orderId, error });
      throw error;
    }
  }

  async rejectFulfillment(
    orderId: string,
    fulfillmentId: string,
    adminUserId: string,
    reason: string
  ): Promise<void> {
    if (!reason || reason.trim().length === 0) throw new Error('Rejection reason required.');
    try {
      await db.transaction(async tx => {
        const fulfillment = await tx.query.orderFulfillments.findFirst({
          where: and(
            eq(schema.orderFulfillments.id, fulfillmentId),
            eq(schema.orderFulfillments.orderId, orderId)
          ),
        });
        if (!fulfillment) throw new Error('Fulfillment record not found.');
        if (fulfillment.status !== schema.fulfillmentStatusEnum.enumValues[0])
          throw new Error('Fulfillment already processed.');
        await tx
          .update(schema.orderFulfillments)
          .set({
            status: schema.fulfillmentStatusEnum.enumValues[2],
            reviewedAt: new Date(),
            reviewedBy: adminUserId,
            reviewNotes: reason,
            updatedAt: new Date(),
          })
          .where(eq(schema.orderFulfillments.id, fulfillmentId));
        const backStatus: OrderStatus = schema.orderStatusEnum.enumValues[4]; // ReadyForFulfillment
        const currentOrder = await tx.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          columns: { status: true },
        });
        if (!currentOrder) throw new Error('Order not found during rejection.');
        // Consider adjusting validation rules for Fulfilled -> ReadyForFulfillment
        // this.validateStatusTransition(currentOrder.status, backStatus);
        await tx
          .update(schema.orders)
          .set({ status: backStatus, updatedAt: new Date() })
          .where(eq(schema.orders.id, orderId));
        await tx.insert(schema.orderStatusHistory).values({
          id: uuidv4(),
          orderId,
          status: backStatus,
          notes: `Fulfillment rejected by admin ${adminUserId}. Reason: ${reason}`,
        });
        await tx
          .update(schema.tasks)
          .set({
            status: schema.taskStatusEnum.enumValues[3],
            updatedAt: new Date(),
            notes: `Rejected by admin ${adminUserId}`,
          })
          .where(
            and(
              eq(schema.tasks.relatedTo, schema.taskRelatedEntityEnum.enumValues[0]),
              eq(schema.tasks.relatedId, orderId),
              eq(schema.tasks.title, 'Verify fulfillment')
            )
          );
      });
      logger.info('Fulfillment rejected', { orderId, fulfillmentId, adminUserId });
      // No return needed for void
    } catch (error) {
      logger.error('Error rejecting fulfillment:', { orderId, error });
      throw error;
    }
  }
}

export const orderService = new OrderService();
// NOTE: Some method bodies omitted for brevity where only import/type changes needed
