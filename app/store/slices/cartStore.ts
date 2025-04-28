import { BaseState, createStore } from '../config';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface CartState extends BaseState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const initialState: Partial<CartState> = {
  items: [],
  total: 0,
};

export const useCartStore = createStore<CartState>(
  {
    ...initialState,
    addItem: item =>
      useCartStore.setState(state => {
        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            total: state.total + item.price,
          };
        }
        return {
          items: [...state.items, item],
          total: state.total + item.price,
        };
      }),
    removeItem: id =>
      useCartStore.setState(state => {
        const item = state.items.find(i => i.id === id);
        return {
          items: state.items.filter(i => i.id !== id),
          total: state.total - (item ? item.price * item.quantity : 0),
        };
      }),
    updateQuantity: (id, quantity) =>
      useCartStore.setState(state => {
        const item = state.items.find(i => i.id === id);
        if (!item) return state;
        const quantityDiff = quantity - item.quantity;
        return {
          items: state.items.map(i => (i.id === id ? { ...i, quantity } : i)),
          total: state.total + item.price * quantityDiff,
        };
      }),
    clearCart: () =>
      useCartStore.setState(() => ({
        items: [],
        total: 0,
      })),
  },
  'cart'
);
