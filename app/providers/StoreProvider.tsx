'use client';

import { ReactNode } from 'react';
import { useHydration } from '@/store/initializeStore';
import { useAuthStore } from '@/store/slices/authStore';
import { useCartStore } from '@/store/slices/cartStore';
import { useProductStore } from '@/store/slices/productStore';
import { useUIStore } from '@/store/slices/uiStore';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Check hydration status of all stores
  const authHydrated = useHydration(useAuthStore);
  const cartHydrated = useHydration(useCartStore);
  const productHydrated = useHydration(useProductStore);
  const uiHydrated = useHydration(useUIStore);

  // Only render children when all stores are hydrated
  const allHydrated = authHydrated && cartHydrated && productHydrated && uiHydrated;

  // During hydration, render a minimal div to avoid layout shift
  if (!allHydrated) {
    return <div className="contents">{children}</div>;
  }

  // Once hydrated, render children
  return <>{children}</>;
}
