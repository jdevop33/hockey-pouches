import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface CartItemResponse {
  id: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  subtotal: number;
}

// GET handler - Get cart items for the current user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    console.log(`GET /api/cart - User: ${userId}`);

    // Fetch cart items with product details
    const cartQuery = `
      SELECT 
        c.id, c.product_id, c.quantity,
        p.name as product_name, CAST(p.price AS FLOAT) as price, p.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;

    const cartItems = await sql.query(cartQuery, [userId]);
    
    // Format cart items for response
    const formattedItems = cartItems.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image_url,
      subtotal: item.price * item.quantity
    }));

    // Calculate cart totals
    const subtotal = formattedItems.reduce((sum: number, item: CartItemResponse) => sum + item.subtotal, 0);
    
    return NextResponse.json({
      items: formattedItems,
      subtotal,
      itemCount: formattedItems.length,
      totalQuantity: formattedItems.reduce((sum: number, item: CartItemResponse) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error('Failed to get cart items:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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

    console.log(`POST /api/cart - User: ${userId}, Product: ${productId}, Quantity: ${quantity}`);

    // Check if product exists and is active
    const productCheck = await sql`
      SELECT id FROM products 
      WHERE id = ${productId} AND is_active = true
    `;

    if (productCheck.length === 0) {
      return NextResponse.json({ message: 'Product not found or not available' }, { status: 404 });
    }

    // Check if item already exists in cart
    const cartCheck = await sql`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    if (cartCheck.length > 0) {
      // Update existing cart item
      const cartItemId = cartCheck[0].id;
      const newQuantity = cartCheck[0].quantity + quantity;
      
      await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${cartItemId}
      `;

      return NextResponse.json({ 
        message: 'Cart item updated',
        cartItemId,
        quantity: newQuantity
      });
    } else {
      // Add new cart item
      const result = await sql`
        INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
        VALUES (${userId}, ${productId}, ${quantity}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      return NextResponse.json({ 
        message: 'Item added to cart',
        cartItemId: result[0].id,
        quantity
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Failed to add item to cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
    console.log(`DELETE /api/cart - User: ${userId}`);

    // Delete all cart items for the user
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

    return NextResponse.json({ message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('Failed to clear cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
