// app/lib/services/order-service.ts
import { db } from '@/lib/db';
// Import specific schemas and enums needed
import { orders, orderItems, orderStatusHistory, orderFulfillments, orderStatusEnum, paymentMethodEnum, orderTypeEnum, paymentStatusEnum, users, stockLocations, tasks, taskCategoryEnum, productVariations, stockLevels, commissions } from '@/lib/schema';
import { eq, and, or, ilike, count, desc, asc, gte, lte, sql as dSql, SQL, ne } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { userService, type UserSelect } from './user-service'; // Correctly import UserSelect
import { commissionService } from './commission-service';
import { productService } from './product-service';

// --- Types ---
export type OrderSelect = typeof orders.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
export type OrderStatusHistoryInsert = typeof orderStatusHistory.$inferInsert;
export type OrderFulfillmentInsert = typeof orderFulfillments.$inferInsert;
export type OrderStatus = typeof orderStatusEnum.enumValues[number];
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type OrderType = typeof orderTypeEnum.enumValues[number];

// Correctly define CreateOrderParams interface
export interface CreateOrderParams {
    userId: string;
    items: Array<{ productVariationId: number; quantity: number; price: number; }>;
    shippingAddress: object;
    paymentMethod: PaymentMethod;
    appliedReferralCode?: string | null;
    discountCode?: string | null;
    discountAmount?: number | null;
    notes?: string | null;
}
// Export OrderWithItems for use in API routes
export interface OrderWithItems extends OrderSelect {
    items: (typeof orderItems.$inferSelect & { productVariation?: typeof productVariations.$inferSelect & { product?: typeof schema.products.$inferSelect | null } | null })[];
    user?: Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'> | null;
    distributor?: Pick<UserSelect, 'id' | 'name'> | null;
    statusHistory?: OrderHistoryItem[];
    fulfillments?: (typeof orderFulfillments.$inferSelect)[];
}
export type OrderHistoryItem = typeof orderStatusHistory.$inferSelect;
export interface FulfillmentData {
    trackingNumber?: string;
    carrier?: string;
    fulfillmentNotes?: string;
    fulfillmentProofUrl?: object; // JSONB type
}

// --- Service Class ---
export class OrderService {

