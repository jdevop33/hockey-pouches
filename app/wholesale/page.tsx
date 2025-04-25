'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import { Button } from '../components/ui/button-shadcn';

export default function WholesalePage() {
  const [quantity, setQuantity] = useState(100);
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Calculate pricing based on quantity
  const getPricePerUnit = () => {
    if (quantity >= 1000) return 8.50;
    if (quantity >= 500) return 9.25;
    if (quantity >= 250) return 10.00;
    if (quantity >= 100) return 10.75;
    return 12.00; // Retail price
  };

  const getDiscount = () => {
    const retailPrice = 15.00;
    const wholesalePrice = getPricePerUnit();
    return ((retailPrice - wholesalePrice) / retailPrice * 100).toFixed(1);
  };

  const getTotalPrice = () => {
    return (getPricePerUnit() * quantity).toFixed(2);
  };

  const getSavings = () => {
    const retailTotal = 15.00 * quantity;
    const wholesaleTotal = getPricePerUnit() * quantity;
    return (retailTotal - wholesaleTotal).toFixed(2);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-cream-50 dark:bg-rich-950 text-rich-900 dark:text-cream-50 relative py-24">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-30 dark:opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="bg-navy-600 mb-6 inline-block rounded-full px-3 py-1 text-sm font-medium text-white">
                WHOLESALE PROGRAM
              </div>
              <h1 className="text-rich-900 dark:text-cream-50 mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Premium Wholesale <span className="text-navy-500">Solutions</span>
              </h1>
              <p className="text-rich-700 dark:text-cream-300 mb-10 max-w-xl text-xl leading-relaxed">
                Offer your customers the finest tobacco-free nicotine experience with significant margins and dedicated support.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button className="bg-navy-600 hover:bg-navy-700 border-none text-white">
                  <a href="#calculator">Wholesale Calculator</a>
                </Button>
                <Button variant="outline" className="border-navy-400 text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-rich-800">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <div className="relative mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl shadow-lg lg:max-w-none">
                <div className="bg-navy-600 absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm">
                  EXCLUSIVE
                </div>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/images/products/placeholder.svg"
                    alt="PUXX Premium Wholesale Program"
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

      {/* Benefits Section */}
      <section className="bg-cream-100 dark:bg-rich-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-navy-600 dark:text-navy-400 inline-block text-sm font-medium">
              WHY CHOOSE US
            </span>
            <h2 className="text-rich-950 dark:text-cream-50 mt-3 mb-4 text-3xl font-bold">
              The PUXX Premium Advantage
            </h2>
            <p className="text-rich-700 dark:text-cream-300 mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
              Partner with us and experience the difference that premium quality, exceptional service, and competitive pricing can make for your business.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="dark:bg-rich-800 rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg">
              <div className="bg-anzac-400 mb-6 flex h-12 w-12 items-center justify-center rounded-full font-bold text-white">
                01
              </div>
              <h3 className="text-rich-950 dark:text-cream-50 mb-3 text-xl font-bold">
                Competitive Pricing
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                Volume discounts starting at just 100 units with significant savings at higher quantities.
              </p>
            </div>

            <div className="dark:bg-rich-800 rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg">
              <div className="bg-navy-600 mb-6 flex h-12 w-12 items-center justify-center rounded-full font-bold text-white">
                02
              </div>
              <h3 className="text-rich-950 dark:text-cream-50 mb-3 text-xl font-bold">
                Premium Quality
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                Globally-sourced, highest quality tobacco-free nicotine pouches with consistent quality control.
              </p>
            </div>

            <div className="dark:bg-rich-800 rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg">
              <div className="bg-forest-600 mb-6 flex h-12 w-12 items-center justify-center rounded-full font-bold text-white">
                03
              </div>
              <h3 className="text-rich-950 dark:text-cream-50 mb-3 text-xl font-bold">
                Hassle-Free Importing
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                We handle all import risks and logistics so you can focus on selling to your customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section id="calculator" className="bg-cream-50 dark:bg-rich-950 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-navy-600 dark:text-navy-400 inline-block text-sm font-medium">
              PRICING CALCULATOR
            </span>
            <h2 className="text-rich-950 dark:text-cream-50 mt-3 text-3xl font-bold">
              Calculate Your Wholesale Savings
            </h2>
            <p className="text-rich-700 dark:text-cream-300 mx-auto mt-6 max-w-2xl text-lg">
              Use our calculator to see how much you can save with our wholesale program.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="from-cream-100 dark:from-rich-900 to-white dark:to-rich-800 bg-gradient-to-br rounded-2xl p-8 shadow-lg">
              <h3 className="text-rich-950 dark:text-cream-50 text-2xl font-bold mb-6">
                Wholesale Calculator
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                    Product Selection
                  </label>
                  <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-navy-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="classic">Classic Collection</option>
                    <option value="intense">Intense Collection</option>
                    <option value="light">Light Collection</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                    Quantity: {quantity} units
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-cream-200 dark:bg-rich-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-rich-600 dark:text-cream-400 mt-1">
                    <span>100</span>
                    <span>250</span>
                    <span>500</span>
                    <span>750</span>
                    <span>1000+</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="bg-navy-600 hover:bg-navy-700 w-full border-none text-white">
                    <Link href="/contact">Contact for Custom Quote</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="from-cream-100 dark:from-rich-900 to-white dark:to-rich-800 bg-gradient-to-br rounded-2xl p-8 shadow-lg">
              <h3 className="text-rich-950 dark:text-cream-50 text-2xl font-bold mb-6">
                Your Savings
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-cream-200 dark:border-rich-700 pb-4">
                  <span className="text-rich-700 dark:text-cream-300">Retail Price:</span>
                  <span className="text-rich-950 dark:text-cream-50 font-bold">$15.00 per unit</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-cream-200 dark:border-rich-700 pb-4">
                  <span className="text-rich-700 dark:text-cream-300">Wholesale Price:</span>
                  <span className="text-navy-600 dark:text-navy-400 font-bold">${getPricePerUnit().toFixed(2)} per unit</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-cream-200 dark:border-rich-700 pb-4">
                  <span className="text-rich-700 dark:text-cream-300">Discount:</span>
                  <span className="text-forest-600 dark:text-forest-400 font-bold">{getDiscount()}%</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-cream-200 dark:border-rich-700 pb-4">
                  <span className="text-rich-700 dark:text-cream-300">Quantity:</span>
                  <span className="text-rich-950 dark:text-cream-50 font-bold">{quantity} units</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-cream-200 dark:border-rich-700 pb-4">
                  <span className="text-rich-700 dark:text-cream-300">Total Savings:</span>
                  <span className="text-forest-600 dark:text-forest-400 font-bold">${getSavings()}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-rich-700 dark:text-cream-300 text-lg font-medium">Your Total:</span>
                  <span className="text-anzac-600 dark:text-anzac-400 text-2xl font-bold">${getTotalPrice()}</span>
                </div>
                
                <div className="text-center text-sm text-rich-600 dark:text-cream-400 pt-4">
                  Contact our sales team for custom quotes on larger quantities or special requirements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-navy-600 to-navy-700 bg-gradient-to-br py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Stock Your Store?</h2>
            <p className="mb-8 text-lg">
              Contact us today to discuss your wholesale needs or request samples to experience our quality firsthand.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-navy-600 hover:bg-cream-100 border-none">
                <Link href="/contact">Contact Sales Team</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-navy-500">
                <Link href="/request-samples">Request Samples</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm opacity-80">
              Our wholesale specialists are available Monday-Friday, 9am-5pm PST
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
