'use client';

import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/layout/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">About Hockey Pouches</h1>

          {/* Company Story */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 mb-4">
                  Hockey Pouches was founded in 2022 by a group of passionate hockey players who were looking for a better nicotine alternative that would fit their active lifestyle on and off the ice.
                </p>
                <p className="text-gray-600 mb-4">
                  As hockey players ourselves, we understood the unique challenges of using traditional tobacco products in a hockey environment. The cold rinks, the need for quick energy boosts between periods, and the desire for a discreet option that wouldn't affect performance led us to discover nicotine pouches.
                </p>
                <p className="text-gray-600">
                  We started importing premium European nicotine pouches for our own team, and soon other players were asking where they could get them. That's when Hockey Pouches was born - a brand dedicated to providing Canadian hockey players with the highest quality nicotine pouches designed specifically for their lifestyle.
                </p>
              </div>
              <div className="relative h-64 rounded-lg bg-white flex items-center justify-center p-8 shadow-md">
                <Image
                  src="/images/logo/hockey-logo.svg"
                  alt="Hockey Pouches Logo"
                  width={400}
                  height={200}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-gray-600">
                  We never compromise on quality. Our products are designed for athletes who demand the best, with consistent performance in every pouch.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Partnership</h3>
                <p className="text-gray-600">
                  We believe in building a community of hockey players who share our passion. We support local teams and are committed to enhancing the hockey experience both on and off the ice.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We stay ahead of the game, continuously improving our products to meet the unique needs of hockey players and developing new solutions that enhance performance and recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative h-48 w-48 rounded-full mx-auto mb-4 overflow-hidden bg-primary-100">
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
                <div className="relative h-48 w-48 rounded-full mx-auto mb-4 overflow-hidden bg-primary-100">
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
                <div className="relative h-48 w-48 rounded-full mx-auto mb-4 overflow-hidden bg-primary-100">
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
          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;Hockey Pouches has been a game-changer for me during the season. I can use them discreetly between periods for that extra boost, and they don't affect my breathing or performance like other products did. The mint flavor is perfect for keeping me alert during those late-night games.&quot;
                </p>
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full mr-3 overflow-hidden">
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;As a hockey coach, I was looking for an alternative to traditional tobacco products for myself and to recommend to my adult players. Hockey Pouches are perfect - they're discreet, don't require spitting, and don't leave a mess in the locker room. Plus, the team discount program is a great perk for our club.&quot;
                </p>
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full mr-3 overflow-hidden">
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
          <div className="bg-primary-600 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Join the Team?</h2>
            <p className="mb-6">
              Join thousands of hockey players across Canada who trust Hockey Pouches for a clean, discreet nicotine experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="bg-white text-primary-600 px-6 py-3 rounded-md font-medium text-center hover:bg-gray-100"
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium text-center hover:bg-primary-700"
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
