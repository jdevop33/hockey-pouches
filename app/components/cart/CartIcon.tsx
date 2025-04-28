'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

const CartIcon: React.FC = () => {
  // Initially set a fallback count that won't show the badge
  const [count, setCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart(); // Move the hook call outside useEffect

  useEffect(() => {
    // Only update state after component is mounted on client
    setIsMounted(true);
    setCount(cart.itemCount);
  }, [cart.itemCount]);

  // When server-side rendering or before hydration, use the fallback
  if (!isMounted) {
    return (
      <Link href="/cart" className="group relative">
        <div className="rounded-full p-2 transition-colors hover:bg-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-300 group-hover:text-gold-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/cart" className="group relative">
      <div className="rounded-full p-2 transition-colors hover:bg-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-300 group-hover:text-gold-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-black">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;
