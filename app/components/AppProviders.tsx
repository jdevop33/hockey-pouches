import React, { ReactNode } from 'react';
import ClientProviders from './ClientProviders';

// Import components but comment them out for now
// import { Providers } from '../providers';
// import { CartProvider } from '../context/CartContext';
// import { Analytics } from '@vercel/analytics/react';
// import { WebVitals } from '../_components/web-vitals';
// import { DatabaseInit } from '../_components/database-init';
// import { AnalyticsScripts } from '../_components/analytics-scripts';
// import { AuthProvider } from '../context/AuthContext';
// import { ToastProvider } from '../context/ToastContext';
// import { CsrfProvider } from '../context/CsrfContext';

interface AppProvidersProps {
  children: ReactNode;
}

// This is now a server component that delegates to ClientProviders
export default function AppProviders({ children }: AppProvidersProps) {
  return <ClientProviders>{children}</ClientProviders>;
}
