'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '../components/layout/Layout';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Our Products
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500">
              Premium tobacco-free nicotine pouches imported from the EU
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Filters</h2>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <div>
                  <label htmlFor="flavor" className="block text-sm font-medium text-gray-700 mb-1">Flavor</label>
                  <select
                    id="flavor"
                    value={selectedFlavor || ''}
                    onChange={(e) => setSelectedFlavor(e.target.value || null)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Flavors</option>
                    {flavors.map(flavor => (
                      <option key={flavor} value={flavor}>{flavor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                  <select
                    id="strength"
                    value={selectedStrength?.toString() || ''}
                    onChange={(e) => setSelectedStrength(e.target.value ? parseInt(e.target.value) : null)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Strengths</option>
                    {strengths.map(strength => (
                      <option key={strength} value={strength}>{strength}mg</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedFlavor(null);
                      setSelectedStrength(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-4"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {product.strength}mg
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-500 mb-4">{product.description}</p>
                  <div className="mt-2 mb-4">
                    <span className="text-sm font-medium text-gray-500">Flavor:</span>
                    <span className="ml-2 text-sm text-gray-900">{product.flavor}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        {product.compareAtPrice ? (
                          <div className="flex items-center">
                            <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                            <p className="ml-2 text-sm line-through text-gray-500">${product.compareAtPrice.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                        )}
                        <p className="text-xs text-gray-500">Free shipping on orders over $50</p>
                        {product.bulkDiscounts && (
                          <div className="mt-1">
                            <p className="text-xs font-medium text-green-600">Bulk discounts available</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                          addedToCartId === product.id
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {addedToCartId === product.id ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or browse all products.</p>
              <button
                onClick={() => {
                  setSelectedFlavor(null);
                  setSelectedStrength(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                View All Products
              </button>
            </div>
          )}

          {/* Customer Benefits */}
          <div className="mt-16 bg-primary-600 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:px-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    Why Hockey Players Choose Us
                  </h2>
                  <p className="mt-3 text-lg text-primary-100">
                    Our nicotine pouches are designed specifically for hockey players who need a discreet, convenient option that works with their active lifestyle.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <a
                      href="/research"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                    >
                      Learn More
                    </a>
                    <a
                      href="/cart"
                      className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      View Cart
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Benefits</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Quick Energy Boost</h4>
                        <p className="mt-2 text-base text-gray-500">Get the energy you need between periods without the crash.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Discreet & Convenient</h4>
                        <p className="mt-2 text-base text-gray-500">No spitting, no mess. Use them anywhere - in the locker room or on the bench.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Premium Quality</h4>
                        <p className="mt-2 text-base text-gray-500">Made with the highest quality ingredients for a clean, consistent experience.</p>
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
