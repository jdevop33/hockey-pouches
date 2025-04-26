'use client';

import React, { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import { ShoppingCart, Menu, User, LogOut, LogIn } from 'lucide-react';
import Footer from './Footer';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean;
  roles?: string[];
}

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const baseNavItems: NavItem[] = [
    { href: '/', label: 'HOME' },
    { href: '/products', label: 'SHOP' },
    { href: '/research', label: 'BENEFITS' },
    { href: '/about', label: 'OUR STORY' },
    { href: '/contact', label: 'CONTACT' },
  ];

  const dynamicNavItems: NavItem[] = [...baseNavItems];
  if (user) {
    if (user.role === 'Admin') {
      dynamicNavItems.push({
        href: '/admin/dashboard',
        label: 'ADMIN',
        roles: ['Admin'],
      });
    } else if (user.role === 'Distributor') {
      dynamicNavItems.push({
        href: '/distributor/dashboard',
        label: 'DASHBOARD',
        roles: ['Distributor'],
      });
    } else {
      dynamicNavItems.push({ href: '/dashboard', label: 'MY ACCOUNT', authRequired: true });
    }
    dynamicNavItems.push({ href: '/cart', label: 'CART' });
  } else {
    dynamicNavItems.push({ href: '/cart', label: 'CART' });
  }

  const visibleNavItems = dynamicNavItems.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.roles && (!user || !item.roles.includes(user.role))) return false;
    return true;
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Desktop nav */}
      <nav className="sticky top-0 z-50 hidden border-b border-gold-500/20 bg-dark-500 shadow-lg backdrop-blur-xl transition-all duration-200 md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo/logo3.svg"
                  alt="PUXX Logo"
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10"
                />
                <span className="hidden text-xl font-bold text-white sm:inline-block">PUXX</span>
              </Link>
              <div className="flex items-center gap-1">
                {visibleNavItems.map(item => (
                  <button
                    key={item.href}
                    className={`rounded-md px-4 py-2 text-sm font-bold tracking-wider transition-all ${
                      pathname === item.href
                        ? 'bg-gold-500 text-black shadow-gold-sm'
                        : 'bg-dark-800/80 text-white hover:bg-gold-500 hover:text-black'
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/cart')}
                className="relative rounded-full p-2 text-white hover:bg-dark-400 hover:text-gold-500"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-dark-500">
                  0
                </span>
              </button>

              <button
                onClick={() => router.push(user ? '/dashboard' : '/login')}
                className="flex items-center rounded-md bg-gradient-gold px-4 py-2 text-xs font-bold text-dark-500 shadow-gold-sm transition-all hover:shadow-gold"
              >
                {user ? (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    ACCOUNT
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    SIGN IN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gold-500/20 bg-dark-500/95 shadow-lg transition-all duration-200 md:hidden">
        <div className="flex h-16 flex-1 items-center justify-around">
          {visibleNavItems.slice(0, 4).map(item => (
            <button
              key={item.href}
              className={`flex flex-col items-center justify-center px-2 py-1 text-xs font-bold ${
                pathname === item.href ? 'text-gold-500' : 'text-white hover:text-gold-500'
              }`}
              onClick={() => router.push(item.href)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            aria-label="Open menu"
            onClick={toggleMobileMenu}
            className="flex flex-col items-center justify-center px-2 py-1 text-xs font-bold text-white hover:text-gold-500"
          >
            <Menu className="h-5 w-5" />
            <span>MORE</span>
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
            mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile menu panel */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-dark-500 p-6 shadow-xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mb-6 flex justify-between">
            <h2 className="text-xl font-bold text-gold-500">Menu</h2>
            <button
              type="button"
              aria-label="Close menu"
              className="rounded-full p-2 text-gray-400 hover:bg-dark-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {visibleNavItems.map(item => (
              <button
                key={item.href}
                className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-bold ${
                  pathname === item.href
                    ? 'bg-gold-500 text-black'
                    : 'bg-dark-800/80 text-white hover:bg-gold-500 hover:text-black'
                }`}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-gold-500/10 pt-6">
            <button
              onClick={() => {
                router.push(user ? '/dashboard' : '/login');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-center rounded-lg bg-gold-500 px-4 py-3 text-sm font-bold text-dark-500"
            >
              {user ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  MY ACCOUNT
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  SIGN IN
                </>
              )}
            </button>

            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="mt-3 flex w-full items-center justify-center rounded-lg border border-gold-500/20 bg-transparent px-4 py-3 text-sm font-bold text-white hover:bg-dark-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                SIGN OUT
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-dark-500">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
