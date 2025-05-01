'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const referralCode = params.id as string;

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
      <div className="relative overflow-hidden bg-dark-900 py-24 text-white">
        {/* Background Elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="mb-4 inline-block rounded-full bg-gold-500/20 px-4 py-1.5 text-sm font-medium text-gold-500">
              Exclusive Invitation
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Welcome to PUXX Premium Nicotine Pouches
              </span>
            </h1>

            {isLoading ? (
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gold-500"></div>
              </div>
            ) : error ? (
              <div className="mt-4 rounded-xl border border-red-500/10 bg-red-900/10 p-4 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-xl text-gray-300">
                  You've been invited by{' '}
                  <span className="font-semibold text-gold-500">{referrer?.name}</span>!
                </p>
                <p className="mt-3 text-gray-400">
                  Join our community of discerning adults who appreciate premium nicotine products.
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center justify-center rounded-md bg-gold-500 px-8 py-3.5 text-base font-medium text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-lg"
              >
                <span>Create an Account</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                href="/products"
                className="group flex items-center justify-center rounded-md border border-gold-500/30 bg-dark-800/50 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700"
              >
                <span>Browse Products</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="mt-24">
            <h2 className="mb-8 text-center text-3xl font-bold text-gold-500">Why Choose PUXX?</h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="hover:shadow-gold/5 transform rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 hover:translate-y-[-8px]">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Premium Quality</h3>
                <p className="text-gray-400">
                  Our pouches are crafted with pharmaceutical-grade ingredients, ensuring an
                  exceptional experience with every use.
                </p>
              </div>

              <div className="hover:shadow-gold/5 transform rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 hover:translate-y-[-8px]">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Sophisticated Design</h3>
                <p className="text-gray-400">
                  Each pouch is designed for optimal comfort and balanced nicotine release,
                  providing a discreet and elegant experience.
                </p>
              </div>

              <div className="hover:shadow-gold/5 transform rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 hover:translate-y-[-8px]">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Distinguished Flavors</h3>
                <p className="text-gray-400">
                  Meticulously crafted flavor profiles that deliver consistent excellence, from
                  refreshing mint to sophisticated fruit variations.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/about"
                className="group inline-flex items-center text-gold-500 transition-colors duration-300 hover:text-gold-400"
              >
                <span>Learn more about our craftsmanship</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
