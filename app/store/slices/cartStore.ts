import { BaseState, createBaseStore } from '..';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  variant?: string;
}

export interface CartState extends BaseState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

const cartStore = createBaseStore<CartState>(
  {
    items: [],
    total: 0,
    addItem: item =>
      cartStore.setState(state => {
        const id = Math.random().toString(36).substring(7);
        return {
          items: [...state.items, { ...item, id }],
        };
      }),
    removeItem: id =>
      cartStore.setState(state => ({
        items: state.items.filter(item => item.id !== id),
      })),
    updateQuantity: (id, quantity) =>
      cartStore.setState(state => ({
        items: state.items.map(item => (item.id === id ? { ...item, quantity } : item)),
      })),
    clearCart: () =>
      cartStore.setState(() => ({
        items: [],
        total: 0,
      })),
    calculateTotal: () =>
      cartStore.setState(state => ({
        total: state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      })),
  },
  'cart'
);

export const useCartStore = cartStore;
