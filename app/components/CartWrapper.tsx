'use client';

import React, { ReactNode, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CartProvider with no SSR
const DynamicCartProvider = dynamic(
  () => import('../context/CartContext').then(mod => ({ default: mod.CartProvider })),
  { ssr: false }
);

interface CartWrapperProps {
  children: ReactNode;
}

const CartWrapper: React.FC<CartWrapperProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  // This ensures we only render the CartProvider on the client side
  useEffect(() => {
    try {
      // Use a try-catch in case there's any initialization issues
      setIsClient(true);
    } catch (error) {
      console.error('Error initializing CartWrapper:', error);
      setHasError(true);
    }
  }, []);

  // If there's an error or we're on the server, just render children
  if (hasError || !isClient) {
    return <>{children}</>;
  }

  // Use an error boundary approach for the CartProvider
  try {
    return (
      <Suspense fallback={<>{children}</>}>
        <DynamicCartProvider>{children}</DynamicCartProvider>
      </Suspense>
    );
  } catch (error) {
    console.error('CartProvider rendering error:', error);
    return <>{children}</>;
  }
};

export default CartWrapper;