    async createOrder(params: CreateOrderParams): Promise<OrderSelect> {
        const { userId, items, shippingAddress, paymentMethod, notes, appliedReferralCode, discountCode, discountAmount } = params;
        if (!items || items.length === 0) throw new Error('Order must contain at least one item');
        const totalQuantity = items.reduce((sum: number, item) => sum + item.quantity, 0);
        const orderType: OrderType = totalQuantity >= 100 ? 'Wholesale' : 'Retail';
        if (orderType === 'Retail' && totalQuantity < 5) throw new Error('Retail orders require a minimum of 5 items');
        if (orderType === 'Wholesale' && totalQuantity < 100) throw new Error('Wholesale orders require a minimum of 100 items');
        const user = await userService.getUserById(userId);
        if (!user) throw new Error('User not found');
        if (orderType === 'Wholesale' && user.role !== 'Wholesale Buyer') throw new Error('Only approved wholesale buyers can place wholesale orders');
        const totalAmount = items.reduce((sum: number, item) => sum + (item.quantity * item.price), 0).toFixed(2);
        const finalAmount = discountAmount && discountAmount > 0 ? (parseFloat(totalAmount) - discountAmount).toFixed(2) : totalAmount;
        if (parseFloat(finalAmount) < 0) throw new Error('Order total cannot be negative');
        try {
            return await db.transaction(async (tx) => {
                const orderId = uuidv4();
                const initialStatus: OrderStatus = 'PendingPayment';
                const insertedOrder = await tx.insert(orders).values({
                    id: orderId, userId, status: initialStatus, totalAmount: finalAmount, paymentMethod,
                    paymentStatus: 'Pending', type: orderType, shippingAddress: shippingAddress, notes: notes,
                    appliedReferralCode: appliedReferralCode, discountCode: discountCode, discountAmount: discountAmount?.toString() ?? '0.00',
                }).returning();
                if (!insertedOrder || insertedOrder.length === 0) throw new Error('Order creation failed');
                const orderItemsToInsert: OrderItemInsert[] = items.map(item => ({ id: uuidv4(), orderId: orderId, productVariationId: item.productVariationId, quantity: item.quantity, priceAtPurchase: item.price.toFixed(2), subtotal: (item.quantity * item.price).toFixed(2) }));
                await tx.insert(orderItems).values(orderItemsToInsert);
                for (const item of items) {
                    const locationId = await this.getDefaultStockLocationId(tx);
                    if (!locationId) throw new Error ('Cannot determine stock location');
                    await productService.updateInventory({ productVariationId: item.productVariationId, locationId: locationId, changeQuantity: -item.quantity, type: 'sale', referenceId: orderId, referenceType: 'order', userId: userId });
                }
                await tx.insert(orderStatusHistory).values({ id: uuidv4(), orderId: orderId, status: initialStatus, notes: 'Order created' });
                 const userForReferralCheck = await tx.query.users.findFirst({ where: eq(users.id, userId), columns: { referredBy: true } }); // Use imported users schema
                 if (userForReferralCheck?.referredBy) {
                    const commissionAmount = parseFloat(finalAmount) * 0.05;
                    if (commissionAmount > 0) {
                        // Ensure amount is passed as number to createCommission if it expects number
                        await commissionService.createCommission({ userId: userForReferralCheck.referredBy, orderId: orderId, amount: commissionAmount, rate: '5.00', status: 'Pending', type: 'Order Referral', relatedTo: 'Order', relatedId: orderId }, tx);
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

    private async getDefaultStockLocationId(tx: any): Promise<string | null> {
        logger.warn('getDefaultStockLocationId placeholder used');
        // Use imported stockLocations schema
        const location = await tx.query.stockLocations.findFirst({ where: eq(stockLocations.type, 'Warehouse')});
        return location?.id || null;
    }

    async getOrderById(orderId: string): Promise<OrderWithItems | null> {
         try {
            // Use imported orders schema
            return await db.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: { items: { with: { productVariation: { with: { product: true } } } } } // Fetch nested product
            }) || null;
        } catch (error) {
            logger.error('Error getting order by ID:', { orderId, error });
            throw new Error(`Failed to fetch order ${orderId}`);
        }
     }

    async updateOrderStatus(orderId: string, status: OrderStatus, notes: string = '', adminUserId?: string): Promise<OrderSelect> {
        try {
            return await db.transaction(async (tx) => {
                // Use imported orders schema
                const currentOrder = await tx.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { status: true, distributorId: true, totalAmount: true } });
                if (!currentOrder) throw new Error('Order not found');
                this.validateStatusTransition(currentOrder.status, status);
                // Use imported orders schema
                const updateResult = await tx.update(orders).set({ status: status, updatedAt: new Date() }).where(eq(orders.id, orderId)).returning();
                if (updateResult.length === 0) throw new Error('Failed to update order status');
                // Use imported orderStatusHistory schema
                await tx.insert(orderStatusHistory).values({ id: uuidv4(), orderId, status, notes });
                // Use imported orders schema
                if (status === 'PaymentReceived') await tx.update(orders).set({ paymentStatus: 'Completed', updatedAt: new Date() }).where(eq(orders.id, orderId));
                 if (status === 'Fulfilled' && currentOrder.distributorId && currentOrder.totalAmount) {
                    try {
                        const commission = await commissionService.calculateCommissionForOrder(orderId, tx);
                        if (commission) {
                           // Use imported orders schema
                           // Ensure commission.amount is converted to string for decimal column
                           await tx.update(orders).set({ commissionAmount: commission.amount.toString() }).where(eq(orders.id, orderId));
                           logger.info('Commission updated for fulfilled order', { orderId, commissionAmount: commission.amount });
                        }
                    } catch(commissionError) { logger.error('Failed to update commission', { orderId, error: commissionError }); }
                 }
                logger.info('Order status updated', { orderId, from: currentOrder.status, to: status });
                return updateResult[0];
            });
        } catch (error) {
            logger.error('Error updating order status:', { orderId, status, error });
            if (error instanceof Error) throw error;
            throw new Error('Failed to update order status.');
        }
    }

    async assignDistributor(orderId: string, distributorId: string): Promise<OrderSelect> {
         try {
            const distributor = await userService.getUserById(distributorId);
            if (!distributor) throw new Error('Distributor user not found');
            if (distributor.role !== 'Distributor') throw new Error('User is not a distributor');
            return await db.transaction(async (tx) => {
                // Use imported orders schema
                const order = await tx.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { status: true } });
                if (!order) throw new Error('Order not found');
                const validStatuses: OrderStatus[] = ['PaymentReceived', 'Processing', 'ReadyForFulfillment'];
                if (!validStatuses.includes(order.status)) throw new Error(`Cannot assign distributor to order in ${order.status} status`);
                // Use imported orders schema
                const updateResult = await tx.update(orders).set({ distributorId: distributorId, updatedAt: new Date() }).where(eq(orders.id, orderId)).returning();
                if (updateResult.length === 0) throw new Error('Failed to assign distributor');
                // Use imported orderStatusHistory schema
                await tx.insert(orderStatusHistory).values({ id: uuidv4(), orderId, status: order.status, notes: `Distributor assigned: ${distributor.name} (${distributorId})` });
                logger.info('Distributor assigned to order', { orderId, distributorId });
                return updateResult[0];
            });
         } catch (error) {
             logger.error('Error assigning distributor:', { orderId, distributorId, error });
             if (error instanceof Error) throw error;
             throw new Error('Failed to assign distributor.');
         }
     }

