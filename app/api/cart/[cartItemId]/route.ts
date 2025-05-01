import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { CartService } from '@/lib/services/cart-service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Initialize the cart service
const cartService = new CartService();

// PUT handler - Update cart item quantity
export async function PUT(request: NextRequest, { params }: { params: { cartItemId: string } }) {
  const { cartItemId } = params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json({ message: 'Quantity is required' }, { status: 400 });
    }

    logger.info(`PUT /api/cart/${cartItemId} - User: ${userId}, Quantity: ${quantity}`);

    try {
      // Update cart item using the cart service
      const result = await cartService.updateCartItem(userId, cartItemId, quantity);

      // If the item was removed (quantity <= 0)
      if ('message' in result) {
        return NextResponse.json({ message: result.message });
      }

      // Item was updated - Use result.id instead of result.cartItemId
      return NextResponse.json({
        message: 'Cart item updated',
        cartItemId: result.id, // Changed from result.cartItemId
        quantity: result.quantity,
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
      if (error instanceof Error && errorMessage.includes('not found')) {
        return NextResponse.json({ message: errorMessage }, { status: 404 });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Failed to update cart item ${cartItemId}:`, {
      error: error instanceof Error ? errorMessage : String(error),
    });
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? errorMessage : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove item from cart
export async function DELETE(request: NextRequest, { params }: { params: { cartItemId: string } }) {
  const { cartItemId } = params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    logger.info(`DELETE /api/cart/${cartItemId} - User: ${userId}`);

    try {
      // Remove cart item using the cart service
      await cartService.removeCartItem(userId, cartItemId);
      return NextResponse.json({ message: 'Item removed from cart' });
    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
      if (error instanceof Error && errorMessage.includes('not found')) {
        return NextResponse.json({ message: errorMessage }, { status: 404 });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Failed to remove cart item ${cartItemId}:`, {
      error: error instanceof Error ? errorMessage : String(error),
    });
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? errorMessage : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
