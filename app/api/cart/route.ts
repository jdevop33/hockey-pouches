import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { CartService } from '@/lib/services/cart-service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Initialize the cart service
const cartService = new CartService();

// GET handler - Get cart items for the current user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    logger.info(`GET /api/cart - User: ${userId}`);

    // Get cart items using the cart service
    const cartSummary = await cartService.getCartItems(userId);

    return NextResponse.json(cartSummary);
  } catch (error) {
    logger.error('Failed to get cart items:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST handler - Add item to cart
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;

    // Parse request body
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ message: 'Quantity must be greater than 0' }, { status: 400 });
    }

    logger.info(`POST /api/cart - User: ${userId}, Product: ${productId}, Quantity: ${quantity}`);

    // Add item to cart using the cart service
    try {
      const result = await cartService.addCartItem(userId, productId, quantity);
      return NextResponse.json(
        {
          message: 'Item added to cart',
          cartItemId: result.cartItemId,
          quantity: result.quantity,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    logger.error('Failed to add item to cart:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE handler - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    logger.info(`DELETE /api/cart - User: ${userId}`);

    // Clear cart using the cart service
    await cartService.clearCart(userId);

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    logger.error('Failed to clear cart:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
