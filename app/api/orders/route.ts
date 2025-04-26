import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { PoolClient } from 'pg';
import { sendOrderConfirmationEmail } from '../../lib/email';

// --- Interfaces ---
interface JwtPayload {
  userId: string;
  role: string;
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
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
}
interface CreateOrderBody {
  items?: OrderItemInput[];
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod?: string;
  discountCode?: string | null;
}
interface ProductInfo {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
}

// --- Helper Functions (Moved outside POST handler) ---
async function getUserFromToken(
  request: NextRequest
): Promise<{ userId: string; role: string } | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Server configuration error: JWT_SECRET missing.');
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return { userId: decoded.userId, role: decoded.role };
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

// Fetch order requirements for validation
async function getOrderRequirements(
  client: PoolClient,
  userRole: string
): Promise<{ minOrderQuantity: number }> {
  // Default minimum quantities
  const defaultMin = 5;

  try {
    // First check for role-specific requirements
    const roleSpecificResult = await client.query(
      'SELECT min_order_quantity FROM order_requirements WHERE applies_to_role = $1 AND is_active = TRUE',
      [userRole]
    );

    if (roleSpecificResult.rows.length > 0) {
      return {
        minOrderQuantity: parseInt(roleSpecificResult.rows[0].min_order_quantity),
      };
    }

    // If no role-specific requirement, check for general requirement ('ALL')
    const generalResult = await client.query(
      'SELECT min_order_quantity FROM order_requirements WHERE applies_to_role = $1 AND is_active = TRUE',
      ['ALL']
    );

    if (generalResult.rows.length > 0) {
      return {
        minOrderQuantity: parseInt(generalResult.rows[0].min_order_quantity),
      };
    }

    // If no requirements found in database, return default
    return { minOrderQuantity: defaultMin };
  } catch (error) {
    console.error('Error fetching order requirements:', error);
    return { minOrderQuantity: defaultMin };
  }
}

