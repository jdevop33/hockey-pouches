import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import jwt from 'jsonwebtoken';

// --- Interfaces --- 
interface JwtPayload { userId: string; }
interface OrderItemInput { productId: number; quantity: number; }
interface AddressInput { street?: string; city?: string; province?: string; postalCode?: string; country?: string; }
interface CreateOrderBody {
    items?: OrderItemInput[];
    shippingAddress?: AddressInput;
    billingAddress?: AddressInput;
    paymentMethod?: string;
}

// --- Helper Functions --- 
async function getUserIdFromToken(request: NextRequest): Promise<string | null> { /* ... as before ... */ 
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

// Placeholder for determining target location based on address
function getTargetLocation(address: AddressInput): string {
    // TODO: Implement proper logic to map province/postal code to location
    const province = address.province?.toUpperCase();
    if (province === 'BC') return 'Vancouver';
    if (province === 'AB') return 'Calgary'; // Or Edmonton based on city/postal?
    if (province === 'ON') return 'Toronto';
    return 'DefaultLocation'; // Fallback - should be handled better
}

// --- Main POST Handler --- 
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

        // Basic Input Validation
        if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ message: 'Order must contain items.' }, { status: 400 });
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.postalCode) return NextResponse.json({ message: 'Incomplete shipping address.' }, { status: 400 });
        if (!paymentMethod) return NextResponse.json({ message: 'Payment method is required.' }, { status: 400 });

        // --- Transaction Simulation Start --- 

        // 1. Fetch Product Details
        const productIds = items.map(item => item.productId);
        if (productIds.length === 0) return NextResponse.json({ message: 'No valid product IDs in order.' }, { status: 400 });
        
        const productDetails = await sql`SELECT id, name, price, is_active FROM products WHERE id = ANY(${productIds})`;
        const productMap = new Map(productDetails.map(p => [p.id, p]));
        
        // 2. Determine Target Location
        const targetLocation = getTargetLocation(shippingAddress);
        console.log(`Target fulfillment location determined as: ${targetLocation}`);

        // 3. Check Availability & Prepare Order Data
        let subtotal = 0;
        const orderItemsData = [];
        const inventoryChecks: Promise<any>[] = []; // Store promises for stock checks

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product || !product.is_active) return NextResponse.json({ message: `Product ID ${item.productId} not found or not available.` }, { status: 400 });
            if (!item.quantity || item.quantity <= 0) return NextResponse.json({ message: `Invalid quantity for product ID ${item.productId}.` }, { status: 400 });

            // Fetch stock for the specific product AND location
            inventoryChecks.push(sql`
                SELECT quantity 
                FROM inventory 
                WHERE product_id = ${item.productId} AND location = ${targetLocation}
            `.then(result => ({ 
                productId: item.productId, 
                requested: item.quantity, 
                available: parseInt(result[0]?.quantity as string || '0'),
                productName: product.name
            })));

            const pricePerItem = parseFloat(product.price as string);
            subtotal += pricePerItem * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                pricePerItem: pricePerItem
            });
        }

        // Execute all inventory checks
        const stockLevels = await Promise.all(inventoryChecks);

        // Validate stock levels AFTER fetching all
        for (const stock of stockLevels) {
            if (stock.available < stock.requested) {
                 console.error(`Insufficient stock for Product ID ${stock.productId} (${stock.productName}) at ${targetLocation}. Requested: ${stock.requested}, Available: ${stock.available}`);
                 return NextResponse.json({ message: `Insufficient stock for product ${stock.productName}. Only ${stock.available} available at your location.` }, { status: 400 });
            }
        }
        console.log('Stock levels verified for all items at location:', targetLocation);

        // 4. Calculate Final Totals (Simplified)
        const shippingCost = 5.00; 
        const taxes = subtotal * 0.13; 
        const totalAmount = subtotal + shippingCost + taxes;

        // 5. Create Order and Order Items in DB
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
        if (!newOrderId) throw new Error('Failed to create order record.');
        console.log(`Order record created with ID: ${newOrderId}`);

        console.log('Inserting order items...');
        const itemInsertPromises = orderItemsData.map(item => sql`
            INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
            VALUES (${newOrderId}, ${item.productId}, ${item.quantity}, ${item.pricePerItem.toFixed(2)})
        `);
        await Promise.all(itemInsertPromises);
        console.log(`${orderItemsData.length} order items inserted.`);

        // 6. Decrement Inventory (CRITICAL)
        console.log(`Decrementing inventory for order ${newOrderId} at location ${targetLocation}...`);
        const inventoryUpdatePromises = orderItemsData.map(item => sql`
            UPDATE inventory 
            SET quantity = quantity - ${item.quantity}, last_updated = CURRENT_TIMESTAMP
            WHERE product_id = ${item.productId} AND location = ${targetLocation} AND quantity >= ${item.quantity} 
        `); 
        // Added WHERE quantity >= item.quantity as a safeguard against race conditions
        await Promise.all(inventoryUpdatePromises);
        console.log(`Inventory decremented for ${orderItemsData.length} items.`);
        
        // TODO: Verify update counts from Promise.all results if needed

        // 7. TODO: Handle Payment Processing

        // --- Transaction Simulation End --- 

        // 8. Return Success Response
        return NextResponse.json({ 
            message: 'Order placed successfully!', 
            orderId: newOrderId,
            status: initialStatus,
            paymentStatus: initialPaymentStatus
        }, { status: 201 });

    } catch (error: any) {
        console.error(`POST /api/orders - Failed for user ${userId || '(unknown)'}:`, error);
        // Add more specific error handling based on error type/message
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
