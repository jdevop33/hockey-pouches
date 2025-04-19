'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/layout/NewLayout';

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
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
            About Hockey Pouches
          </h1>

          {/* Our Story */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Story</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Hockey Puxx was founded by a group of passionate hockey players who were looking
                  for a better way to enjoy nicotine without the drawbacks of traditional tobacco
                  products.
                </p>
                <p className="text-gray-600">
                  As athletes, we understood the importance of maintaining peak physical condition
                  while still enjoying the focus and relaxation that nicotine can provide. Our
                  search for a solution that wouldn't compromise our lung capacity, endurance, or
                  overall health led us to discover nicotine pouches.
                </p>
                <p className="text-gray-600">
                  We started importing premium European nicotine pouches for our own team, and soon
                  other players were asking where they could get them. That's when Hockey Puxx was
                  born - a brand dedicated to providing Canadian hockey players with the highest
                  quality nicotine pouches designed specifically for their lifestyle.
                </p>
              </div>
              <div className="relative flex h-64 items-center justify-center">
                <Image
                  src="/images/logo/hockey-logo2.png"
                  alt="Hockey Puxx Logo"
                  width={400}
                  height={200}
                  style={{ objectFit: 'contain' }}
                  className="max-h-full max-w-full"
                />
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg
                    className="text-primary-600 h-6 w-6"
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
                <h3 className="mb-2 text-xl font-semibold">Quality</h3>
                <p className="text-gray-600">
                  We never compromise on quality. Our products are designed for athletes who demand
                  the best, with consistent performance in every pouch.
                </p>
              </div>
              <div>
                <div className="bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg
                    className="text-primary-600 h-6 w-6"
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
                <h3 className="mb-2 text-xl font-semibold">Partnership</h3>
                <p className="text-gray-600">
                  We believe in building a community of hockey players who share our passion. We
                  support local teams and are committed to enhancing the hockey experience both on
                  and off the ice.
                </p>
              </div>
              <div>
                <div className="bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg
                    className="text-primary-600 h-6 w-6"
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
                <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
                <p className="text-gray-600">
                  We stay ahead of the game, continuously improving our products to meet the unique
                  needs of hockey players and developing new solutions that enhance performance and
                  recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Team</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary-100 relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full">
                  <Image
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="John Smith"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="text-xl font-semibold">Mike Johnson</h3>
                <p className="text-gray-600">Founder & Former NHL Player</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full">
                  <Image
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Sarah Johnson"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="text-xl font-semibold">Sarah Williams</h3>
                <p className="text-gray-600">Product Development & Nutritionist</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full">
                  <Image
                    src="https://randomuser.me/api/portraits/men/67.jpg"
                    alt="Michael Brown"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="text-xl font-semibold">Alex Chen</h3>
                <p className="text-gray-600">Community Manager & Amateur Goalie</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">What Our Customers Say</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6">
                <div className="mb-4 flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="mb-4 text-gray-600">
                  &quot;Hockey Puxx has been a game-changer for me during the season. I can use them
                  discreetly between periods for that extra boost, and they don't affect my
                  breathing or performance like other products did. The mint flavor is perfect for
                  keeping me alert during those late-night games.&quot;
                </p>
                <div className="flex items-center">
                  <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src="https://randomuser.me/api/portraits/men/41.jpg"
                      alt="David Wilson"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">David Wilson</p>
                    <p className="text-sm text-gray-500">Defenseman, Toronto Wolves</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <div className="mb-4 flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="mb-4 text-gray-600">
                  &quot;As a hockey coach, I was looking for an alternative to traditional tobacco
                  products for myself and to recommend to my adult players. Hockey Puxx pouches are
                  perfect - they're discreet, don't require spitting, and don't leave a mess in the
                  locker room. Plus, the team discount program is a great perk for our club.&quot;
                </p>
                <div className="flex items-center">
                  <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src="https://randomuser.me/api/portraits/women/33.jpg"
                      alt="Jennifer Lee"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">Jennifer Lee</p>
                    <p className="text-sm text-gray-500">Head Coach, Vancouver Vipers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary-600 rounded-lg p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold">Ready to Join the Team?</h2>
            <p className="mb-6">
              Join thousands of hockey players across Canada who trust Hockey Puxx for a clean,
              discreet nicotine experience.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="text-primary-600 rounded-md bg-white px-6 py-3 text-center font-medium hover:bg-gray-100"
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className="hover:bg-primary-700 rounded-md border-2 border-white bg-transparent px-6 py-3 text-center font-medium text-white"
              >
                Shop Now
              </Link>
            </div>
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
