import { db } from '@/lib/db';
import { inventory } from '@/lib/schema/inventory';
import { cart } from '@/lib/schema/cart';
import { inventory } from '@/lib/schema/inventory';
import { cart } from '@/lib/schema/cart';
import { inventory } from '@/lib/schema/inventory';
import { cart } from '@/lib/schema/cart';
import { inventory } from '@/lib/schema/inventory';
import { cart } from '@/lib/schema/cart';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use central schema index
import { eq, and, sql as drizzleSql, sum, desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { productService } from './product-service';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
type CartItemSelect = typeof schema.cartItems.$inferSelect;
type CartItemInsert = typeof schema.cartItems.$inferInsert;

interface CartItemWithDetails extends CartItemSelect {
    productVariation: {
        name: string; price: string; imageUrl: string | null; flavor: string | null;
        strength: number | null; isActive: boolean;
        product: { category: string | null; } | null;
    } | null;
}
export interface CartSummary {
    items: Array<{ id: string; productVariationId: number; productName: string; price: number; quantity: number; imageUrl?: string | null; subtotal: number; flavor?: string | null; strength?: number | null; category?: string | null; isActive: boolean; }>;
    subtotal: number; itemCount: number; totalQuantity: number; isWholesaleEligible: boolean;
    minimumOrderRequirements: { retail: { met: boolean; required: number; current: number }; wholesale: { met: boolean; required: number; current: number }; };
}
export type CartValidationResult = { isValid: boolean; errors: string[]; message: string; };

// --- Service ---
export class CartService {
    private RETAIL_MIN_UNITS = 5;
    private WHOLESALE_MIN_UNITS = 100;

    async getCartItems(userId: string): Promise<CartSummary> {
        try {
            logger.info(`Getting cart items for user: ${userId}`);
            const cartItemsResult: CartItemWithDetails[] = await db.query.cartItems.findMany({
                where: eq(schema.cartItems.userId, userId),
                with: { productVariation: { columns: { name: true, price: true, imageUrl: true, flavor: true, strength: true, isActive: true }, with: { product: { columns: { category: true } } } } },
                orderBy: [desc(schema.cartItems.createdAt)]
            });
            const validItems = cartItemsResult.filter(item => item.productVariation && item.productVariation.isActive);
            let subtotal = 0, totalQuantity = 0;
            const formattedItems = validItems.map(item => {
                const variation = item.productVariation!;
                const price = parseFloat(variation.price);
                const itemSubtotal = price * item.quantity;
                subtotal += itemSubtotal; totalQuantity += item.quantity;
                return { id: item.id, productVariationId: item.productVariationId, productName: variation.name, price, quantity: item.quantity, imageUrl: variation.imageUrl, subtotal: itemSubtotal, flavor: variation.flavor, strength: variation.strength, category: variation.product?.category, isActive: variation.isActive };
            });
            const isRetailValid = totalQuantity >= this.RETAIL_MIN_UNITS;
            const isWholesaleValid = totalQuantity >= this.WHOLESALE_MIN_UNITS;
            return {
                items: formattedItems, subtotal: parseFloat(subtotal.toFixed(2)), itemCount: formattedItems.length, totalQuantity,
                isWholesaleEligible: isWholesaleValid,
                minimumOrderRequirements: { retail: { met: isRetailValid, required: this.RETAIL_MIN_UNITS, current: totalQuantity }, wholesale: { met: isWholesaleValid, required: this.WHOLESALE_MIN_UNITS, current: totalQuantity } },
            };
        } catch (error) {
            logger.error('Failed to get cart items:', { userId, error }); throw new Error('Failed to get cart items.');
        }
    }
    async addCartItem(userId: string, productVariationId: number, quantity: number): Promise<CartItemSelect> {
        try {
            logger.info(`Adding item to cart`, { userId, productVariationId, quantity });
            if (quantity <= 0) throw new Error('Quantity must be > 0');
            const variation = await db.query.productVariations.findFirst({ where: and(eq(schema.productVariations.id, productVariationId), eq(schema.productVariations.isActive, true)), columns: { id: true } });
            if (!variation) throw new Error('Product variation not found or unavailable');
            const result = await db.transaction(async (tx) => {
                const existingItem = await tx.query.cartItems.findFirst({ where: and(eq(schema.cartItems.userId, userId), eq(schema.cartItems.productVariationId, productVariationId)) });
                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    const updated = await tx.update(schema.cartItems).set({ quantity: newQuantity, updatedAt: new Date() }).where(eq(schema.cartItems.id, existingItem.id)).returning();
                    return updated[0];
                } else {
                    const newItem: CartItemInsert = { id: uuidv4(), userId, productVariationId, quantity };
                    const inserted = await tx.insert(schema.cartItems).values(newItem).returning();
                    return inserted[0];
                }
            });
            if (!result) throw new Error('Failed to add/update cart item');
            return result;
        } catch (error) {
            logger.error('Failed to add item to cart:', { userId, productVariationId, error }); throw error;
        }
    }
    async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<CartItemSelect | { message: string }> {
        try {
            logger.info(`Updating cart item`, { userId, cartItemId, quantity });
            if (quantity <= 0) {
                await this.removeCartItem(userId, cartItemId);
                return { message: 'Item removed due to zero quantity' };
            }
            const result = await db.update(schema.cartItems).set({ quantity: quantity, updatedAt: new Date() }).where(and(eq(schema.cartItems.id, cartItemId), eq(schema.cartItems.userId, userId))).returning();
            if (result.length === 0) throw new Error('Cart item not found or unauthorized');
            return result[0];
        } catch (error) {
            logger.error(`Failed to update cart item:`, { cartItemId, error }); throw error;
        }
    }
    async removeCartItem(userId: string, cartItemId: string): Promise<boolean> {
        try {
            logger.info(`Removing cart item`, { userId, cartItemId });
            const result = await db.delete(schema.cartItems).where(and(eq(schema.cartItems.id, cartItemId), eq(schema.cartItems.userId, userId))).returning({ id: schema.cartItems.id });
            if (result.length === 0) { logger.warn('Attempted remove of non-existent/unauthorized item', { userId, cartItemId }); return false; }
            return true;
        } catch (error) {
            logger.error(`Failed to remove cart item:`, { cartItemId, error }); throw new Error('Failed to remove cart item.');
        }
    }
    async clearCart(userId: string): Promise<boolean> {
        try {
            logger.info(`Clearing cart for user: ${userId}`);
            await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId)); return true;
        } catch (error) {
            logger.error(`Failed to clear cart:`, { userId, error }); throw new Error('Failed to clear cart.');
        }
    }
    async validateCart(userId: string, isWholesale: boolean = false): Promise<CartValidationResult> {
        try {
            const { totalQuantity, minimumOrderRequirements } = await this.getCartItems(userId);
            const reqs = isWholesale ? minimumOrderRequirements.wholesale : minimumOrderRequirements.retail;
            if (!reqs.met) { const msg = `Order must contain at least ${reqs.required} units. Currently has ${totalQuantity}.`; return { isValid: false, errors: [msg], message: msg }; }
            return { isValid: true, errors: [], message: `Order meets minimum requirements.` };
        } catch (error) {
            logger.error(`Failed to validate cart reqs:`, { userId, error }); throw new Error('Failed to validate cart reqs.');
        }
    }
    async validateInventory(userId: string): Promise<CartValidationResult> {
        try {
            const { items } = await this.getCartItems(userId);
            const errors: string[] = [];
            for (const item of items) {
                const availableStock = await productService.getTotalAvailableStock(item.productVariationId);
                if (availableStock < item.quantity) errors.push(`Not enough stock for ${item.productName}. Available: ${availableStock}, Requested: ${item.quantity}`);
            }
            if (errors.length > 0) return { isValid: false, errors, message: 'Insufficient stock for some items.' };
            return { isValid: true, errors: [], message: 'All items available.' };
        } catch (error) {
            logger.error(`Failed to validate cart inventory:`, { userId, error }); throw new Error('Failed to validate inventory.');
        }
    }
    async transferCart(fromUserId: string, toUserId: string): Promise<boolean> {
        try {
            logger.info(`Transferring cart from ${fromUserId} to ${toUserId}`);
            const sourceItems = await db.query.cartItems.findMany({ where: eq(schema.cartItems.userId, fromUserId) });
            if (sourceItems.length === 0) return true;
            await db.transaction(async (tx) => {
                for (const item of sourceItems) {
                    const targetItem = await tx.query.cartItems.findFirst({ where: and(eq(schema.cartItems.userId, toUserId), eq(schema.cartItems.productVariationId, item.productVariationId)) });
                    if (targetItem) {
                        const newQty = targetItem.quantity + item.quantity;
                        await tx.update(schema.cartItems).set({ quantity: newQty, updatedAt: new Date() }).where(eq(schema.cartItems.id, targetItem.id));
                    } else {
                        await tx.insert(schema.cartItems).values({ id: uuidv4(), userId: toUserId, productVariationId: item.productVariationId, quantity: item.quantity });
                    }
                }
                await tx.delete(schema.cartItems).where(eq(schema.cartItems.userId, fromUserId));
            });
            logger.info(`Cart transferred successfully from ${fromUserId} to ${toUserId}`); return true;
        } catch (error) {
            logger.error(`Failed to transfer cart:`, { fromUserId, toUserId, error }); throw new Error('Failed to transfer cart.');
        }
    }
}
export const cartService = new CartService();
