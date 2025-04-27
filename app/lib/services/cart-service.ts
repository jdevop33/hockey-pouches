import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { ProductService } from './product-service';
import { getRows } from '@/lib/db-types';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct {
  id: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  subtotal: number;
  flavor?: string | null;
  strength?: number | null;
  category?: string | null;
}

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
  isWholesaleEligible: boolean;
  minimumOrderRequirements: {
    retail: {
      met: boolean;
      required: number;
      current: number;
    };
    wholesale: {
      met: boolean;
      required: number;
      current: number;
    };
  };
}

export type CartValidationResult = {
  isValid: boolean;
  errors: string[];
  message: string;
};

// Interface for cart database row
interface CartDbRow {
  id: string;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
  image_url: string | null;
  flavor: string | null;
  strength: number | null;
  category: string | null;
}

/**
 * Service for cart operations
 */
export class CartService {
  private productService: ProductService;

  // Minimum order requirements
  private RETAIL_MIN_UNITS = 5; // Minimum units for retail orders
  private WHOLESALE_MIN_UNITS = 100; // Minimum units for wholesale orders

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get cart items for a user
   */
  async getCartItems(userId: string): Promise<CartSummary> {
    try {
      logger.info(`Getting cart items for user: ${userId}`);

      // Fetch cart items with product details
      const cartQuery = `
        SELECT 
          c.id, c.product_id, c.quantity,
          p.name as product_name, CAST(p.price AS FLOAT) as price, 
          p.image_url, p.flavor, p.strength, p.category
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1 AND p.is_active = true
        ORDER BY c.created_at DESC
      `;

      const cartItemsResult = await sql.query(cartQuery, [userId]);
      const cartItems = getRows(cartItemsResult) as CartDbRow[];

      // Format cart items for response
      const formattedItems: CartItemWithProduct[] = cartItems.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.image_url,
        flavor: item.flavor,
        strength: item.strength,
        category: item.category,
        subtotal: item.price * item.quantity,
      }));

      // Calculate cart totals
      const subtotal = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalQuantity = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Check if cart meets minimum order requirements
      const isRetailValid = totalQuantity >= this.RETAIL_MIN_UNITS;
      const isWholesaleValid = totalQuantity >= this.WHOLESALE_MIN_UNITS;

      return {
        items: formattedItems,
        subtotal,
        itemCount: formattedItems.length,
        totalQuantity,
        isWholesaleEligible: isWholesaleValid,
        minimumOrderRequirements: {
          retail: {
            met: isRetailValid,
            required: this.RETAIL_MIN_UNITS,
            current: totalQuantity,
          },
          wholesale: {
            met: isWholesaleValid,
            required: this.WHOLESALE_MIN_UNITS,
            current: totalQuantity,
          },
        },
      };
    } catch (error) {
      logger.error('Failed to get cart items:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to get cart items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add an item to the cart
   */
  async addCartItem(
    userId: string,
    productId: number,
    quantity: number
  ): Promise<{ cartItemId: string; quantity: number }> {
    try {
      logger.info(
        `Adding item to cart - User: ${userId}, Product: ${productId}, Quantity: ${quantity}`
      );

      // Validate inputs
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Check if product exists and is active
      const productCheck = await sql`
        SELECT id FROM products 
        WHERE id = ${productId} AND is_active = true
      `;

      if (getRows(productCheck).length === 0) {
        throw new Error('Product not found or not available');
      }

      // Check if item already exists in cart
      const cartCheck = await sql`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = ${userId} AND product_id = ${productId}
      `;

      const cartItems = getRows(cartCheck);
      if (cartItems.length > 0) {
        // Update existing cart item
        const cartItemId = cartItems[0].id;
        const newQuantity = cartItems[0].quantity + quantity;

        await sql`
          UPDATE cart_items 
          SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${cartItemId}
        `;

        return { cartItemId, quantity: newQuantity };
      } else {
        // Add new cart item
        const result = await sql`
          INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
          VALUES (${userId}, ${productId}, ${quantity}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;

        const newItem = getRows(result)[0];
        return { cartItemId: newItem.id, quantity };
      }
    } catch (error) {
      logger.error('Failed to add item to cart:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<{ cartItemId: string; quantity: number } | { message: string }> {
    try {
      logger.info(
        `Updating cart item - User: ${userId}, CartItem: ${cartItemId}, Quantity: ${quantity}`
      );

      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item from cart
        await this.removeCartItem(userId, cartItemId);
        return { message: 'Item removed from cart' };
      }

      // Check if cart item exists and belongs to the user
      const cartCheck = await sql`
        SELECT id FROM cart_items 
        WHERE id = ${cartItemId} AND user_id = ${userId}
      `;

      if (getRows(cartCheck).length === 0) {
        throw new Error('Cart item not found or not authorized');
      }

      // Update cart item quantity
      await sql`
        UPDATE cart_items 
        SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${cartItemId}
      `;

      return { cartItemId, quantity };
    } catch (error) {
      logger.error(`Failed to update cart item ${cartItemId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to update cart item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Remove an item from the cart
   */
  async removeCartItem(userId: string, cartItemId: string): Promise<boolean> {
    try {
      logger.info(`Removing cart item - User: ${userId}, CartItem: ${cartItemId}`);

      // Check if cart item exists and belongs to the user
      const cartCheck = await sql`
        SELECT id FROM cart_items 
        WHERE id = ${cartItemId} AND user_id = ${userId}
      `;

      if (getRows(cartCheck).length === 0) {
        throw new Error('Cart item not found or not authorized');
      }

      // Delete cart item
      await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;

      return true;
    } catch (error) {
      logger.error(`Failed to remove cart item ${cartItemId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to remove cart item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clear the entire cart for a user
   */
  async clearCart(userId: string): Promise<boolean> {
    try {
      logger.info(`Clearing cart for user: ${userId}`);

      // Delete all cart items for the user
      await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

      return true;
    } catch (error) {
      logger.error(`Failed to clear cart for user ${userId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to clear cart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate cart for minimum order requirements
   */
  async validateCart(userId: string, isWholesale: boolean = false): Promise<CartValidationResult> {
    try {
      const { totalQuantity, minimumOrderRequirements } = await this.getCartItems(userId);

      const minimumRequired = isWholesale
        ? minimumOrderRequirements.wholesale.required
        : minimumOrderRequirements.retail.required;

      const isMet = isWholesale
        ? minimumOrderRequirements.wholesale.met
        : minimumOrderRequirements.retail.met;

      if (!isMet) {
        return {
          isValid: false,
          errors: [
            `Order must contain at least ${minimumRequired} units. Currently has ${totalQuantity} units.`,
          ],
          message: `Order must contain at least ${minimumRequired} units. Currently has ${totalQuantity} units.`,
        };
      }

      return {
        isValid: true,
        errors: [],
        message: `Order meets minimum requirements with ${totalQuantity} units.`,
      };
    } catch (error) {
      logger.error(`Failed to validate cart for user ${userId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to validate cart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate product availability and inventory levels
   */
  async validateInventory(userId: string): Promise<CartValidationResult> {
    try {
      // Get current cart items
      const { items } = await this.getCartItems(userId);
      const errors: string[] = [];

      // Check each product's inventory
      for (const item of items) {
        // Get the product inventory
        const inventory = await this.productService.getProductInventory(item.productId);

        // Sum total inventory across all locations
        const totalInventory = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

        // Check if there's enough inventory
        if (totalInventory < item.quantity) {
          errors.push(
            `Not enough inventory for ${item.productName}. Available: ${totalInventory}, Requested: ${item.quantity}`
          );
        }
      }

      if (errors.length > 0) {
        return {
          isValid: false,
          errors,
          message: 'Some items in your cart are not available in the requested quantity.',
        };
      }

      return {
        isValid: true,
        errors: [],
        message: 'All items are available.',
      };
    } catch (error) {
      logger.error(`Failed to validate inventory for user ${userId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to validate inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transfer cart to another user (e.g., from anonymous to logged-in user)
   */
  async transferCart(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      logger.info(`Transferring cart from user ${fromUserId} to user ${toUserId}`);

      // Get items from the source cart
      const sourceCartResult = await sql`
        SELECT product_id, quantity FROM cart_items 
        WHERE user_id = ${fromUserId}
      `;

      const sourceCartItems = getRows(sourceCartResult);
      if (sourceCartItems.length === 0) {
        // No items to transfer
        return true;
      }

      // Start a transaction
      await sql`BEGIN`;

      try {
        // For each item in the source cart
        for (const item of sourceCartItems) {
          const productId = item.product_id;
          const quantity = item.quantity;

          // Check if the item exists in the target cart
          const targetItemResult = await sql`
            SELECT id, quantity FROM cart_items 
            WHERE user_id = ${toUserId} AND product_id = ${productId}
          `;

          const targetItems = getRows(targetItemResult);
          if (targetItems.length > 0) {
            // Update existing item in target cart
            const targetItemId = targetItems[0].id;
            const newQuantity = targetItems[0].quantity + quantity;

            await sql`
              UPDATE cart_items 
              SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ${targetItemId}
            `;
          } else {
            // Add new item to target cart
            await sql`
              INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
              VALUES (${toUserId}, ${productId}, ${quantity}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
          }
        }

        // Clear the source cart
        await sql`DELETE FROM cart_items WHERE user_id = ${fromUserId}`;

        // Commit the transaction
        await sql`COMMIT`;

        return true;
      } catch (error) {
        // Rollback the transaction on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to transfer cart from user ${fromUserId} to user ${toUserId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to transfer cart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
