// Import necessary types and the correct store creator
import { HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';

export interface CartItem {
  id: string; // Assuming product variation ID or a unique cart item ID
  productId: string; // Base product ID
  variationId: number; // Specific variation ID
  quantity: number;
  price: number;
  name: string;
  image?: string;
  // Add variation details if needed (e.g., flavor, strength)
  variationName?: string;
}

// Extend the correct base state
export interface CartState extends HydratedBaseState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const initialState: Partial<CartState> = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Define the cart store slice
const createCartSlice: StoreCreator<CartState> = (set, get) => ({
  addItem: itemToAdd =>
    set(state => {
      const existingItemIndex = state.items.findIndex(i => i.id === itemToAdd.id);
      const newItems = [...state.items];

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + itemToAdd.quantity,
        };
      } else {
        // Add new item
        newItems.push(itemToAdd);
      }

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }),

  removeItem: itemIdToRemove =>
    set(state => {
      const newItems = state.items.filter(i => i.id !== itemIdToRemove);
      // Recalculate totals
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }),

  updateQuantity: (itemIdToUpdate, newQuantity) =>
    set(state => {
      let newItems;
      if (newQuantity <= 0) {
        // If quantity is 0 or less, remove the item
        newItems = state.items.filter(i => i.id !== itemIdToUpdate);
      } else {
        // Otherwise update the quantity
        newItems = state.items.map(i =>
          i.id === itemIdToUpdate ? { ...i, quantity: newQuantity } : i
        );
      }

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }),

  clearCart: () =>
    set({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }),
});

// Use createHydratedStore
export const useCartStore = createHydratedStore<CartState>(initialState, 'cart', createCartSlice);
