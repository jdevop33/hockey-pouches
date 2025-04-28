'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

// Define product data with more compelling descriptions and consistent image paths
const featuredProducts = [
  {
    id: 'cool-mint',
    name: 'PUXX Classic Mint',
    description: 'Our flagship flavor with a perfectly balanced cooling sensation.',
    price: 15.0,
    image: '/images/products/puxxcoolmint22mg.png',
    badge: { text: 'BEST SELLER', color: 'bg-gold-500' },
    rating: 4.9,
    reviewCount: 187,
    strength: '22mg',
  },
  {
    id: 'peppermint',
    name: 'PUXX Peppermint',
    description: 'Crisp, intense peppermint for those who appreciate bold refreshment.',
    price: 15.0,
    image: '/images/products/puxxperpermint22mg.png',
    rating: 4.7,
    reviewCount: 142,
    strength: '22mg',
  },
  {
    id: 'spearmint',
    name: 'PUXX Spearmint',
    description: 'Sophisticated spearmint with a smooth finish and lasting freshness.',
    price: 15.0,
    image: '/images/products/puxxspearmint22mg.png',
    badge: { text: 'POPULAR', color: 'bg-gold-500' },
    rating: 4.8,
    reviewCount: 156,
    strength: '22mg',
  },
  {
    id: 'watermelon',
    name: 'PUXX Watermelon',
    description: 'Premium watermelon with the perfect balance of sweetness and satisfaction.',
    price: 15.0,
    image: '/images/products/puxxwatermelon16mg.png',
    badge: { text: 'NEW', color: 'bg-blue-500' },
    rating: 4.6,
    reviewCount: 98,
    strength: '16mg',
  },
];

// Testimonials for social proof
const testimonials = [
  {
    name: 'Michael T.',
    text: 'PUXX has completely changed my nicotine experience. The flavors are next level and the quality is unmatched.',
    avatar: '/images/icons/avatar-1.png',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    text: 'After trying several brands, I finally found PUXX. The discreet design and premium feel make it my go-to choice.',
    avatar: '/images/icons/avatar-2.png',
    rating: 5,
  },
  {
    name: 'David R.',
    text: 'The Classic Mint is outstanding - perfectly balanced flavor and consistent satisfaction every time.',
    avatar: '/images/icons/avatar-3.png',
    rating: 4,
  },
];

// Benefits list with icons
const benefits = [
  { text: 'Premium pharmaceutical-grade ingredients', icon: 'CheckCircle' },
  { text: 'Discreet, elegant design', icon: 'CheckCircle' },
  { text: 'Long-lasting flavor and satisfaction', icon: 'CheckCircle' },
  { text: 'Free shipping on orders over $50', icon: 'CheckCircle' },
  { text: 'Satisfaction guaranteed', icon: 'CheckCircle' },
];

