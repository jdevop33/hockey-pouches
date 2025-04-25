// app/api/distributor/inventory/route.ts
import { NextResponse, NextRequest } from 'next/server';
import sql from '@/lib/db'; // Corrected path
import { verifyDistributor, unauthorizedResponse, forbiddenResponse } from '@/lib/auth'; // Corrected path & import
import { logger } from '@/lib/logger'; // Corrected path

// Interface for the returned inventory item
interface DistributorInventoryItem {
  id: number;
  productId: number;
  productName: string; 
  quantity: number;
  location: string; 
  lastUpdated: string; // Assuming inventory table has an updated_at timestamp
  imageUrl?: string | null;
}

// Database function to get inventory for a specific distributor
async function getDistributorInventoryFromDB(userId: string): Promise<DistributorInventoryItem[]> {
    logger.info(`Fetching inventory from DB for distributor: ${userId}`);
    try {
        // Query inventory table, joining with products, and filtering by distributor's user ID.
        // Assumes inventory table has a 'user_id' column linking to the distributor.
        // Adjust table/column names (e.g., inventory.user_id, products.image_url, inventory.updated_at) if needed.
        const query = `
            SELECT
                i.id,
                i.product_id as "productId",
                p.name as "productName",
                i.quantity,
                i.location,
                i.updated_at as "lastUpdated", 
                p.image_url as "imageUrl"
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            WHERE i.user_id = $1
            ORDER BY p.name ASC, i.location ASC;
        `;
        
        // Removed type argument, will use type assertion on result
        const result = await sql(query, [userId]); 
        logger.info(`Found ${result.length} inventory items for distributor ${userId}`);
        // Assert type here
        return result as DistributorInventoryItem[];

    } catch (error) {
        logger.error(`Database error fetching inventory for distributor ${userId}:`, error);
        throw new Error('Failed to fetch inventory from database.'); // Rethrow for the handler
    }
}

export async function GET(req: NextRequest) {
  try {
    // Use verifyDistributor to check authentication and role
    const authResult = await verifyDistributor(req);
    if (!authResult.isAuthenticated) {
        return unauthorizedResponse(authResult.message); 
    }
    // verifyDistributor checks the role, but we double-check its message 
    // in case the function signature changes or for extra safety.
    if (!authResult.role || authResult.role !== 'Distributor') {
        logger.warn('Authorization check failed for distributor inventory access', { userId: authResult.userId, role: authResult.role });
        return forbiddenResponse('Access denied. Distributor role required.');
    }

    const userId = authResult.userId; // Get userId from authResult
    if (!userId) {
        // This should ideally not happen if isAuthenticated is true, but belts and braces...
        logger.error('Authenticated distributor user ID is missing');
        return unauthorizedResponse('User ID missing from session.');
    }
    
    const inventory = await getDistributorInventoryFromDB(userId);

    logger.info(`Successfully fetched inventory for distributor ${userId}`, { count: inventory.length });
    return NextResponse.json(inventory);

  } catch (error) {
    logger.error('Error in GET /api/distributor/inventory:', error);
    // Use the error message from the DB function if available
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// TODO: Add POST/PUT/DELETE handlers if distributors can modify their inventory directly
// (e.g., report stock adjustments), or handle this via requests to admin.
