import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Import db instance
import jwt from 'jsonwebtoken';
import { sendOrderConfirmationEmail, type OrderItem as EmailOrderItem } from '@/lib/email'; // Keep specific import
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from '@/lib/schema/tasks';
import { orderItems } from '@/lib/schema/orderItems';
import { orders } from '@/lib/schema/orders';
import { users } from '@/lib/schema/users';
import { cart } from '@/lib/schema/cart';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums and complex types

// --- Interfaces ---

// Use schema-derived types where possible
type UserRole = typeof schema.userRoleEnum.enumValues[number];
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number]; // Defined based on enum (from stash)
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number]; // Defined based on enum (from stash)
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number]; // Defined based on enum (from stash)
type OrderType = typeof schema.orderTypeEnum.enumValues[number]; // Defined based on enum (from stash)
type TaskCategory = typeof schema.taskCategoryEnum.enumValues[number]; // Defined based on enum (from stash)
type TaskStatus = typeof schema.taskStatusEnum.enumValues[number]; // Defined based on enum (from stash)
type TaskPriority = typeof schema.taskPriorityEnum.enumValues[number]; // Defined based on enum (from stash)
type TaskRelatedEntity = typeof schema.taskRelatedEntityEnum.enumValues[number]; // Defined based on enum (from stash)
type TaskInsert = typeof schema.tasks.$inferInsert;


interface JwtPayload {
  userId: string;
  role: UserRole;
}
interface OrderItemInput {
  productVariationId: number; // Use variation ID
  quantity: number;
}

interface AddressInput {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  address1?: string;
  address2?: string;
  firstName?: string;
  lastName?: string;
}

interface CreateOrderBody {
  items?: OrderItemInput[];
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod?: PaymentMethod;
  discountCode?: string | null;
  referralCode?: string | null;
  notes?: string | null;
}

// --- Helper Functions ---

async function getUserFromToken(
  request: NextRequest
): Promise<{ userId: string; role: UserRole } | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('Server configuration error: JWT_SECRET missing.');
    throw new Error('Server configuration error: JWT_SECRET missing.');
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (schema.userRoleEnum.enumValues.includes(decoded.role)) {
        return { userId: String(decoded.userId), role: decoded.role };
    } else {
        logger.warn('Invalid role found in token', { userId: String(decoded.userId), role: decoded.role });
        return null;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Token verification failed:', { error });
    return null;
  }
}

async function getTargetLocationId(address: AddressInput | undefined): Promise<string | null> {
    const defaultLocationId = 'clwvv35r6000012dk95zk1fvs';
    logger.warn(`Using default stock location ID ${defaultLocationId}. Implement proper location lookup.`);
    return defaultLocationId;
}

