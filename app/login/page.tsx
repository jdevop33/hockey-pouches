'use client';

import { Suspense } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LoginForm from './LoginForm';

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
      <LoginForm />
    </Suspense>
  );
}
