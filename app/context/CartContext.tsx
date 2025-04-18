'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

// Define action types
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

// Calculate price with discount
const calculateDiscountedPrice = (product: Product, quantity: number): number => {
  if (!product.bulkDiscounts) return product.price;

  const applicableDiscount = product.bulkDiscounts
    .filter(discount => quantity >= discount.quantity)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

  if (!applicableDiscount) return product.price;

  return product.price * (1 - applicableDiscount.discountPercentage / 100);
};

// Calculate totals from items
const calculateTotals = (items: CartItem[]): { itemCount: number; subtotal: number } => {
  return items.reduce(
    (acc, item) => {
      const price = calculateDiscountedPrice(item.product, item.quantity);
      return {
        itemCount: acc.itemCount + item.quantity,
        subtotal: acc.subtotal + item.quantity * price,
      };
    },
    { itemCount: 0, subtotal: 0 }
  );
};

// Reducer function for cart state management
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS': {
      const items = action.payload;
      const { itemCount, subtotal } = calculateTotals(items);
      return { items, itemCount, subtotal };
    }

    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      if (quantity <= 0) return state;

      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }

      const { itemCount, subtotal } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const { itemCount, subtotal } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );

      const { itemCount, subtotal } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal };
    }

    case 'CLEAR_CART':
      return { items: [], itemCount: 0, subtotal: 0 };

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    subtotal: 0,
  });

  // Extract values from state
  const { items, itemCount, subtotal } = state;

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'SET_ITEMS', payload: parsedCart });
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [items]);

  // Memoized cart operations
  const addToCart = useCallback((product: Product, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
