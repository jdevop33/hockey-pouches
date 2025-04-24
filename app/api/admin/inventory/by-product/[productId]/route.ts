import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest, 
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }
    
    // Check if user is an admin
    if (authResult.role !== 'Admin') {
      return forbiddenResponse('Only administrators can access this resource');
    }
    
    const adminUserId = authResult.userId;
    console.log(`Admin: Get inventory for product ID: ${productId} by admin: ${adminUserId}`);
    
    // Fetch inventory for this product from all locations
    const inventoryQuery = `
      SELECT 
        i.id as inventoryId, 
        i.product_id as productId,
        p.name as productName,
        i.location,
        i.quantity,
        p.image_url as imageUrl
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.product_id = $1
      ORDER BY i.location
    `;
    
    const inventoryResult = await sql.query(inventoryQuery, [productId]);
    
    return NextResponse.json(inventoryResult);

  } catch (error) {
    console.error(`Admin: Failed to get inventory for product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
