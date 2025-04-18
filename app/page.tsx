'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';
import { flavors } from './data/products';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white shadow-lg">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-full w-full bg-[url('/images/hockey-pattern.png')] bg-repeat opacity-20"></div>
          <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-black to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <div className="mb-4 inline-block rounded-md bg-accent-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                DESIGNED FOR HOCKEY PLAYERS
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl">
                Stay in the Game with Hockey Pouches
              </h1>
              <p className="mb-8 max-w-xl text-xl text-white/90">
                Premium tobacco-free nicotine pouches designed for hockey players and fans.
                Discreet, convenient, and perfect for the rink.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-block transform rounded-md bg-white px-6 py-3 text-lg font-medium text-primary-600 shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg"
                >
                  Shop Now
                </Link>

                <Link
                  href="/about"
                  className="inline-block rounded-md border-2 border-white bg-transparent px-6 py-3 text-lg font-medium text-white shadow-sm transition-all hover:bg-white hover:text-primary-600"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative mt-10 lg:mt-0">
              <div className="relative h-80 transform overflow-hidden rounded-lg bg-white/10 p-4 shadow-xl backdrop-blur-sm transition-transform hover:scale-[1.02]">
                <div className="absolute -right-6 -top-6 flex h-24 w-24 rotate-12 transform items-center justify-center rounded-full bg-accent-500 text-lg font-bold text-white">
                  <span>NEW!</span>
                </div>
                <Image
                  src="/images/hero.jpeg"
                  alt="Hockey Pouches - Premium Nicotine Pouches"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-center font-medium text-white">
                  Perfect for the Rink
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-t border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">
              Why Hockey Players Choose Our Pouches
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
              Designed specifically for hockey players and fans who need a discreet, convenient
              nicotine option that works with their active lifestyle.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="transform overflow-hidden rounded-lg border-t-4 border-primary-500 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-primary-100 p-3">
                    <svg
                      className="h-6 w-6 text-primary-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Quick Energy Boost</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Get the energy you need between periods without the crash. Perfect for
                      maintaining focus during long games.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    href="/products"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Explore our products <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="transform overflow-hidden rounded-lg border-t-4 border-accent-500 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-accent-100 p-3">
                    <svg
                      className="h-6 w-6 text-accent-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Discreet & Convenient</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      No spitting, no mess. Use them anywhere - in the locker room, on the bench, or
                      during travel to away games.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    href="/research"
                    className="font-medium text-accent-600 hover:text-accent-500"
                  >
                    Learn how they work <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="transform overflow-hidden rounded-lg border-t-4 border-primary-500 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-primary-100 p-3">
                    <svg
                      className="h-6 w-6 text-primary-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Team Discounts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Bulk discounts available for hockey teams and leagues. The same pouches
                      trusted by professional players.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    href="/products"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Shop team favorites <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Favorites Section */}
      <section className="relative overflow-hidden py-16">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-0 top-0 h-full w-full bg-[url('/images/ice-texture.png')] bg-repeat opacity-10"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <span className="mr-2 h-1 w-10 bg-primary-500"></span>
              <h2 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                Player Favorites
              </h2>
              <span className="ml-2 h-1 w-10 bg-primary-500"></span>
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
              Our most popular flavors among hockey players. All pouches are tobacco-free, designed
              for maximum performance and convenience on and off the ice.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {flavors.slice(0, 4).map((flavor, index) => (
              <div
                key={index}
                className="group relative transform rounded-lg bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute right-2 top-2 rounded-full bg-accent-500 px-2 py-1 text-xs font-bold text-white">
                  {index === 0
                    ? 'BEST SELLER'
                    : index === 1
                      ? 'POPULAR'
                      : index === 2
                        ? 'STRONG'
                        : 'NEW'}
                </div>
                <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-50 transition-opacity group-hover:opacity-90">
                  <Image
                    src={`/images/products/${flavor.toLowerCase().replace(/\s+/g, '-')}/${flavor.toLowerCase().replace(/\s+/g, '-')}-6mg.png`}
                    alt={flavor}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-4 drop-shadow-sm"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{flavor}</h3>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="ml-1 text-xs font-medium text-gray-600">
                        {4.5 + index * 0.1}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Perfect for{' '}
                    {index === 0
                      ? 'between periods'
                      : index === 1
                        ? 'long road trips'
                        : index === 2
                          ? 'post-game recovery'
                          : 'training sessions'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium text-primary-600">$15.00</span>
                    <Link
                      href={`/products?flavor=${encodeURIComponent(flavor)}`}
                      className="flex items-center text-sm font-medium text-accent-600 hover:text-accent-500"
                    >
                      Shop now{' '}
                      <span aria-hidden="true" className="ml-1">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex transform items-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Community CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600/90 to-primary-800/90 py-16 text-white shadow-lg">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-full bg-[url('/images/hockey-pattern.png')] bg-repeat opacity-10"></div>
          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <div className="mb-4 inline-block rounded-md bg-white px-3 py-1 text-sm font-semibold text-primary-600">
                JOIN THE COMMUNITY
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight">
                Get the Edge On and Off the Ice
              </h2>
              <p className="mb-8 text-xl opacity-90">
                Join thousands of hockey players across Canada who trust Hockey Pouches for a clean,
                discreet nicotine experience that fits their active lifestyle.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-block transform rounded-md bg-white px-6 py-3 text-lg font-medium text-primary-600 shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 inline-block h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Shop Now
                </Link>
                <Link
                  href="/account"
                  className="inline-block rounded-md bg-accent-500 px-6 py-3 text-lg font-medium text-white shadow-md transition-all hover:bg-accent-600 hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 inline-block h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create Account
                </Link>
              </div>
            </div>
            <div className="mt-10 text-center lg:mt-0">
              <div className="inline-block rounded-lg border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-8 w-8 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-2xl font-bold">Why Players Love Us</p>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Discreet use during games & practice</span>
                  </div>
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Quick energy boost between periods</span>
                  </div>
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>No spitting required - clean & convenient</span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Fast, free shipping across Canada</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href="/research"
                    className="flex items-center justify-center text-lg font-bold transition-colors hover:text-yellow-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
