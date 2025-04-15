'use client';

import Image from "next/image";
import Link from "next/link";
import Layout from "./components/layout/Layout";
import { flavors } from "./data/products.ts";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20 relative overflow-hidden">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/hockey-pattern.png')] bg-repeat opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-block bg-accent-500 text-white px-3 py-1 rounded-md text-sm font-semibold mb-4">
                DESIGNED FOR HOCKEY PLAYERS
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Stay in the Game with Hockey Pouches
              </h1>
              <p className="text-xl mb-8">
                Premium tobacco-free nicotine pouches designed for hockey players and fans. Discreet, convenient, and perfect for the rink.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-block bg-white text-primary-600 px-6 py-3 rounded-md font-medium text-lg shadow-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
                <Link
                  href="/calculator"
                  className="inline-block bg-accent-500 text-white px-6 py-3 rounded-md font-medium text-lg shadow-md hover:bg-accent-600 relative overflow-hidden group"
                >
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-primary-800 text-xs font-bold px-2 py-1 rounded-bl-md transform rotate-3 group-hover:rotate-6 transition-transform">
                    NEW
                  </span>
                  Team Discount Calculator
                </Link>
                <Link
                  href="/about"
                  className="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium text-lg hover:bg-white hover:text-primary-600"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 relative">
              <div className="relative h-80 rounded-lg shadow-xl overflow-hidden bg-white/10 backdrop-blur-sm p-4">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg transform rotate-12">
                  <span>NEW!</span>
                </div>
                <Image
                  src="/images/products/mint/mint-6mg.png"
                  alt="Hockey Pouches - Premium Nicotine Pouches"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-4 drop-shadow-lg"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white py-2 px-4 rounded text-center font-medium">
                  Perfect for the Rink
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Hockey Players Choose Our Pouches</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Designed specifically for hockey players and fans who need a discreet, convenient nicotine option that works with their active lifestyle.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-primary-500">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Quick Energy Boost</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Get the energy you need between periods without the crash. Perfect for maintaining focus during long games.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/products" className="font-medium text-primary-600 hover:text-primary-500">
                    Explore our products <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-accent-500">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Discreet & Convenient</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      No spitting, no mess. Use them anywhere - in the locker room, on the bench, or during travel to away games.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/research" className="font-medium text-accent-600 hover:text-accent-500">
                    Learn how they work <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-primary-500">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Team Discounts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Special pricing for hockey teams and leagues. The more players who join, the more everyone saves.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/calculator" className="font-medium text-primary-600 hover:text-primary-500">
                    Calculate team savings <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Favorites Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/ice-texture.png')] bg-repeat opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <span className="h-1 w-10 bg-primary-500 mr-2"></span>
              <h2 className="text-3xl font-extrabold text-gray-900">Player Favorites</h2>
              <span className="h-1 w-10 bg-primary-500 ml-2"></span>
            </div>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our most popular flavors among hockey players. All pouches are tobacco-free, designed for maximum performance and convenience on and off the ice.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {flavors.slice(0, 4).map((flavor, index) => (
              <div key={index} className="group relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {index === 0 ? 'BEST SELLER' : index === 1 ? 'POPULAR' : index === 2 ? 'STRONG' : 'NEW'}
                </div>
                <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden group-hover:opacity-90 transition-opacity">
                  <Image
                    src={`/images/products/${flavor.toLowerCase().replace(/\s+/g, '-')}/${flavor.toLowerCase().replace(/\s+/g, '-')}-6mg.png`}
                    alt={flavor}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-4 drop-shadow-sm"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{flavor}</h3>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="text-xs font-medium text-gray-600 ml-1">{4.5 + (index * 0.1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Perfect for {index === 0 ? 'between periods' : index === 1 ? 'long road trips' : index === 2 ? 'post-game recovery' : 'training sessions'}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-primary-600 font-medium">From $7.99</span>
                    <Link
                      href={`/products?flavor=${encodeURIComponent(flavor)}`}
                      className="text-sm font-medium text-accent-600 hover:text-accent-500 flex items-center"
                    >
                      Shop now <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Community CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 relative overflow-hidden">
        {/* Hockey-themed background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/hockey-pattern.png')] bg-repeat opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-block bg-white text-primary-600 px-3 py-1 rounded-md text-sm font-semibold mb-4">
                JOIN THE COMMUNITY
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Get the Edge On and Off the Ice
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of hockey players across Canada who trust Hockey Pouches for a clean, discreet nicotine experience that fits their active lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-block bg-white text-primary-600 px-6 py-3 rounded-md font-medium text-lg shadow-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Shop Now
                </Link>
                <Link
                  href="/account"
                  className="inline-block bg-accent-500 text-white px-6 py-3 rounded-md font-medium text-lg shadow-md hover:bg-accent-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Create Account
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg inline-block shadow-lg border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-2xl font-bold">Why Players Love Us</p>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Discreet use during games & practice</span>
                  </div>
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Quick energy boost between periods</span>
                  </div>
                  <div className="flex items-start border-b border-white/20 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No spitting required - clean & convenient</span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Fast, free shipping across Canada</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/research" className="text-lg font-bold hover:text-yellow-300 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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
