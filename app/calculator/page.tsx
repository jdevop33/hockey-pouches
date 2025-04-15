'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { products, Product, PriceTier } from '../data/products';

export default function CalculatorPage() {
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: number}>({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [savings, setSavings] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);

  // Calculate totals when selected products change
  useEffect(() => {
    let quantity = 0;
    let cost = 0;
    let baselineCost = 0;

    // Calculate for each selected product
    Object.entries(selectedProducts).forEach(([productId, productQuantity]) => {
      if (productQuantity > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const product = products.find((p: any) => p.id === parseInt(productId));
        if (product) {
          quantity += productQuantity;

          // Find the appropriate price tier
          let tierPrice = product.wholesalePrices[0].price; // Default to first tier
          for (let i = product.wholesalePrices.length - 1; i >= 0; i--) {
            if (quantity >= product.wholesalePrices[i].quantity) {
              tierPrice = product.wholesalePrices[i].price;
              setCurrentTier(i);
              break;
            }
          }

          cost += productQuantity * tierPrice;
          baselineCost += productQuantity * product.wholesalePrices[0].price;
        }
      }
    });

    setTotalQuantity(quantity);
    setTotalCost(cost);
    setSavings(baselineCost - cost);
  }, [selectedProducts]);

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Get the next price tier
  const getNextTier = (): PriceTier | null => {
    if (totalQuantity === 0) return products[0].wholesalePrices[0];

    for (let i = 0; i < products[0].wholesalePrices.length; i++) {
      if (totalQuantity < products[0].wholesalePrices[i].quantity) {
        return products[0].wholesalePrices[i];
      }
    }

    return null; // Already at highest tier
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Wholesale Pricing Calculator
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500">
              Calculate your wholesale costs and see how much you save with our volume discounts.
            </p>
          </div>

          {/* Calculator Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
            <div className="p-6 sm:p-8 bg-primary-600 text-white">
              <h2 className="text-xl font-bold mb-2">Build Your Wholesale Order</h2>
              <p>Select products and quantities to calculate your wholesale pricing</p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Products</h3>
                  <div className="space-y-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {products.map((product: any) => (
                      <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              style={{ objectFit: 'contain' }}
                              className="p-1"
                            />
                          </div>
                          <div className="flex-1 sm:hidden">
                            <h4 className="font-medium">{product.name}</h4>
                          </div>
                        </div>
                        <div className="flex-1 hidden sm:block">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                        <div className="flex sm:hidden w-full">
                          <p className="text-sm text-gray-500 flex-1">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-24 mt-2 sm:mt-0">
                          <label htmlFor={`quantity-${product.id}`} className="block text-sm font-medium text-gray-700 mr-2 sm:hidden">Quantity:</label>
                          <input
                            type="number"
                            id={`quantity-${product.id}`}
                            min="0"
                            value={selectedProducts[product.id] || 0}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-medium">{totalQuantity}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Price Tier:</span>
                        <span className="font-medium">
                          {totalQuantity > 0
                            ? `${products[0].wholesalePrices[currentTier].quantity}+ units`
                            : 'No items selected'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Per Unit:</span>
                        <span className="font-medium">
                          {totalQuantity > 0
                            ? `$${products[0].wholesalePrices[currentTier].price.toFixed(2)}`
                            : '-'}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between text-lg font-medium">
                          <span>Total Cost:</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>

                        {savings > 0 && (
                          <div className="flex justify-between text-green-600 mt-2">
                            <span>Your Savings:</span>
                            <span>${savings.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {getNextTier() && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-blue-800 text-sm">
                            <span className="font-medium">Unlock better pricing!</span> Add {getNextTier()!.quantity - totalQuantity} more units to reach the next tier and save even more.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                      <Link
                        href="/contact"
                        className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${totalQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-disabled={totalQuantity === 0}
                      >
                        Request This Order
                      </Link>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Or call us at <a href="tel:250-415-5678" className="text-primary-600 font-medium">250-415-5678</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Wholesale Pricing Tiers</h2>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-auto">
                        Quantity
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-auto">
                        Price
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-auto">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {products[0].wholesalePrices.map((tier: any, index: number) => (
                      <tr key={index} className={currentTier === index && totalQuantity > 0 ? 'bg-primary-50' : ''}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {tier.quantity}+
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          ${tier.price.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {index === 0 ? '-' : `${(((products[0].wholesalePrices[0].price - tier.price) / products[0].wholesalePrices[0].price) * 100).toFixed(1)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Why Choose Us for Wholesale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Competitive Pricing</h3>
                  <p className="text-gray-500">We offer the best wholesale prices in Canada with significant volume discounts.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Quality Guaranteed</h3>
                  <p className="text-gray-500">EU imported, highest quality tobacco-free nicotine pouches with consistent quality.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Hassle-Free Importing</h3>
                  <p className="text-gray-500">We handle all import risks and logistics so you can focus on selling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
