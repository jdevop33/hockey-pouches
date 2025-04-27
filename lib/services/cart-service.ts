import { storeClient } from '../medusa-client';
import { z } from 'zod';

// Type definition for cart item
interface CartItem {
  variant_id: string;
  quantity: number;
  [key: string]: any;
}

// Type definition for cart
interface Cart {
  id: string;
  items?: CartItem[];
  [key: string]: any;
}

// Minimum order quantity as per requirements
const MIN_ORDER_QUANTITY = 5;

// Validation schema for adding items to cart
export const addToCartSchema = z.object({
  product_id: z.string(),
  variant_id: z.string().optional(),
  quantity: z
    .number()
    .int()
    .min(MIN_ORDER_QUANTITY, `Minimum order quantity is ${MIN_ORDER_QUANTITY} units per product`),
});

// Validation schema for cart creation
export const createCartSchema = z.object({
  region_id: z.string().optional(),
  country_code: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        variant_id: z.string().optional(),
        quantity: z
          .number()
          .int()
          .min(
            MIN_ORDER_QUANTITY,
            `Minimum order quantity is ${MIN_ORDER_QUANTITY} units per product`
          ),
      })
    )
    .optional(),
});

export const cartService = {
  // Create a new cart
  create: async (cartData?: Record<string, any>) => {
    try {
      // Validate cart data if provided
      if (cartData?.items) {
        // Ensure all items meet minimum quantity
        createCartSchema.parse(cartData);
      }

      const { cart } = await storeClient.cart.create(cartData);
      return cart as Cart;
    } catch (error) {
      console.error('Failed to create cart:', error);
      throw error;
    }
  },

  // Get a cart by ID
  get: async (cartId: string) => {
    try {
      const { cart } = await storeClient.cart.retrieve(cartId);
      return cart as Cart;
    } catch (error) {
      console.error(`Failed to get cart ${cartId}:`, error);
      throw error;
    }
  },

  // Add an item to the cart with minimum quantity validation
  addItem: async (cartId: string, itemData: Record<string, any>) => {
    try {
      // Validate minimum quantity
      const validatedItem = addToCartSchema.parse(itemData);

      const { cart } = await storeClient.cart.lineItems.create(cartId, validatedItem);
      return cart as Cart;
    } catch (error) {
      console.error(`Failed to add item to cart ${cartId}:`, error);
      throw error;
    }
  },

  // Update cart item quantity with minimum validation
  updateItem: async (cartId: string, lineId: string, quantity: number) => {
    try {
      // Check if new quantity meets minimum requirements
      if (quantity < MIN_ORDER_QUANTITY) {
        throw new Error(`Minimum order quantity is ${MIN_ORDER_QUANTITY} units per product`);
      }

      const { cart } = await storeClient.cart.lineItems.update(cartId, lineId, { quantity });
      return cart as Cart;
    } catch (error) {
      console.error(`Failed to update item ${lineId} in cart ${cartId}:`, error);
      throw error;
    }
  },

  // Remove an item from the cart
  removeItem: async (cartId: string, lineId: string) => {
    try {
      const { cart } = await storeClient.cart.lineItems.delete(cartId, lineId);
      const typedCart = cart as Cart;

      // After removal, validate that the remaining cart still meets minimum order requirements
      // If cart is emptied, this is allowed
      if (typedCart.items && typedCart.items.length > 0) {
        // Check if the cart has at least one item with minimum quantity
        const hasValidItems = typedCart.items.some(item => item.quantity >= MIN_ORDER_QUANTITY);

        if (!hasValidItems) {
          throw new Error(
            `Cart must have at least one item with ${MIN_ORDER_QUANTITY} units minimum`
          );
        }
      }

      return typedCart;
    } catch (error) {
      console.error(`Failed to remove item ${lineId} from cart ${cartId}:`, error);
      throw error;
    }
  },

  // Complete cart and create order
  complete: async (cartId: string) => {
    try {
      // Before completing, validate that the cart meets minimum order requirements
      const { cart } = await storeClient.cart.retrieve(cartId);
      const typedCart = cart as Cart;

      if (!typedCart.items || typedCart.items.length === 0) {
        throw new Error('Cannot complete an empty cart');
      }

      // Ensure all items meet minimum quantity
      const invalidItems = typedCart.items.filter(item => item.quantity < MIN_ORDER_QUANTITY);

      if (invalidItems.length > 0) {
        throw new Error(`All items must have a minimum quantity of ${MIN_ORDER_QUANTITY} units`);
      }

      // Complete the cart
      const { order } = await storeClient.cart.complete(cartId);
      return order;
    } catch (error) {
      console.error(`Failed to complete cart ${cartId}:`, error);
      throw error;
    }
  },

  // Check if cart meets minimum order requirements
  validateMinimumOrder: (cart: Cart) => {
    if (!cart.items || cart.items.length === 0) {
      return {
        valid: false,
        message: 'Cart is empty',
      };
    }

    const invalidItems = cart.items.filter(item => item.quantity < MIN_ORDER_QUANTITY);

    if (invalidItems.length > 0) {
      return {
        valid: false,
        message: `All items must have a minimum quantity of ${MIN_ORDER_QUANTITY} units`,
        invalidItems,
      };
    }

    return { valid: true };
  },
};
