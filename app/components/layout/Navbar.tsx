'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, LogIn, Menu, X } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean;
  roles?: string[];
}

/**
 * Primary navigation component that follows Refactoring UI principles:
 * - Clear visual hierarchy
 * - Consistent spacing using a defined scale
 * - Limited color palette for better focus
 * - De-emphasized inactive elements
 * - Reduced borders in favor of spacing and subtle backgrounds
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle window scroll for potential background opacity changes
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items - putting function first
  const baseNavItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/research', label: 'Benefits' },
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Contact' },
    { href: '/wholesale/apply', label: 'Wholesale' },
  ];

  // Dynamic items based on auth state
  const getNavItems = () => {
    const items = [...baseNavItems];

    if (user) {
      if (user.role === 'Admin') {
        items.push({
          href: '/admin/dashboard',
          label: 'Admin',
          roles: ['Admin'],
        });
      } else if (user.role === 'Distributor') {
        items.push({
          href: '/distributor/dashboard',
          label: 'Dashboard',
          roles: ['Distributor'],
        });
      }
    }

    return items.filter(item => {
      if (item.authRequired && !user) return false;
      if (item.roles && (!user || !item.roles.includes(user.role))) return false;
      return true;
    });
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';

    if (user.role === 'Admin') {
      return '/admin/dashboard';
    } else if (user.role === 'Distributor') {
      return '/distributor/dashboard';
    } else {
      return '/dashboard';
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = getNavItems();

  return (
    <nav
      className={`fixed top-0 z-30 w-full transition-colors duration-200 ${
        scrolled ? 'bg-dark-900/95 shadow-md' : 'bg-dark-900/80'
      } backdrop-blur-sm`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - high contrast, immediately visible */}
          <div className="flex items-center">
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

            {/* Desktop navigation - clear hierarchy with active state emphasized */}
            <div className="hidden md:ml-8 md:block">
              <div className="flex items-center space-x-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-dark-800 text-gold-500' // Active: high contrast, gold color
                        : 'text-gray-300 hover:bg-dark-800/50 hover:text-white' // Inactive: de-emphasized
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side actions - cart and account */}
          <div className="flex items-center space-x-4">
            {/* Cart button with count indicator */}
            <Link
              href="/cart"
              className="relative rounded-md p-2 text-gray-300 transition-colors hover:bg-dark-800/50 hover:text-white"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-dark-900">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account/Sign in button - primary call to action */}
            <Link
              href={getDashboardRoute()}
              className="hidden items-center rounded-md bg-gold-500 px-3 py-2 text-sm font-medium text-dark-900 shadow-sm transition-colors hover:bg-gold-400 md:flex"
            >
              {user ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Account
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-dark-800 hover:text-white focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified with consistent styling */}
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } absolute inset-x-0 top-16 border-t border-dark-700 bg-dark-900/95 md:hidden`}
      >
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                pathname === item.href
                  ? 'bg-dark-800 text-gold-500'
                  : 'text-gray-300 hover:bg-dark-800/50 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={getDashboardRoute()}
            className="mt-1 flex w-full items-center justify-center rounded-md bg-gold-500 px-3 py-2 text-base font-medium text-dark-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            {user ? (
              <>
                <User className="mr-2 h-4 w-4" />
                My Account
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center justify-center rounded-md border border-dark-700 bg-dark-800 px-3 py-2 text-base font-medium text-gray-300 hover:bg-dark-700 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
