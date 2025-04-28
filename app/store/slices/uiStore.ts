import { BaseState, createBaseStore } from '..';

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

const uiStore = createBaseStore<UIState>(
  {
    toasts: [],
    currentModal: null,
    isSidebarOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    addToast: toast =>
      uiStore.setState(state => ({
        toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(7) }],
      })),
    removeToast: id =>
      uiStore.setState(state => ({
        toasts: state.toasts.filter(toast => toast.id !== id),
      })),
    showModal: modal =>
      uiStore.setState(() => ({
        currentModal: { ...modal, id: Math.random().toString(36).substring(7) },
      })),
    hideModal: () =>
      uiStore.setState(() => ({
        currentModal: null,
      })),
    toggleSidebar: () =>
      uiStore.setState(state => ({
        isSidebarOpen: !state.isSidebarOpen,
      })),
    toggleCart: () =>
      uiStore.setState(state => ({
        isCartOpen: !state.isCartOpen,
      })),
    toggleSearch: () =>
      uiStore.setState(state => ({
        isSearchOpen: !state.isSearchOpen,
      })),
  },
  'ui'
);

export const useUIStore = uiStore;
