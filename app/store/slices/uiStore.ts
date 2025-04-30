// Import necessary types and the correct store creator
import { HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Modal {
  id: string;
  component: string; // Identifier for the modal component
  props?: Record<string, unknown>; // Props to pass to the modal
}

// Extend the correct base state
export interface UIState extends HydratedBaseState {
  toasts: Toast[];
  currentModal: Modal | null;
  isSidebarOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: () => void;
  toggleSidebar: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  setSidebarOpen: (isOpen: boolean) => void; // Added explicit setter
  setCartOpen: (isOpen: boolean) => void; // Added explicit setter
}

// Define initial state separately
const initialState: Partial<UIState> = {
  toasts: [],
  currentModal: null,
  isSidebarOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
};

// Creator function
const createUISlice: StoreCreator<UIState> = (set, get) => ({
  addToast: toast =>
    set(state => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(2, 9) }], // Generate simple ID
    })),

  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),

  showModal: modal =>
    set({
      currentModal: { ...modal, id: Math.random().toString(36).substring(2, 9) }, // Generate simple ID
    }),

  hideModal: () =>
    set({
      currentModal: null,
    }),

  toggleSidebar: () =>
    set(state => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  toggleCart: () =>
    set(state => ({
      isCartOpen: !state.isCartOpen,
    })),

  toggleSearch: () =>
    set(state => ({
      isSearchOpen: !state.isSearchOpen,
    })),

  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  setCartOpen: (isOpen: boolean) => set({ isCartOpen: isOpen }),
});

// Use createHydratedStore
export const useUIStore = createHydratedStore<UIState>(
  initialState,
  'ui', // Store name for persistence
  createUISlice
);
