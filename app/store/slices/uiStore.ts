import { BaseState, createStore } from '../config';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

export interface UIState extends BaseState {
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
}

const initialState: Partial<UIState> = {
  toasts: [],
  currentModal: null,
  isSidebarOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  addToast: toast =>
    useUIStore.setState(state => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(7) }],
    })),
  removeToast: id =>
    useUIStore.setState(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),
  showModal: modal =>
    useUIStore.setState(() => ({
      currentModal: { ...modal, id: Math.random().toString(36).substring(7) },
    })),
  hideModal: () =>
    useUIStore.setState(() => ({
      currentModal: null,
    })),
  toggleSidebar: () =>
    useUIStore.setState(state => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
  toggleCart: () =>
    useUIStore.setState(state => ({
      isCartOpen: !state.isCartOpen,
    })),
  toggleSearch: () =>
    useUIStore.setState(state => ({
      isSearchOpen: !state.isSearchOpen,
    })),
};

export const useUIStore = createStore<UIState>(
  {
    ...initialState,
    toggleSidebar: () => useUIStore.setState(state => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleCart: () => useUIStore.setState(state => ({ isCartOpen: !state.isCartOpen })),
    toggleSearch: () => useUIStore.setState(state => ({ isSearchOpen: !state.isSearchOpen })),
  },
  'ui'
);
