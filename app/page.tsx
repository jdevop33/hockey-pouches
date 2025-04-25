'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/NewLayout';
import { flavors, products } from './data/products';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-cream-50 dark:bg-rich-950 py-24 text-rich-900 dark:text-cream-50">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-30 dark:opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="bg-anzac-400 text-white mb-6 inline-block rounded-full px-3 py-1 text-sm font-medium">
                PUXX PREMIUM EXPERIENCE
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-rich-900 dark:text-cream-50 sm:text-5xl lg:text-6xl">
                Premium Nicotine <span className="text-anzac-500">Experience</span>
              </h1>
              <p className="mb-10 max-w-xl text-xl leading-relaxed text-rich-700 dark:text-cream-300">
                Meticulously crafted premium tobacco-free nicotine pouches for those who demand excellence. 
                Discreet, convenient, and perfect for your lifestyle.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="primary" className="inline-block rounded-md px-6 py-3 text-base font-medium shadow-sm transition-all">
                  <Link href="/products">Shop Now</Link>
                </Button>

                <Button variant="outline" className="inline-block rounded-md px-6 py-3 text-base font-medium shadow-sm transition-all">
                  <Link href="/craftsmanship">Our Craft</Link>
                </Button>
              </div>
            </div>
            <div className="relative mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl shadow-lg lg:max-w-none">
                <div className="bg-anzac-500 absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm">
                  PREMIUM
                </div>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/images/hero.jpeg"
                    alt="PUXX Premium - Luxury Nicotine Pouches"
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
      <section className="py-20 bg-cream-100 dark:bg-rich-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-anzac-600 dark:text-anzac-400 inline-block text-sm font-medium">SUPERIOR QUALITY</span>
            <h2 className="mt-3 text-3xl font-bold text-rich-950 dark:text-cream-50 mb-4">
              Globally-sourced excellence in every pouch
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-rich-700 dark:text-cream-300">
              Designed for those who demand more from every moment. PUXX Premium delivers an unparalleled experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-rich-800 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-anzac-400 rounded-full flex items-center justify-center text-white font-bold mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-rich-950 dark:text-cream-50 mb-3">Perfect Balance</h3>
              <p className="text-rich-700 dark:text-cream-300">Ideal harmony of flavor, strength, and comfort</p>
            </div>

            <div className="bg-white dark:bg-rich-800 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center text-white font-bold mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-rich-950 dark:text-cream-50 mb-3">Revolutionary Design</h3>
              <p className="text-rich-700 dark:text-cream-300">
                Optimal placement, minimal movement, maximum comfort
              </p>
            </div>

            <div className="bg-white dark:bg-rich-800 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-forest-600 rounded-full flex items-center justify-center text-white font-bold mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-rich-950 dark:text-cream-50 mb-3">Precision Crafted</h3>
              <p className="text-rich-700 dark:text-cream-300">
                Engineered for consistent release and maximum comfort
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Player Favorites Section */}
      <section className="py-24 bg-cream-50 dark:bg-rich-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-anzac-600 dark:text-anzac-400 inline-block text-sm font-medium">COLLECTIONS</span>
            <h2 className="mt-3 text-3xl font-bold text-rich-950 dark:text-cream-50 sm:text-4xl">
              Crafted Perfection
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-rich-700 dark:text-cream-300">
              Each PUXX collection represents our relentless pursuit of perfection, offering distinct experiences for
              every preference and moment.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {flavors.slice(0, 4).map((flavor, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg bg-white dark:bg-rich-800 shadow-sm transition-all hover:shadow-md"
              >
                {index === 0 && (
                  <div className="bg-anzac-500 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    CLASSIC
                  </div>
                )}
                {index === 1 && (
                  <div className="bg-navy-600 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    INTENSE
                  </div>
                )}
                {index === 2 && (
                  <div className="bg-forest-600 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
                    LIGHT
                  </div>
                )}
                {index === 3 && (
                  <div className="bg-anzac-400 absolute top-0 right-0 z-10 rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
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
                  <h3 className="mb-2 text-lg font-medium text-rich-950 dark:text-cream-50">{flavor}</h3>
                  <p className="mb-4 text-sm text-rich-700 dark:text-cream-300">
                    Perfect for{' '}
                    {index === 0
                      ? 'everyday elegance'
                      : index === 1
                        ? 'bold experiences'
                        : index === 2
                          ? 'gentle introduction'
                          : 'special moments'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-rich-950 dark:text-cream-50">$15.00</span>
                    <Link
                      href={`/products?flavor=${encodeURIComponent(flavor)}`}
                      className="text-anzac-600 dark:text-anzac-400 hover:text-anzac-700 dark:hover:text-anzac-300 text-sm font-medium"
                    >
                      Shop now <span className="ml-1">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" className="inline-flex items-center rounded-md px-6 py-3 text-base font-medium shadow-sm transition-all">
              <Link href="/products">
                View All Products
                <svg
                  className="ml-2 h-5 w-5 text-anzac-400"
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
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-anzac-500 to-anzac-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Experience Nicotine Reimagined</h2>
            <p className="text-xl mb-4">Join the Premium PUXX Movement</p>
            <p className="mb-8">
              Elevate your nicotine experience with our meticulously crafted tobacco-free pouches, designed for those
              who demand more from every moment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-anzac-600 hover:bg-cream-100 border-none">
                <Link href="/products">Shop Premium Pouches</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-anzac-600">
                <Link href="/products">Explore Flavors</Link>
              </Button>
            </div>
            <p className="text-sm mt-8">
              These products contain nicotine. Nicotine is an addictive chemical. For adult use only.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
