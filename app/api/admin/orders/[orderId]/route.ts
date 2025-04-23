import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

export const dynamic = 'force-dynamic';

// --- Types --- 
type OrderItemDetails = { id: number; order_id: number; product_id: number; quantity: number; price_per_item: number; product_name: string; image_url?: string | null };
interface Address { street?: string; city?: string; province?: string; postalCode?: string; country?: string; name?: string; phone?: string; }
interface OrderHistory { timestamp: string; status: string; user?: string; notes?: string; }

interface AdminOrderDetailResponse {
    id: number;
    created_at: string; 
    status: string;
    subtotal: number;
    shipping_cost: number;
    taxes: number;
    total_amount: number;
    shipping_address: Address | null; 
    billing_address: Address | null;  
    payment_method: string | null;
    payment_status: string | null;
    user_id: string; 
    customer_name: string | null;
    customer_email: string | null;
    assigned_distributor_id?: string | null;
    assigned_distributor_name?: string | null; 
    tracking_number?: string | null;
    fulfillment_notes?: string | null;
    fulfillment_photo_url?: string | null;
    items: OrderItemDetails[];
    orderHistory?: OrderHistory[]; // Added missing optional property
}

// --- GET Handler --- 
export async function GET(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);
  if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  
  console.log(`GET /api/admin/orders/${orderId} request`);
  try {
    // Fetch main order data + joins
    const orderQuery = sql`
        SELECT o.*, u.name as customer_name, u.email as customer_email, d.name as assigned_distributor_name
        FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN users d ON o.assigned_distributor_id = d.id
        WHERE o.id = ${orderId}
    `;
    // Fetch items + joins
    const itemsQuery = sql`
        SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, CAST(oi.price_per_item AS FLOAT) as price_per_item, p.name as product_name, p.image_url
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ${orderId}
    `;
    // TODO: Fetch actual history when table exists
    // const historyQuery = sql`SELECT ... FROM order_history WHERE order_id = ${orderId} ...`;
    
    const [orderResult, itemsResult] = await Promise.all([orderQuery, itemsQuery]);

    if (orderResult.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const orderData = orderResult[0];
    const itemsData = itemsResult as OrderItemDetails[];
    
    const responseData: AdminOrderDetailResponse = {
        id: orderData.id,
        created_at: orderData.created_at,
        status: orderData.status,
        subtotal: parseFloat(orderData.subtotal as string),
        shipping_cost: parseFloat(orderData.shipping_cost as string),
        taxes: parseFloat(orderData.taxes as string),
        total_amount: parseFloat(orderData.total_amount as string),
        shipping_address: orderData.shipping_address as Address | null,
        billing_address: orderData.billing_address as Address | null,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        user_id: orderData.user_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        assigned_distributor_id: orderData.assigned_distributor_id,
        assigned_distributor_name: orderData.assigned_distributor_name,
        tracking_number: orderData.tracking_number,
        fulfillment_notes: orderData.fulfillment_notes,
        fulfillment_photo_url: orderData.fulfillment_photo_url,
        items: itemsData,
        orderHistory: [] // Assign placeholder empty array
    };
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error(`Admin: Failed to get order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler --- 
export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
    // ... PUT handler remains the same ...
     const { orderId: orderIdString } = params;
    const orderId = parseInt(orderIdString);
    if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
    try {
        const body = await request.json();
        console.log(`Admin PUT /api/admin/orders/${orderId} request:`, body);
        return NextResponse.json({ message: `Order ${orderId} update placeholder successful` }); 
    } catch (error: any) {
        if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        console.error(`Admin: Failed to update order ${orderId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
