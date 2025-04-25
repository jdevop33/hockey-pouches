import { NextResponse, type NextRequest } from 'next/server';
import sql, { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { PoolClient } from 'pg';

// --- Interfaces ---
interface JwtPayload {
  userId: string;
}
interface OrderItemInput {
  productId: number;
  quantity: number;
}
interface AddressInput {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}
interface CreateOrderBody {
  items?: OrderItemInput[];
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod?: string;
  discountCode?: string | null;
  shippingMethod?: 'standard' | 'express';
  shippingCost?: number;
  taxes?: {
    gst: number;
    pst?: number;
    hst?: number;
    qst?: number;
    total: number;
  };
  subtotal?: number;
  discountAmount?: number;
  total?: number;
}
interface ProductInfo {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
}

// --- Helper Functions (Moved outside POST handler) ---
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Server configuration error: JWT_SECRET missing.');
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded.userId;
  } catch (error) {
    console.warn('Token verification failed:', error);
    return null;
  }
}

function getTargetLocation(address: AddressInput | undefined): string {
  // Made address potentially undefined
  const province = address?.province?.toUpperCase() || '';
  if (['BC'].includes(province)) return 'Vancouver';
  if (['AB', 'SK', 'MB'].includes(province)) return 'Calgary';
  if (['ON', 'QC'].includes(province)) return 'Toronto';
  console.warn(
    `Could not determine specific location for province: ${province}, using fallback 'Toronto'.`
  );
  return 'Toronto';
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
  // Declare variables needed across try/catch/finally
  let userId: string | null = null;
  let client: PoolClient | null = null;
  let orderCreated = false; // Moved declaration outside try
  let newOrderId: number | null = null;

  try {
    userId = await getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

    const body: CreateOrderBody = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      discountCode,
      shippingMethod = 'standard',
      shippingCost: clientShippingCost,
      taxes: clientTaxes,
      subtotal: clientSubtotal,
      discountAmount: clientDiscountAmount,
      total: clientTotal,
    } = body;

    // --- Input Validation ---
    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ message: 'Order must contain items.' }, { status: 400 });
    if (
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.province ||
      !shippingAddress?.postalCode
    )
      return NextResponse.json({ message: 'Incomplete shipping address.' }, { status: 400 });
    if (!paymentMethod)
      return NextResponse.json({ message: 'Payment method is required.' }, { status: 400 });

    // Get a client connection from the pool
    client = await pool.connect();
    console.log('DB client connected for transaction.');

    // --- Pre-computation & Checks ---
    const productIds = items.map(item => item.productId);
    if (productIds.length === 0) throw new Error('No valid product IDs in order.');

    const productDetailsResult = await client.query(
      'SELECT id, name, price, is_active FROM products WHERE id = ANY($1)',
      [productIds]
    );
    const productDetails = productDetailsResult.rows as ProductInfo[];
    const productMap = new Map(productDetails.map(p => [p.id, p]));
    const targetLocation = getTargetLocation(shippingAddress);

    let subtotal = 0;
    const orderItemsData: {
      productId: number;
      quantity: number;
      pricePerItem: number;
      name: string;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || !product.is_active)
        throw new Error(
          `Product ID ${item.productId} (${product?.name || 'Unknown'}) not found or not available.`
        );
      if (!item.quantity || item.quantity <= 0)
        throw new Error(`Invalid quantity for product ID ${item.productId}.`);

      const stockResult = await client.query(
        'SELECT quantity FROM inventory WHERE product_id = $1 AND location = $2',
        [item.productId, targetLocation]
      );
      const available = stockResult.rows[0]?.quantity ?? 0;
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Only ${available} available at ${targetLocation}.`
        );
      }

      const pricePerItem = parseFloat(product.price);
      subtotal += pricePerItem * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        pricePerItem: pricePerItem,
        name: product.name,
      });
    }
    console.log('Stock levels verified.');

    // Process discount code if provided
    let discountAmount = 0;
    let appliedDiscountCode = null;

    if (discountCode) {
      const discountResult = await client.query(
        `SELECT
          id, code, description, discount_type, discount_value,
          min_order_amount, max_discount_amount
        FROM discount_codes
        WHERE code = $1
          AND is_active = TRUE
          AND start_date <= CURRENT_TIMESTAMP
          AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
          AND (usage_limit IS NULL OR times_used < usage_limit)`,
        [discountCode]
      );

      if (discountResult.rows.length > 0) {
        const discount = discountResult.rows[0];

        // Check minimum order amount
        if (subtotal >= parseFloat(discount.min_order_amount)) {
          appliedDiscountCode = discount.code;

          // Calculate discount amount
          if (discount.discount_type === 'percentage') {
            discountAmount = subtotal * (parseFloat(discount.discount_value) / 100);

            // Apply maximum discount if specified
            if (
              discount.max_discount_amount &&
              discountAmount > parseFloat(discount.max_discount_amount)
            ) {
              discountAmount = parseFloat(discount.max_discount_amount);
            }
          } else if (discount.discount_type === 'fixed_amount') {
            discountAmount = parseFloat(discount.discount_value);

            // Ensure discount doesn't exceed order total
            if (discountAmount > subtotal) {
              discountAmount = subtotal;
            }
          }

          // Increment usage count
          await client.query(
            'UPDATE discount_codes SET times_used = times_used + 1 WHERE code = $1',
            [discountCode]
          );
        }
      }
    }

    // Use client-provided values if available, otherwise calculate
    const finalShippingCost = clientShippingCost || (shippingMethod === 'express' ? 20.0 : 10.0);

    // Calculate taxes if not provided by client
    let taxesTotal = 0;
    let taxesGst = 0;
    let taxesPst = 0;
    let taxesHst = 0;
    let taxesQst = 0;

    if (clientTaxes) {
      taxesTotal = clientTaxes.total;
      taxesGst = clientTaxes.gst || 0;
      taxesPst = clientTaxes.pst || 0;
      taxesHst = clientTaxes.hst || 0;
      taxesQst = clientTaxes.qst || 0;
    } else {
      // Default tax calculation (13% HST) if client didn't provide taxes
      taxesHst = subtotal * 0.13;
      taxesTotal = taxesHst;
    }

    // Calculate final total
    const totalAmount = clientTotal || subtotal - discountAmount + finalShippingCost + taxesTotal;

    // --- Database Transaction ---
    await client.query('BEGIN');
    console.log('BEGIN Transaction');

    // 4. Create Order Record
    const initialStatus = 'Pending Approval';
    const initialPaymentStatus =
      paymentMethod === 'etransfer' || paymentMethod === 'btc'
        ? 'Awaiting Confirmation'
        : 'Pending';
    const shippingAddrJson = JSON.stringify(shippingAddress);
    const billingAddrJson = JSON.stringify(billingAddress);

    // Create tax details JSON
    const taxDetailsJson = JSON.stringify({
      gst: taxesGst,
      pst: taxesPst,
      hst: taxesHst,
      qst: taxesQst,
      total: taxesTotal,
    });

    const orderInsertQuery = `INSERT INTO orders (
      user_id, status, subtotal, discount_code, discount_amount,
      shipping_method, shipping_cost, tax_details, total_amount,
      shipping_address, billing_address, payment_method, payment_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`;

    const orderInsertParams = [
      userId,
      initialStatus,
      subtotal.toFixed(2),
      appliedDiscountCode,
      discountAmount.toFixed(2),
      shippingMethod,
      finalShippingCost.toFixed(2),
      taxDetailsJson,
      totalAmount.toFixed(2),
      shippingAddrJson,
      billingAddrJson,
      paymentMethod,
      initialPaymentStatus,
    ];
    const orderResult = await client.query(orderInsertQuery, orderInsertParams);
    newOrderId = orderResult.rows[0]?.id;
    if (!newOrderId) throw new Error('Failed to create order record.');
    console.log(`Order record inserted (ID: ${newOrderId})`);

    // 5. Create Order Items
    const itemInsertQuery =
      'INSERT INTO order_items (order_id, product_id, quantity, price_per_item) VALUES ($1, $2, $3, $4)';
    const itemInsertPromises = orderItemsData.map(item =>
      client.query(itemInsertQuery, [
        newOrderId,
        item.productId,
        item.quantity,
        item.pricePerItem.toFixed(2),
      ])
    );
    await Promise.all(itemInsertPromises);
    console.log(`Order items inserted for order ${newOrderId}`);

    // 6. Decrement Inventory
    const inventoryUpdateQuery =
      'UPDATE inventory SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP WHERE product_id = $2 AND location = $3 AND quantity >= $1';
    const inventoryUpdatePromises = orderItemsData.map(item =>
      client.query(inventoryUpdateQuery, [item.quantity, item.productId, targetLocation])
    );
    const updateResults = await Promise.all(inventoryUpdatePromises);
    for (let i = 0; i < updateResults.length; i++) {
      if (updateResults[i].rowCount === 0) {
        throw new Error(
          `Inventory update failed for product ID ${orderItemsData[i].productId} (race condition?). Order rolled back.`
        );
      }
    }
    console.log(`Inventory decremented for order ${newOrderId}`);

    // Commit transaction
    await client.query('COMMIT');
    console.log('COMMIT Transaction');
    orderCreated = true; // Set flag only AFTER successful commit

    // --- Transaction End ---

    // 7. Handle Payment Processing
    if (orderCreated && newOrderId) {
      try {
        // Import payment service dynamically to avoid circular dependencies
        const { processPayment } = await import('@/lib/payment');

        // Process the payment
        const paymentResult = await processPayment(
          newOrderId,
          totalAmount,
          paymentMethod as any, // Type assertion for now
          userId
        );

        console.log(`Payment processing result for order ${newOrderId}:`, paymentResult);

        // Return appropriate response based on payment result
        return NextResponse.json(
          {
            message: 'Order placed successfully!',
            orderId: newOrderId,
            status: initialStatus,
            paymentStatus: paymentResult.status,
            paymentResult: {
              success: paymentResult.success,
              transactionId: paymentResult.transactionId,
              message: paymentResult.message,
            },
          },
          { status: 201 }
        );
      } catch (paymentError) {
        console.error(`Payment processing error for order ${newOrderId}:`, paymentError);
        // Note: We don't roll back the order creation if payment processing fails
        // Instead, we return success with payment status details
        return NextResponse.json(
          {
            message:
              'Order placed successfully, but payment processing failed. Please contact support.',
            orderId: newOrderId,
            status: initialStatus,
            paymentStatus: 'Failed',
            paymentError:
              paymentError instanceof Error ? paymentError.message : 'Unknown payment error',
          },
          { status: 201 }
        );
      }
    }

    // Fallback response if we somehow get here
    return NextResponse.json(
      {
        message: 'Order placed successfully!',
        orderId: newOrderId,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Rollback transaction if client exists and order wasn't successfully committed
    if (client && !orderCreated) {
      try {
        await client.query('ROLLBACK');
        console.log('ROLLBACK Transaction due to error');
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
    }
    console.error(`POST /api/orders - Failed for user ${userId || '(unknown)'}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release(); // Release client back to pool
      console.log('DB client released.');
    }
  }
}
