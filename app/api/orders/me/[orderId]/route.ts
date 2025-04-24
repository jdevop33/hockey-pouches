import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';
import { Order, OrderItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    console.log(`GET /api/orders/me/${orderId} - User: ${userId}`);

    // Fetch order details
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
        oi.id, oi.product_id, p.name as product_name,
        oi.quantity, CAST(oi.price_per_item AS FLOAT) as price_per_item,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
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
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      pricePerItem: item.price_per_item,
      imageUrl: item.image_url,
      subtotal: item.price_per_item * item.quantity,
    }));

    // Format order for response
    const order = {
      id: orderData.id,
      status: orderData.status,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shipping_cost,
      taxes: orderData.taxes,
      totalAmount: orderData.total_amount,
      shippingAddress: orderData.shipping_address,
      billingAddress: orderData.billing_address,
      paymentMethod: orderData.payment_method,
      paymentStatus: orderData.payment_status,
      createdAt: orderData.created_at,
      trackingNumber: orderData.tracking_number,
      notes: orderData.notes,
      items,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Failed to get customer order ${orderId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
