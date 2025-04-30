import { NextResponse, type NextRequest } from 'next/server';
// Removed: import { pool } from '@/lib/db'; 
import { db } from '@/lib/db'; // Import db instead of pool
import jwt from 'jsonwebtoken';
import type { PoolClient } from 'pg'; // Keep for type checking if helpers still expect it
import { sendOrderConfirmationEmail } from '../../lib/email';
import { orderItems } from '@/lib/schema/orderItems';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { cart } from '@/lib/schema/cart';
import { orderItems } from '@/lib/schema/orderItems';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { cart } from '@/lib/schema/cart';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Use central schema index
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger'; // Assuming logger exists
import { v4 as uuidv4 } from 'uuid';

// --- Interfaces ---

// Use schema-derived types where possible
type UserRole = typeof schema.userRoleEnum.enumValues[number];

interface JwtPayload {
  userId: string;
  role: UserRole;
}
interface OrderItemInput {
  productVariationId: number; // Use variation ID
  quantity: number;
}

// Assuming Address type is defined elsewhere or locally
// If not, define it here
interface AddressInput {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  name?: string; // Added name based on usage
  // Add other potential fields if needed from JSON usage
  address1?: string; 
  address2?: string;
  firstName?: string;
  lastName?: string;
}

interface CreateOrderBody {
  items?: OrderItemInput[];
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod?: typeof schema.paymentMethodEnum.enumValues[number]; // Use enum type
  discountCode?: string | null;
  referralCode?: string | null; // Added referral code
  notes?: string | null; // Added notes
}

interface ProductVariationInfo {
  id: number;
  productId: number;
  name: string | null;
  price: string;
  isActive: boolean;
  productName: string | null;
  productIsActive: boolean;
}

// --- Helper Functions ---

// (getUserFromToken remains largely the same)
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
    // Assert the type after verification
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    // Validate role against enum
    if (schema.userRoleEnum.enumValues.includes(decoded.role)) {
        return { userId: decoded.userId, role: decoded.role };
    } else {
        logger.warn('Invalid role found in token', { userId: decoded.userId, role: decoded.role });
        return null; // Or handle as unauthorized
    }
  } catch (error) {
    logger.warn('Token verification failed:', { error });
    return null;
  }
}

// Simplified location logic - needs refinement based on actual location schema/strategy
function getTargetLocation(address: AddressInput | undefined): string {
  const province = address?.province?.toUpperCase() || '';
  // This logic is likely too simple and needs to map to actual StockLocation IDs/names
  if (['BC'].includes(province)) return 'WAREHOUSE_VAN'; // Example ID
  if (['AB', 'SK', 'MB'].includes(province)) return 'WAREHOUSE_CGY'; // Example ID
  if (['ON', 'QC'].includes(province)) return 'WAREHOUSE_TOR'; // Example ID
  logger.warn(`Could not determine specific stock location ID for province: ${province}, using fallback 'WAREHOUSE_TOR'.`);
  return 'WAREHOUSE_TOR'; // Fallback stock location ID
}


