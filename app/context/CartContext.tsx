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

// Define Product type consistently with API/DB
export interface Product {
  id: number;
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
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

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

const calculateDiscountedPrice = (product: Product, quantity: number): number => {
  return product.price;
}; // Simplified
const calculateTotals = (items: CartItem[]): { itemCount: number; subtotal: number } => {
  /* ... */
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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS': {
      const items = action.payload;
      const { itemCount, subtotal } = calculateTotals(items);
      return { items, itemCount, subtotal };
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

      const { itemCount, subtotal } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal };
    }

    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item.product.id !== productId);
      const { itemCount, subtotal } = calculateTotals(newItems);
      return { items: newItems, itemCount, subtotal };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      // Don't allow negative or zero quantities
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
  /* ... */
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], itemCount: 0, subtotal: 0 });
  const { items, itemCount, subtotal } = state;

  useEffect(() => {
    console.log('CartProvider useEffect: Loading state from localStorage.');
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'SET_ITEMS', payload: parsedCart });
          console.log(
            'CartProvider: Loaded cart from localStorage with',
            parsedCart.length,
            'items'
          );
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
    console.log('CartProvider useEffect: Finished initial load.');
  }, []);

  useEffect(() => {
    // --- Saving to localStorage still active (can be commented out if needed) ---
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
    () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
