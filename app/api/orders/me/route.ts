import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';
import { Order, Pagination } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log(`GET /api/orders/me - User: ${userId}, Page: ${page}, Limit: ${limit}`);

    // Fetch orders
    const ordersQuery = `
      SELECT
        o.id, o.status,
        CAST(o.subtotal AS FLOAT) as subtotal,
        CAST(o.shipping_cost AS FLOAT) as shipping_cost,
        CAST(o.taxes AS FLOAT) as taxes,
        CAST(o.total_amount AS FLOAT) as total_amount,
        o.payment_method, o.payment_status, o.created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    // Fetch count
    const countQuery = `SELECT COUNT(*) FROM orders WHERE user_id = $1`;

    const [ordersResult, totalResult] = await Promise.all([
      sql.query(ordersQuery, [userId, limit, offset]),
      sql.query(countQuery, [userId]),
    ]);

    const totalOrders = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalOrders / limit);

    // Format orders for response
    const orders = ordersResult.map((row: any) => ({
      id: row.id,
      status: row.status,
      subtotal: row.subtotal,
      shippingCost: row.shipping_cost,
      taxes: row.taxes,
      totalAmount: row.total_amount,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      createdAt: row.created_at,
      itemCount: row.item_count,
    }));

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to get customer orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
