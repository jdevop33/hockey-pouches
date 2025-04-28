'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import { ShoppingCart, Menu, User, LogOut, LogIn, X } from 'lucide-react';
import Footer from './Footer';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean;
  roles?: string[];
}

// Separate component for authenticated navigation to avoid conditional hook calls
const AuthenticatedNavigation: React.FC = () => {
  const authContext = useAuth();
  const cartContext = useCart();
  const user = authContext.user;
  const logout = authContext.logout;
  const itemCount = cartContext.itemCount;

  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Helper function to get the correct dashboard route
  const getDashboardRoute = () => {
    if (!user) return '/login';

    // Route based on user role
    if (user.role === 'Admin') {
      return '/admin/dashboard';
    } else if (user.role === 'Distributor') {
      return '/distributor/dashboard';
    } else {
      return '/dashboard';
    }
  };

  const baseNavItems: NavItem[] = [
    { href: '/', label: 'HOME' },
    { href: '/products', label: 'SHOP' },
    { href: '/research', label: 'BENEFITS' },
    { href: '/about', label: 'OUR STORY' },
    { href: '/contact', label: 'CONTACT' },
    { href: '/wholesale/apply', label: 'WHOLESALE' },
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

  return (
    <nav className="fixed top-0 z-30 w-full backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 focus:outline-none">
              <div className="h-full w-28 rounded-lg p-2">
                <Image
                  src="/images/logo/logo3.svg"
                  alt="PUXX"
                  width={100}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop navigation links */}
            <div className="hidden md:ml-6 md:block">
              <div className="flex items-center space-x-4">
                {visibleNavItems
                  .filter(
                    item =>
                      !item.authRequired ||
                      (user && (!item.roles || item.roles.includes(user.role)))
                  )
                  .map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                        pathname === item.href
                          ? 'bg-dark-800/60 text-gold-500 shadow-sm'
                          : 'text-white hover:bg-dark-800/40 hover:text-gold-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* Desktop right-side buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/cart')}
              className="relative rounded-xl p-2.5 text-white hover:bg-dark-400 hover:text-gold-500"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-dark-500">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <Link
              href={getDashboardRoute()}
              className="hidden items-center rounded-xl bg-gradient-gold px-5 py-2 text-xs font-bold text-dark-500 shadow-gold-sm transition-all hover:shadow-gold md:flex"
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
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-dark-800 hover:text-white focus:outline-none"
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

      {/* Mobile menu dropdown */}
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } absolute left-0 right-0 top-20 z-50 border-t border-dark-700 bg-dark-900/90 backdrop-blur-md md:hidden`}
      >
        <div className="space-y-1 px-3 py-3 sm:px-5">
          {visibleNavItems
            .filter(
              item =>
                !item.authRequired || (user && (!item.roles || item.roles.includes(user.role)))
            )
            .map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-dark-800 text-gold-500'
                    : 'text-white hover:bg-dark-800 hover:text-gold-500'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

          <Link
            href={getDashboardRoute()}
            className="mt-3 flex w-full items-center rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-dark-900 shadow-md transition-all hover:shadow-gold-sm"
            onClick={() => setMobileMenuOpen(false)}
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
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center rounded-xl border border-gold-500/30 bg-dark-800/80 px-4 py-3 text-sm font-bold text-white hover:bg-dark-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              SIGN OUT
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// Fallback navigation when auth context isn't available
const BasicNavigation: React.FC = () => {
  return (
    <nav className="fixed top-0 z-30 w-full backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 focus:outline-none">
              <div className="h-full w-28 rounded-lg p-2">
                <Image
                  src="/images/logo/logo3.svg"
                  alt="PUXX"
                  width={100}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Component that conditionally renders Navigation without conditional hooks
const Navigation: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <BasicNavigation />;
  }

  // Only try to render auth navigation on client side
  // We wrap this in error boundary pattern
  try {
    return <AuthenticatedNavigation />;
  } catch (error) {
    console.error('Failed to render authenticated navigation:', error);
    return <BasicNavigation />;
  }
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
