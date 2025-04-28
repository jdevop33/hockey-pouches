'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/slices/authStore';
import { useCartStore } from '@/store/slices/cartStore';
import { useProductStore } from '@/store/slices/productStore';
import { useUIStore } from '@/store/slices/uiStore';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Initialize stores if needed
  useAuthStore.getState();
  useCartStore.getState();
  useProductStore.getState();
  useUIStore.getState();

  return <>{children}</>;
}
