'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { ThemeProviderClient } from './theme-provider-client';

// Simple client component wrapper that handles providers with client-side initialization
export default function ClientProviders({ children }: { children: ReactNode }) {
  // Handle hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During server-side rendering or initial hydration, return just the children
  if (!mounted) {
    return <div className="contents">{children}</div>;
  }

  // Once mounted on client, wrap in providers
  return <ThemeProviderClient>{children}</ThemeProviderClient>;
}
