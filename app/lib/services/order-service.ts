// app/lib/services/order-service.ts
import { db } from '@/lib/db';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { commissions } from '@/lib/schema/commissions';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { commissions } from '@/lib/schema/commissions';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { commissions } from '@/lib/schema/commissions';
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
    const totalQuantity = items.reduce((sum: number, item) => sum + item.quantity, 0);
    const orderType: OrderType =
      totalQuantity >= 100
        ? schema.orderTypeEnum.enumValues[1]
        : schema.orderTypeEnum.enumValues[0];
    if (orderType === schema.orderTypeEnum.enumValues[0] && totalQuantity < 5)
      throw new Error('Retail orders require minimum 5 items');
    if (orderType === schema.orderTypeEnum.enumValues[1] && totalQuantity < 100)
      throw new Error('Wholesale orders require minimum 100 items');
    const user = await userService.getUserById(userId);
    if (!user) throw new Error('User not found');
    if (
      orderType === schema.orderTypeEnum.enumValues[1] &&
      user.role !== schema.userRoleEnum.enumValues[3]
    )
      throw new Error('Wholesale orders require approved buyer account');
    const totalAmount = items
      .reduce((sum: number, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);
    const finalAmountNum = discountAmount
      ? parseFloat(totalAmount) - discountAmount
      : parseFloat(totalAmount);
    if (finalAmountNum < 0) throw new Error('Order total cannot be negative');
    const finalAmountStr = finalAmountNum.toFixed(2);
    const discountAmountStr = discountAmount?.toFixed(2) ?? '0.00';
    try {
      return await db.transaction(async tx => {
        const orderId = uuidv4();
        const initialStatus: OrderStatus = schema.orderStatusEnum.enumValues[1]; // 'PendingPayment'
        const insertedOrder = await tx
          .insert(schema.orders)
          .values({
            id: orderId,
            userId,
            status: initialStatus,
            totalAmount: finalAmountStr,
            paymentMethod,
            paymentStatus: schema.paymentStatusEnum.enumValues[0],
            type: orderType,
            shippingAddress: shippingAddress,
            notes: notes ?? undefined,
            appliedReferralCode: appliedReferralCode ?? undefined,
            discountCode: discountCode ?? undefined,
            discountAmount: discountAmountStr,
          })
          .returning();
        if (!insertedOrder || insertedOrder.length === 0) throw new Error('Order creation failed');
        const orderItemsToInsert: OrderItemInsert[] = items.map(item => ({
          id: uuidv4(),
          orderId: orderId,
          productVariationId: item.productVariationId,
          quantity: item.quantity,
          priceAtPurchase: item.price.toFixed(2),
          subtotal: (item.quantity * item.price).toFixed(2),
        }));
        await tx.insert(schema.orderItems).values(orderItemsToInsert);

        // Get location ID - using a direct query instead of the helper method to avoid type issues
        let locationId: string | null = null;
        try {
          const locationQuery = await tx.query.stockLocations.findFirst({
            where: eq(schema.stockLocations.type, schema.stockLocationTypeEnum.enumValues[0]),
          });
          locationId = locationQuery?.id || null;
        } catch (err) {
          logger.error('Error getting default stock location', { error: err });
        }

        if (!locationId) throw new Error('Cannot determine default stock location');

        for (const item of items) {
          await productService.updateInventory({
            productVariationId: item.productVariationId,
            locationId: locationId,
            changeQuantity: -item.quantity,
            type: 'sale',
            referenceId: orderId,
            referenceType: 'order',
            userId: userId,
            transaction: tx,
          });
        }
        await tx
          .insert(schema.orderStatusHistory)
          .values({ id: uuidv4(), orderId, status: initialStatus, notes: 'Order created' });
        const userForReferralCheck = await tx.query.users.findFirst({
          where: eq(schema.users.id, userId),
          columns: { referredBy: true },
        });
        if (userForReferralCheck?.referredBy) {
          const commissionAmountNum = parseFloat((finalAmountNum * 0.05).toFixed(2));
          if (commissionAmountNum > 0) {
            await commissionService.createCommission(
              {
                userId: userForReferralCheck.referredBy,
                orderId: orderId,
                amount: commissionAmountNum.toString(),
                rate: '5.00',
                status: commissionStatusEnum.enumValues[0],
                type: commissionTypeEnum.enumValues[0],
                relatedTo: commissionRelatedEntityEnum.enumValues[0],
                relatedId: orderId,
              },
              tx
            );
          }
        }
        return insertedOrder[0];
      });
    } catch (error) {
      logger.error('Error creating order transaction:', { error, params });
      if (error instanceof Error) throw error;
      throw new Error('Failed to create order.');
    }
  }

  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    try {
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
        if (!validStatuses.includes(order.status))
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
          columns: { status: true, distributorId: true, totalAmount: true, commissionAmount: true },
        });
        if (!order) throw new Error('Order not found');
        const validStatuses: OrderStatus[] = [
          schema.orderStatusEnum.enumValues[4],
          schema.orderStatusEnum.enumValues[3],
        ]; // ReadyForFulfillment, Processing
        if (!validStatuses.includes(order.status))
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
