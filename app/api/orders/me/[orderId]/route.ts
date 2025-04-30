import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { sql } from '@/lib/db'; // Corrected import
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { addresses } from '@/lib/schema/addresses';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { addresses } from '@/lib/schema/addresses';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { products } from '@/lib/schema/products';
import { addresses } from '@/lib/schema/addresses';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import schema namespace

export const dynamic = 'force-dynamic';

// Define types based on schema inference
type OrderSelect = typeof schema.orders.$inferSelect;
type OrderItemSelect = typeof schema.orderItems.$inferSelect;

// Define the structure for the response
interface OrderDetailsResponse extends Omit<OrderSelect, 'userId' | 'distributorId' | 'commissionAmount' | 'shippingAddress' | 'billingAddress' | 'discountCode' | 'discountAmount' | 'appliedReferralCode' | 'updatedAt'> {
  shippingAddress: any; // Keep as any for JSON parsing flexibility, or define Address interface
  billingAddress: any; // Keep as any for JSON parsing flexibility, or define Address interface
  items: Array<Omit<OrderItemSelect, 'orderId' | 'createdAt'> & { productName: string | null; imageUrl: string | null; }>;
}

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  if (!orderId || typeof orderId !== 'string') { // Basic validation
      return NextResponse.json({ message: 'Valid Order ID is required' }, { status: 400 });
  }

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
        return NextResponse.json({ message: 'User ID not found in token' }, { status: 401 });
    }
    console.log(`GET /api/orders/me/${orderId} - User: ${userId}`);

    // Fetch order details
    // Cast amounts to FLOAT for easier handling in JS
    const orderQuery = `
      SELECT
        o.id, o.status,
        CAST(o.subtotal AS FLOAT) as subtotal,
        CAST(o.shipping_cost AS FLOAT) as shipping_cost,
        CAST(o.taxes AS FLOAT) as taxes,
        CAST(o.total_amount AS FLOAT) as total_amount,
        o.shipping_address, o.billing_address,
        o.payment_method, o.payment_status, o.created_at,
        o.tracking_number, o.notes
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2
    `;

    // Fetch order items
    const itemsQuery = `
      SELECT
        oi.id, oi.product_variation_id as "productVariationId", -- Correct alias
        p.name as product_name, 
        pv.name as variation_name, -- Get variation name too
        oi.quantity, 
        CAST(oi.price_at_purchase AS FLOAT) as price_at_purchase, -- Use price at purchase
        pv.image_url as variation_image_url, -- Prefer variation image
        p.image_url as product_image_url -- Fallback to product image
      FROM order_items oi
      JOIN product_variations pv ON oi.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE oi.order_id = $1
    `;

    const [orderResult, itemsResult] = await Promise.all([
      sql.query(orderQuery, [orderId, userId]),
      sql.query(itemsQuery, [orderId]),
    ]);

    // Check if order exists and belongs to user
    if (orderResult.length === 0) {
      return NextResponse.json(
        { message: 'Order not found or not authorized to view' },
        { status: 404 }
      );
    }

    const orderData = orderResult[0];

    // Format order items
    const items = itemsResult.map((item: any) => ({
      id: item.id,
      productVariationId: item.productVariationId,
      productName: item.product_name, // Product base name
      variationName: item.variation_name, // Specific variation name
      quantity: item.quantity,
      priceAtPurchase: item.price_at_purchase,
      imageUrl: item.variation_image_url || item.product_image_url, // Prefer variation image
      subtotal: item.price_at_purchase * item.quantity, // Calculate subtotal based on price at purchase
    }));

    // Format order for response, matching OrderDetailsResponse structure
    const orderResponse: OrderDetailsResponse = {
      id: orderData.id,
      status: orderData.status,
      totalAmount: orderData.total_amount,
      paymentMethod: orderData.payment_method,
      paymentStatus: orderData.payment_status,
      // Parse addresses, handle potential errors
      shippingAddress: typeof orderData.shipping_address === 'string' ? JSON.parse(orderData.shipping_address) : orderData.shipping_address,
      billingAddress: typeof orderData.billing_address === 'string' ? JSON.parse(orderData.billing_address) : orderData.billing_address,
      notes: orderData.notes,
      createdAt: orderData.created_at,
      // Include fields from Omit<> if needed, e.g., subtotal, taxes
      subtotal: orderData.subtotal,
      shippingCost: orderData.shipping_cost,
      taxes: orderData.taxes,
      trackingNumber: orderData.tracking_number,
      items,
    };

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error(`Failed to get customer order ${orderId}:`, error);
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error('Failed to parse address JSON from DB');
        // Decide if you want to return partial data or a 500 error
        // return NextResponse.json({ message: 'Error processing order data.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
