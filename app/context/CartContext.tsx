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
  // Use try-catch to safely access context
  try {
    const context = useContext(CartContext);
    if (context === undefined) {
      // Only log errors in browser environment
      if (typeof window !== 'undefined') {
        console.error('CRITICAL: useCart called outside of CartProvider!');
      }

      // Return fallback context
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
    // Handle SSR/SSG gracefully
    if (typeof window !== 'undefined') {
      console.error('Error accessing CartContext:', error);
    }
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
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [minOrderQuantity] = useState<number>(MIN_ORDER_QUANTITY);

  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    subtotal: 0,
    totalQuantity: 0,
  });

  // Handle hydration and localStorage synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            dispatch({ type: 'SET_ITEMS', payload: parsedCart });
            console.debug(
              'CartProvider: Loaded cart from localStorage',
              parsedCart.length,
              'items'
            );
          } else {
            console.warn('Invalid cart format in localStorage, resetting');
            localStorage.removeItem('cart');
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      } finally {
        setIsInitialized(true);
      }
    };

    const timeout = setTimeout(() => {
      setMounted(true);
      loadCart();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!mounted || !isInitialized) return;

    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items, mounted, isInitialized]);

  const addToCart = useCallback(
    async (product: Product, quantity: number) => {
      if (!mounted || !isInitialized) return;

      try {
        setIsAddingToCart(true);
        // Add validation or API calls here if needed
        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
      } catch (error) {
        console.error('Error adding item to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [mounted, isInitialized]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (!mounted || !isInitialized) return;
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
    },
    [mounted, isInitialized]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!mounted || !isInitialized) return;
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    },
    [mounted, isInitialized]
  );

  const clearCart = useCallback(() => {
    if (!mounted || !isInitialized) return;
    dispatch({ type: 'CLEAR_CART' });
  }, [mounted, isInitialized]);

  const validateMinimumOrder = useCallback(() => {
    if (!mounted || !isInitialized) {
      return { isValid: false, message: 'Cart not initialized' };
    }
    const isValid = state.totalQuantity >= minOrderQuantity;
    return {
      isValid,
      message: isValid ? undefined : `Minimum order quantity is ${minOrderQuantity} items`,
    };
  }, [state.totalQuantity, minOrderQuantity, mounted, isInitialized]);

  const value = useMemo(
    () => ({
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount: state.itemCount,
      subtotal: state.subtotal,
      totalQuantity: state.totalQuantity,
      validateMinimumOrder,
      minOrderQuantity,
      isAddingToCart,
    }),
    [
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      validateMinimumOrder,
      minOrderQuantity,
      isAddingToCart,
    ]
  );

  // During SSR or before hydration, return a minimal wrapper
  if (!mounted || !isInitialized) {
    return (
      <CartContext.Provider
        value={{
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
        }}
      >
        {children}
      </CartContext.Provider>
    );
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
