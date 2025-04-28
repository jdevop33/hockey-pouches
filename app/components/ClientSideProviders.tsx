'use client';

import React, { useState, useEffect, ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Providers with no SSR to avoid hydration issues
const DynamicProviders = dynamic(
  () => import('../providers').then(mod => ({ default: mod.Providers })),
  {
    ssr: false,
  }
);

interface ClientSideProvidersProps {
  children: ReactNode;
}

// This component ensures all client-side providers are initialized properly
// and prevents hydration mismatches
export default function ClientSideProviders({ children }: ClientSideProvidersProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated once it runs on client
    setIsHydrated(true);
  }, []);

  // During server rendering or before hydration, render children without providers
  // to prevent "Cannot read properties of undefined (reading 'call')" errors
  if (!isHydrated) {
    // Return a placeholder with the same structure to avoid layout shifts
    return <div className="contents">{children}</div>;
  }

  // Once hydrated, wrap with all providers
  // Using Suspense to handle any loading states during dynamic import
  return (
    <Suspense fallback={<div className="contents">{children}</div>}>
      <DynamicProviders>{children}</DynamicProviders>
    </Suspense>
  );
}
