import { NextResponse } from 'next/server';
// import { verifyAdmin } from '@/lib/auth';
// import { listAllCommissions } from '@/lib/commissionService';

export async function GET(request: Request) {
  // TODO: Implement admin logic to list all commissions
  // 1. Verify Admin Authentication.
  // 2. Parse Query Parameters: Filtering (userId, orderId, status, date range), sorting, pagination.
  // 3. Fetch Commissions: Retrieve commissions based on filters.
  // 4. Return Commission List.

  try {
    // --- Add Admin Authentication Verification Logic Here ---
    // const adminCheck = await verifyAdmin(request);
    // if (!adminCheck.isAdmin) {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    // Add other filters (orderId, dateFrom, dateTo)

    console.log(`Admin: Get all commissions request - Page: ${page}, Limit: ${limit}, Status: ${status}, User: ${userId}`); // Placeholder

    // --- Fetch Commissions Logic Here ---
    // const { commissions, total } = await listAllCommissions({ 
    //   page: parseInt(page), 
    //   limit: parseInt(limit), 
    //   status, userId 
    // });

    // Placeholder data
    const dummyCommissions = [
      { commissionId: 'comm-1', userId: 'distributor-1', userName: 'Distributor One', orderId: 'order-123', amount: 5.55, status: 'Paid', earnedDate: new Date().toISOString(), payoutDate: new Date().toISOString() },
      { commissionId: 'comm-2', userId: 'distributor-2', userName: 'Distributor Two', orderId: 'order-456', amount: 7.50, status: 'Pending Payout', earnedDate: new Date().toISOString(), payoutDate: null },
      { commissionId: 'comm-3', userId: 'customer-ref', userName: 'Referred Customer', type: 'Referral Bonus', amount: 10.00, status: 'Pending Payout', earnedDate: new Date().toISOString(), payoutDate: null },
      { commissionId: 'comm-4', userId: 'distributor-1', userName: 'Distributor One', orderId: 'order-xyz', amount: 6.20, status: 'Cancelled', earnedDate: new Date().toISOString(), payoutDate: null }, // Example cancelled
    ];
    const totalCommissions = 100; // Example total count

    return NextResponse.json({ 
      commissions: dummyCommissions, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total: totalCommissions, 
        totalPages: Math.ceil(totalCommissions / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Admin: Failed to get commissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
