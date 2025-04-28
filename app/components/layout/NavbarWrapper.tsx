'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Navbar';

/**
 * Basic fallback navbar used during SSR or if authentication context fails
 */
const BasicNavbar = () => {
  return (
    <nav className="fixed top-0 z-30 w-full bg-dark-900/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex-shrink-0">
            <div className="h-10 w-28">
              <Image
                src="/images/logo/logo3.svg"
                alt="PUXX"
                width={100}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

/**
 * Wrapper that safely handles client-side rendering of the Navbar component
 * Prevents hydration mismatches and provides a fallback for SSR
 */
export default function NavbarWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR or before hydration, use the simple Navbar
  if (!isClient) {
    return <BasicNavbar />;
  }

  // After hydration, try to render the full Navbar
  try {
    return <Navbar />;
  } catch (error) {
    console.error('Failed to render Navbar with authentication:', error);
    return <BasicNavbar />;
  }
}
