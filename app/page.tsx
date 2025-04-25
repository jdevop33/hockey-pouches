'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';
import { flavors, products } from './data/products';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 text-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              {/* Restored original classes */}
              <div className="bg-primary-50 text-primary-600 mb-6 inline-block rounded-full px-3 py-1 text-sm font-medium">
                FOR HOCKEY PLAYERS
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 text-shadow-sm sm:text-5xl lg:text-6xl">
                Stay in the Game with Hockey Puxx
              </h1>
              <p className="mb-10 max-w-xl text-xl leading-relaxed text-gray-600">
                Premium tobacco-free nicotine pouches designed for hockey players and fans.
                Discreet, convenient, and perfect for the rink.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                 {/* Restored original classes */}
                <Link
                  href="/products"
                  className="bg-primary-600 hover:bg-primary-700 inline-block rounded-md px-6 py-3 text-base font-medium text-white shadow-sm transition-all"
                >
                  Shop Now
                </Link>

                <Link
                  href="/about"
                  className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl shadow-lg lg:max-w-none">
                 {/* Restored original classes */}
                <div className="bg-primary-500 absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm">
                  NEW
                </div>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/images/hero.jpeg"
                    alt="Hockey Puxx - Premium Nicotine Pouches"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
             {/* Restored original classes */}
            <span className="text-primary-600 inline-block text-sm font-medium">BENEFITS</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 text-shadow-xs sm:text-4xl">
              Why Hockey Players Choose Our Pouches
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Designed specifically for hockey players and fans who need a discreet, convenient
              nicotine option that works with their active lifestyle.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="group">
               {/* Restored original classes */}
              <div className="bg-primary-50 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-primary-600 h-6 w-6"
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
              <h3 className="mb-3 text-xl font-medium text-gray-900">Quick Energy Boost</h3>
              <p className="mb-5 text-gray-600">
                Get the energy you need between periods without the crash. Perfect for maintaining
                focus during long games.
              </p>
              <Link
                href="/products"
                className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm font-medium"
              >
                Explore our products <span className="ml-1">&rarr;</span>
              </Link>
            </div>
            {/* ... rest of features section ... */}
             <div className="group">
              <div className="bg-primary-50 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-primary-600 h-6 w-6"
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
              <h3 className="mb-3 text-xl font-medium text-gray-900">Discreet & Convenient</h3>
              <p className="mb-5 text-gray-600">
                No spitting, no mess. Use them anywhere - in the locker room, on the bench, or
                during travel to away games.
              </p>
              <Link
                href="/research"
                className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm font-medium"
              >
                Learn how they work <span className="ml-1">&rarr;</span>
              </Link>
            </div>
             <div className="group">
              <div className="bg-primary-50 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-primary-600 h-6 w-6"
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
              <h3 className="mb-3 text-xl font-medium text-gray-900">Team Discounts</h3>
              <p className="mb-5 text-gray-600">
                Bulk discounts available for hockey teams and leagues. The same pouches trusted by
                professional players.
              </p>
              <Link
                href="/products"
                className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm font-medium"
              >
                Shop team favorites <span className="ml-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
       {/* ... rest of page ... */}
       <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
             {/* Restored original classes */}
            <span className="text-primary-600 inline-block text-sm font-medium">TOP PICKS</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 text-shadow-xs sm:text-4xl">
              Player Favorites
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Our most popular flavors among hockey players. All pouches are tobacco-free, designed
              for maximum performance and convenience on and off the ice.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {flavors.slice(0, 4).map((flavor, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
              >
                 {/* Restored original classes */}
                {index === 0 && (
                  <div className="bg-primary-600 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    BEST SELLER
                  </div>
                )}
                {index === 1 && (
                  <div className="bg-primary-500 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    POPULAR
                  </div>
                )}
                {index === 2 && (
                  <div className="bg-primary-700 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    STRONG
                  </div>
                )}
                {index === 3 && (
                  <div className="bg-primary-400 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    NEW
                  </div>
                )}
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={
                      products.find(p => p.flavor === flavor)?.imageUrl ||
                      '/images/products/placeholder.svg'
                    }
                    alt={flavor}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-6"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">{flavor}</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Perfect for{' '}
                    {index === 0
                      ? 'between periods'
                      : index === 1
                        ? 'long road trips'
                        : index === 2
                          ? 'post-game recovery'
                          : 'training sessions'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">$15.00</span>
                     {/* Restored original classes */}
                    <Link
                      href={`/products?flavor=${encodeURIComponent(flavor)}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Shop now <span className="ml-1">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/products"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
            >
              View All Products
              <svg
                className="ml-2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                 {/* Restored original classes */}
                <span className="text-primary-600 inline-block text-sm font-medium">
                  JOIN THE COMMUNITY
                </span>
                <h2 className="mt-3 text-3xl font-bold text-gray-900 text-shadow-xs sm:text-4xl">
                  Get the Edge On and Off the Ice
                </h2>
                <p className="mt-6 text-lg text-gray-600">
                  Join thousands of hockey players across Canada who trust Hockey Puxx for a clean,
                  discreet nicotine experience that fits their active lifestyle.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                   {/* Restored original classes */}
                  <Link
                    href="/products"
                    className="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-md px-6 py-3 text-base font-medium text-white shadow-sm transition-all"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
              <div className="bg-gray-100 p-8 sm:p-12 lg:p-16">
                <h3 className="text-xl font-bold text-gray-900">Why Players Love Us</h3>
                <ul className="mt-8 space-y-5">
                  <li className="flex">
                    <svg
                      className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Discreet use during games & practice</span>
                  </li>
                  {/* ... list items ... */}
                   <li className="flex">
                    <svg
                      className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Quick energy boost between periods</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">No spitting required - clean & convenient</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Fast, free shipping across Canada</span>
                  </li>
                </ul>
                <div className="mt-8">
                   {/* Restored original classes */}
                  <Link
                    href="/research"
                    className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                  >
                    Learn more about our products <span className="ml-1">&rarr;</span>
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
