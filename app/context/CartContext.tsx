'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useState,
} from 'react';

// Define Product type consistently with API/DB
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  flavor?: string | null;
  strength?: number | null;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_active: boolean;
  bulkDiscounts?: { quantity: number; discountPercentage: number }[];
}
export interface CartItem {
  product: Product;
  quantity: number;
}
export type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAddingToCart: boolean;
  itemCount: number;
  subtotal: number;
  totalQuantity: number;
  validateMinimumOrder: () => { isValid: boolean; message?: string };
  minOrderQuantity: number;
};

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };
interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  totalQuantity: number;
}

// Minimum order quantity
const MIN_ORDER_QUANTITY = 5;

const calculateDiscountedPrice = (product: Product): number => {
  return product.price;
}; // Simplified

const calculateTotals = (
  items: CartItem[]
): { itemCount: number; subtotal: number; totalQuantity: number } => {
  /* ... */
  return items.reduce(
    (acc, item) => {
      const price = calculateDiscountedPrice(item.product);
      return {
        itemCount: acc.itemCount + 1, // Count of unique items
        subtotal: acc.subtotal + item.quantity * price,
        totalQuantity: acc.totalQuantity + item.quantity, // Total count of all items
      };
    },
    { itemCount: 0, subtotal: 0, totalQuantity: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS': {
      const items = action.payload;
      const { itemCount, subtotal, totalQuantity } = calculateTotals(items);
      return { items, itemCount, subtotal, totalQuantity };
    }

    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;

      // Check if product already exists in cart
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);

      let newItems;
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item if product not in cart
        newItems = [...state.items, { product, quantity }];
      }

      const { itemCount, subtotal, totalQuantity } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal, totalQuantity };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const { itemCount, subtotal, totalQuantity } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal, totalQuantity };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { itemCount, subtotal, totalQuantity } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal, totalQuantity };
    }

    case 'CLEAR_CART':
      return { items: [], itemCount: 0, subtotal: 0, totalQuantity: 0 };

    default:
      return state;
  }
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: async () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isAddingToCart: false,
  itemCount: 0,
  subtotal: 0,
  totalQuantity: 0,
  validateMinimumOrder: () => ({ isValid: false, message: 'Cart not initialized' }),
  minOrderQuantity: MIN_ORDER_QUANTITY,
});

export const useCart = () => {
  // Use a try-catch block to safely access context
  try {
    const context = useContext(CartContext);
    if (context === undefined) {
      // Detect if we're in a browser environment to provide better error messages
      if (typeof window !== 'undefined') {
        console.error('CRITICAL: useCart called outside of CartProvider!');
      }

      // Provide a fallback context instead of throwing to prevent rendering errors
      return {
        items: [],
        addToCart: async () => {},
        removeFromCart: () => {},
        updateQuantity: () => {},
        clearCart: () => {},
        isAddingToCart: false,
        itemCount: 0,
        subtotal: 0,
        totalQuantity: 0,
        validateMinimumOrder: () => ({ isValid: false, message: 'Cart not initialized' }),
        minOrderQuantity: MIN_ORDER_QUANTITY,
      };
    }
    return context;
  } catch (error) {
    // This can happen during SSR or static generation
    if (typeof window !== 'undefined') {
      console.error('Error accessing CartContext:', error);
    }

    // Return fallback data
    return {
      items: [],
      addToCart: async () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      isAddingToCart: false,
      itemCount: 0,
      subtotal: 0,
      totalQuantity: 0,
      validateMinimumOrder: () => ({ isValid: false, message: 'Cart not initialized' }),
      minOrderQuantity: MIN_ORDER_QUANTITY,
    };
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  const [isInitialized, setIsInitialized] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    subtotal: 0,
    totalQuantity: 0,
  });
  const { items, itemCount, subtotal, totalQuantity } = state;

  // We aren't currently using setMinOrderQuantity, but keeping it for future flexibility
  // when we might need to update the value from an API
  const [minOrderQuantity] = useState<number>(MIN_ORDER_QUANTITY);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Safely load cart from localStorage
  useEffect(() => {
    if (!isBrowser) return; // Skip server-side execution

    console.log('CartProvider useEffect: Loading state from localStorage.');
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            dispatch({ type: 'SET_ITEMS', payload: parsedCart });
            console.log(
              'CartProvider: Loaded cart from localStorage with',
              parsedCart.length,
              'items'
            );
          } else {
            console.warn('Invalid cart format in localStorage, resetting');
            localStorage.removeItem('cart');
          }
        } catch (parseError) {
          console.error('Failed to parse cart from localStorage:', parseError);
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      setIsInitialized(true);
    }

    console.log('CartProvider useEffect: Finished initial load.');
  }, [isBrowser]);

  // Safely save cart to localStorage
  useEffect(() => {
    if (!isBrowser || !isInitialized) return; // Skip on server or before initialization

    try {
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items, isInitialized, isBrowser]);

  // Validate minimum order quantity
  const validateMinimumOrder = useCallback(() => {
    if (totalQuantity < minOrderQuantity) {
      return {
        isValid: false,
        message: `Minimum order quantity is ${minOrderQuantity} units. You have ${totalQuantity} units in your cart.`,
      };
    }
    return { isValid: true };
  }, [totalQuantity, minOrderQuantity]);

  const addToCart = useCallback(async (product: Product, quantity: number) => {
    try {
      setIsAddingToCart(true);
      // Validate the quantity is at least 1
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    } finally {
      setIsAddingToCart(false);
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      totalQuantity,
      validateMinimumOrder,
      minOrderQuantity,
      isAddingToCart,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      totalQuantity,
      validateMinimumOrder,
      minOrderQuantity,
      isAddingToCart,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
