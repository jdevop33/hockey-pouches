import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT handler - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  const { cartItemId } = params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    
    // Parse request body
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json({ message: 'Quantity is required' }, { status: 400 });
    }

    console.log(`PUT /api/cart/${cartItemId} - User: ${userId}, Quantity: ${quantity}`);

    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item from cart
      await sql`
        DELETE FROM cart_items 
        WHERE id = ${cartItemId} AND user_id = ${userId}
      `;
      
      return NextResponse.json({ message: 'Item removed from cart' });
    } else {
      // Check if cart item exists and belongs to the user
      const cartCheck = await sql`
        SELECT id FROM cart_items 
        WHERE id = ${cartItemId} AND user_id = ${userId}
      `;

      if (cartCheck.length === 0) {
        return NextResponse.json({ message: 'Cart item not found or not authorized' }, { status: 404 });
      }

      // Update cart item quantity
      await sql`
        UPDATE cart_items 
        SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${cartItemId}
      `;

      return NextResponse.json({ 
        message: 'Cart item updated',
        cartItemId,
        quantity
      });
    }

  } catch (error) {
    console.error(`Failed to update cart item ${cartItemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  const { cartItemId } = params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    console.log(`DELETE /api/cart/${cartItemId} - User: ${userId}`);

    // Check if cart item exists and belongs to the user
    const cartCheck = await sql`
      SELECT id FROM cart_items 
      WHERE id = ${cartItemId} AND user_id = ${userId}
    `;

    if (cartCheck.length === 0) {
      return NextResponse.json({ message: 'Cart item not found or not authorized' }, { status: 404 });
    }

    // Delete cart item
    await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;

    return NextResponse.json({ message: 'Item removed from cart' });

  } catch (error) {
    console.error(`Failed to remove cart item ${cartItemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
