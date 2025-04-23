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
  const orderId = searchParams.get('orderId'); 
  const { user } = useAuth();

  return (
      <div className="mx-auto max-w-xl text-center bg-white p-8 sm:p-12 rounded-lg shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
          {orderId ? (
              <p className="text-gray-600 mb-6">
              Thank you{user ? `, ${user.name}` : ''} for your order! Your order number is 
              <span className="font-semibold text-gray-800">#{orderId}</span>.
              You will receive an email confirmation shortly (feature pending).
              </p>
          ) : (
              <p className="text-gray-600 mb-6">
              Thank you for your order! You will receive an email confirmation shortly (feature pending).
              </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
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
      <div className="bg-gray-100 min-h-[70vh] flex items-center justify-center py-12">
          {/* Wrap component using useSearchParams in Suspense */}
          <Suspense fallback={<div className="text-center p-8">Loading confirmation...</div>}>
             <SuccessContent />
          </Suspense>
      </div>
    </Layout>
  );
}