// --- Main POST Handler ---
export async function POST(request: NextRequest) {
  let userInfo: { userId: string; role: UserRole } | null = null;
  let orderCreated = false;
  let newOrderId: string | null = null; // Order ID is now UUID (string)

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
    // Basic address validation (can be improved with Zod)
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.province || !shippingAddress?.postalCode || !shippingAddress?.country || !shippingAddress?.name) {
      return NextResponse.json({ message: 'Incomplete shipping address (street, city, province, postalCode, country, name required).' }, { status: 400 });
    }
    if (!paymentMethod || !schema.paymentMethodEnum.enumValues.includes(paymentMethod)) {
      return NextResponse.json({ message: `Payment method is required and must be one of: ${schema.paymentMethodEnum.enumValues.join(', ')}` }, { status: 400 });
    }
    // Ensure quantities are positive integers
    if (items.some(item => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
        return NextResponse.json({ message: 'Item quantities must be positive integers.' }, { status: 400 });
    }
    
    const variationIds = items.map(item => item.productVariationId);
    if (variationIds.some(id => typeof id !== 'number') || variationIds.length === 0) {
      return NextResponse.json({ message: 'Invalid product variation IDs provided.' }, { status: 400 });
    }

    // Determine order type based on role
    const orderType: typeof schema.orderTypeEnum.enumValues[number] = 
        role === 'Wholesale Buyer' ? 'Wholesale' : 'Retail';

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
            columns: { id: true, productId: true, name: true, price: true, isActive: true }
        });

        const variationMap = new Map(variationDetails.map(v => [v.id, v]));
        let subtotal = 0;
        const orderItemsData: Array<typeof schema.orderItems.$inferInsert & { name?: string | null }> = [];

        // TODO: Implement proper location determination based on address/rules
        const targetLocationId = 'clwvv35r6000012dk95zk1fvs'; // Hardcoded main warehouse ID FOR NOW
        if (!targetLocationId) {
             logger.error('Target stock location ID could not be determined', { shippingAddress });
             throw new Error('Could not determine fulfillment location.');
        }
        
        for (const item of items) {
            const variation = variationMap.get(item.productVariationId);
            if (!variation || !variation.isActive || !variation.product.isActive) {
                throw new Error(`Product variation ID ${item.productVariationId} (${variation?.product.name} - ${variation?.name}) not found or is inactive.`);
            }
            
            // Check stock level at the target location
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
                orderId: '', // Will be set after order creation
                productVariationId: item.productVariationId,
                quantity: item.quantity,
                priceAtPurchase: pricePerItem.toFixed(2),
                subtotal: itemSubtotal.toFixed(2),
                name: `${variation.product.name} - ${variation.name}` // For potential email/logging use
            });
        }
        logger.info('Stock levels verified', { userId, targetLocationId });

        // --- Calculate Shipping, Taxes, Discounts ---
        // TODO: Implement dynamic shipping calculation
        const shippingCost = 5.00; 
        // TODO: Implement dynamic tax calculation based on address
        const taxes = subtotal * 0.13; 
        // TODO: Apply discountCode validation and calculation (using discount-service?)
        const discountAmount = 0.00; // Placeholder
        const totalAmount = subtotal + shippingCost + taxes - discountAmount;

        // --- Create Order Record ---
        const orderId = uuidv4();
        const initialStatus: OrderStatus = paymentMethod === 'CreditCard' ? 'Processing' : 'PendingPayment'; // Adjust based on payment
        const initialPaymentStatus: PaymentStatus = paymentMethod === 'CreditCard' ? 'Completed' : 'Pending';

        const insertedOrder = await tx.insert(schema.orders).values({
            id: orderId,
            userId: userId,
            status: initialStatus,
            totalAmount: totalAmount.toFixed(2),
            // distributorId: null, // Assign later if needed
            // commissionAmount: null,
            paymentMethod: paymentMethod,
            paymentStatus: initialPaymentStatus,
            type: orderType,
            shippingAddress: shippingAddress, // Store as JSONB
            billingAddress: billingAddress ?? shippingAddress, // Store as JSONB
            notes: notes,
            discountCode: discountCode,
            discountAmount: discountAmount.toFixed(2),
            appliedReferralCode: referralCode,
            // createdAt, updatedAt handled by default
        }).returning({ id: schema.orders.id });

        newOrderId = insertedOrder[0]?.id;
        if (!newOrderId) {
            throw new Error('Failed to create order record.');
        }
        logger.info('Order record created', { orderId: newOrderId, userId });

        // --- Create Order Items ---
        for (const itemData of orderItemsData) {
            itemData.orderId = newOrderId; // Assign the generated order ID
        }
        await tx.insert(schema.orderItems).values(orderItemsData.map(({ name, ...rest }) => rest)); // Insert items without the temporary name field
        logger.info('Order items created', { orderId: newOrderId });

        // --- Update Stock Levels (Reserve Quantity) ---
        // Instead of decrementing, we increment reservedQuantity
        const stockUpdatePromises = items.map(item => 
            tx.update(schema.stockLevels)
                .set({ 
                    reservedQuantity: sql`${schema.stockLevels.reservedQuantity} + ${item.quantity}`,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(schema.stockLevels.productVariationId, item.productVariationId),
                    eq(schema.stockLevels.locationId, targetLocationId),
                    // Ensure we don't reserve more than available (quantity >= reserved + requested)
                    sql`${schema.stockLevels.quantity} >= ${schema.stockLevels.reservedQuantity} + ${item.quantity}`
                ))
        );
        const stockUpdateResults = await Promise.all(stockUpdatePromises);
        // Check if any update failed (rowCount is 0)
        if (stockUpdateResults.some(res => res.rowCount === 0)) {
            logger.error('Inventory reservation failed for one or more items', { orderId: newOrderId });
            throw new Error('Failed to reserve stock for all items. Please try again.');
        }
        logger.info('Stock levels reserved', { orderId: newOrderId });

        // --- Add Order History ---
        await tx.insert(schema.orderStatusHistory).values({
            orderId: newOrderId,
            status: initialStatus,
            notes: 'Order created',
            // changedByUserId: userId // Optional: log who initiated
        });
        logger.info('Order history added', { orderId: newOrderId });
        
        // --- Clear User's Cart --- 
        await tx.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
        logger.info('User cart cleared', { userId });

        // --- Create Tasks (e.g., for manual payment confirmation) ---
        if (paymentMethod === 'ETransfer' || paymentMethod === 'Bitcoin') {
             await tx.insert(schema.tasks).values({
                title: `Confirm ${paymentMethod} Payment for Order ${newOrderId}`,
                category: 'Payment',
                status: 'Pending',
                priority: 'Medium',
                relatedTo: 'Order',
                relatedId: newOrderId,
                // assignedTo: admin // Assign to a specific admin or group if possible
             });
             logger.info(`Created task to confirm ${paymentMethod} payment`, { orderId: newOrderId });
        }
         // Task for order review/processing (regardless of payment?)
        await tx.insert(schema.tasks).values({
            title: `Process Order ${newOrderId}`,
            category: 'OrderReview',
            status: 'Pending',
            priority: 'High',
            relatedTo: 'Order',
            relatedId: newOrderId,
        });
        logger.info('Created task to process order', { orderId: newOrderId });
        
        orderCreated = true;
        return { 
            orderId: newOrderId, 
            initialStatus,
            initialPaymentStatus,
            totalAmount 
        }; // Return data needed outside transaction
    }); // End Drizzle Transaction

    // --- Post-Transaction Actions (Email, Payment Processing) ---
    if (orderCreated && result?.orderId) {
        // Removed payment processing call - should happen via Stripe Intent or manual confirmation
        logger.info('Order creation transaction successful', { orderId: result.orderId });
        
        // Send order confirmation email
        try {
            const user = await db.query.users.findFirst({
                where: eq(schema.users.id, userId),
                columns: { email: true, name: true }
            });
            
            if (user?.email) {
                 // Re-fetch order items with names for email
                const emailOrderItems = await db.query.orderItems.findMany({
                    where: eq(schema.orderItems.orderId, result.orderId),
                    with: {
                        productVariation: { columns: { name: true }, with: { product: { columns: { name: true } } } }
                    },
                    columns: { quantity: true, priceAtPurchase: true }
                });
                
                await sendOrderConfirmationEmail({
                    customerEmail: user.email,
                    customerName: user.name ?? 'Customer',
                    orderId: result.orderId,
                    orderTotal: result.totalAmount,
                    orderItems: emailOrderItems.map(item => ({
                        name: `${item.productVariation.product.name} - ${item.productVariation.name}`,
                        price: parseFloat(item.priceAtPurchase),
                        quantity: item.quantity,
                    })),
                    shippingAddress: shippingAddress as any, // Cast needed if Address type isn't fully defined
                    paymentMethod: paymentMethod,
                });
                 logger.info('Order confirmation email sent', { orderId: result.orderId, email: user.email });
            } else {
                 logger.warn('Could not find user email to send confirmation', { userId, orderId: result.orderId });
            }
        } catch (emailError) {
            logger.error('Failed to send order confirmation email (order created successfully)', { orderId: result.orderId, error: emailError });
            // Do not fail the request if email fails
        }
        
        return NextResponse.json(
            {
                message: 'Order placed successfully!',
                orderId: result.orderId,
                status: result.initialStatus,
                paymentStatus: result.initialPaymentStatus, 
            },
            { status: 201 }
        );

    } else {
         // This case should not happen if transaction succeeded, but included as fallback
         logger.error('Order transaction seemed successful but did not return expected data', { result });
         throw new Error('Order creation failed after transaction.');
    }

  } catch (error: unknown) {
    // Transaction should have rolled back automatically on error
    logger.error(`POST /api/orders - Failed for user ${userInfo?.userId || '(unknown)'}`, { error });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: error instanceof Error && error.message.includes('Insufficient stock') ? 400 : 500 }
    );
  }
  // No finally block needed as drizzle.transaction handles connection release
}
