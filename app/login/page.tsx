import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Import the client component dynamically with SSR disabled
const LoginClient = dynamic(() => import('./LoginClient'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center">
      <LoadingSpinner size="large" color="gold" />
      <p className="mt-4 text-gold-500">Loading login page...</p>
    </div>
  ),
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center">
          <LoadingSpinner size="large" color="gold" />
          <p className="mt-4 text-gold-500">Loading login page...</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
