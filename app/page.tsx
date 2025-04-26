'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';

// Define product data directly in the component
const featuredProducts = [
  {
    id: 'cool-mint',
    name: 'Cool Mint',
    description: 'Perfect for between periods',
    price: 15.0,
    image: '/images/products/mint/mint-pack.webp',
    badge: { text: 'BEST SELLER', color: 'bg-gold-500' },
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    description: 'Perfect for long road trips',
    price: 15.0,
    image: '/images/products/mint/peppermint-pack.webp',
  },
  {
    id: 'spearmint',
    name: 'Spearmint',
    description: 'Perfect for post-game recovery',
    price: 15.0,
    image: '/images/products/mint/spearmint-pack.webp',
    badge: { text: 'POPULAR', color: 'bg-gold-500' },
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    description: 'Perfect for training sessions',
    price: 15.0,
    image: '/images/products/berry/berry-pack.webp',
    badge: { text: 'NEW', color: 'bg-blue-500' },
  },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-dark-500 py-16 text-white md:py-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/patterns/ice-texture.jpg"
            alt="Ice texture"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-block rounded-full bg-gold-500/10 px-3 py-1 text-sm font-medium uppercase tracking-wider text-gold-500">
                For Hockey Players
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Stay in the Game with{' '}
                <span className="bg-gradient-gold bg-clip-text text-transparent">Hockey Puxx</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-300">
                Premium tobacco-free nicotine pouches designed for hockey players and fans.
                Discreet, convenient, and perfect for the rink.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-block rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-500 shadow-gold-sm transition-all hover:shadow-gold"
                >
                  Shop Now
                </Link>
                <Link
                  href="/about"
                  className="inline-block rounded-md border border-gold-500/20 bg-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:border-gold-500/60 hover:bg-dark-400"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl"></div>
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl"></div>
              <Image
                src="/images/products/hockey-player.webp"
                alt="Hockey player"
                width={600}
                height={500}
                className="relative z-10 rounded-lg object-cover shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-dark-400 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Why Hockey Players Choose Our Pouches
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Designed specifically for hockey players and fans who need a discreet, convenient
              nicotine option that works with their active lifestyle.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="rounded-lg bg-dark-500 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gold-500"
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
              <h3 className="mb-3 text-lg font-bold text-white">Quick Energy Boost</h3>
              <p className="text-gray-300">
                Get the energy you need between periods without the crash. Perfect for maintaining
                focus during long games.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-lg bg-dark-500 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gold-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">No Spitting, No Mess</h3>
              <p className="text-gray-300">
                Use them anywhere - in the locker room, on the bench, or during travel to away
                games. Clean and discreet.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-lg bg-dark-500 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gold-500"
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
              <h3 className="mb-3 text-lg font-bold text-white">Team Discounts</h3>
              <p className="text-gray-300">
                Bulk discounts available for hockey teams and leagues. The same pouches trusted by
                professional athletes.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center space-x-6">
            <Link href="/products" className="text-gold-500 hover:text-gold-400">
              Explore our products →
            </Link>
            <Link href="/research" className="text-gold-500 hover:text-gold-400">
              Learn how they work →
            </Link>
            <Link href="/shop" className="text-gold-500 hover:text-gold-400">
              Shop team favorites →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-dark-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">Player Favorites</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
            Our most popular flavors among hockey players. All pouches are tobacco-free, designed
            for maximum performance and convenience on and off the ice.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map(product => (
              <div
                key={product.id}
                className="group rounded-lg bg-dark-400 p-6 transition-all hover:shadow-gold-sm"
              >
                <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-dark-300">
                  {product.badge && (
                    <span
                      className={`absolute right-2 top-2 z-10 rounded-full ${product.badge.color} px-2 py-1 text-xs font-bold ${product.badge.color === 'bg-gold-500' ? 'text-dark-500' : 'text-white'}`}
                    >
                      {product.badge.text}
                    </span>
                  )}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-1 text-lg font-bold text-white">{product.name}</h3>
                <p className="mb-3 text-sm text-gray-400">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gold-500">
                    ${product.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/products/${product.id}`}
                    className="rounded bg-dark-300 px-3 py-1 text-sm text-white transition-colors hover:bg-gold-500 hover:text-dark-500"
                  >
                    Shop now →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-block rounded-md border border-gold-500/30 bg-dark-400 px-6 py-3 font-medium text-white shadow-sm transition-all hover:border-gold-500/60 hover:shadow-gold-sm"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Community CTA Section */}
      <section className="bg-gradient-to-b from-dark-400 to-dark-500 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-dark-300 shadow-lg">
            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
              <div>
                <span className="inline-block text-sm font-medium uppercase tracking-wider text-gold-500">
                  JOIN THE COMMUNITY
                </span>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Get the Edge On and Off the Ice
                </h2>
                <p className="mt-6 text-lg text-gray-300">
                  Join thousands of hockey players across Canada who trust Hockey Puxx for a clean,
                  discreet nicotine experience that fits their active lifestyle.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-500 shadow-sm transition-all hover:shadow-gold"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center rounded-md border border-gold-500/20 bg-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:border-gold-500/60 hover:bg-dark-400"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              <div className="space-y-4 lg:pt-8">
                <h3 className="text-xl font-bold text-white">Why Players Love Us</h3>

                <div className="flex items-start space-x-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Discreet use during games & practice</span>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Quick energy boost between periods</span>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">No spitting required - clean & convenient</span>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Fast, free shipping across Canada</span>
                </div>

                <div className="mt-6">
                  <Link href="/research" className="text-gold-500 hover:text-gold-400">
                    Learn more about our products →
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
