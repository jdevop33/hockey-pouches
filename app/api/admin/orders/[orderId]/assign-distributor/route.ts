import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db'; // Default import sql

export const dynamic = 'force-dynamic';

interface AssignBody { distributorId?: string; }

export async function POST(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);
  if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

  // TODO: Add Admin Auth Check 

  console.log(`POST /api/admin/orders/${orderId}/assign-distributor request`);

  try {
    const body: AssignBody = await request.json();
    const { distributorId } = body;
    if (!distributorId || typeof distributorId !== 'string') {
      return NextResponse.json({ message: 'Missing or invalid distributor ID.' }, { status: 400 });
    }

    // Use sql tag directly for checks
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    if (orderCheck[0].status !== 'Awaiting Fulfillment') return NextResponse.json({ message: `Order cannot be assigned. Current status: ${orderCheck[0].status}` }, { status: 400 });
    
    const distributorCheck = await sql`SELECT id FROM users WHERE id = ${distributorId} AND role = 'Distributor' AND status = 'Active'`;
    if (distributorCheck.length === 0) return NextResponse.json({ message: 'Invalid or inactive distributor ID provided.' }, { status: 400 });
    
    // Use sql tag directly for update
    await sql`
        UPDATE orders SET assigned_distributor_id = ${distributorId}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    console.log(`Placeholder: Update/Close task for assigning order ${orderId}`);
    console.log(`Placeholder: Notify distributor ${distributorId} about new assignment`);

    return NextResponse.json({ message: `Distributor ${distributorId} assigned to order ${orderId}.` });

  } catch (error: any) {
     if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
     if (error.message?.includes('violates foreign key constraint "orders_assigned_distributor_id_fkey"')) return NextResponse.json({ message: 'Invalid Distributor ID.' }, { status: 400 });
     console.error(`Admin: Failed to assign distributor to order ${orderId}:`, error);
     return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
