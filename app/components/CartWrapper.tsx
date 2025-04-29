'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CartProvider with no SSR
const DynamicCartProvider = dynamic(
  () => import('@/context/CartContext').then(mod => mod.CartProvider),
  {
    ssr: false,
  }
);

interface CartWrapperProps {
  children: React.ReactNode;
}

const CartWrapper: React.FC<CartWrapperProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        setMounted(true);
      } catch (error) {
        console.error('Error mounting CartWrapper:', error);
        setHasError(true);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // During SSR or before hydration, render children without cart context
  if (!mounted || hasError) {
    return (
      <div className="contents" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // After hydration, wrap with cart provider in a suspense boundary
  return (
    <Suspense
      fallback={
        <div className="contents" suppressHydrationWarning>
          {children}
        </div>
      }
    >
      <DynamicCartProvider>{children}</DynamicCartProvider>
    </Suspense>
  );
};

export default CartWrapper;
