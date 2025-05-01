'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// Force dynamic rendering because useSearchParams needs client-side rendering
export const dynamic = 'force-dynamic';

// Inner component to read search params, allowing Suspense boundary
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = router.push('orderId');
  const paymentMethod = router.push('method');
  const [isMounted, setIsMounted] = React.useState(false);
  const auth = useAuth();
  const { user } = auth;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted, show a simple loading state
  if (!isMounted) {
    return (
      <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-10 w-10 animate-pulse text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Confirming Order...</h1>
      </div>
    );
  }

  // Payment instructions based on method
  const renderPaymentInstructions = () => {
    if (!paymentMethod) return null;

    switch (paymentMethod) {
      case 'credit-card':
        return (
          <div className="mt-6 rounded-md bg-blue-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-blue-800">Payment Instructions:</h3>
            <p className="mb-2 text-blue-700">To complete your order, please follow these steps:</p>
            <ol className="list-decimal space-y-1 pl-5 text-blue-700">
              <li>Check your email for payment instructions</li>
              <li>Follow the link to our secure payment page</li>
              <li>Complete the payment form with your credit card details</li>
              <li>Once payment is confirmed, your order will be processed</li>
            </ol>
          </div>
        );
      case 'etransfer':
        return (
          <div className="mt-6 rounded-md bg-blue-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-blue-800">E-Transfer Instructions:</h3>
            <p className="mb-2 text-blue-700">
              Please send your e-transfer to the following email:
            </p>
            <p className="mb-2 font-medium text-blue-900">payments@hockeypouches.com</p>
            <p className="mb-2 text-blue-700">
              <span className="font-semibold">Important:</span> Include your order number{' '}
              <span className="font-semibold">#{orderId}</span> in the message field.
            </p>
          </div>
        );
      case 'btc':
        return (
          <div className="mt-6 rounded-md bg-blue-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-blue-800">Bitcoin Payment Instructions:</h3>
            <p className="mb-2 text-blue-700">
              Please check your email for Bitcoin payment instructions, including:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-blue-700">
              <li>Bitcoin address for payment</li>
              <li>Exact amount to send</li>
              <li>Instructions for confirming your payment</li>
            </ul>
            <p className="mt-2 text-blue-700">
              <span className="font-semibold">Important:</span> Always include your order number{' '}
              <span className="font-semibold">#{orderId}</span> when confirming payment.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-xl sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-10 w-10 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mb-3 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
      {orderId ? (
        <p className="mb-6 text-gray-600">
          Thank you{user ? `, ${user.name}` : ''} for your order! Your order number is{' '}
          <span className="font-semibold text-gray-800">#{orderId}</span>. You will receive an email
          confirmation shortly.
        </p>
      ) : (
        <p className="mb-6 text-gray-600">
          Thank you for your order! You will receive an email confirmation shortly.
        </p>
      )}

      {/* Payment instructions */}
      {renderPaymentInstructions()}

      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        {orderId && user && (
          <Link
            href={`/dashboard/orders/${orderId}`}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            View Order Details
          </Link>
        )}
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-100 py-12">
        {/* Wrap component using useSearchParams in Suspense */}
        <Suspense fallback={<div className="p-8 text-center">Loading confirmation...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </Layout>
  );
}
