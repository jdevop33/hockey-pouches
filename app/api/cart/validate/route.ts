import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { CartService } from '@/lib/services/cart-service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Initialize the cart service
const cartService = new CartService();

/**
 * POST handler - Validate cart for minimum order requirements and inventory availability
 * Body parameters:
 * - isWholesale: boolean - Whether to validate against wholesale minimum requirements
 * - checkInventory: boolean - Whether to also validate inventory availability
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId!; // Non-null assertion since we've verified authentication

    // Parse request body
    const body = await request.json();
    const { isWholesale = false, checkInventory = true } = body;

    logger.info(
      `POST /api/cart/validate - User: ${userId}, Wholesale: ${isWholesale}, CheckInventory: ${checkInventory}`
    );

    // Validate cart for minimum order requirements
    const orderValidation = await cartService.validateCart(userId, isWholesale);

    // If order doesn't meet minimum requirements, return validation result
    if (!orderValidation.isValid) {
      return NextResponse.json({
        isValid: false,
        errors: orderValidation.errors,
        message: orderValidation.message,
      });
    }

    // If inventory check is requested, also validate inventory availability
    if (checkInventory) {
      const inventoryValidation = await cartService.validateInventory(userId);

      // If inventory validation fails, return those results
      if (!inventoryValidation.isValid) {
        return NextResponse.json({
          isValid: false,
          errors: inventoryValidation.errors,
          message: inventoryValidation.message,
        });
      }
    }

    // All validations passed
    return NextResponse.json({
      isValid: true,
      errors: [],
      message: isWholesale
        ? 'Order meets wholesale minimum requirements and inventory is available.'
        : 'Order meets retail minimum requirements and inventory is available.',
    });
  } catch (error) {
    logger.error('Failed to validate cart:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
