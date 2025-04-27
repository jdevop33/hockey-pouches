'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/layout/NewLayout'; // Using relative path for now
import Logo from '../components/ui/Logo';

// Loading component
function AboutLoading() {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>

          {/* Company Story Loading */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <div className="mb-6 h-6 w-1/4 animate-pulse rounded bg-gray-200"></div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="h-64 animate-pulse rounded-lg bg-gray-200 p-4">
                <div className="flex h-full items-center justify-center">
                  <div className="h-32 w-32 animate-pulse rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Values Loading */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <div className="mb-6 h-6 w-1/4 animate-pulse rounded bg-gray-200"></div>
            <div className="grid gap-8 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Main content component
function AboutContent() {
  return (
    <Layout>
      <div className="min-h-screen bg-dark-500 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-gold-500">About PUXX</h1>

          {/* Our Story */}
          <div className="mb-12 rounded-lg border border-gold-500/10 bg-dark-600 p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-white">Our Story</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-gray-300">
                  PUXX began with a simple question: "Why settle for less?" We're a team of experts
                  who set out to create the best nicotine pouch experience possible.
                </p>
                <p className="text-gray-300">
                  As users ourselves, we understand what matters most—consistent quality, great
                  flavor, and a product that fits your active life. We couldn't find anything that
                  met our standards, so we created something better.
                </p>
                <p className="text-gray-300">
                  Using only top-grade ingredients sourced from Europe, we developed PUXX—a premium
                  brand built on quality you can taste and feel. Thousands of customers have already
                  made the switch to something better.
                </p>
              </div>
              <div className="relative flex h-64 items-center justify-center">
                <Logo size="large" className="scale-150" />
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-12 rounded-lg border border-gold-500/10 bg-dark-600 p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-white">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20">
                  <svg
                    className="h-6 w-6 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Quality First</h3>
                <p className="text-gray-300">
                  We never compromise on ingredients or craftsmanship. Every PUXX pouch is made with
                  the same care and attention to detail, guaranteed.
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20">
                  <svg
                    className="h-6 w-6 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">
                  Community of Excellence
                </h3>
                <p className="text-gray-300">
                  Join thousands who've upgraded to PUXX. Our customers share a common appreciation
                  for the best things in life—no compromises, no settling.
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20">
                  <svg
                    className="h-6 w-6 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Constant Innovation</h3>
                <p className="text-gray-300">
                  We never stop improving. Our team is always working on new flavors, better
                  formulas, and improved experiences to stay ahead of what you need.
                </p>
              </div>
            </div>
          </div>

          {/* Our Strengths */}
          <div className="mb-12 rounded-lg border border-gold-500/10 bg-dark-600 p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-white">Our Distinction</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20">
                  <Image
                    src="/images/products/cool-mint-6mg.png"
                    alt="Superior Quality"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Premium Ingredients</h3>
                <p className="text-gray-300">
                  We use only medical-grade nicotine and premium flavor extracts, sourced globally
                  to ensure every pouch delivers exceptional quality.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20">
                  <Image
                    src="/images/products/berry/berry-12mg.png"
                    alt="Perfect Balance"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Perfect Balance</h3>
                <p className="text-gray-300">
                  Each PUXX variety delivers exactly the right balance of flavor, strength, and
                  comfort—created for those who appreciate the details.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20">
                  <Image
                    src="/images/products/citrus/citrus-12mg.png"
                    alt="Revolutionary Design"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Smart Design</h3>
                <p className="text-gray-300">
                  Our specially designed pouches fit comfortably and stay discreet, making them
                  perfect for any situation, anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Experience */}
          <div className="mb-12 rounded-lg border border-gold-500/10 bg-gradient-to-r from-dark-700 to-dark-800 p-8 shadow-md">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gold-500">A Superior Experience</h2>
              <p className="text-lg text-gray-300">For those who refuse to compromise</p>
            </div>
            <p className="mx-auto mb-8 max-w-3xl text-center text-gray-300">
              While others cut corners, PUXX takes the extra steps. Each pouch is made with the
              finest ingredients available, giving you a clean, consistent experience without smoke
              or odor. It's the upgrade you'll notice from the very first use.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-gold-500/10 bg-dark-700/70 p-6 backdrop-blur-sm transition-all hover:border-gold-500/30">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/30">
                  <span className="text-xl font-bold text-gold-500">01</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold text-gold-500">
                  Discrete Luxury
                </h3>
                <p className="text-center text-gray-300">
                  A refined alternative delivering nicotine without smoke or odor, preserving your
                  composure and presence in any setting.
                </p>
              </div>

              <div className="rounded-lg border border-gold-500/10 bg-dark-700/70 p-6 backdrop-blur-sm transition-all hover:border-gold-500/30">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/30">
                  <span className="text-xl font-bold text-gold-500">02</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold text-gold-500">
                  Performance Enhancing
                </h3>
                <p className="text-center text-gray-300">
                  Engineered to support your concentration and focus during crucial moments,
                  allowing you to maintain peak performance.
                </p>
              </div>

              <div className="rounded-lg border border-gold-500/10 bg-dark-700/70 p-6 backdrop-blur-sm transition-all hover:border-gold-500/30">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/30">
                  <span className="text-xl font-bold text-gold-500">03</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold text-gold-500">
                  Sophisticated Formulation
                </h3>
                <p className="text-center text-gray-300">
                  A perfect balance of flavor and effect, created through pharmaceutical-grade
                  ingredients that deliver consistent satisfaction with every use.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="rounded-lg border border-gold-500/20 bg-dark-600 p-8 text-center shadow-md">
            <h2 className="mb-3 text-2xl font-bold text-gold-500">Experience PUXX Today</h2>
            <p className="mx-auto mb-8 max-w-2xl text-gray-300">
              Join the ranks of discerning individuals who demand more from their nicotine
              experience. PUXX delivers a level of sophistication and satisfaction previously
              unavailable in Canada.
            </p>
            <Link
              href="/products"
              className="inline-block rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-900 shadow-sm transition-all hover:bg-gold-400 hover:shadow-gold"
            >
              Explore Our Products
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Main export with Suspense boundary
export default function AboutPage() {
  return (
    <Suspense fallback={<AboutLoading />}>
      <AboutContent />
    </Suspense>
  );
}
