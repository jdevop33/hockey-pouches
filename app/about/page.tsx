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
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">About PUXX</h1>

          {/* Our Story */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Story</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-gray-600">
                  PUXX was founded by connoisseurs and innovators seeking to redefine the premium
                  nicotine experience through sophisticated, high-performance pouches crafted for
                  those who demand excellence.
                </p>
                <p className="text-gray-600">
                  As enthusiasts of refined experiences, we understood the importance of maintaining
                  peak performance while enjoying the focus and clarity that premium nicotine can
                  provide. Our search for a solution that wouldn't compromise our standards led us
                  to create something extraordinary.
                </p>
                <p className="text-gray-600">
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
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
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
                <h3 className="mb-2 text-xl font-semibold">Uncompromising Quality</h3>
                <p className="text-gray-600">
                  Excellence is non-negotiable. Every PUXX product represents our commitment to
                  superior craftsmanship, with meticulous attention to detail and consistency in
                  every pouch.
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
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
                <h3 className="mb-2 text-xl font-semibold">Exclusive Community</h3>
                <p className="text-gray-600">
                  We cultivate a distinguished network of discerning individuals who recognize and
                  demand superior experiences. Our commitment extends beyond products to fostering
                  connections among those who share our passion for excellence.
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
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
                <h3 className="mb-2 text-xl font-semibold">Relentless Innovation</h3>
                <p className="text-gray-600">
                  We push boundaries, continuously refining our formulations to create experiences
                  that anticipate and exceed expectations. Our commitment to innovation ensures PUXX
                  remains at the forefront of luxury nicotine experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Our Strengths */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Distinction</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Image
                    src="/images/products/mint/mint-12mg.png"
                    alt="Superior Quality"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Exceptional Craftsmanship</h3>
                <p className="text-gray-600">
                  Globally-sourced excellence in every pouch, with pharmaceutical-grade nicotine and
                  premium ingredients for an unparalleled experience.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Image
                    src="/images/products/berry/berry-12mg.png"
                    alt="Perfect Balance"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Sophisticated Balance</h3>
                <p className="text-gray-600">
                  A masterful harmony of nuanced flavor profiles, optimal strength, and refined
                  comfort designed for those who appreciate the extraordinary.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Image
                    src="/images/products/citrus/citrus-12mg.png"
                    alt="Revolutionary Design"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Innovative Design</h3>
                <p className="text-gray-600">
                  Engineered for discretion and comfort with refined contours that ensure a seamless
                  experience in any setting or activity.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Experience */}
          <div className="mb-12 rounded-lg bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white shadow-md">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold">Elevated Nicotine Experience</h2>
              <p className="text-lg">
                Meticulously Crafted for Those Who Demand Nothing Less Than Excellence
              </p>
            </div>
            <p className="mx-auto mb-8 max-w-3xl text-center">
              In a world of compromise, PUXX stands apart. We've meticulously crafted these premium
              nicotine pouches from the highest-grade sources available, delivering an unparalleled
              experience of sophistication without smoke or odor that integrates seamlessly into
              your lifestyle.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500">
                  <span className="text-xl font-bold text-white">01</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold">Discrete Luxury</h3>
                <p className="text-center">
                  A refined alternative delivering nicotine without smoke or odor, preserving your
                  composure and presence in any setting.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500">
                  <span className="text-xl font-bold text-white">02</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold">Superior Satisfaction</h3>
                <p className="text-center">
                  Expertly balanced formulations provide consistent release and lasting satisfaction
                  with refined flavor profiles that exceed expectations.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500">
                  <span className="text-xl font-bold text-white">03</span>
                </div>
                <h3 className="mb-3 text-center text-xl font-semibold">Effortless Integration</h3>
                <p className="text-center">
                  Seamlessly enhances your lifestyle with discreet, convenient pouches that fit
                  naturally into moments of focus, creativity, and social engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Our Team</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-primary-100">
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
                <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-primary-100">
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
                <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-primary-100">
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
          <div className="rounded-lg bg-primary-600 p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold">Ready to Join the Team?</h2>
            <p className="mb-6">
              Join thousands of hockey players across Canada who trust Hockey Puxx for a clean,
              discreet nicotine experience.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-md bg-white px-6 py-3 text-center font-medium text-primary-600 hover:bg-gray-100"
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className="rounded-md border-2 border-white bg-transparent px-6 py-3 text-center font-medium text-white hover:bg-primary-700"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Distributor Program */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Become a Distributor</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Join our growing network of Hockey Pouches Distributors and build your own
                  business while sharing products you believe in. Our Distributor program is
                  designed for entrepreneurs who are passionate about hockey and want to earn
                  additional income.
                </p>
                <p className="text-gray-600">
                  As a Distributor, you'll have access to wholesale pricing, exclusive training
                  resources, and the ability to build your own team of referrers. Whether you're
                  looking for a side hustle or a full-time opportunity, our program offers
                  flexibility and support.
                </p>
                <div className="mt-6">
                  <Link
                    href="/distributor/apply"
                    className="inline-flex items-center rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    Apply to Become a Distributor
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 text-xl font-semibold">Distributor Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Higher commission rates (up to 25%)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Access to wholesale pricing</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Exclusive training and marketing materials
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Early access to new products</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Build your own team of referrers</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Dedicated support from our team</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Referral Program */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Referral Program</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="/images/referral-program.jpg"
                  alt="Referral Program"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Love our products? Share them with friends and earn rewards! Our referral program
                  makes it easy to earn commissions on every purchase made through your unique
                  referral link.
                </p>
                <h3 className="mt-4 text-xl font-semibold">How It Works</h3>
                <ol className="ml-5 list-decimal space-y-2 text-gray-600">
                  <li>Create an account on our website</li>
                  <li>Get your unique referral link from your dashboard</li>
                  <li>Share your link with friends, family, and followers</li>
                  <li>Earn 10% commission on every purchase made through your link</li>
                  <li>Withdraw your earnings or use them for future purchases</li>
                </ol>
                <div className="mt-6">
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    Join Our Referral Program
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="mb-12 rounded-lg bg-gradient-to-br from-primary-700 to-primary-900 p-8 text-white shadow-md">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
              <p className="mx-auto mb-8 max-w-3xl text-lg">
                We're on a mission to empower discerning adults with premium nicotine products while
                creating opportunities for entrepreneurship and community building.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-semibold">Quality Products</h3>
                <p>
                  We're committed to providing the highest quality tobacco-free nicotine pouches
                  crafted with pharmaceutical-grade ingredients for the most discerning consumers.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-semibold">Empowering Entrepreneurs</h3>
                <p>
                  We believe in creating opportunities for individuals to build their own businesses
                  and achieve financial independence through our distributor program.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-semibold">Building Community</h3>
                <p>
                  We're fostering a community of sophisticated individuals who appreciate premium
                  quality and share our passion for excellence in nicotine products.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="divide-y divide-gray-200">
              <div className="py-6">
                <h3 className="mb-3 text-xl font-medium">
                  What makes PUXX different from other nicotine pouches?
                </h3>
                <p className="text-gray-600">
                  PUXX stands apart through our unwavering commitment to premium quality,
                  sophisticated flavor profiles, and optimal nicotine delivery. Our pouches are
                  crafted with pharmaceutical-grade ingredients, featuring proprietary blends
                  developed specifically for discerning connoisseurs who demand excellence in every
                  aspect of their experience.
                </p>
              </div>
              <div className="py-6">
                <h3 className="mb-3 text-xl font-medium">
                  Are PUXX products available internationally?
                </h3>
                <p className="text-gray-600">
                  Currently, PUXX is exclusively available to Canadian customers, with plans for
                  selective international expansion. We're committed to maintaining the highest
                  standards of quality and service as we grow, ensuring that every PUXX customer
                  receives an exceptional experience regardless of location.
                </p>
              </div>
              <div className="py-6">
                <h3 className="mb-3 text-xl font-medium">How should I store my PUXX pouches?</h3>
                <p className="text-gray-600">
                  For optimal freshness and flavor preservation, store your PUXX pouches in a cool,
                  dry place away from direct sunlight. Our specialized packaging is designed to
                  maintain peak quality, but proper storage will ensure each pouch delivers the
                  exceptional experience you expect from PUXX.
                </p>
              </div>
            </div>
          </div>

          {/* Join Us */}
          <div className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white shadow-md">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold">Experience the PUXX Difference</h2>
              <p className="mb-8 text-lg">
                Join the growing community of discerning individuals who have elevated their
                nicotine experience.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-base font-medium text-primary-600 hover:bg-gray-100"
                >
                  Explore Our Collection
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-white bg-transparent px-5 py-3 text-base font-medium text-white hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
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
