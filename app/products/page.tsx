'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '../components/layout/NewLayout';
import { products, Product } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);

  // Get unique flavors
  const flavors = Array.from(new Set(products.map(product => product.flavor)));

  // Get unique strengths
  const strengths = Array.from(new Set(products.map(product => product.strength)));

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    if (selectedFlavor && product.flavor !== selectedFlavor) return false;
    if (selectedStrength && product.strength !== selectedStrength) return false;
    return true;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1); // Add 1 as default quantity for B2C
    setAddedToCartId(product.id);

    // Reset the "Added to cart" message after 2 seconds
    setTimeout(() => {
      setAddedToCartId(null);
    }, 2000);
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Products</h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-500">
              Premium tobacco-free nicotine pouches imported from the EU
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="mb-4 text-lg font-medium text-gray-900 sm:mb-0">Filters</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <div>
                  <label htmlFor="flavor" className="mb-1 block text-sm font-medium text-gray-700">
                    Flavor
                  </label>
                  <select
                    id="flavor"
                    value={selectedFlavor || ''}
                    onChange={e => setSelectedFlavor(e.target.value || null)}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">All Flavors</option>
                    {flavors.map(flavor => (
                      <option key={flavor} value={flavor}>
                        {flavor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="strength"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Strength
                  </label>
                  <select
                    id="strength"
                    value={selectedStrength?.toString() || ''}
                    onChange={e =>
                      setSelectedStrength(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">All Strengths</option>
                    {strengths.map(strength => (
                      <option key={strength} value={strength}>
                        {strength}mg
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedFlavor(null);
                      setSelectedStrength(null);
                    }}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md"
              >
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-4"
                  />
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                      {product.strength}mg
                    </span>
                  </div>
                </div>
                <div className="flex-grow p-6">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mb-4 text-gray-500">{product.description}</p>
                  <div className="mb-4 mt-2">
                    <span className="text-sm font-medium text-gray-500">Flavor:</span>
                    <span className="ml-2 text-sm text-gray-900">{product.flavor}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {product.compareAtPrice ? (
                          <div className="flex items-center">
                            <p className="text-lg font-medium text-gray-900">
                              ${product.price.toFixed(2)}
                            </p>
                            <p className="ml-2 text-sm text-gray-500 line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-medium text-gray-900">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Free shipping on orders over $50</p>
                        {product.bulkDiscounts && (
                          <div className="mt-1">
                            <p className="text-xs font-medium text-green-600">
                              Bulk discounts available
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm ${
                          addedToCartId === product.id
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {addedToCartId === product.id ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-1 h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-1 h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-4 h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mb-4 text-gray-500">
                Try adjusting your filters or browse all products.
              </p>
              <button
                onClick={() => {
                  setSelectedFlavor(null);
                  setSelectedStrength(null);
                }}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
              >
                View All Products
              </button>
            </div>
          )}

          {/* Customer Benefits */}
          <div className="mt-16 overflow-hidden rounded-lg bg-primary-600 shadow-lg">
            <div className="px-6 py-12 sm:px-12 lg:px-16">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    Why Hockey Players Choose Us
                  </h2>
                  <p className="mt-3 text-lg text-primary-100">
                    Our nicotine pouches are designed specifically for hockey players who need a
                    discreet, convenient option that works with their active lifestyle.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="/research"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-700 hover:bg-primary-50"
                    >
                      Learn More
                    </a>
                    <a
                      href="/cart"
                      className="inline-flex items-center justify-center rounded-md border border-white px-5 py-3 text-base font-medium text-white hover:bg-primary-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      View Cart
                    </a>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Customer Benefits</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Quick Energy Boost</h4>
                        <p className="mt-2 text-base text-gray-500">
                          Get the energy you need between periods without the crash.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Discreet & Convenient</h4>
                        <p className="mt-2 text-base text-gray-500">
                          No spitting, no mess. Use them anywhere - in the locker room or on the
                          bench.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Premium Quality</h4>
                        <p className="mt-2 text-base text-gray-500">
                          Made with the highest quality ingredients for a clean, consistent
                          experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
