import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken'; // Needed for auth check

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define the structure of the JWT payload we expect
interface JwtPayload { userId: string; role: string; }

// Define the expected request body
interface FulfillBody {
    trackingNumber?: string | null;
    fulfillmentPhotoUrl?: string | null; // Assuming URL is provided after upload
    notes?: string | null;
}

// Helper to get Distributor ID from token (Adapt from previous helper)
async function getDistributorIdFromToken(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) { throw new Error('Server configuration error: JWT_SECRET missing.'); }
    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      // Check if the user has the Distributor role
      if (decoded.role !== 'Distributor') {
          console.warn(`User ${decoded.userId} attempted fulfill action but is not a Distributor.`);
          return null; // Not authorized for this action
      }
      return decoded.userId;
    } catch (error) {
      console.warn('Token verification failed for fulfill action:', error);
      return null;
    } 
}

export async function POST(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);
  let distributorId: string | null = null; // For logging

  if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  }

  try {
    // 1. Verify Authentication & Role, get Distributor ID
    distributorId = await getDistributorIdFromToken(request);
    if (!distributorId) {
        return NextResponse.json({ message: 'Forbidden: Distributor access required.' }, { status: 403 });
    }
    console.log(`POST /api/distributor/orders/${orderId}/fulfill request by Distributor ${distributorId}`);

    // 2. Get request body
    const body: FulfillBody = await request.json();
    const { trackingNumber, fulfillmentPhotoUrl, notes } = body;
    // Basic validation (can add more)
    if (!trackingNumber && !fulfillmentPhotoUrl) {
         return NextResponse.json({ message: 'Tracking number or fulfillment photo is required.' }, { status: 400 });
    }

    // 3. Fetch order, check status and assignment
    const orderCheck = await sql`
        SELECT status, assigned_distributor_id 
        FROM orders 
        WHERE id = ${orderId}
    `;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;
    const assignedDistributor = orderCheck[0].assigned_distributor_id;

    if (assignedDistributor !== distributorId) {
        console.warn(`Distributor ${distributorId} attempted to fulfill order ${orderId} not assigned to them (assigned to ${assignedDistributor}).`);
        return NextResponse.json({ message: 'Order not assigned to this distributor.' }, { status: 403 }); // Forbidden
    }
    if (currentStatus !== 'Awaiting Fulfillment') {
        return NextResponse.json({ message: `Order cannot be fulfilled. Current status: ${currentStatus}` }, { status: 400 });
    }

    // 4. Update Order Status and save fulfillment details
    const newStatus = 'Pending Fulfillment Verification';
    console.log(`Updating order ${orderId} status to ${newStatus} and saving fulfillment details...`);

    await sql`
        UPDATE orders
        SET status = ${newStatus},
            tracking_number = ${trackingNumber || null},
            fulfillment_photo_url = ${fulfillmentPhotoUrl || null},
            fulfillment_notes = ${notes || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId} AND assigned_distributor_id = ${distributorId} -- Double check assignment
    `;
    
    // TODO: Add entry to order_history table (e.g., "Order fulfilled by Distributor X")

    // 5. TODO: Create Task: Generate a 'Fulfillment Verification' task for admin/owner.
    console.log(`Placeholder: Create task 'Verify fulfillment for Order ${orderId}'`);
    // await createTask({ title: `Verify fulfillment for Order ${orderId}`, ... });

    return NextResponse.json({ message: `Order ${orderId} marked as fulfilled. Awaiting verification.` });

  } catch (error: any) {
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Distributor: Failed to fulfill order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
