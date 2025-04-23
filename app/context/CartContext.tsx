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
// Removed static import: import { Product } from '../data/products';

// Define Product type consistently with API/DB
// (Can also be imported from a shared types file later)
export interface Product {
    id: number;
    name: string;
    description?: string | null;
    flavor?: string | null;
    strength?: number | null;
    price: number; 
    compare_at_price?: number | null;
    image_url?: string | null; // <--- Use image_url
    category?: string | null;
    is_active: boolean;
    bulkDiscounts?: { quantity: number; discountPercentage: number }[]; // Keep bulk discounts if needed
}


export interface CartItem {
  product: Product; // Uses the updated Product interface
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
  // TODO: Adapt bulk discount logic if needed based on how it's stored/fetched
  return product.price;
  // if (!product.bulkDiscounts) return product.price;
  // const applicableDiscount = product.bulkDiscounts
  //   .filter(discount => quantity >= discount.quantity)
  //   .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  // if (!applicableDiscount) return product.price;
  // return product.price * (1 - applicableDiscount.discountPercentage / 100);
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
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
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
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    subtotal: 0,
  });
  const { items, itemCount, subtotal } = state;

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [items]);

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