    async recordFulfillment(orderId: string, fulfillmentData: FulfillmentData, distributorUserId: string): Promise<OrderSelect> {
         const { trackingNumber, carrier, fulfillmentNotes, fulfillmentProofUrl } = fulfillmentData;
        try {
             return await db.transaction(async (tx) => {
                 // Use imported orders schema
                const order = await tx.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { status: true, distributorId: true, totalAmount: true } });
                if (!order) throw new Error('Order not found');
                const validStatuses: OrderStatus[] = ['ReadyForFulfillment', 'Processing'];
                if (!validStatuses.includes(order.status)) throw new Error(`Cannot record fulfillment for order in ${order.status} status`);
                if (!order.distributorId) throw new Error('No distributor assigned');
                const fulfillmentId = uuidv4();
                 // Use imported orderFulfillments schema
                await tx.insert(orderFulfillments).values({ id: fulfillmentId, orderId, trackingNumber, carrier, fulfillmentNotes, fulfillmentProofUrl, status: 'Pending Approval' });
                const newStatus: OrderStatus = 'Fulfilled';
                 // Use imported orders schema
                const updateResult = await tx.update(orders).set({ status: newStatus, updatedAt: new Date() }).where(eq(orders.id, orderId)).returning();
                if (updateResult.length === 0) throw new Error('Failed to update order status');
                const historyNotes = trackingNumber ? `Order fulfilled by distributor - Tracking: ${trackingNumber} (${carrier || 'N/A'}) - Pending Admin Approval` : 'Order fulfilled by distributor - Pending Admin Approval';
                 // Use imported orderStatusHistory schema
                await tx.insert(orderStatusHistory).values({ id: uuidv4(), orderId, status: newStatus, notes: historyNotes });
                 if (order.distributorId && order.totalAmount) {
                     try {
                        const commission = await commissionService.calculateCommissionForOrder(orderId, tx);
                        if (commission) {
                            // Use imported orders schema
                           await tx.update(orders).set({ commissionAmount: commission.amount.toString() }).where(eq(orders.id, orderId));
                           logger.info('Commission updated for fulfillment', { orderId, commissionAmount: commission.amount });
                        }
                    } catch(commissionError) { logger.error('Failed to update commission on fulfillment', { orderId, error: commissionError }); }
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

     async getUserOrders(userId: string, options: { page?: number; limit?: number; status?: OrderStatus } = {}) {
        const { page = 1, limit = 10, status } = options;
        const offset = (page - 1) * limit;
        try {
             // Use imported orders schema
            const conditions = [eq(orders.userId, userId)];
            if (status) conditions.push(eq(orders.status, status));
            const whereClause = and(...conditions);
             // Use imported orders schema
            const ordersQuery = db.query.orders.findMany({ where: whereClause, orderBy: [desc(orders.createdAt)], limit, offset });
             // Use imported orders schema
            const countQuery = db.select({ total: count() }).from(orders).where(whereClause);
            const [ordersResult, countResult] = await Promise.all([ordersQuery, countQuery]);
            const total = countResult[0].total;
            return { orders: ordersResult, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
        } catch (error) {
             logger.error('Error getting user orders:', { userId, options, error });
             throw new Error('Failed to get user orders');
        }
    }

    async getAdminOrders(options: any): Promise<any> {
        const { page = 1, limit = 20, status, type, fromDate, toDate, search } = options;
        try {
            const offset = (page - 1) * limit;
            const conditions: (SQL | undefined)[] = [];
             // Use imported orders schema for conditions
            if (status) conditions.push(eq(orders.status, status));
            if (type) conditions.push(eq(orders.type, type));
            if (fromDate) conditions.push(gte(orders.createdAt, fromDate));
            if (toDate) conditions.push(lte(orders.createdAt, toDate));
            if (search) conditions.push(or(ilike(orders.id, `%${search}%`), ilike(orders.userId, `%${search}%`)));
            const whereClause = conditions.filter(c => c !== undefined).length > 0 ? and(...conditions.filter(c => c !== undefined) as SQL[]) : undefined;
             // Use imported orders schema
            const ordersQuery = db.query.orders.findMany({ where: whereClause, with: { user: { columns: { name: true, email: true } }, distributor: { columns: { name: true } } }, orderBy: [desc(orders.createdAt)], limit, offset });
             // Use imported orders schema
            const countQuery = db.select({ total: count() }).from(orders).where(whereClause);
            const [ordersResult, countResult] = await Promise.all([ordersQuery, countQuery]);
            const total = countResult[0].total;
            return { orders: ordersResult, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
        } catch (error) {
            logger.error('Error getting admin orders:', { options, error });
            throw new Error('Failed to get admin orders');
        }
    }

     private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void { /* ... */ }
     async approveFulfillment(orderId: string, fulfillmentId: string, adminUserId: string, adminNotes?: string): Promise<boolean> { /* ... */ }
     async rejectFulfillment(orderId: string, fulfillmentId: string, adminUserId: string, reason: string): Promise<boolean> { /* ... */ }
}

export const orderService = new OrderService();
// NOTE: Ellipses indicate unchanged code
