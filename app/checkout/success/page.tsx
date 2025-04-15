'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  // If user refreshes this page, redirect to home after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Order Successful!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your order. We've received your request and will contact you shortly to confirm the details and provide payment options.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">What happens next?</h2>
              <ol className="text-left space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold mr-3">1</span>
                  <span>Our team will review your order and send you a confirmation email within 24 hours.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold mr-3">2</span>
                  <span>You'll receive payment instructions with several options to choose from (e-transfer, credit card, etc.).</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold mr-3">3</span>
                  <span>Once payment is confirmed, we'll ship your order with tracking information.</span>
                </li>
              </ol>
            </div>
            <p className="text-md text-gray-500 mb-6">
              If you have any questions, please contact us at <a href="mailto:info@hockeypouches.ca" className="text-primary-600 hover:text-primary-500">info@hockeypouches.ca</a> or call us at <a href="tel:2504155678" className="text-primary-600 hover:text-primary-500">(250) 415-5678</a>.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
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
