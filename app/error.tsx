'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-dark-500 flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="bg-dark-400 rounded-xl p-6 shadow-xl md:p-10">
        <h1 className="text-gold-500 mb-4 text-3xl font-bold md:text-4xl">Something went wrong</h1>
        <p className="mb-6 text-gray-300">{error?.message || 'An unexpected error occurred'}</p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <button
            onClick={reset}
            className="bg-gold-500 text-dark-800 hover:bg-gold-400 rounded-md px-4 py-2 font-medium transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-gold-500/30 text-gold-500 hover:border-gold-500/60 hover:bg-dark-300 rounded-md border bg-transparent px-4 py-2 font-medium transition-all"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
