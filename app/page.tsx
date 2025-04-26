'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';

// Define product data directly in the component
const featuredProducts = [
  {
    id: 'cool-mint',
    name: 'PUXX Classic Mint',
    description: 'Refined flavor profile with subtle cooling effect',
    price: 15.0,
    image: '/images/products/mint/mint-pack.webp',
    badge: { text: 'BEST SELLER', color: 'bg-gold-500' },
  },
  {
    id: 'peppermint',
    name: 'PUXX Peppermint',
    description: 'Crisp peppermint with exceptional clarity',
    price: 15.0,
    image: '/images/products/mint/peppermint-pack.webp',
  },
  {
    id: 'spearmint',
    name: 'PUXX Spearmint',
    description: 'Sophisticated spearmint with lasting freshness',
    price: 15.0,
    image: '/images/products/mint/spearmint-pack.webp',
    badge: { text: 'POPULAR', color: 'bg-gold-500' },
  },
  {
    id: 'watermelon',
    name: 'PUXX Watermelon',
    description: 'Premium watermelon with balanced sweetness',
    price: 15.0,
    image: '/images/products/berry/berry-pack.webp',
    badge: { text: 'NEW', color: 'bg-blue-500' },
  },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] overflow-hidden bg-dark-500 py-16 text-white md:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/products/banner.png"
            alt="PUXX Premium Nicotine Pouches"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-500 via-dark-500/80 to-transparent"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-block rounded-full bg-gold-500/20 px-3 py-1 text-sm font-medium uppercase tracking-wider text-gold-500">
                Premium Nicotine Pouches
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-gold bg-clip-text text-transparent">PUXX</span>
                <span className="mt-2 block text-3xl sm:text-4xl">World's Best Pouches</span>
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-300">
                Experience unparalleled quality with PUXX premium tobacco-free nicotine pouches.
                Crafted with meticulous attention to detail and pharmaceutical-grade ingredients for
                the most discerning adults.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-block rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-900 shadow-gold transition-all hover:bg-gold-400 hover:shadow-gold-lg"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/about"
                  className="inline-block rounded-md border border-gold-500/30 bg-dark-500/50 px-6 py-3 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all hover:border-gold-500/60 hover:bg-dark-400"
                >
                  Our Story
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl"></div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl"></div>

              <div className="relative z-10 rounded-2xl border border-gold-500/10 bg-dark-400/30 p-6 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.02]">
                <Image
                  src="/images/products/mint/mint-pack.webp"
                  alt="PUXX Premium Nicotine Pouch"
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg object-contain shadow-lg"
                  priority
                />
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-gold-500">PUXX Classic Mint</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Exceptional craftsmanship, superior satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Promise Section with secondary image */}
      <section className="relative overflow-hidden bg-dark-400 py-16 text-white">
        <div className="absolute right-0 top-0 hidden h-full w-1/2 overflow-hidden opacity-20 lg:block lg:opacity-40">
          <Image
            src="/images/products/hero.png"
            alt="PUXX Craftsmanship"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-dark-400"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="mb-6 bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              The PUXX Difference
            </h2>

            <div className="prose prose-lg prose-invert">
              <p className="mb-6 text-gray-300">
                PUXX represents the pinnacle of nicotine pouch craftsmanship. Born from a desire to
                elevate the experience beyond conventional options, PUXX stands for uncompromising
                quality, sophisticated design, and premium satisfaction.
              </p>
              <p className="text-gray-300">
                In a world of compromises, PUXX stands apart through meticulous attention to detail
                and pharmaceutical-grade ingredients. We deliver an unparalleled nicotine experience
                that meets the standards of the most discerning adults.
              </p>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-gold-500/10 bg-dark-500/50 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-bold text-gold-500">Craftsmanship</h3>
                <p className="text-gray-300">
                  Meticulous attention to every detail, from sourcing to production to packaging.
                </p>
              </div>

              <div className="rounded-xl border border-gold-500/10 bg-dark-500/50 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-bold text-gold-500">Excellence</h3>
                <p className="text-gray-300">
                  Uncompromising commitment to superior quality in every aspect of our products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-dark-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Superior Experience by Design
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Crafted with exceptional care for those who appreciate sophisticated design and
              premium quality.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="rounded-lg border border-gold-500/10 bg-dark-400/70 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
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
              <h3 className="mb-3 text-lg font-bold text-white">Instant Satisfaction</h3>
              <p className="text-gray-300">
                Experience immediate enjoyment with our innovative pouch design, engineered for
                optimal nicotine delivery and comfort.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-lg border border-gold-500/10 bg-dark-400/70 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
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
              <h3 className="mb-3 text-lg font-bold text-white">Refined Discretion</h3>
              <p className="text-gray-300">
                Sophisticated elegance meets practical convenience. Enjoy PUXX anywhere with our
                discreet, mess-free pouches.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-lg border border-gold-500/10 bg-dark-400/70 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold-sm">
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">Superior Ingredients</h3>
              <p className="text-gray-300">
                Pharmaceutical-grade components and premium flavorings create an exceptional
                experience for discerning users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-dark-400 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">Premium Collection</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
            Discover our meticulously crafted selection of tobacco-free nicotine pouches, each
            designed to deliver an unparalleled experience.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map(product => (
              <div
                key={product.id}
                className="group rounded-lg border border-gold-500/10 bg-dark-500/70 p-6 transition-all hover:translate-y-[-5px] hover:shadow-gold"
              >
                <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-dark-400/50">
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
                <h3 className="mb-1 text-lg font-bold text-gold-500">{product.name}</h3>
                <p className="mb-3 text-sm text-gray-400">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                  <Link
                    href={`/products/${product.id}`}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-medium text-dark-900 transition-all hover:bg-gold-400"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-block rounded-md border border-gold-500/30 bg-dark-500 px-8 py-3 font-medium text-gold-500 shadow-sm transition-all hover:border-gold-500 hover:shadow-gold-sm"
            >
              View Full Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Community CTA Section */}
      <section className="bg-gradient-to-b from-dark-500 to-dark-600 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-gold-500/10 bg-dark-400/50 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
              <div>
                <span className="inline-block text-sm font-medium uppercase tracking-wider text-gold-500">
                  EXCLUSIVE EXPERIENCE
                </span>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  For Discerning Adults
                </h2>
                <p className="mt-6 text-lg text-gray-300">
                  Join the community of sophisticated individuals who value quality and
                  craftsmanship. PUXX offers an exceptional alternative designed for those who
                  demand the very best.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-900 shadow-gold transition-all hover:bg-gold-400"
                  >
                    Explore Products
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center rounded-md border border-gold-500/30 bg-dark-500/50 px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:border-gold-500/60 hover:bg-dark-400"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              <div className="space-y-4 lg:pt-8">
                <h3 className="text-xl font-bold text-gold-500">The PUXX Promise</h3>

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
                  <span className="text-gray-300">Premium, pharmaceutical-grade ingredients</span>
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
                  <span className="text-gray-300">Sophisticated design for optimal comfort</span>
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
                  <span className="text-gray-300">Meticulously crafted flavor profiles</span>
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
                  <span className="text-gray-300">Discreet, elegant packaging for any setting</span>
                </div>

                <div className="mt-6">
                  <Link href="/about" className="text-gold-500 hover:text-gold-400">
                    Learn more about our craftsmanship →
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
