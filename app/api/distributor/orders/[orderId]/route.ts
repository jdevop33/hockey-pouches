import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// --- Types --- (Copied/Adapted from Admin/Frontend)
interface JwtPayload { userId: string; role: string; }
interface OrderItemDetails { id: number; order_id: number; product_id: number; product_name: string; quantity: number; price_per_item: number; image_url?: string | null; }
interface Address { street?: string; city?: string; province?: string; postalCode?: string; country?: string; name?: string; phone?: string; }
interface AssignedOrderDetails {
    id: number;
    created_at: string;
    status: string;
    items: OrderItemDetails[];
    shipping_address: Address | null;
    customer_name: string | null;
    tracking_number?: string | null;
    fulfillment_photo_url?: string | null;
    fulfillment_notes?: string | null;
    // Fields not typically needed by distributor:
    // subtotal, shipping_cost, taxes, total_amount, billing_address, payment_method, payment_status, user_id, customer_email, assigned_distributor_id, assigned_distributor_name, orderHistory
}

// --- Helper Functions --- 
async function getDistributorIdFromToken(request: NextRequest): Promise<string | null> { /* ... as before ... */ 
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) { throw new Error('Server configuration error: JWT_SECRET missing.'); }
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        if (decoded.role !== 'Distributor') return null;
        return decoded.userId;
    } catch (error) { return null; }
}

// --- GET Handler --- 
export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    const { orderId: orderIdString } = params;
    const orderId = parseInt(orderIdString);
    let distributorId: string | null = null;

    if (isNaN(orderId)) {
        return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
    }

    try {
        // 1. Verify Authentication & Role
        distributorId = await getDistributorIdFromToken(request);
        if (!distributorId) {
            return NextResponse.json({ message: 'Forbidden: Distributor access required.' }, { status: 403 });
        }
        console.log(`GET /api/distributor/orders/${orderId} request by Distributor ${distributorId}`);

        // 2. Fetch Order, Items and Verify Assignment
        // Fetch main order data and check assignment
        const orderQuery = sql`
            SELECT 
                o.id, o.created_at, o.status, o.shipping_address, 
                u.name as customer_name, 
                o.tracking_number, o.fulfillment_photo_url, o.fulfillment_notes,
                o.assigned_distributor_id
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ${orderId}
        `;

        // Fetch associated items
        const itemsQuery = sql`
            SELECT 
                oi.id, oi.order_id, oi.product_id, oi.quantity, 
                CAST(oi.price_per_item AS FLOAT) as price_per_item,
                p.name as product_name,
                p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ${orderId}
        `;

        const [orderResult, itemsResult] = await Promise.all([orderQuery, itemsQuery]);

        if (orderResult.length === 0) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        const orderData = orderResult[0];
        
        // Verify assignment *after* fetching
        if (orderData.assigned_distributor_id !== distributorId) {
             console.warn(`Distributor ${distributorId} attempted to access order ${orderId} not assigned to them.`);
             return NextResponse.json({ message: 'Order not assigned to this distributor.' }, { status: 403 });
        }

        const itemsData = itemsResult as OrderItemDetails[];

        // 3. Construct Response (subset of full details)
        const responseData: AssignedOrderDetails = {
            id: orderData.id,
            created_at: orderData.created_at,
            status: orderData.status,
            shipping_address: orderData.shipping_address as Address | null,
            customer_name: orderData.customer_name,
            items: itemsData,
            tracking_number: orderData.tracking_number,
            fulfillment_photo_url: orderData.fulfillment_photo_url,
            fulfillment_notes: orderData.fulfillment_notes,
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error(`Distributor: Failed to get order ${orderId}:`, error);
        if (error.message?.includes('Server configuration error')) {
             return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
