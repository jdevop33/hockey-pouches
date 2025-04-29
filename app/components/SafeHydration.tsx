'use client';

import React, { useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// SafeHydration ensures that client components are only rendered after hydration
// is complete to prevent "Cannot read properties of undefined (reading 'call')" errors
export function SafeHydration({ children, fallback }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use a timeout to ensure we're fully hydrated
    const timeout = setTimeout(() => {
      try {
        setIsHydrated(true);
      } catch (error) {
        console.error('Error during hydration:', error);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // During SSR or before hydration, render fallback or null
  if (!isHydrated) {
    return fallback ? <>{fallback}</> : null;
  }

  // After hydration, render children in an error boundary
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error rendering hydrated content:', error);
    return fallback ? <>{fallback}</> : null;
  }
}
