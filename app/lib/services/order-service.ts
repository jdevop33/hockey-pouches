import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { withTransaction } from '../dbConnectionPool';
import { logger } from '../logger';
import { userService } from './user-service';
import { commissionService } from './commission-service';

// Order statuses in sequential flow
export enum OrderStatus {
  Created = 'Created',
  PendingPayment = 'PendingPayment',
  PaymentReceived = 'PaymentReceived',
  Processing = 'Processing',
  ReadyForFulfillment = 'ReadyForFulfillment',
  Fulfilled = 'Fulfilled',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

// Payment methods
export enum PaymentMethod {
  CreditCard = 'CreditCard',
  ETransfer = 'ETransfer',
  Bitcoin = 'Bitcoin',
  Manual = 'Manual',
}

// Order types
export enum OrderType {
  Retail = 'Retail',
  Wholesale = 'Wholesale',
}

// Interface for order creation
export interface CreateOrderParams {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Full order interface
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  distributorId: string | null;
  commissionAmount: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  type: OrderType;
  shippingAddress: Record<string, unknown>;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Order item interface
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Order with items
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Order history item interface
export interface OrderHistoryItem {
  status: OrderStatus;
  notes: string;
  createdAt: Date;
}

// Query parameters type
type QueryParams = (string | number | boolean | Date | null)[];

export class OrderService {
  /**
   * Create a new order
   * @param params Order creation parameters
   * @returns Created order
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const { userId, items, shippingAddress, paymentMethod, notes = '' } = params;

    // Validate order
    if (items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Determine order type (Retail/Wholesale) based on total quantity
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const orderType = totalQuantity >= 100 ? OrderType.Wholesale : OrderType.Retail;

    // Check minimum order quantity (5 for retail, 100 for wholesale)
    if (orderType === OrderType.Retail && totalQuantity < 5) {
      throw new Error('Retail orders require a minimum of 5 items');
    }

    if (orderType === OrderType.Wholesale && totalQuantity < 100) {
      throw new Error('Wholesale orders require a minimum of 100 items');
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    try {
      return await withTransaction(async client => {
        // Get user role
        const user = await userService.getUserById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Check if wholesale order is from an approved wholesale buyer
        if (orderType === OrderType.Wholesale && user.role !== 'WholesaleBuyer') {
          throw new Error('Only approved wholesale buyers can place wholesale orders');
        }

        // Create the order
        const orderId = uuidv4();
        const now = new Date();

        // Initial order status is PendingPayment
        const status = OrderStatus.PendingPayment;

        // Insert order record
        await client.query(
          `INSERT INTO orders (
            id, user_id, status, total_amount, distributor_id, commission_amount,
            payment_method, payment_status, type, shipping_address, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            orderId,
            userId,
            status,
            totalAmount,
            null, // distributorId
            null, // commissionAmount
            paymentMethod,
            'Pending', // paymentStatus
            orderType,
            JSON.stringify(shippingAddress),
            notes,
            now,
            now,
          ]
        );

        // Insert order items
        for (const item of items) {
          const orderItemId = uuidv4();
          const subtotal = item.quantity * item.price;

          await client.query(
            `INSERT INTO order_items (
              id, order_id, product_id, quantity, price, subtotal, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [orderItemId, orderId, item.productId, item.quantity, item.price, subtotal, now]
          );

          // Update inventory (if using real-time inventory tracking)
          // This would involve a call to the inventory service
        }

        // Create order audit log entry
        await client.query(
          `INSERT INTO order_status_history (
            id, order_id, status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), orderId, status, 'Order created', now]
        );

        // Return the created order
        const newOrder: Order = {
          id: orderId,
          userId,
          status,
          totalAmount,
          distributorId: null,
          commissionAmount: null,
          paymentMethod,
          paymentStatus: 'Pending',
          type: orderType,
          shippingAddress,
          notes,
          createdAt: now,
          updatedAt: now,
        };

        logger.info('Order created', { orderId, userId, totalAmount, orderType });

        return newOrder;
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error creating order:', { error: error.message });
      } else {
        logger.error('Unknown error creating order');
      }
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param orderId Order ID
   * @returns Order with items
   */
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    try {
      // Get order
      const orderResult = await sql`
        SELECT 
          id, user_id as "userId", status, total_amount as "totalAmount", 
          distributor_id as "distributorId", commission_amount as "commissionAmount",
          payment_method as "paymentMethod", payment_status as "paymentStatus", 
          type, shipping_address as "shippingAddress", notes, 
          created_at as "createdAt", updated_at as "updatedAt"
        FROM orders
        WHERE id = ${orderId}
      `;

      if (orderResult.length === 0) {
        return null;
      }

      const order = orderResult[0] as Order;

      // Get order items
      const itemsResult = await sql`
        SELECT 
          id, order_id as "orderId", product_id as "productId", 
          quantity, price, subtotal
        FROM order_items
        WHERE order_id = ${orderId}
      `;

      const items = itemsResult as OrderItem[];

      return {
        ...order,
        items,
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting order by ID:', { error: error.message });
      } else {
        logger.error('Unknown error getting order by ID');
      }
      throw error;
    }
  }

