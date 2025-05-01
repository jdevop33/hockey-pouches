import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db'; // Corrected import
import { verifyDistributor, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import * as schema from '@/lib/schema'; // Import schema namespace

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// --- Types ---

// Define OrderStatus based on schema enum
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];

// Define Address interface (assuming basic structure)
// TODO: Verify if a more specific definition exists elsewhere
interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  name?: string; // Optional name
  phone?: string; // Optional phone
}

interface OrderItemDetails {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price_per_item: number;
    image_url?: string | null;
}
interface AssignedOrderDetails {
    id: number;
    created_at: string;
    status: OrderStatus;
    items: OrderItemDetails[];
    shipping_address: Address | null;
    customer_name: string | null;
    tracking_number?: string | null;
    fulfillment_photo_url?: string | null;
    fulfillment_notes?: string | null;
}

// --- GET Handler ---
export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    const { orderId: orderIdString } = params;
    const orderId = parseInt(orderIdString);

    if (isNaN(orderId)) {
        return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
    }

    try {
        // Verify distributor authentication
        const authResult = await verifyDistributor(request);
        if (!authResult.isAuthenticated) {
            return unauthorizedResponse(authResult.message);
        }

        // Check if user is a distributor
        if (authResult.role !== 'Distributor') {
            return forbiddenResponse('Only distributors can access this resource');
        }

        const distributorId = authResult.userId;
        if (!distributorId) {
            return NextResponse.json({ message: 'Distributor ID not found in token' }, { status: 401 });
        }
        

        // 2. Fetch Order Details and Verify Assignment
        const orderQuery = sql`
            SELECT
                o.id, o.created_at, o.status, o.shipping_address,
                -- Extract customer name from shipping address JSON if available, otherwise use a placeholder
                COALESCE(o.shipping_address->>'name', 'Customer') as customer_name,
                o.tracking_number, o.fulfillment_photo_url, o.fulfillment_notes,
                o.assigned_distributor_id
            FROM orders o
            WHERE o.id = ${orderId}
        `;

        // 3. Fetch Associated Order Items
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

        // Execute concurrently
        const [orderResult, itemsResult] = await Promise.all([orderQuery, itemsQuery]);

        if (orderResult.length === 0) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        const orderData = orderResult[0];

        // !!! CRITICAL: Verify this order is assigned to the requesting distributor !!!
        if (orderData.assigned_distributor_id !== distributorId) {
             console.warn(`Distributor ${distributorId} attempted to access order ${orderId} not assigned to them.`);
             // Return 404 instead of 403 to avoid revealing order existence
             return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        const itemsData = itemsResult as OrderItemDetails[];

        // 4. Construct Response
        const responseData: AssignedOrderDetails = {
            id: orderData.id,
            created_at: orderData.created_at,
            status: orderData.status as OrderStatus, // Cast to OrderStatus
            shipping_address: orderData.shipping_address as Address | null,
            customer_name: orderData.customer_name,
            items: itemsData,
            tracking_number: orderData.tracking_number,
            fulfillment_photo_url: orderData.fulfillment_photo_url,
            fulfillment_notes: orderData.fulfillment_notes,
        };

        return NextResponse.json(responseData);

    } catch (error: unknown) {
        console.error(`Distributor: Failed to get order ${orderId}:`, error);
        if (errorMessage) {
             return NextResponse.json({ message: errorMessage }, { status: 500 });
        }
        return NextResponse.json({ message: errorMessage || 'Internal Server Error' }, { status: 500 });
    }
}
