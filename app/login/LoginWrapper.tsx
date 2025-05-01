'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Import the client component dynamically with proper configuration
const LoginClient = dynamic(() => import('./LoginClient').then(mod => mod.default), {
  loading: () => (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center">
      <LoadingSpinner size="large" color="gold" />
      <p className="mt-4 text-gold-500">Loading login page...</p>
    </div>
  ),
  ssr: false, // Disable SSR for this component
});

export default function LoginWrapper() {
  return <LoginClient />;
}
