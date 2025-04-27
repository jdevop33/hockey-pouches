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
      <nav className="sticky top-0 z-50 border-b border-gold-500/20 bg-dark-500 shadow-lg backdrop-blur-xl transition-all duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo/logo3.svg"
                  alt="PUXX Logo"
                  width={40}
                  height={40}
                  priority
                  className="h-9 w-9"
                />
                <span className="hidden text-xl font-bold text-white sm:inline-block">PUXX</span>
              </Link>

              {/* Mobile menu button */}
              <button
                type="button"
                aria-label="Toggle menu"
                onClick={toggleMobileMenu}
                className="rounded-xl border border-gold-500/30 bg-dark-800/80 p-2.5 text-white hover:bg-dark-700 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:gap-2">
              {visibleNavItems.map(item => (
                <button
                  key={item.href}
                  className={`rounded-xl px-4 py-2 text-sm font-bold tracking-wider transition-all ${
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

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/cart')}
                className="relative rounded-xl p-2.5 text-white hover:bg-dark-400 hover:text-gold-500"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-dark-500">
                  0
                </span>
              </button>

              <button
                onClick={() => router.push(user ? '/dashboard' : '/login')}
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
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={`absolute left-0 right-0 z-50 border-b border-gold-500/20 bg-dark-900/95 shadow-lg backdrop-blur-xl transition-all duration-300 md:hidden ${
            mobileMenuOpen ? 'h-auto opacity-100' : 'pointer-events-none h-0 opacity-0'
          }`}
        >
          <div className="space-y-2 px-4 py-4">
            {visibleNavItems.map(item => (
              <button
                key={item.href}
                className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold ${
                  pathname === item.href
                    ? 'bg-gold-500 text-black shadow-md'
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

            <button
              onClick={() => {
                router.push(user ? '/dashboard' : '/login');
                setMobileMenuOpen(false);
              }}
              className="mt-3 flex w-full items-center rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-dark-900 shadow-md transition-all hover:shadow-gold-sm"
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
