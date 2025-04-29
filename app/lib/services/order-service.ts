import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, asc, gte, lte, sql as dSql, SQL } from 'drizzle-orm'; // Added SQL
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { userService } from './user-service';
import { commissionService } from './commission-service';
import { productService } from './product-service';

// --- Types ---
type OrderSelect = typeof schema.orders.$inferSelect;
type OrderItemInsert = typeof schema.orderItems.$inferInsert;
type OrderStatusHistoryInsert = typeof schema.orderStatusHistory.$inferInsert;
type OrderFulfillmentInsert = typeof schema.orderFulfillments.$inferInsert;
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type OrderType = typeof schema.orderTypeEnum.enumValues[number];

export interface CreateOrderParams {
    userId: string; items: Array<{ productVariationId: number; quantity: number; price: number; }>;
    shippingAddress: object; paymentMethod: PaymentMethod; appliedReferralCode?: string | null;
    discountCode?: string | null; discountAmount?: number | null; notes?: string | null;
}
export interface OrderWithItems extends OrderSelect { items: (typeof schema.orderItems.$inferSelect)[]; }
export type OrderHistoryItem = typeof schema.orderStatusHistory.$inferSelect;
export interface FulfillmentData { trackingNumber?: string; carrier?: string; fulfillmentNotes?: string; fulfillmentProofUrl?: object; }

// --- Service Class ---
export class OrderService {
    async createOrder(params: CreateOrderParams): Promise<OrderSelect> {
        // ... (logic as before) ...
        try {
            return await db.transaction(async (tx) => {
                // ... (order/item insertion as before) ...

                 // Trigger Referral Commission (simplified)
                 const user = await tx.query.users.findFirst({ where: eq(schema.users.id, params.userId), columns: { referredBy: true } });
                 if (user?.referredBy) {
                    const commissionAmount = parseFloat(finalAmount) * 0.05;
                    if (commissionAmount > 0) {
                        // Assuming commissionService handles Drizzle now
                        await commissionService.createCommission({
                           userId: user.referredBy, orderId: orderId, amount: commissionAmount, rate: '5.00',
                           status: 'Pending', type: 'Order Referral', relatedTo: 'Order', relatedId: orderId
                        }, tx);
                    }
                }
                return insertedOrder[0];
            });
        } catch (error) {
            // ... (error handling) ...
        }
         // Add return statement for non-transaction path (or ensure transaction always runs)
         throw new Error('createOrder should always return within transaction or throw');
    }

    private async getDefaultStockLocationId(tx: any): Promise<string | null> { /* ... */ }
    async getOrderById(orderId: string): Promise<OrderWithItems | null> { /* ... */ }

    async updateOrderStatus(orderId: string, status: OrderStatus, notes: string = '', adminUserId?: string): Promise<OrderSelect> {
        try {
            return await db.transaction(async (tx) => {
                // ... (fetch current order, validate transition) ...
                const updateResult = await tx.update(schema.orders).set({ status: status, updatedAt: new Date() }).where(eq(schema.orders.id, orderId)).returning();
                if (updateResult.length === 0) throw new Error('Failed to update order status');
                await tx.insert(schema.orderStatusHistory).values({ id: uuidv4(), orderId, status, notes });
                if (status === 'PaymentReceived') await tx.update(schema.orders).set({ paymentStatus: 'Completed', updatedAt: new Date() }).where(eq(schema.orders.id, orderId));

                 // Calculate commission on Fulfilled status
                 if (status === 'Fulfilled' && currentOrder.distributorId && currentOrder.totalAmount) {
                    try {
                         // Pass the transaction context (tx) to the service call
                        const commission = await commissionService.calculateCommissionForOrder(orderId, tx);
                        if (commission) {
                           await tx.update(schema.orders).set({ commissionAmount: commission.amount.toString() }).where(eq(schema.orders.id, orderId));
                           logger.info('Commission updated for fulfilled order', { orderId, commissionAmount: commission.amount });
                        }
                    } catch(commissionError) {
                        logger.error('Failed to update commission for fulfilled order', { orderId, error: commissionError });
                    }
                 }
                logger.info('Order status updated', { orderId, from: currentOrder.status, to: status });
                return updateResult[0];
            });
        } catch (error) {
            // ... (error handling) ...
        }
        throw new Error('updateOrderStatus should return within transaction or throw');
    }

    async assignDistributor(orderId: string, distributorId: string): Promise<OrderSelect> { /* ... */ }
    async recordFulfillment(orderId: string, fulfillmentData: FulfillmentData, adminUserId: string): Promise<OrderSelect> {
         try {
             return await db.transaction(async (tx) => {
                 // ... (fetch order, validate status/distributor) ...
                 await tx.insert(schema.orderFulfillments).values({ /* ... fulfillment data ... */ });
                 const newStatus: OrderStatus = 'Fulfilled';
                 const updateResult = await tx.update(schema.orders).set({ status: newStatus, updatedAt: new Date() }).where(eq(schema.orders.id, orderId)).returning();
                 if (updateResult.length === 0) throw new Error('Failed to update order status to fulfilled');
                 await tx.insert(schema.orderStatusHistory).values({ /* ... history data ... */ });
                 // Calculate commission on Fulfilled status
                 if (order.distributorId && order.totalAmount) {
                     try {
                         // Pass the transaction context (tx) to the service call
                         const commission = await commissionService.calculateCommissionForOrder(orderId, tx);
                         if (commission) {
                            await tx.update(schema.orders).set({ commissionAmount: commission.amount.toString() }).where(eq(schema.orders.id, orderId));
                            logger.info('Commission updated for fulfillment', { orderId, commissionAmount: commission.amount });
                         }
                     } catch(commissionError) {
                         logger.error('Failed to update commission on fulfillment', { orderId, error: commissionError });
                     }
                 }
                 logger.info('Fulfillment recorded', { orderId });
                 return updateResult[0];
             });
         } catch (error) {
              // ... (error handling) ...
         }
          throw new Error('recordFulfillment should return within transaction or throw');
    }
    async getUserOrders(userId: string, options: { page?: number; limit?: number; status?: OrderStatus } = {}) { /* ... */ }
    private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void { /* ... */ }
    async getAdminOrders(options: any): Promise<any> { /* ... */ }
}
export const orderService = new OrderService();

// NOTE: Ellipses (...) indicate unchanged code from previous version for brevity
