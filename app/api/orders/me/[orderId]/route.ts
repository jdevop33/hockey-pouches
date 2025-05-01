import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db';
import { logger } from '@/lib/logger';
// Rely solely on the wildcard import
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
export const dynamic = 'force-dynamic';

// Define types based on schema inference
type OrderSelect = typeof schema.orders.$inferSelect;
type OrderItemSelect = typeof schema.orderItems.$inferSelect;

// Define Address interface
interface Address {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
}

// Define the structure for the response
interface OrderDetailsResponse extends Omit<OrderSelect, 'userId' | 'distributorId' | 'commissionAmount' | 'shippingAddress' | 'billingAddress' | 'discountCode' | 'discountAmount' | 'appliedReferralCode' | 'updatedAt'> {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  items: Array<Omit<OrderItemSelect, 'orderId' | 'createdAt'> & { productName: string | null; variationName: string | null; imageUrl: string | null; subtotal: number }>;
  subtotal: number;
  shippingCost: number;
  taxes: number;
  trackingNumber: string | null;
  createdAt: Date | null;
  notes: string | null;
}

// Define expected query result row structures
interface OrderQueryResultRow {
    id: number;
    status: string;
    subtotal: number;
    shipping_cost: number;
    taxes: number;
    total_amount: number;
    shipping_address: string | object | null;
    billing_address: string | object | null;
    payment_method: string | null;
    payment_status: string | null;
    created_at: Date | null;
    tracking_number: string | null;
    notes: string | null;
}

interface ItemQueryResultRow {
    id: number;
    productVariationId: number;
    product_name: string | null;
    variation_name: string | null;
    quantity: number;
    price_at_purchase: number;
    variation_image_url: string | null;
    product_image_url: string | null;
}


export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  if (!orderId || isNaN(parseInt(orderId))) {
      logger.warn('Invalid Order ID format received for /me/orders/[orderId]', { orderId });
      return NextResponse.json({ message: 'Valid Order ID is required' }, { status: 400 });
  }
  const orderIdNum = parseInt(orderId);

  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
        logger.warn('User ID not found in token for /me/orders/[orderId]', { orderId: orderIdNum });
        return NextResponse.json({ message: 'User ID not found in token' }, { status: 401 });
    }
    logger.info('Fetching user order details', { userId, orderId: orderIdNum });

    // Use schema namespace for tables
    const orderQuery = sql`
      SELECT
        o.id, o.status,
        CAST(o.subtotal AS FLOAT) as subtotal,
        CAST(o.shipping_cost AS FLOAT) as shipping_cost,
        CAST(o.taxes AS FLOAT) as taxes,
        CAST(o.total_amount AS FLOAT) as total_amount,
        o.shipping_address, o.billing_address,
        o.payment_method, o.payment_status, o.created_at,
        o.tracking_number, o.notes
      FROM ${schema.orders} o
      WHERE o.id = ${orderIdNum} AND o.user_id = ${userId}
    `;

    // Use schema namespace for tables
    const itemsQuery = sql`
      SELECT
        oi.id, oi.product_variation_id as "productVariationId",
        p.name as product_name,
        pv.name as variation_name,
        oi.quantity,
        CAST(oi.price_at_purchase AS FLOAT) as price_at_purchase,
        pv.image_url as variation_image_url,
        p.image_url as product_image_url
      FROM ${schema.orderItems} oi
      JOIN ${schema.productVariations} pv ON oi.product_variation_id = pv.id
      JOIN ${schema.products} p ON pv.product_id = p.id
      WHERE oi.order_id = ${orderIdNum}
    `;

    const [orderResult, itemsResult] = await Promise.all([
      db.execute(orderQuery),
      db.execute(itemsQuery),
    ]);

    if (orderResult.rows.length === 0) {
        logger.warn('Order not found or user not authorized', { userId, orderId: orderIdNum });
      return NextResponse.json(
        { message: 'Order not found or not authorized to view' },
        { status: 404 }
      );
    }

    const orderData = orderResult.rows[0] as OrderQueryResultRow;
    const itemRows = itemsResult.rows as ItemQueryResultRow[];

    const items = itemRows.map((item) => ({
      id: item.id,
      productVariationId: String(item.productVariationId),
      productName: item.product_name,
      variationName: item.variation_name,
      quantity: item.quantity,
      priceAtPurchase: item.price_at_purchase,
      imageUrl: item.variation_image_url || item.product_image_url,
      subtotal: item.price_at_purchase * item.quantity,
    }));

    let shippingAddress: Address | null = null;
    let billingAddress: Address | null = null;
    try {
        if(orderData.shipping_address && typeof orderData.shipping_address === 'string') {
            shippingAddress = JSON.parse(orderData.shipping_address);
        } else if (orderData.shipping_address && typeof orderData.shipping_address === 'object') {
            shippingAddress = orderData.shipping_address as Address;
        }
    } catch (e) {
        logger.error('Failed to parse shipping address JSON', { orderId: String(orderIdNum), address: orderData.shipping_address, error: e });
        shippingAddress = null;
    }
     try {
        if(orderData.billing_address && typeof orderData.billing_address === 'string') {
            billingAddress = JSON.parse(orderData.billing_address);
        } else if (orderData.billing_address && typeof orderData.billing_address === 'object') {
            billingAddress = orderData.billing_address as Address;
        }
    } catch (e) {
        logger.error('Failed to parse billing address JSON', { orderId: String(orderIdNum), address: orderData.billing_address, error: e });
        billingAddress = null;
    }

    const orderResponse: OrderDetailsResponse = {
      id: orderData.id,
      status: orderData.status as any, // TODO: Validate against schema.orderStatusEnum
      totalAmount: orderData.total_amount,
      paymentMethod: orderData.payment_method as any, // TODO: Validate against schema.paymentMethodEnum
      paymentStatus: orderData.payment_status as any, // TODO: Validate against schema.paymentStatusEnum
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      notes: orderData.notes,
      createdAt: orderData.created_at,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shipping_cost,
      taxes: orderData.taxes,
      trackingNumber: orderData.tracking_number,
      items,
    };

    logger.info('Successfully fetched user order details', { userId, orderId: orderIdNum });
    return NextResponse.json(orderResponse);
  } catch (error) {
    logger.error(`Failed to get customer order ${orderId}:`, { error });
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
