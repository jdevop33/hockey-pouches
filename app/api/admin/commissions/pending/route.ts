import { NextResponse } from 'next/server';
// import { verifyAdmin } from '@/lib/auth';
// import { listPendingCommissions } from '@/lib/commissionService';

export async function GET(request: Request) {
  // TODO: Implement admin logic to list pending commissions
  // 1. Verify Admin Authentication.
  // 2. Parse Query Parameters: Filtering (userId?), sorting (by user, amount?), pagination.
  // 3. Fetch Commissions: Retrieve commissions with status 'Pending Payout' (or similar).
  // 4. Return Pending Commission List.

  try {
    // --- Add Admin Authentication Verification Logic Here ---
    // const adminCheck = await verifyAdmin(request);
    // if (!adminCheck.isAdmin) {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50'; // May want larger limit for payouts
    const userId = searchParams.get('userId');
    // Add sorting options

    console.log(`Admin: Get pending commissions request - Page: ${page}, Limit: ${limit}, User: ${userId}`); // Placeholder

    // --- Fetch Pending Commissions Logic Here ---
    // const { commissions, total } = await listPendingCommissions({ 
    //   page: parseInt(page), 
    //   limit: parseInt(limit), 
    //   userId 
    // });

    // Placeholder data
    const dummyPendingCommissions = [
      { commissionId: 'comm-2', userId: 'distributor-2', userName: 'Distributor Two', orderId: 'order-456', amount: 7.50, status: 'Pending Payout', earnedDate: new Date().toISOString() },
      { commissionId: 'comm-3', userId: 'customer-ref', userName: 'Referred Customer', type: 'Referral Bonus', amount: 10.00, status: 'Pending Payout', earnedDate: new Date().toISOString() },
      { commissionId: 'comm-5', userId: 'distributor-1', userName: 'Distributor One', orderId: 'order-789', amount: 12.00, status: 'Pending Payout', earnedDate: new Date().toISOString() },
    ];
    const totalPending = 25; // Example total count

    return NextResponse.json({ 
      commissions: dummyPendingCommissions, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total: totalPending, 
        totalPages: Math.ceil(totalPending / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Admin: Failed to get pending commissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
