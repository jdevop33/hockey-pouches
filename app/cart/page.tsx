'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity);
    cart.updateQuantity(productId, quantity);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Show a minimal loading state while client-side hydration is happening
  if (!isMounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-100">Your Curated Selection</h1>
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-gold-sm sm:p-8">
              <p className="text-gray-400">Loading your selections...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const { items, itemCount, subtotal, removeFromCart, clearCart } = cart;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-100">Your Curated Selection</h1>

          {itemCount === 0 ? (
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-gold-sm sm:p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="mb-4 mt-4 text-lg text-gray-300 sm:text-xl">
                Your collection awaits its first selection.
              </p>
              <p className="mb-6 text-sm text-gray-400">
                Discover our premium nicotine pouches crafted for those with refined tastes.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-gold-600 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gold-500 sm:px-6 sm:py-3 sm:text-base"
              >
                Explore The Collection
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-gray-800 shadow-gold-sm">
              {/* Cart Items List */}
              <ul role="list" className="divide-y divide-gray-700">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex flex-col px-4 py-4 sm:flex-row sm:px-6 sm:py-6"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Image
                          src={product.image_url || '/images/products/fallback.jpg'}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-md border border-gray-600 object-contain p-1 sm:h-20 sm:w-20"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                        <div className="flex justify-between">
                          <div className="min-w-0 flex-1 pr-8 sm:pr-0">
                            <h4 className="text-sm font-medium text-gray-100">
                              <Link
                                href={`/products/${product.id}`}
                                className="hover:text-gold-400"
                              >
                                {product.name}
                              </Link>
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-x-4">
                              {product.flavor && (
                                <p className="text-xs text-gray-400 sm:text-sm">
                                  {product.flavor} Profile
                                </p>
                              )}
                              {product.strength && (
                                <p className="text-xs text-gray-400 sm:text-sm">
                                  {product.strength}mg Precision
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flow-root flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <svg
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.234-2.326.468C2.88 4.82 2 5.737 2 6.828v6.344c0 1.09.88 1.992 2.02 2.13.746.14 1.539.267 2.326.357v.443A2.75 2.75 0 008.75 19h2.5A2.75 2.75 0 0014 16.25v-.443c.787-.09 1.58-.217 2.326-.357C17.12 15.32 18 14.41 18 13.172V6.828c0-1.09-.88-2.008-2.02-2.144A11.02 11.02 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v12.5c0 .69-.56 1.25-1.25 1.25h-2.5c-.69 0-1.25-.56-1.25-1.25V3.75z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-2 pt-2 sm:flex-nowrap">
                          <p className="text-sm font-medium text-gray-100">
                            ${product.price.toFixed(2)}
                          </p>
                          <div>
                            <label htmlFor={`quantity-${product.id}`} className="sr-only">
                              Quantity
                            </label>
                            <input
                              id={`quantity-${product.id}`}
                              name={`quantity-${product.id}`}
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={e =>
                                handleQuantityChange(product.id, parseInt(e.target.value))
                              }
                              className="w-16 rounded-md border border-gray-700 bg-gray-700 py-1 text-left text-sm font-medium leading-5 text-gray-100 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 sm:w-20 sm:py-1.5 sm:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Order summary */}
              <div className="border-t border-gray-700 px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex justify-between text-base font-medium text-gray-100">
                  <p>Collection Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Premium shipping and applicable taxes calculated at checkout.
                </p>

                {/* Trust indicators */}
                <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-400">
                  <span className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Secure Checkout
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Discreet Billing
                  </span>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={handleCheckout}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-gold-600 px-4 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-gold-500 sm:px-6 sm:py-3 sm:text-base"
                  >
                    Complete Your Selection
                  </button>
                </div>
                <div className="mt-4 flex justify-center text-center text-xs text-gray-400 sm:mt-6 sm:text-sm">
                  <p>
                    or{' '}
                    <Link
                      href="/products"
                      className="font-medium text-gold-400 hover:text-gold-300"
                    >
                      Continue Curating<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
                <div className="mt-3 text-center sm:mt-4">
                  <button
                    onClick={() => clearCart()}
                    className="text-xs font-medium text-red-400 hover:text-red-300 sm:text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
