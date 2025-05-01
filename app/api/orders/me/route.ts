// app/api/orders/me/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { orderService } from '@/lib/services/order-service'; // Import refactored service
import { logger } from '@/lib/logger'; // Assuming logger is available

export const dynamic = 'force-dynamic'; // Keep edge runtime or adjust as needed

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) { // Ensure userId is present
      return unauthorizedResponse(authResult.message);
    }
    const userId = authResult.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // Get optional status filter (adapt based on OrderStatus enum if needed)
    const status = searchParams.get('status') as any; // Cast status if needed

    logger.info(`GET /api/orders/me request`, { userId, page, limit, status });

    // Use the refactored OrderService to get user orders
    const result = await orderService.getUserOrders(userId, {
        page,
        limit,
        status, // Pass status filter to service method
    });

    // Return the data fetched by the service
    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error('Failed to get customer orders API route:', { error });
    // Avoid exposing internal error messages directly
    const message = error instanceof Error ? errorMessage : 'Internal Server Error';
     // Return a generic error response
     // Consider more specific error codes if applicable (e.g., 400 for bad request)
     return NextResponse.json({ message: "Failed to retrieve orders." }, { status: 500 });
  }
}
