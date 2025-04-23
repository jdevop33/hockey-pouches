import { NextResponse, type NextRequest } from 'next/server';

// Explicitly force dynamic rendering for this route
export const dynamic = 'force-dynamic'; 

export async function POST(
    request: NextRequest, // Reverting to NextRequest as Request didn't fix it
    { params }: { params: { orderId: string } } // Correct standard signature
) {
  const { orderId } = params;

  try {
    if (!orderId) {
         return NextResponse.json({ message: 'Order ID missing in route parameters.' }, { status: 400 });
    }
    
    // --- Auth Check Logic ---
    console.log(`Admin: Approve order request for ID: ${orderId}`);
    // --- Approve Order Logic Here ---
    // --- Create Task Logic ---

    return NextResponse.json({ message: `Order ${orderId} approved. Assignment task created.` });

  } catch (error) {
    console.error(`Admin: Failed to approve order ${orderId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
