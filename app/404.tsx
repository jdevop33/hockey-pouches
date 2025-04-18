'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Layout from './components/layout/Layout';

// Loading component
function NotFoundLoading() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="animate-pulse">
          <div className="mb-4 h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="mb-4 h-8 w-64 rounded bg-gray-200"></div>
          <div className="mb-8 h-4 w-96 rounded bg-gray-200"></div>
          <div className="h-10 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
    </Layout>
  );
}

// Content component
function NotFoundContent() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary-600">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-primary-600 px-6 py-3 text-white shadow-md hover:bg-primary-700"
        >
          Return Home
        </Link>
      </div>
    </Layout>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundLoading />}>
      <NotFoundContent />
    </Suspense>
  );
}
