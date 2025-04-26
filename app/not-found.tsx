import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-dark-500 flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="bg-dark-400 rounded-xl p-6 shadow-xl md:p-10">
        <h1 className="text-gold-500 mb-4 text-3xl font-bold md:text-4xl">404 - Page Not Found</h1>
        <p className="mb-6 text-gray-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-gold-500 text-dark-800 hover:bg-gold-400 rounded-md px-4 py-2 font-medium transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
