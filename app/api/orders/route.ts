import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken';

// Define the structure of the JWT payload we expect
interface JwtPayload {
  userId: string;
}

// Define the expected request body structure
interface OrderItemInput {
    productId: number;
    quantity: number;
}
interface AddressInput { 
    street?: string; city?: string; province?: string; postalCode?: string; country?: string; 
}
interface CreateOrderBody {
    items?: OrderItemInput[];
    shippingAddress?: AddressInput;
    billingAddress?: AddressInput;
    paymentMethod?: string;
}

// Helper function to get userId from token
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) { throw new Error('Server configuration error: JWT_SECRET missing.'); }
    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      return decoded.userId;
    } catch (error) {
      console.warn('Token verification failed:', error);
      return null;
    } 
}

export async function POST(request: NextRequest) {
    let userId: string | null = null;
    try {
        userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
        }
        console.log(`POST /api/orders - User ${userId} starting order creation.`);

        const body: CreateOrderBody = await request.json();
        const { items, shippingAddress, billingAddress, paymentMethod } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: 'Order must contain items.' }, { status: 400 });
        }
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.postalCode) {
            return NextResponse.json({ message: 'Incomplete shipping address.' }, { status: 400 });
        }
        if (!paymentMethod) {
             return NextResponse.json({ message: 'Payment method is required.' }, { status: 400 });
        }

        // --- Transaction Simulation Start --- 

        console.log('Fetching product details and checking stock...');
        const productIds = items.map(item => item.productId);
        if (productIds.length === 0) { 
             return NextResponse.json({ message: 'No valid product IDs in order.' }, { status: 400 });
        }
        
        // Corrected: Use = ANY(${}) for array parameter in WHERE clause
        const productDetails = await sql`
            SELECT id, name, price, is_active 
            FROM products 
            WHERE id = ANY(${productIds})
        `;
        
        const productMap = new Map(productDetails.map(p => [p.id, p]));
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product || !product.is_active) {
                return NextResponse.json({ message: `Product ID ${item.productId} not found or not available.` }, { status: 400 });
            }
             if (!item.quantity || item.quantity <= 0) {
                 return NextResponse.json({ message: `Invalid quantity for product ID ${item.productId}.` }, { status: 400 });
            }
            
            console.warn(`STOCK CHECK SKIPPED for product ${item.productId} - Placeholder Only!`);

            const pricePerItem = parseFloat(product.price as string);
            subtotal += pricePerItem * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                pricePerItem: pricePerItem
            });
        }
        console.log('Product details fetched and basic checks passed.');

        const shippingCost = 5.00; 
        const taxes = subtotal * 0.13; 
        const totalAmount = subtotal + shippingCost + taxes;

        console.log('Inserting order into database...');
        const initialStatus = 'Pending Approval';
        const initialPaymentStatus = paymentMethod === 'etransfer' || paymentMethod === 'btc' ? 'Awaiting Confirmation' : 'Pending';
        const shippingAddrJson = JSON.stringify(shippingAddress);
        const billingAddrJson = JSON.stringify(billingAddress);

        const orderResult = await sql`
            INSERT INTO orders (user_id, status, subtotal, shipping_cost, taxes, total_amount, shipping_address, billing_address, payment_method, payment_status)
            VALUES (${userId}, ${initialStatus}, ${subtotal.toFixed(2)}, ${shippingCost.toFixed(2)}, ${taxes.toFixed(2)}, ${totalAmount.toFixed(2)}, ${shippingAddrJson}, ${billingAddrJson}, ${paymentMethod}, ${initialPaymentStatus})
            RETURNING id
        `;
        
        const newOrderId = orderResult[0]?.id as number | undefined;
        if (!newOrderId) {
            throw new Error('Failed to create order record.');
        }
        console.log(`Order record created with ID: ${newOrderId}`);

        console.log('Inserting order items...');
        // Corrected: Use Promise.all with individual INSERT statements
        const itemInsertPromises = orderItemsData.map(item => sql`
            INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
            VALUES (${newOrderId}, ${item.productId}, ${item.quantity}, ${item.pricePerItem.toFixed(2)})
        `);
        await Promise.all(itemInsertPromises);
        console.log(`${orderItemsData.length} order items inserted.`);

        console.warn(`INVENTORY NOT DECREMENTED for order ${newOrderId} - Placeholder Only!`);

        return NextResponse.json({ 
            message: 'Order placed successfully!', 
            orderId: newOrderId,
            status: initialStatus,
            paymentStatus: initialPaymentStatus
        }, { status: 201 });

    } catch (error: any) {
        console.error(`POST /api/orders - Failed for user ${userId || '(unknown)'}:`, error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
         if (error.message?.includes('Server configuration error')) {
             return NextResponse.json({ message: error.message }, { status: 500 });
        }
        // Catch potential SQL errors like foreign key violations etc.
        if (error.message?.includes('violates foreign key constraint')) {
             return NextResponse.json({ message: 'Invalid product ID in order.' }, { status: 400 });
        }
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
