'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity);
    updateQuantity(productId, quantity);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-800">Your Shopping Cart</h1>

          {itemCount === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow-md sm:p-8">
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
              <p className="mt-4 mb-4 text-lg text-gray-600 sm:text-xl">Your cart is empty.</p>
              <Link
                href="/products"
                className="bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm sm:px-6 sm:py-3 sm:text-base"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              {/* Cart Items List */}
              <ul role="list" className="divide-y divide-gray-200">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex flex-col px-4 py-4 sm:flex-row sm:px-6 sm:py-6"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Image
                          src={product.image_url || '/images/products/placeholder.svg'}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-md border border-gray-200 object-contain p-1 sm:h-20 sm:w-20"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                        <div className="flex justify-between">
                          <div className="min-w-0 flex-1 pr-8 sm:pr-0">
                            <h4 className="text-sm font-medium text-gray-800">
                              <Link
                                href={`/products/${product.id}`}
                                className="hover:text-primary-600"
                              >
                                {product.name}
                              </Link>
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-x-4">
                              {product.flavor && (
                                <p className="text-xs text-gray-500 sm:text-sm">{product.flavor}</p>
                              )}
                              {product.strength && (
                                <p className="text-xs text-gray-500 sm:text-sm">
                                  {product.strength}mg
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flow-root flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="-m-2 inline-flex bg-white p-2 text-gray-400 hover:text-gray-500"
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
                          <p className="text-sm font-medium text-gray-900">
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
                              className="focus:border-primary-500 focus:ring-primary-500 w-16 rounded-md border border-gray-300 py-1 text-left text-sm leading-5 font-medium text-gray-700 shadow-sm focus:ring-1 focus:outline-none sm:w-20 sm:py-1.5 sm:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Order summary */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={handleCheckout}
                    className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2.5 text-sm font-medium text-white shadow-sm sm:px-6 sm:py-3 sm:text-base"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-4 flex justify-center text-center text-xs text-gray-500 sm:mt-6 sm:text-sm">
                  <p>
                    or{' '}
                    <Link
                      href="/products"
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
                <div className="mt-3 text-center sm:mt-4">
                  <button
                    onClick={() => clearCart()}
                    className="text-xs font-medium text-red-600 hover:text-red-500 sm:text-sm"
                  >
                    Clear Cart
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
