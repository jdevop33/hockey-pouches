'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">Your Cart</h1>
            <div className="mt-8 rounded-lg bg-white p-8 shadow-lg">
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 h-24 w-24 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h2 className="mb-2 text-xl font-medium text-gray-900">Your cart is empty</h2>
                <p className="mb-6 text-gray-500">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                >
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900 sm:text-4xl">Your Cart</h1>

        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="bg-primary-600 p-6 text-white sm:p-8">
            <h2 className="text-xl font-bold">Cart Summary</h2>
            <p className="text-sm opacity-80">
              You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {items.map(item => {
              // Get the retail price from the product
              let retailPrice = item.product.price;
              let discountApplied = false;

              // Apply bulk discounts if applicable
              if (item.product.bulkDiscounts) {
                // Find the highest applicable discount
                const applicableDiscount = item.product.bulkDiscounts
                  .filter(discount => item.quantity >= discount.quantity)
                  .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

                if (applicableDiscount) {
                  const discountMultiplier = 1 - applicableDiscount.discountPercentage / 100;
                  retailPrice = retailPrice * discountMultiplier;
                  discountApplied = true;
                }
              }

              const itemTotal = item.quantity * retailPrice;

              return (
                <div
                  key={item.product.id}
                  className="flex flex-col items-start p-6 sm:flex-row sm:items-center"
                >
                  <div className="mb-4 flex items-center sm:mb-0 sm:mr-6">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
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
                        ${item.product.price.toFixed(2)} each{' '}
                        {discountApplied && (
                          <span className="text-xs text-green-600">
                            (${retailPrice.toFixed(2)} after discount)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full flex-col items-start sm:ml-auto sm:mt-0 sm:w-auto sm:flex-row sm:items-center">
                    <div className="mb-4 mr-0 flex items-center rounded-md border sm:mb-0 sm:mr-6">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e =>
                          updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 border-0 text-center focus:ring-0"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex w-full items-center justify-between sm:w-auto">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-medium text-gray-900 sm:mr-6 sm:w-24 sm:text-right">
                          ${itemTotal.toFixed(2)}
                        </span>
                        {discountApplied && (
                          <span className="text-xs font-medium text-green-600">
                            {
                              item.product.bulkDiscounts
                                .filter(discount => item.quantity >= discount.quantity)
                                .sort((a, b) => b.discountPercentage - a.discountPercentage)[0]
                                .discountPercentage
                            }
                            % discount applied
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="mb-6 text-sm text-gray-500">
              Shipping and taxes will be calculated at checkout.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
              >
                Proceed to Checkout
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5"
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