  /**
   * Update order status
   * @param orderId Order ID
   * @param status New status
   * @param notes Optional notes about the status change
   * @returns Updated order
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes: string = ''
  ): Promise<Order> {
    try {
      return await withTransaction(async client => {
        // Verify order exists
        const orderResult = await client.query('SELECT id, status FROM orders WHERE id = $1', [
          orderId,
        ]);

        if (orderResult.rows.length === 0) {
          throw new Error('Order not found');
        }

        const currentStatus = orderResult.rows[0].status;

        // Prevent invalid status transitions
        this.validateStatusTransition(currentStatus, status);

        // Update order status
        const now = new Date();

        await client.query(
          `UPDATE orders 
           SET status = $1, updated_at = $2
           WHERE id = $3`,
          [status, now, orderId]
        );

        // Record status change in history
        await client.query(
          `INSERT INTO order_status_history (
            id, order_id, status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), orderId, status, notes, now]
        );

        logger.info('Order status updated', { orderId, from: currentStatus, to: status });

        // If status is PaymentReceived, update payment status
        if (status === OrderStatus.PaymentReceived) {
          await client.query(
            `UPDATE orders 
             SET payment_status = 'Completed'
             WHERE id = $1`,
            [orderId]
          );
        }

        // If status is Fulfilled, calculate commission
        if (status === OrderStatus.Fulfilled) {
          const distributorId = await this.getOrderDistributorId(orderId);

          if (distributorId) {
            // Calculate commission for the order
            const commission = await commissionService.calculateCommissionForOrder(orderId);

            // Update order with commission amount
            await client.query(
              `UPDATE orders 
               SET commission_amount = $1
               WHERE id = $2`,
              [commission.amount, orderId]
            );
          }
        }

        // Get updated order
        const result = await client.query(
          `SELECT 
            id, user_id as "userId", status, total_amount as "totalAmount", 
            distributor_id as "distributorId", commission_amount as "commissionAmount",
            payment_method as "paymentMethod", payment_status as "paymentStatus", 
            type, shipping_address as "shippingAddress", notes, 
            created_at as "createdAt", updated_at as "updatedAt"
          FROM orders
          WHERE id = $1`,
          [orderId]
        );

        return result.rows[0] as Order;
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error updating order status:', { error: error.message });
      } else {
        logger.error('Unknown error updating order status');
      }
      throw error;
    }
  }

  /**
   * Assign distributor to an order
   * @param orderId Order ID
   * @param distributorId Distributor user ID
   * @returns Updated order
   */
  async assignDistributor(orderId: string, distributorId: string): Promise<Order> {
    try {
      // Verify distributor exists and has Distributor role
      const distributor = await userService.getUserById(distributorId);

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      if (distributor.role !== 'Distributor') {
        throw new Error('User is not a distributor');
      }

      return await withTransaction(async client => {
        // Verify order exists and is in a valid state for assignment
        const orderResult = await client.query('SELECT id, status FROM orders WHERE id = $1', [
          orderId,
        ]);

        if (orderResult.rows.length === 0) {
          throw new Error('Order not found');
        }

        const status = orderResult.rows[0].status;

        // Can only assign distributor if order is in specific statuses
        const validStatuses = [
          OrderStatus.PaymentReceived,
          OrderStatus.Processing,
          OrderStatus.ReadyForFulfillment,
        ];

        if (!validStatuses.includes(status as OrderStatus)) {
          throw new Error(`Cannot assign distributor to order in ${status} status`);
        }

        // Update order with distributor
        const now = new Date();

        await client.query(
          `UPDATE orders 
           SET distributor_id = $1, updated_at = $2
           WHERE id = $3`,
          [distributorId, now, orderId]
        );

        // Add note to order history
        await client.query(
          `INSERT INTO order_status_history (
            id, order_id, status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            uuidv4(),
            orderId,
            status,
            `Distributor assigned: ${distributor.name} (${distributorId})`,
            now,
          ]
        );

        logger.info('Distributor assigned to order', { orderId, distributorId });

        // Get updated order
        const result = await client.query(
          `SELECT 
            id, user_id as "userId", status, total_amount as "totalAmount", 
            distributor_id as "distributorId", commission_amount as "commissionAmount",
            payment_method as "paymentMethod", payment_status as "paymentStatus", 
            type, shipping_address as "shippingAddress", notes, 
            created_at as "createdAt", updated_at as "updatedAt"
          FROM orders
          WHERE id = $1`,
          [orderId]
        );

        return result.rows[0] as Order;
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error assigning distributor to order:', { error: error.message });
      } else {
        logger.error('Unknown error assigning distributor to order');
      }
      throw error;
    }
  }

  /**
   * Get orders for a user
   * @param userId User ID
   * @param params Query parameters (pagination, status filter)
   * @returns List of orders with pagination
   */
  async getUserOrders(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    } = {}
  ) {
    const { page = 1, limit = 10, status } = params;

    try {
      // Build query
      let query = `
        SELECT 
          id, user_id as "userId", status, total_amount as "totalAmount", 
          distributor_id as "distributorId", commission_amount as "commissionAmount",
          payment_method as "paymentMethod", payment_status as "paymentStatus", 
          type, shipping_address as "shippingAddress", notes, 
          created_at as "createdAt", updated_at as "updatedAt"
        FROM orders
        WHERE user_id = $1
      `;

      const queryParams: QueryParams = [userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      // Add sorting and pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);

      // Execute query
      const result = await sql.query(query, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders
        WHERE user_id = $1
        ${status ? 'AND status = $2' : ''}
      `;

      const countParams = status ? [userId, status] : [userId];
      const countResult = await sql.query(countQuery, countParams);

      const total = parseInt(countResult[0].total as string);

      return {
        orders: result as Order[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting user orders:', { error: error.message });
      } else {
        logger.error('Unknown error getting user orders');
      }
      throw error;
    }
  }

  /**
   * Get orders assigned to a distributor
   * @param distributorId Distributor user ID
   * @param params Query parameters (pagination, status filter)
   * @returns List of orders with pagination
   */
  async getDistributorOrders(
    distributorId: string,
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    } = {}
  ) {
    const { page = 1, limit = 10, status } = params;

    try {
      // Build query
      let query = `
        SELECT 
          id, user_id as "userId", status, total_amount as "totalAmount", 
          distributor_id as "distributorId", commission_amount as "commissionAmount",
          payment_method as "paymentMethod", payment_status as "paymentStatus", 
          type, shipping_address as "shippingAddress", notes, 
          created_at as "createdAt", updated_at as "updatedAt"
        FROM orders
        WHERE distributor_id = $1
      `;

      const queryParams: QueryParams = [distributorId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      // Add sorting and pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);

      // Execute query
      const result = await sql.query(query, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders
        WHERE distributor_id = $1
        ${status ? 'AND status = $2' : ''}
      `;

      const countParams = status ? [distributorId, status] : [distributorId];
      const countResult = await sql.query(countQuery, countParams);

      const total = parseInt(countResult[0].total as string);

      return {
        orders: result as Order[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting distributor orders:', { error: error.message });
      } else {
        logger.error('Unknown error getting distributor orders');
      }
      throw error;
    }
  }

  /**
   * Get orders for admin dashboard
   * @param params Query parameters (pagination, filters)
   * @returns List of orders with pagination
   */
  async getAdminOrders(
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
      type?: OrderType;
      fromDate?: Date;
      toDate?: Date;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status, type, fromDate, toDate, search } = params;

    try {
      // Build query conditions
      const conditions: string[] = [];
      const queryParams: QueryParams = [];
      let paramIndex = 1;

      if (status) {
        conditions.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (type) {
        conditions.push(`type = $${paramIndex}`);
        queryParams.push(type);
        paramIndex++;
      }

      if (fromDate) {
        conditions.push(`created_at >= $${paramIndex}`);
        queryParams.push(fromDate);
        paramIndex++;
      }

      if (toDate) {
        conditions.push(`created_at <= $${paramIndex}`);
        queryParams.push(toDate);
        paramIndex++;
      }

      if (search) {
        conditions.push(`(id::text ILIKE $${paramIndex} OR user_id::text ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Build query
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          o.id, o.user_id as "userId", o.status, o.total_amount as "totalAmount", 
          o.distributor_id as "distributorId", o.commission_amount as "commissionAmount",
          o.payment_method as "paymentMethod", o.payment_status as "paymentStatus", 
          o.type, o.shipping_address as "shippingAddress", o.notes, 
          o.created_at as "createdAt", o.updated_at as "updatedAt",
          u.name as "userName", u.email as "userEmail",
          d.name as "distributorName"
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users d ON o.distributor_id = d.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);

      // Execute query
      const result = await sql.query(query, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
      `;

      const countResult = await sql.query(countQuery, queryParams.slice(0, -2));

      const total = parseInt(countResult[0].total as string);

      return {
        orders: result as Order[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting admin orders:', { error: error.message });
      } else {
        logger.error('Unknown error getting admin orders');
      }
      throw error;
    }
  }

  /**
   * Get order history with status changes
   * @param orderId Order ID
   * @returns Order status history
   */
  async getOrderHistory(orderId: string): Promise<OrderHistoryItem[]> {
    try {
      const result = await sql`
        SELECT 
          status, notes, created_at as "createdAt"
        FROM order_status_history
        WHERE order_id = ${orderId}
        ORDER BY created_at ASC
      `;

      return result as OrderHistoryItem[];
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting order history:', { error: error.message });
      } else {
        logger.error('Unknown error getting order history');
      }
      throw error;
    }
  }

  /**
   * Record fulfillment details for an order
   * @param orderId Order ID
   * @param fulfillmentData Fulfillment data (tracking, carrier, etc.)
   * @returns Updated order
   */
  async recordFulfillment(
    orderId: string,
    fulfillmentData: {
      trackingNumber?: string;
      carrier?: string;
      fulfillmentNotes?: string;
      fulfillmentImages?: string[];
    }
  ): Promise<Order> {
    const { trackingNumber, carrier, fulfillmentNotes, fulfillmentImages } = fulfillmentData;

    try {
      return await withTransaction(async client => {
        // Verify order exists and is in a valid state
        const orderResult = await client.query(
          'SELECT id, status, distributor_id FROM orders WHERE id = $1',
          [orderId]
        );

        if (orderResult.rows.length === 0) {
          throw new Error('Order not found');
        }

        const { status, distributor_id } = orderResult.rows[0];

        // Can only record fulfillment if order is in specific statuses
        const validStatuses = [OrderStatus.ReadyForFulfillment, OrderStatus.Processing];

        if (!validStatuses.includes(status)) {
          throw new Error(`Cannot record fulfillment for order in ${status} status`);
        }

        // If no distributor assigned, cannot fulfill
        if (!distributor_id) {
          throw new Error('No distributor assigned to this order');
        }

        // Create fulfillment record
        const fulfillmentId = uuidv4();
        const now = new Date();

        await client.query(
          `INSERT INTO order_fulfillments (
            id, order_id, tracking_number, carrier, notes, 
            fulfillment_images, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            fulfillmentId,
            orderId,
            trackingNumber || null,
            carrier || null,
            fulfillmentNotes || null,
            fulfillmentImages ? JSON.stringify(fulfillmentImages) : null,
            now,
          ]
        );

        // Update order status to Fulfilled
        await client.query(
          `UPDATE orders 
           SET status = $1, updated_at = $2
           WHERE id = $3`,
          [OrderStatus.Fulfilled, now, orderId]
        );

        // Add note to order history
        const notes = trackingNumber
          ? `Order fulfilled - Tracking: ${trackingNumber} (${carrier || 'N/A'})`
          : 'Order fulfilled';

        await client.query(
          `INSERT INTO order_status_history (
            id, order_id, status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), orderId, OrderStatus.Fulfilled, notes, now]
        );

        // Calculate commission for the order
        const commission = await commissionService.calculateCommissionForOrder(orderId);

        // Update order with commission amount
        await client.query(
          `UPDATE orders 
           SET commission_amount = $1
           WHERE id = $2`,
          [commission.amount, orderId]
        );

        logger.info('Order fulfilled', {
          orderId,
          distributorId: distributor_id,
          trackingNumber: trackingNumber || 'N/A',
          commissionAmount: commission.amount,
        });

        // Get updated order
        const result = await client.query(
          `SELECT 
            id, user_id as "userId", status, total_amount as "totalAmount", 
            distributor_id as "distributorId", commission_amount as "commissionAmount",
            payment_method as "paymentMethod", payment_status as "paymentStatus", 
            type, shipping_address as "shippingAddress", notes, 
            created_at as "createdAt", updated_at as "updatedAt"
          FROM orders
          WHERE id = $1`,
          [orderId]
        );

        return result.rows[0] as Order;
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error recording fulfillment:', { error: error.message });
      } else {
        logger.error('Unknown error recording fulfillment');
      }
      throw error;
    }
  }

  // Helper methods

  /**
   * Validate order status transition
   * @param currentStatus Current order status
   * @param newStatus New order status
   * @throws Error if transition is invalid
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.Created]: [OrderStatus.PendingPayment, OrderStatus.Cancelled],
      [OrderStatus.PendingPayment]: [OrderStatus.PaymentReceived, OrderStatus.Cancelled],
      [OrderStatus.PaymentReceived]: [
        OrderStatus.Processing,
        OrderStatus.ReadyForFulfillment,
        OrderStatus.Cancelled,
        OrderStatus.Refunded,
      ],
      [OrderStatus.Processing]: [
        OrderStatus.ReadyForFulfillment,
        OrderStatus.Cancelled,
        OrderStatus.Refunded,
      ],
      [OrderStatus.ReadyForFulfillment]: [
        OrderStatus.Fulfilled,
        OrderStatus.Cancelled,
        OrderStatus.Refunded,
      ],
      [OrderStatus.Fulfilled]: [OrderStatus.Shipped, OrderStatus.Refunded],
      [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Refunded],
      [OrderStatus.Delivered]: [OrderStatus.Completed, OrderStatus.Refunded],
      [OrderStatus.Completed]: [OrderStatus.Refunded],
      [OrderStatus.Cancelled]: [],
      [OrderStatus.Refunded]: [],
    };

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Get distributor ID assigned to an order
   * @param orderId Order ID
   * @returns Distributor ID or null
   */
  private async getOrderDistributorId(orderId: string): Promise<string | null> {
    try {
      const result = await sql`
        SELECT distributor_id
        FROM orders
        WHERE id = ${orderId}
      `;

      if (result.length === 0) {
        return null;
      }

      return result[0].distributor_id;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error getting order distributor ID:', { error: error.message });
      } else {
        logger.error('Unknown error getting order distributor ID');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
