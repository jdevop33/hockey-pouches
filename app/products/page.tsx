'use client'; // Added directive

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Added missing Link import
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
            {/* ... filter controls ... */}
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="mb-4 text-lg font-medium text-gray-900 sm:mb-0">Filters</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <div>
                  <label htmlFor="flavor" className="mb-1 block text-sm font-medium text-gray-700">Flavor</label>
                  <select id="flavor" value={selectedFlavor || ''} onChange={e => setSelectedFlavor(e.target.value || null)} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                    <option value="">All Flavors</option>
                    {flavors.map(flavor => (<option key={flavor} value={flavor}>{flavor}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="strength" className="mb-1 block text-sm font-medium text-gray-700">Strength</label>
                  <select id="strength" value={selectedStrength?.toString() || ''} onChange={e => setSelectedStrength(e.target.value ? parseInt(e.target.value) : null)} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                    <option value="">All Strengths</option>
                    {strengths.map(strength => (<option key={strength} value={strength}>{strength}mg</option>))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setSelectedFlavor(null); setSelectedStrength(null); }} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Clear Filters</button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
                <div className="relative h-64 bg-gray-100">
                  <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain' }} className="p-4"/>
                  <div className="absolute right-4 top-4"><span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">{product.strength}mg</span></div>
                </div>
                <div className="flex-grow p-6">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mb-4 text-gray-500">{product.description}</p>
                  <div className="mb-4 mt-2">
                    <span className="text-sm font-medium text-gray-500">Flavor:</span><span className="ml-2 text-sm text-gray-900">{product.flavor}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>{/* ... price display ... */}</div>
                      <button onClick={() => handleAddToCart(product)} className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm ${addedToCartId === product.id ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                        {/* ... button content ... */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
             <div className="rounded-lg bg-white p-8 text-center shadow-md"> {/* ... No products found message ... */} </div>
          )}
          
          {/* --- MLM/Referral System Additions --- */}
          {/* TODO: Add MLM/Referral info here */}
          
          <div className="mt-16 overflow-hidden rounded-lg bg-primary-600 shadow-lg"> {/* ... Customer Benefits Section ... */} </div>
        </div>
      </div>
    </Layout>
  );
}
