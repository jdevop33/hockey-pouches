'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Your Cart</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
                <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">Your Cart</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8 bg-primary-600 text-white">
            <h2 className="text-xl font-bold">Cart Summary</h2>
            <p className="text-sm opacity-80">You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>

          <div className="divide-y divide-gray-200">
            {items.map((item) => {
              // For B2C, we use a fixed retail price (2x the wholesale price)
              const retailPrice = item.product.wholesalePrices[0].price * 2;
              const itemTotal = item.quantity * retailPrice;

              return (
                <div key={item.product.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-2"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.product.description}</p>
                      <p className="mt-1 text-sm font-medium text-primary-600">
                        ${retailPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 w-full sm:w-auto sm:ml-auto">
                    <div className="flex items-center border rounded-md mr-0 sm:mr-6 mb-4 sm:mb-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border-0 focus:ring-0"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-medium text-gray-900 sm:mr-6 sm:text-right sm:w-24">
                          ${itemTotal.toFixed(2)}
                        </span>
                        {item.quantity >= 3 && (
                          <span className="text-xs text-green-600 font-medium">
                            Bulk discount applied
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Shipping and taxes will be calculated at checkout.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
