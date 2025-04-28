'use client';

import React, { useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: React.ReactNode;
}

// SafeHydration ensures that client components are only rendered after hydration
// is complete to prevent "Cannot read properties of undefined (reading 'call')" errors
export function SafeHydration({ children }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This will run only on the client, after hydration
    setIsHydrated(true);
  }, []);

  // Only render children after hydration is complete
  // This prevents errors during the server-to-client transition
  return isHydrated ? <>{children}</> : null;
}