// Map payment method from schema enum to email function expected type (from stash)
function mapPaymentMethodForEmail(paymentMethod: PaymentMethod): 'etransfer' | 'btc' | 'credit-card' | undefined {
    switch (paymentMethod) {
        case 'ETransfer': return 'etransfer';
        case 'Bitcoin': return 'btc';
        case 'CreditCard': return 'credit-card';
        default: return undefined;
    }
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
  let userInfo: { userId: string; role: UserRole } | null = null;
  let orderCreated = false;
  let newOrderId: string | null = null;

  try {
    userInfo = await getUserFromToken(request);
    if (!userInfo) {
        logger.warn('POST /api/orders - Unauthorized access attempt');
        return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { userId, role } = userInfo;

    const body: CreateOrderBody = await request.json();
    const { items, shippingAddress, billingAddress, paymentMethod, discountCode, referralCode, notes } = body;

    // --- Input Validation ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Order must contain items.' }, { status: 400 });
    }
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.province || !shippingAddress?.postalCode || !shippingAddress?.country || !shippingAddress?.name) {
      return NextResponse.json({ message: 'Incomplete shipping address (street, city, province, postalCode, country, name required).' }, { status: 400 });
    }
    if (!paymentMethod || !schema.paymentMethodEnum.enumValues.includes(paymentMethod)) {
      return NextResponse.json({ message: `Payment method is required and must be one of: ${schema.paymentMethodEnum.enumValues.join(', ')}` }, { status: 400 });
    }
    if (items.some(item => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
        return NextResponse.json({ message: 'Item quantities must be positive integers.' }, { status: 400 });
    }

    const variationIds = items.map(item => item.productVariationId);
    if (variationIds.some(id => typeof id !== 'number') || variationIds.length === 0) {
      return NextResponse.json({ message: 'Invalid product variation IDs provided.' }, { status: 400 });
    }

    const orderType: OrderType = role === 'Wholesale Buyer' ? schema.orderTypeEnum.Wholesale : schema.orderTypeEnum.Retail;

    // Start DB Transaction using Drizzle
    const result = await db.transaction(async (tx) => {
        logger.info('Beginning order creation transaction', { userId, role, itemCount: items.length });

        // --- Fetch Product Variation Details & Check Stock ---
        const variationDetails = await tx.query.productVariations.findMany({
            where: (variations, { inArray }) => inArray(variations.id, variationIds),
            with: {
                product: {
                    columns: { name: true, isActive: true }
                }
            },
            columns: { id: true, productId: String(true), name: true, price: true, isActive: true }
        });

        const variationMap = new Map(variationDetails.map(v => [v.id, v]));
        let subtotal = 0;
        const orderItemsData: Array<typeof schema.orderItems.$inferInsert & { name?: string | null }> = [];

        const targetLocationId = await getTargetLocationId(shippingAddress);
        if (!targetLocationId) {
             logger.error('Target stock location ID could not be determined', { shippingAddress });
             throw new Error('Could not determine fulfillment location.');
        }

        for (const item of items) {
            const variation = variationMap.get(item.productVariationId);
            if (!variation || !variation.isActive || !variation.product.isActive) {
                throw new Error(`Product variation ID ${item.productVariationId} (${variation?.product.name} - ${variation?.name}) not found or is inactive.`);
            }

            const stockLevel = await tx.query.stockLevels.findFirst({
                where: and(
                    eq(schema.stockLevels.productVariationId, item.productVariationId),
                    eq(schema.stockLevels.locationId, targetLocationId)
                ),
                columns: { quantity: true, reservedQuantity: true }
            });

            const availableStock = (stockLevel?.quantity ?? 0) - (stockLevel?.reservedQuantity ?? 0);
            if (availableStock < item.quantity) {
                throw new Error(`Insufficient stock for ${variation.product.name} - ${variation.name}. Available: ${availableStock}, Requested: ${item.quantity} at location ${targetLocationId}.`);
            }

            const pricePerItem = parseFloat(variation.price);
            const itemSubtotal = pricePerItem * item.quantity;
            subtotal += itemSubtotal;
            orderItemsData.push({
                orderId: String(''), // Will be set after order creation
                productVariationId: String(item.productVariationId),
                quantity: item.quantity,
                priceAtPurchase: pricePerItem.toFixed(2),
                subtotal: itemSubtotal.toFixed(2),
                name: `${variation.product.name} - ${variation.name}`
            });
        }
        logger.info('Stock levels verified', { userId, targetLocationId });

        // --- Calculate Shipping, Taxes, Discounts ---
        const shippingCost = 5.00; // Placeholder
        const taxes = subtotal * 0.13; // Placeholder
        const discountAmount = 0.00; // Placeholder
        const totalAmount = subtotal + shippingCost + taxes - discountAmount;

        // --- Create Order Record ---
        const orderId = uuidv4();
        // Use enums correctly (from stash)
        const initialStatus: OrderStatus = paymentMethod === 'CreditCard' ? schema.orderStatusEnum.Processing : schema.orderStatusEnum.PendingPayment;
        const initialPaymentStatus: PaymentStatus = paymentMethod === 'CreditCard' ? schema.paymentStatusEnum.Completed : schema.paymentStatusEnum.Pending;

        const insertedOrder = await tx.insert(schema.orders).values({
            id: orderId,
            userId: String(userId),
            status: initialStatus,
            totalAmount: totalAmount.toFixed(2),
            paymentMethod: paymentMethod,
            paymentStatus: initialPaymentStatus,
            type: orderType,
            shippingAddress: shippingAddress, // Store as JSONB
            billingAddress: billingAddress ?? shippingAddress, // Store as JSONB
            notes: notes,
            discountCode: discountCode,
            discountAmount: $1?.$2(2),
            appliedReferralCode: referralCode,
        }).returning({ id: schema.orders.id });

        newOrderId = insertedOrder[0]?.id;
        if (!newOrderId) {
            throw new Error('Failed to create order record.');
        }
        logger.info('Order record created', { orderId: String(newOrderId), userId });

        // --- Create Order Items ---
        for (const itemData of orderItemsData) {
            itemData.orderId = newOrderId;
        }
        await tx.insert(schema.orderItems).values(orderItemsData.map(({ name, ...rest }) => rest));
        logger.info('Order items created', { orderId: newOrderId });

        // --- Update Stock Levels (Reserve Quantity) ---
        const stockUpdatePromises = items.map(item =>
            tx.update(schema.stockLevels)
                .set({
                    reservedQuantity: sql`${schema.stockLevels.reservedQuantity} + ${item.quantity}`,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(schema.stockLevels.productVariationId, item.productVariationId),
                    eq(schema.stockLevels.locationId, targetLocationId),
                    sql`${schema.stockLevels.quantity} >= ${schema.stockLevels.reservedQuantity} + ${item.quantity}`
                ))
        );
        const stockUpdateResults = await Promise.all(stockUpdatePromises);
        if (stockUpdateResults.some(res => res.rowCount === 0)) {
            logger.error('Inventory reservation failed for one or more items', { orderId: newOrderId });
            throw new Error('Failed to reserve stock for all items. Please try again.');
        }
        logger.info('Stock levels reserved', { orderId: newOrderId });

        // --- Add Order History ---
        await tx.insert(schema.orderStatusHistory).values({
            orderId: String(newOrderId),
            status: initialStatus,
            notes: 'Order created',
        });
        logger.info('Order history added', { orderId: newOrderId });

        // --- Clear User's Cart --- 
        await tx.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
        logger.info('User cart cleared', { userId });

        // --- Create Tasks ---
        if (paymentMethod === 'ETransfer' || paymentMethod === 'Bitcoin') {
            const adminUser = await tx.query.users.findFirst({
                where: eq(schema.users.role, 'Admin'),
                columns: { id: true }
            });
             const task: TaskInsert = {
                title: `Confirm ${paymentMethod} Payment for Order ${newOrderId}`,
                category: schema.taskCategoryEnum.PaymentReview, // Use enum (from stash)
                status: schema.taskStatusEnum.Pending, // Use enum
                priority: schema.taskPriorityEnum.Medium, // Use enum
                relatedTo: schema.taskRelatedEntityEnum.Order, // Use enum
                relatedId: String(newOrderId),
                assignedTo: adminUser?.id
             };
             await tx.insert(schema.tasks).values(task);
             logger.info(`Created task to confirm ${paymentMethod} payment`, { orderId: String(newOrderId), assignedTo: adminUser?.id });
        }
        const adminUserForReview = await tx.query.users.findFirst({
            where: eq(schema.users.role, 'Admin'),
            columns: { id: true }
         });
         const reviewTask: TaskInsert = {
            title: `Process Order ${newOrderId}`,
            category: schema.taskCategoryEnum.OrderReview, // Use enum
            status: schema.taskStatusEnum.Pending, // Use enum
            priority: schema.taskPriorityEnum.High, // Use enum
            relatedTo: schema.taskRelatedEntityEnum.Order, // Use enum
            relatedId: String(newOrderId),
            assignedTo: adminUserForReview?.id
        };
        await tx.insert(schema.tasks).values(reviewTask);
        logger.info('Created task to process order', { orderId: String(newOrderId), assignedTo: adminUserForReview?.id });

        orderCreated = true;
        return { orderId: String(newOrderId), initialStatus, initialPaymentStatus, totalAmount };
    }); // End Drizzle Transaction

    // --- Post-Transaction Actions ---
    if (orderCreated && result?.orderId) {
        logger.info('Order creation transaction successful', { orderId: result.orderId });

        try {
            const user = await db.query.users.findFirst({
                where: eq(schema.users.id, userId),
                columns: { email: true, name: true }
            });

            if (user?.email) {
                const emailOrderItemsResult = await db.query.orderItems.findMany({
                    where: eq(schema.orderItems.orderId, result.orderId),
                    with: {
                        productVariation: { columns: { name: true }, with: { product: { columns: { name: true } } } }
                    },
                    columns: { quantity: true, priceAtPurchase: true }
                });

                const emailItems: EmailOrderItem[] = emailOrderItemsResult.map(item => ({
                    name: `${item.productVariation?.product?.name ?? 'Product'} - ${item.productVariation?.name ?? 'Variation'}`,
                    price: parseFloat(item.priceAtPurchase),
                    quantity: item.quantity,
                }));

                // Use mapping function (from stash)
                const mappedPaymentMethod = mapPaymentMethodForEmail(paymentMethod);

                await sendOrderConfirmationEmail({
                    customerEmail: user.email,
                    customerName: user.name ?? 'Customer',
                    orderId: String(result.orderId),
                    orderTotal: result.totalAmount,
                    orderItems: emailItems,
                    shippingAddress: shippingAddress as any,
                    paymentMethod: mappedPaymentMethod,
                });
                 logger.info('Order confirmation email sent', { orderId: String(result.orderId), email: user.email });
            } else {
                 logger.warn('Could not find user email to send confirmation', { userId, orderId: result.orderId });
            }
        } catch (emailError) {
            logger.error('Failed to send order confirmation email (order created successfully)', { orderId: String(result.orderId), error: emailError });
        }

        return NextResponse.json(
            {
                message: 'Order placed successfully!',
                orderId: String(result.orderId),
                status: result.initialStatus,
                paymentStatus: result.initialPaymentStatus,
            },
            { status: 201 }
        );

    } else {
         logger.error('Order transaction seemed successful but did not return expected data', { result });
         throw new Error('Order creation failed after transaction.');
    }

  } catch (error: unknown) {
    logger.error(`POST /api/orders - Failed for user ${userInfo?.userId || '(unknown)'}`, { error });
    return NextResponse.json(
      { message: error instanceof Error ? errorMessage : 'Internal Server Error' },
      { status: error instanceof Error && $1?.$2('Insufficient stock') ? 400 : 500 }
    );
  }
}