export default function Home() {
  return (
    <Layout>
      <main className="flex min-h-screen flex-col bg-dark-500">
        {/* Hero Section - Applying principle 36: Text contrast on images */}
        <section className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-4">
          {/* Background Image with proper overlay for text readability */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/products/hero.png"
              alt="PUXX Premium Nicotine Pouches"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 to-dark-900/40 backdrop-blur-[1px]"></div>
          </div>

          <div className="container relative z-10 mx-auto flex flex-col items-start justify-center px-4 sm:items-center sm:px-6 sm:text-center lg:px-8">
            <div className="inline-block rounded-full bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-500 backdrop-blur-sm">
              Premium Nicotine Pouches
            </div>

            <h1 className="mt-6 max-w-4xl text-left text-4xl font-bold tracking-tight text-white sm:text-center md:text-5xl lg:text-6xl">
              Elevate Your Experience with{' '}
              <span className="bg-gradient-gold bg-clip-text text-transparent">PUXX</span>
            </h1>

            <p className="mt-6 max-w-2xl text-left text-lg text-gray-300 sm:text-center">
              Discover the perfect blend of elegance, satisfaction, and premium quality. Designed
              for those who demand the very best.
            </p>

            <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/products"
                className="group flex items-center justify-center rounded-xl bg-gold-500 px-8 py-3.5 text-base font-bold text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-lg"
              >
                <span>Shop Collection</span>
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="group flex items-center justify-center rounded-xl border border-gold-500/30 bg-dark-800/30 px-8 py-3.5 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700/40"
              >
                <span>Our Story</span>
                <ArrowRight className="ml-2 h-5 w-5 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            </div>

            {/* Social proof element */}
            <div className="mt-12 flex w-full flex-col items-start sm:items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="h-5 w-5 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-300">
                <span className="text-white">4.8</span> average rating from over{' '}
                <span className="text-white">500+</span> verified customers
              </p>
            </div>
          </div>
        </section>

        {/* Featured Products Section - Applying principle 6: Prioritize Elements */}
        <section className="relative overflow-hidden bg-dark-900 py-20 text-white">
          <div className="absolute inset-0 bg-[url('/images/patterns/hockey-pattern.png')] bg-repeat opacity-5"></div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-3 inline-block rounded-full bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-500">
                Premium Selection
              </div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  Discover Your Perfect Match
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Crafted with precision and care, our pouches deliver an exceptional experience from
                the first moment to the last.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="group rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/30 hover:shadow-gold"
                >
                  <div className="aspect-square relative mb-6 overflow-hidden rounded-lg bg-dark-700/50">
                    {product.badge && (
                      <span
                        className={`absolute right-2 top-2 z-10 rounded-full ${product.badge.color} px-3 py-1 text-xs font-bold text-dark-900`}
                      >
                        {product.badge.text}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  {/* Product info with clear hierarchy */}
                  <div className="mb-1.5 flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.floor(product.rating) ? 'fill-gold-500 text-gold-500' : 'text-gray-500'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-gray-400">({product.reviewCount})</span>
                  </div>

                  <h3 className="mb-1 text-xl font-bold text-white">{product.name}</h3>
                  <span className="mb-2 inline-block rounded-full bg-dark-700/80 px-2.5 py-0.5 text-xs font-medium text-gold-500">
                    {product.strength} Strength
                  </span>
                  <p className="mb-4 text-sm text-gray-400">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-dark-900 transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-sm"
                    >
                      Add to Cart
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center rounded-xl border border-gold-500/30 bg-dark-800/50 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700/70"
              >
                <span>View All Products</span>
                <ArrowRight className="ml-2 h-5 w-5 transform opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            </div>
          </div>

          {/* Section Divider with Refactoring UI principle 41: Decorate Backgrounds Subtly */}
          <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute bottom-0 h-full w-full fill-dark-800"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
              ></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
            </svg>
          </div>
        </section>

        {/* Premium Quality Section - With principle 30: Simulate Light Source Subtly */}
        <section className="relative overflow-hidden bg-dark-800 py-24 text-white">
          <div className="absolute right-0 top-0 h-32 w-full bg-gradient-to-b from-dark-900/30 to-transparent"></div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <div className="mb-3 inline-block rounded-full bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-500">
                Premium Quality
              </div>
              <h2 className="mb-6 bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                Crafted to Perfection
              </h2>

              <div className="prose prose-lg prose-invert">
                <p className="mb-6 text-gray-300">
                  PUXX stands at the pinnacle of nicotine pouch quality. Created from our unwavering
                  desire to offer something truly exceptional, PUXX delivers unmatched quality,
                  elegant design, and premium satisfaction in every pouch.
                </p>
                <p className="text-gray-300">
                  Where others compromise, PUXX sets the gold standard with meticulous attention to
                  detail and pharmaceutical-grade ingredients. Our customers consistently agree—we
                  provide a superior experience worthy of the most discerning users.
                </p>
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              <div className="relative transform rounded-2xl border border-gold-500/10 bg-dark-900/50 p-8 shadow-lg backdrop-blur-sm transition-transform duration-500 hover:-translate-y-2">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold-500/5 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl"></div>

                <Image
                  src="/images/products/banner.png"
                  alt="PUXX Premium Collection"
                  width={600}
                  height={400}
                  className="mx-auto mb-8 rounded-lg object-contain"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gold-500/5 bg-dark-800/70 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gold-500">Expert Blending</h3>
                    <p className="text-sm text-gray-400">
                      Perfect balance of flavor and effect in every pouch
                    </p>
                  </div>

                  <div className="rounded-lg border border-gold-500/5 bg-dark-800/70 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gold-500">Pure Quality</h3>
                    <p className="text-sm text-gray-400">
                      Only the finest ingredients make it into PUXX
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="transform rounded-xl border border-gold-500/10 bg-dark-900/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:translate-x-1 hover:border-gold-500/20"
                  >
                    <div className="flex items-start">
                      <CheckCircle className="mr-4 h-6 w-6 flex-shrink-0 text-gold-500" />
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-white">{benefit.text}</h3>
                        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials section - applying principle 7: Use Multiple Cues */}
            <div className="mt-20">
              <h3 className="mb-10 text-center text-2xl font-bold text-white">
                What Our Customers Say
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gold-500/10 bg-dark-900/60 p-6 backdrop-blur-sm"
                  >
                    <div className="mb-4 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'fill-gold-500 text-gold-500' : 'text-gray-500'}`}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-gray-300">"{testimonial.text}"</p>
                    <div className="flex items-center">
                      <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-dark-700">
                        {/* Placeholder for avatar */}
                      </div>
                      <span className="font-medium text-white">{testimonial.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Divider - Diamond Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute bottom-0 h-full w-full fill-dark-500"
            >
              <path d="M1200 0L0 0 598.97 114.72 1200 0z"></path>
            </svg>
          </div>
        </section>

        {/* CTA Section - Premium PUXX Movement */}
        <section className="relative bg-dark-500 pb-24 pt-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-gold-500/10 bg-dark-800/60 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
                <div>
                  <span className="inline-block text-sm font-medium uppercase tracking-wider text-gold-500">
                    JOIN THE ELITE
                  </span>
                  <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                    Experience the PUXX Difference
                  </h2>
                  <p className="mt-6 text-lg text-gray-300">
                    Join thousands who have elevated their experience with PUXX. Whether you're new
                    to nicotine pouches or looking to upgrade your daily ritual, PUXX delivers an
                    unparalleled premium experience.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/products"
                      className="group inline-flex items-center justify-center rounded-md bg-gold-500 px-6 py-3 text-base font-bold text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/account"
                      className="group inline-flex items-center justify-center rounded-md border border-gold-500/30 bg-dark-800/50 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700"
                    >
                      <span>Join PUXX</span>
                      <ArrowRight className="ml-2 h-5 w-5 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 lg:pt-8">
                  <h3 className="text-xl font-bold text-gold-500">The PUXX Advantage</h3>

                  {[
                    'Premium pharmaceutical-grade ingredients',
                    'Discreet, elegant design for any setting',
                    'Longer-lasting flavor than competitors',
                    'Perfect strength for optimal satisfaction',
                    'Fast shipping and exceptional service',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-gold-500" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}

                  <div className="mt-8 rounded-xl bg-dark-900/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Limited Time Offer</span>
                      <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-black">
                        SAVE 15%
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      Use code <span className="font-bold text-gold-500">PREMIUM15</span> at
                      checkout for 15% off your first order
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
