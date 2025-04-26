'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from './components/layout/Layout';

// Define product data directly in the component with corrected image paths
const featuredProducts = [
  {
    id: 'cool-mint',
    name: 'PUXX Classic Mint',
    description: 'Refined flavor profile with subtle cooling effect',
    price: 15.0,
    image: '/images/products/puxxcoolmint22mg.png',
    badge: { text: 'BEST SELLER', color: 'bg-gold-500' },
  },
  {
    id: 'peppermint',
    name: 'PUXX Peppermint',
    description: 'Crisp peppermint with exceptional clarity',
    price: 15.0,
    image: '/images/products/puxxperpermint22mg.png',
  },
  {
    id: 'spearmint',
    name: 'PUXX Spearmint',
    description: 'Sophisticated spearmint with lasting freshness',
    price: 15.0,
    image: '/images/products/puxxspearmint22mg.png',
    badge: { text: 'POPULAR', color: 'bg-gold-500' },
  },
  {
    id: 'watermelon',
    name: 'PUXX Watermelon',
    description: 'Premium watermelon with balanced sweetness',
    price: 15.0,
    image: '/images/products/puxxwatermelon16mg.png',
    badge: { text: 'NEW', color: 'bg-blue-500' },
  },
];

export default function Home() {
  return (
    <Layout>
      <main className="flex min-h-screen flex-col bg-dark-500">
        {/* Hero Section */}
        <section className="relative flex min-h-[75vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-32">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/products/banner.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
            }}
          >
            <div className="absolute inset-0 bg-dark-900/70"></div>
          </div>

          <div className="container relative z-10 mx-auto flex flex-col items-center justify-center text-center">
            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Premium Nicotine Pouches for{' '}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Discerning Adults
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-gray-300">
              Discreet, convenient, and perfect for your active lifestyle. Free shipping on orders
              over $50.
            </p>

            <div className="flex flex-col gap-6 sm:flex-row">
              <Link
                href="/products"
                className="group flex items-center justify-center rounded-md bg-gold-500 px-8 py-3.5 text-base font-medium text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-lg"
              >
                <span>Explore Collection</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                href="/about"
                className="group flex items-center justify-center rounded-md border border-gold-500/30 bg-dark-800/50 px-8 py-3.5 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700"
              >
                <span>Our Story</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
        </section>

        {/* Symphony of Sensations Section */}
        <section className="relative overflow-hidden bg-dark-900 pb-32 pt-20 text-white">
          <div className="absolute right-0 top-0 h-64 w-full bg-gradient-to-b from-black/20 to-transparent"></div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  A Symphony of Sensations
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Each PUXX creation represents the perfect blend of precision, offering distinct
                profiles from bold intensity to subtle refinement.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="group rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 transition-all duration-500 hover:translate-y-[-8px] hover:shadow-gold"
                >
                  <div className="aspect-square relative mb-6 overflow-hidden rounded-lg bg-dark-800/80">
                    {product.badge && (
                      <span
                        className={`absolute right-2 top-2 z-10 rounded-full ${product.badge.color} px-2 py-1 text-xs font-bold text-dark-900`}
                      >
                        {product.badge.text}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-800/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-3 transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gold-500">{product.name}</h3>
                  <p className="mb-4 text-sm text-gray-400">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-dark-900 transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-sm"
                    >
                      Add to Cart
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Divider - Flowing Lines */}
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

        {/* The Artistry Behind PUXX */}
        <section className="relative overflow-hidden bg-dark-800 py-24 text-white">
          <div className="absolute right-0 top-0 h-32 w-full bg-gradient-to-b from-dark-900/30 to-transparent"></div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="mb-6 bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                The Artistry Behind PUXX
              </h2>

              <div className="prose prose-lg prose-invert">
                <p className="mb-6 text-gray-300">
                  PUXX represents the pinnacle of nicotine pouch craftsmanship. Born from a desire
                  to elevate the experience beyond conventional options, PUXX stands for
                  uncompromising quality, sophisticated design, and premium satisfaction.
                </p>
                <p className="text-gray-300">
                  In a world of compromises, PUXX stands apart through meticulous attention to
                  detail and pharmaceutical-grade ingredients. We deliver an unparalleled nicotine
                  experience that meets the standards of the most discerning adults.
                </p>
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              <div className="relative transform rounded-2xl border border-gold-500/10 bg-dark-900/50 p-8 shadow-lg backdrop-blur-sm transition-transform duration-500 hover:translate-y-[-5px]">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold-500/5 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl"></div>

                <Image
                  src="/images/products/hero.png"
                  alt="PUXX Craftsmanship"
                  width={500}
                  height={500}
                  className="mx-auto mb-8 rounded-lg object-contain"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gold-500/5 bg-dark-800/70 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gold-500">Master Blending</h3>
                    <p className="text-sm text-gray-400">
                      Precisely calculated formulas create the perfect balance of flavor and effect
                    </p>
                  </div>

                  <div className="rounded-lg border border-gold-500/5 bg-dark-800/70 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gold-500">Uncompromising Quality</h3>
                    <p className="text-sm text-gray-400">
                      Every ingredient selected to meet our exacting standards for purity
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-8">
                <div className="transform rounded-xl border border-gold-500/10 bg-dark-900/40 p-6 transition-all duration-500 hover:translate-x-1 hover:translate-y-[-5px]">
                  <h3 className="mb-3 text-xl font-bold text-white">Superior Ingredients</h3>
                  <p className="mb-5 text-gray-300">
                    We source only the finest pharmaceutical-grade ingredients, ensuring a
                    consistently exceptional experience with every pouch.
                  </p>
                  <div className="h-1 w-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"></div>
                </div>

                <div className="transform rounded-xl border border-gold-500/10 bg-dark-900/40 p-6 transition-all duration-500 hover:translate-x-1 hover:translate-y-[-5px]">
                  <h3 className="mb-3 text-xl font-bold text-white">Precise Calibration</h3>
                  <p className="mb-5 text-gray-300">
                    Each PUXX variant is meticulously formulated to deliver consistent strength,
                    flavor, and satisfaction throughout the entire experience.
                  </p>
                  <div className="h-1 w-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"></div>
                </div>

                <div className="transform rounded-xl border border-gold-500/10 bg-dark-900/40 p-6 transition-all duration-500 hover:translate-x-1 hover:translate-y-[-5px]">
                  <h3 className="mb-3 text-xl font-bold text-white">Elegant Design</h3>
                  <p className="mb-5 text-gray-300">
                    Our proprietary pouch construction ensures optimal comfort, balanced release,
                    and discreet use in any setting.
                  </p>
                  <div className="h-1 w-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"></div>
                </div>
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

        {/* Join the Premium PUXX Movement */}
        <section className="relative bg-dark-500 pb-24 pt-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-gold-500/10 bg-dark-800/60 shadow-xl backdrop-blur-sm">
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
                      className="group inline-flex items-center justify-center rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400"
                    >
                      <span>Explore Products</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/account"
                      className="group inline-flex items-center justify-center rounded-md border border-gold-500/30 bg-dark-800/50 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-300 hover:border-gold-500/60 hover:bg-dark-700"
                    >
                      <span>Create Account</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-5 w-5 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
                    <span className="text-gray-300">
                      Discreet, elegant packaging for any setting
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/about"
                      className="group inline-flex items-center text-gold-500 transition-colors duration-300 hover:text-gold-400"
                    >
                      <span>Learn more about our craftsmanship</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
