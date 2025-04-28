'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Providers } from '../providers';
import { CartProvider } from '../context/CartContext';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '../_components/web-vitals';
import { DatabaseInit } from '../_components/database-init';

// Import AnalyticsScripts directly in this client component
import { AnalyticsScripts } from '../_components/analytics-scripts';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return a placeholder during SSR to avoid hydration mismatches
  if (!isHydrated) {
    return <div className="contents">{children}</div>;
  }

  // Once hydrated, render all client components and providers
  return (
    <>
      {/* Analytics scripts will be injected into the head via next/script */}
      <AnalyticsScripts />

      {/* Theme and Auth providers */}
      <Providers>
        {/* Analytics tracking */}
        <WebVitals />
        <Analytics />
        <DatabaseInit />

        {/* Cart functionality */}
        <CartProvider>{children}</CartProvider>
      </Providers>
    </>
  );
}
