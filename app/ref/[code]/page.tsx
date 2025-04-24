'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const referralCode = params.code as string;
  
  const [referrer, setReferrer] = useState<{ name: string; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateReferralCode = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/referrals/validate?code=${referralCode}`);
        
        if (!response.ok) {
          throw new Error('Invalid referral code');
        }
        
        const data = await response.json();
        setReferrer(data.referrer);
        
        // Store the referral code in localStorage for later use during registration/checkout
        localStorage.setItem('referralCode', referralCode);
        
      } catch (err) {
        console.error('Error validating referral code:', err);
        setError('The referral code is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (referralCode) {
      validateReferralCode();
    }
  }, [referralCode]);

  // If user is already logged in, redirect to products page
  useEffect(() => {
    if (user) {
      router.push('/products');
    }
  }, [user, router]);

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Welcome to Hockey Pouches!
            </h1>
            
            {isLoading ? (
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xl text-gray-600">
                  You've been invited by <span className="font-semibold">{referrer?.name}</span>!
                </p>
                <p className="mt-2 text-gray-600">
                  Sign up now to get access to premium hockey pouches and products.
                </p>
              </div>
            )}
            
            <div className="mt-8 flex justify-center space-x-4">
              <Link 
                href="/register" 
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Sign Up Now
              </Link>
              <Link 
                href="/products" 
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Browse Products
              </Link>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Why Choose Hockey Pouches?</h2>
            
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Premium Quality</h3>
                <p className="mt-2 text-gray-600">
                  Our pouches are made with the highest quality materials to ensure durability and performance.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Fair Pricing</h3>
                <p className="mt-2 text-gray-600">
                  Competitive prices without compromising on quality. Get the best value for your money.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Fast Shipping</h3>
                <p className="mt-2 text-gray-600">
                  Quick processing and shipping to get your products to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
