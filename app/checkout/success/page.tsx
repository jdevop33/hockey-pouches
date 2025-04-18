'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout';

// Content component that uses useSearchParams
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Even if not used, Next.js detects this

  // If user refreshes this page, redirect to home after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900">Order Successful!</h1>
            <p className="mb-8 text-lg text-gray-600">
              Thank you for your order. We've received your request and will contact you shortly to
              confirm the details and provide payment options.
            </p>
            <div className="mb-8 rounded-lg bg-gray-50 p-6">
              <h2 className="mb-3 text-xl font-semibold text-gray-800">What happens next?</h2>
              <ol className="space-y-4 text-left text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-800">
                    1
                  </span>
                  <span>
                    Our team will review your order and send you a confirmation email within 24
                    hours.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-800">
                    2
                  </span>
                  <span>
                    You'll receive payment instructions with several options to choose from
                    (e-transfer, credit card, etc.).
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-800">
                    3
                  </span>
                  <span>
                    Once payment is confirmed, we'll ship your order with tracking information.
                  </span>
                </li>
              </ol>
            </div>
            <p className="text-md mb-6 text-gray-500">
              If you have any questions, please contact us at{' '}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'jesse@pouchbuzz.ca'}`}
                className="text-primary-600 hover:text-primary-500"
              >
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'jesse@pouchbuzz.ca'}
              </a>{' '}
              or call us at{' '}
              <a href="tel:2504155678" className="text-primary-600 hover:text-primary-500">
                (250) 415-5678
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Loading component
function SuccessLoading() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-50"></div>
            <div className="mx-auto mb-4 h-8 w-1/2 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto mb-8 h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-8 rounded-lg bg-gray-50 p-6">
              <div className="mx-auto mb-3 h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-3 h-6 w-6 shrink-0 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <div className="mx-auto h-10 w-40 animate-pulse rounded bg-gray-200"></div>
              <div className="mx-auto h-10 w-40 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Layout>
      <Suspense fallback={<SuccessLoading />}>
        <SuccessContent />
      </Suspense>
    </Layout>
  );
}
