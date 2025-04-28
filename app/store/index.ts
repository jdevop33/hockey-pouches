import { BaseState, createStore } from '@/store/config';

// Re-export base types and store creator
export type { BaseState };
export { createStore };

// Export store types
export type { CartState } from '@/store/slices/cartStore';
export type { UIState } from '@/store/slices/uiStore';
export type { AuthState } from '@/store/slices/authStore';
export type { ProductState } from '@/store/slices/productStore';

// Export store instances
export { useCartStore } from '@/store/slices/cartStore';
export { useUIStore } from '@/store/slices/uiStore';
export { useAuthStore } from '@/store/slices/authStore';
export { useProductStore } from '@/store/slices/productStore';
