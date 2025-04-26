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
                  PUXX was founded by connoisseurs and innovators seeking to redefine the premium
                  nicotine experience through sophisticated, high-performance pouches crafted for
                  those who demand excellence.
                </p>
                <p className="text-gray-300">
                  As enthusiasts of refined experiences, we understood the importance of maintaining
                  peak performance while enjoying the focus and clarity that premium nicotine can
                  provide. Our search for a solution that wouldn't compromise our standards led us
                  to create something extraordinary.
                </p>
                <p className="text-gray-300">
                  We began by sourcing the finest ingredients from across Europe, developing
                  proprietary blends that deliver unparalleled satisfaction. What started as a
                  pursuit of personal perfection quickly became PUXX – a luxury brand dedicated to
                  providing connoisseurs with the highest quality nicotine pouches designed for
                  those who accept nothing less than exceptional.
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
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Uncompromising Quality</h3>
                <p className="text-gray-300">
                  Excellence is non-negotiable. Every PUXX product represents our commitment to
                  superior craftsmanship, with meticulous attention to detail and consistency in
                  every pouch.
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
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Exclusive Community</h3>
                <p className="text-gray-300">
                  We cultivate a distinguished network of discerning individuals who recognize and
                  demand superior experiences. Our commitment extends beyond products to fostering
                  connections among those who share our passion for excellence.
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
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Relentless Innovation</h3>
                <p className="text-gray-300">
                  We push boundaries, continuously refining our formulations to create experiences
                  that anticipate and exceed expectations. Our commitment to innovation ensures PUXX
                  remains at the forefront of luxury nicotine experiences.
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
                    src="/images/products/mint/mint-12mg.png"
                    alt="Superior Quality"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gold-500">
                  Exceptional Craftsmanship
                </h3>
                <p className="text-gray-300">
                  Globally-sourced excellence in every pouch, with pharmaceutical-grade nicotine and
                  premium ingredients for an unparalleled experience.
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
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Sophisticated Balance</h3>
                <p className="text-gray-300">
                  A masterful harmony of nuanced flavor profiles, optimal strength, and refined
                  comfort designed for those who appreciate the extraordinary.
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
                <h3 className="mb-2 text-xl font-semibold text-gold-500">Innovative Design</h3>
                <p className="text-gray-300">
                  Engineered for discretion and comfort with refined contours that ensure a seamless
                  experience in any setting or activity.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Experience */}
          <div className="mb-12 rounded-lg border border-gold-500/10 bg-gradient-to-r from-dark-700 to-dark-800 p-8 shadow-md">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gold-500">
                Elevated Nicotine Experience
              </h2>
              <p className="text-lg text-gray-300">
                Meticulously Crafted for Those Who Demand Nothing Less Than Excellence
              </p>
            </div>
            <p className="mx-auto mb-8 max-w-3xl text-center text-gray-300">
              In a world of compromise, PUXX stands apart. We've meticulously crafted these premium
              nicotine pouches from the highest-grade sources available, delivering an unparalleled
              experience of sophistication without smoke or odor that integrates seamlessly into
              your lifestyle.
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