// Check if user is eligible for wholesale (either approved or meets criteria)
async function checkWholesaleEligibility(
  client: PoolClient,
  userId: string,
  userRole: string,
  totalQuantity: number
): Promise<boolean> {
  try {
    // If not a wholesale buyer, not eligible
    if (userRole !== 'Wholesale Buyer') {
      return false;
    }

    // Check if user is already approved for wholesale
    const userResult = await client.query('SELECT wholesale_eligibility FROM users WHERE id = $1', [
      userId,
    ]);

    if (userResult.rows.length > 0 && userResult.rows[0].wholesale_eligibility) {
      return true;
    }

    // Get wholesale requirements
    const reqResult = await client.query(
      'SELECT min_order_quantity FROM wholesale_requirements WHERE is_active = TRUE'
    );

    const minWholesaleQuantity =
      reqResult.rows.length > 0 ? parseInt(reqResult.rows[0].min_order_quantity) : 100;

    // Check if current order meets wholesale criteria
    return totalQuantity >= minWholesaleQuantity;
  } catch (error) {
    console.error('Error checking wholesale eligibility:', error);
    return false;
  }
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
  // Declare variables needed across try/catch/finally
  let userInfo: { userId: string; role: string } | null = null;
  let client: PoolClient | null = null;
  let orderCreated = false; // Moved declaration outside try
  let newOrderId: number | null = null;

  try {
    userInfo = await getUserFromToken(request);
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

    const { userId, role } = userInfo;

    const body: CreateOrderBody = await request.json();
    const { items, shippingAddress, billingAddress, paymentMethod, discountCode } = body;

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

    // --- Validate minimum order quantity ---
    const orderRequirements = await getOrderRequirements(client, role);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalQuantity < orderRequirements.minOrderQuantity) {
      return NextResponse.json(
        {
          message: `Minimum order quantity is ${orderRequirements.minOrderQuantity} units. Your order has ${totalQuantity} units.`,
        },
        { status: 400 }
      );
    }

    // --- Check wholesale eligibility ---
    const isWholesaleEligible = await checkWholesaleEligibility(
      client,
      userId,
      role,
      totalQuantity
    );
    const isWholesaleOrder = role === 'Wholesale Buyer' && isWholesaleEligible;

    // --- Pre-computation & Checks ---
    const productIds = items.map(item => item.productId);
    if (productIds.length === 0) throw new Error('No valid product IDs in order.');

    if (!client) throw new Error('Failed to connect to database.');

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

      if (!client) throw new Error('Database connection lost.');

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

    if (discountCode && client) {
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

    const shippingCost = 5.0;
    const taxes = subtotal * 0.13;
    const totalAmount = subtotal - discountAmount + shippingCost + taxes;

    // --- Database Transaction ---
    if (!client) throw new Error('Database connection lost before transaction.');

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

    const orderInsertQuery = `
      INSERT INTO orders (
        user_id, status, subtotal, discount_code, discount_amount, 
        shipping_cost, taxes, total_amount, shipping_address, billing_address, 
        payment_method, payment_status, is_wholesale, total_quantity
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING id`;

    const orderInsertParams = [
      userId,
      initialStatus,
      subtotal.toFixed(2),
      appliedDiscountCode,
      discountAmount.toFixed(2),
      shippingCost.toFixed(2),
      taxes.toFixed(2),
      totalAmount.toFixed(2),
      shippingAddrJson,
      billingAddrJson,
      paymentMethod,
      initialPaymentStatus,
      isWholesaleOrder,
      totalQuantity,
    ];

    const orderResult = await client.query(orderInsertQuery, orderInsertParams);
    newOrderId = orderResult.rows[0]?.id;
    if (!newOrderId) throw new Error('Failed to create order record.');
    console.log(`Order record inserted (ID: ${newOrderId})`);

    // If this is the user's first wholesale order and they're eligible, update their status
    if (isWholesaleOrder && role === 'Wholesale Buyer' && !isWholesaleEligible) {
      await client.query(
        'UPDATE users SET wholesale_eligibility = TRUE, wholesale_approved_at = NOW() WHERE id = $1',
        [userId]
      );
      console.log(`User ${userId} marked as wholesale eligible`);
    }

    // 5. Create Order Items
    const itemInsertQuery =
      'INSERT INTO order_items (order_id, product_id, quantity, price_per_item) VALUES ($1, $2, $3, $4)';

    if (!client) throw new Error('Database connection lost before inserting order items.');

    // Use non-null assertion (!.) to tell TypeScript that client won't be null
    const itemInsertPromises = orderItemsData.map(item =>
      client!.query(itemInsertQuery, [
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

    // Double-check client before any database operations
    if (!client) throw new Error('Database connection lost during inventory update.');

    // Use non-null assertion to tell TypeScript that client is not null
    const inventoryUpdatePromises = orderItemsData.map(item =>
      client!.query(inventoryUpdateQuery, [item.quantity, item.productId, targetLocation])
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
    if (!client) throw new Error('Database connection lost before commit.');

    // Use non-null assertion for commit
    await client!.query('COMMIT');
    console.log('COMMIT Transaction');
    orderCreated = true; // Set flag only AFTER successful commit

    // --- Transaction End ---

    // 7. Handle Payment Processing
    if (orderCreated && newOrderId) {
      try {
        // Import payment service dynamically to avoid circular dependencies
        const { processPayment } = await import('@/lib/payment');

        // Map the payment method to the expected format
        // The payment library expects 'credit-card' but we might have 'credit'
        const paymentMethodMapping: Record<string, string> = {
          credit: 'credit-card',
          cc: 'credit-card',
          'e-transfer': 'etransfer',
          bitcoin: 'btc',
        };

        const normalizedPaymentMethod = paymentMethodMapping[paymentMethod] || paymentMethod;

        // Process the payment
        const paymentResult = await processPayment(
          newOrderId,
          totalAmount,
          normalizedPaymentMethod as 'credit-card' | 'etransfer' | 'btc', // Use correct type
          userId
        );

        console.log(`Payment processing result for order ${newOrderId}:`, paymentResult);

        // Send order confirmation email
        try {
          if (!client) throw new Error('Database connection lost before sending email.');

          // Get user details
          const userResult = await client.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [userId]
          );

          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            // Create properly typed shipping address for email
            const emailShippingAddress = {
              firstName: shippingAddress.firstName || user.first_name || '',
              lastName: shippingAddress.lastName || user.last_name || '',
              address1: shippingAddress.address1 || shippingAddress.street || '',
              address2: shippingAddress.address2 || '',
              city: shippingAddress.city || '',
              province: shippingAddress.province || '',
              postalCode: shippingAddress.postalCode || '',
              country: shippingAddress.country || 'Canada',
            };

            await sendOrderConfirmationEmail({
              customerEmail: user.email,
              customerName: `${user.first_name} ${user.last_name}`,
              orderId: newOrderId.toString(),
              orderTotal: totalAmount,
              orderItems: orderItemsData.map(item => ({
                name: item.name,
                price: item.pricePerItem,
                quantity: item.quantity,
              })),
              shippingAddress: emailShippingAddress,
            });

            console.log(`Order confirmation email sent for order ${newOrderId}`);
          }
        } catch (emailError) {
          // Log error but don't fail the request
          console.error(
            `Failed to send order confirmation email for order ${newOrderId}:`,
            emailError
          );
        }

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
  } catch (error: unknown) {
    // Rollback transaction if client exists and order wasn't successfully committed
    if (client && !orderCreated) {
      try {
        await client.query('ROLLBACK');
        console.log('ROLLBACK Transaction due to error');
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
    }
    console.error(`POST /api/orders - Failed for user ${userInfo?.userId || '(unknown)'}:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release(); // Release client back to pool
      console.log('DB client released.');
    }
  }
}
