'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface CartItem {
  id: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  subtotal: number;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
}

const CartSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);

  const fetchCart = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchCart();
    }
  }, [isOpen, token, fetchCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  {loading ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : cart && cart.items.length > 0 ? (
                    <div className="flow-root">
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.items.map(item => (
                          <li key={item.id} className="flex py-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                  <span className="text-gray-500">No image</span>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <Link href={`/products/${item.productId}`}>
                                      {item.productName}
                                    </Link>
                                  </h3>
                                  <p className="ml-4">${item.subtotal.toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  ${item.price.toFixed(2)} each
                                </p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={loading}
                                    aria-label={`Decrease quantity of ${item.productName}`}
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={loading}
                                    aria-label={`Increase quantity of ${item.productName}`}
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                <div className="flex">
                                  <button
                                    type="button"
                                    className="font-medium text-red-600 hover:text-red-500"
                                    onClick={() => removeItem(item.id)}
                                    disabled={loading}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 text-right">
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                          onClick={clearCart}
                          disabled={loading}
                        >
                          Clear Cart
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start shopping to add items to your cart
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/products"
                          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={onClose}
                        >
                          View Products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {cart && cart.items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${cart.subtotal.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/checkout"
                      className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Checkout
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="font-medium text-blue-600 hover:text-blue-500"
                        onClick={onClose}
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
