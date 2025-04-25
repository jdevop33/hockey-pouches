'use client';

import React, { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Settings,
  LogOut,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import CartIcon from '../cart/CartIcon';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean; // Optionally hide/show based on auth
  roles?: string[]; // Optionally show only for specific roles
}

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout, isLoading: authIsLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    // Optionally redirect to home or login page after logout
    router.push('/');
  };

  // Define nav items, potentially adding dashboard links based on role
  const baseNavItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/craftsmanship', label: 'Craftsmanship' },
    { href: '/experience', label: 'Experience' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/contact', label: 'Contact' },
  ];

  const dynamicNavItems: NavItem[] = [...baseNavItems];
  if (user) {
    // Add dashboard links based on role
    if (user.role === 'Admin') {
      // For admin users, use the admin dashboard as their account page
      dynamicNavItems.push({
        href: '/admin/dashboard',
        label: 'Admin Dashboard',
        roles: ['Admin'],
      });
    } else if (user.role === 'Distributor') {
      // For distributor users, use the distributor dashboard as their account page
      dynamicNavItems.push({
        href: '/distributor/dashboard',
        label: 'Distributor Dashboard',
        roles: ['Distributor'],
      });
    } else {
      // Regular users get the standard dashboard
      dynamicNavItems.push({ href: '/dashboard', label: 'My Account', authRequired: true });
    }
    // All users get cart
    dynamicNavItems.push({ href: '/cart', label: 'Cart' });
  } else {
    // Only show cart if not logged in (assuming login/register are separate)
    dynamicNavItems.push({ href: '/cart', label: 'Cart' });
  }

  // Filter items based on auth status and role (though role check is implicitly handled above)
  const visibleNavItems = dynamicNavItems.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.roles && (!user || !item.roles.includes(user.role))) return false;
    return true;
  });

  return (
    <nav className="border-primary-200 dark:border-secondary-800 dark:bg-secondary-950/95 sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
      {/* Desktop navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-secondary-950 text-3xl font-bold dark:text-white">PUXX</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {visibleNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    // Handle potential dashboard parent paths for active state
                    pathname === item.href ||
                    (item.href.includes('dashboard') && pathname.startsWith(item.href))
                      ? 'text-primary-500 dark:text-primary-400 font-semibold'
                      : 'text-secondary-800 hover:text-primary-500 dark:hover:text-primary-400 transition-colors dark:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Actions */}
              <div className="ml-4 flex items-center space-x-4">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full p-2 transition-colors dark:text-white"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="text-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full p-2 transition-colors dark:text-white">
                  <Search size={20} />
                </button>
                <CartIcon />
                {authIsLoading ? (
                  <span className="text-secondary-500 dark:text-secondary-300 text-sm">
                    Loading...
                  </span>
                ) : user ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <div className="bg-primary-100 dark:bg-secondary-800 text-primary-600 dark:text-primary-400 flex h-8 w-8 items-center justify-center rounded-full">
                        <User size={16} />
                      </div>
                      <span>Hi, {user.name.split(' ')[0]}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileMenuOpen && (
                      <div className="border-secondary-200 dark:border-secondary-700 dark:bg-secondary-900 ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-white shadow-lg ring-1 ring-black focus:outline-none">
                        <div className="border-secondary-200 dark:border-secondary-700 border-b px-4 py-3">
                          <p className="text-secondary-900 text-sm font-medium dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-secondary-500 dark:text-secondary-400 text-xs">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          {user.role === 'Admin' ? (
                            <Link
                              href="/admin/dashboard"
                              className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Settings size={16} className="mr-2" />
                              Admin Dashboard
                            </Link>
                          ) : user.role === 'Distributor' ? (
                            <Link
                              href="/distributor/dashboard"
                              className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Settings size={16} className="mr-2" />
                              Distributor Dashboard
                            </Link>
                          ) : (
                            <Link
                              href="/dashboard"
                              className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Settings size={16} className="mr-2" />
                              My Dashboard
                            </Link>
                          )}

                          <Link
                            href="/dashboard/profile"
                            className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User size={16} className="mr-2" />
                            Profile Settings
                          </Link>

                          <Link
                            href="/dashboard/orders"
                            className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <ShoppingBag size={16} className="mr-2" />
                            My Orders
                          </Link>

                          {user.role === 'Referrer' && (
                            <Link
                              href="/dashboard/referrals"
                              className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <CreditCard size={16} className="mr-2" />
                              My Commissions
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              handleLogout();
                              setProfileMenuOpen(false);
                            }}
                            className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center px-4 py-2 text-sm"
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-primary-500 hover:bg-primary-600 flex items-center rounded-md px-3 py-2 text-sm font-medium text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full p-2 transition-colors dark:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="text-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-800 ml-2 rounded-full p-2 transition-colors dark:text-white">
              <Search size={20} />
            </button>
            {/* Cart icon for mobile */}
            <CartIcon />
            <button
              type="button"
              className="text-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-800 ml-4 inline-flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="border-primary-200 dark:border-secondary-800 dark:bg-secondary-900 space-y-1 border-t bg-white px-2 pt-2 pb-3 shadow-lg">
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === item.href ||
                  (item.href.includes('dashboard') && pathname.startsWith(item.href))
                    ? 'text-primary-500 dark:text-primary-400 font-semibold'
                    : 'text-secondary-800 hover:text-primary-500 dark:hover:text-primary-400 transition-colors dark:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile Auth Button/Logout */}
            <div className="border-primary-200 dark:border-secondary-800 mt-4 border-t px-3 pt-4">
              {authIsLoading ? (
                <span className="text-secondary-500 dark:text-secondary-300 block text-base font-medium">
                  Loading...
                </span>
              ) : user ? (
                <div className="space-y-2">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="bg-primary-100 dark:bg-secondary-800 text-primary-600 dark:text-primary-400 flex h-10 w-10 items-center justify-center rounded-full">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-secondary-900 text-sm font-medium dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-secondary-500 dark:text-secondary-400 text-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard link based on role */}
                  {user.role === 'Admin' ? (
                    <Link
                      href="/admin/dashboard"
                      className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Admin Dashboard
                    </Link>
                  ) : user.role === 'Distributor' ? (
                    <Link
                      href="/distributor/dashboard"
                      className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Distributor Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      My Dashboard
                    </Link>
                  )}

                  {/* Profile settings */}
                  <Link
                    href="/dashboard/profile"
                    className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile Settings
                  </Link>

                  {/* Orders */}
                  <Link
                    href="/dashboard/orders"
                    className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    My Orders
                  </Link>

                  {/* Referrals if applicable */}
                  {user.role === 'Referrer' && (
                    <Link
                      href="/dashboard/referrals"
                      className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CreditCard size={16} className="mr-2" />
                      My Commissions
                    </Link>
                  )}

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex w-full items-center rounded px-2 py-2 text-sm"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary-500 hover:bg-primary-600 block w-full rounded-md px-3 py-2 text-center text-base font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  // Get auth context for the footer
  const { user } = useAuth();

  return (
    <footer className="bg-secondary-950 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">PUXX</h3>
            <p className="text-secondary-300">
              Premium tobacco-free nicotine pouches meticulously crafted for those who demand
              excellence. Discreet, convenient, and perfect for your lifestyle.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products/classic"
                  className="text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  Classic Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/products/intense"
                  className="text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  Intense Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/products/light"
                  className="text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  Light Collection
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/craftsmanship"
                  className="text-cream-300 hover:text-anzac-400 transition-colors"
                >
                  Craftsmanship
                </Link>
              </li>
              <li>
                <Link
                  href="/experience"
                  className="text-cream-300 hover:text-anzac-400 transition-colors"
                >
                  Experience
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-cream-300 hover:text-anzac-400 transition-colors"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-cream-300 hover:text-anzac-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              {/* Dynamic account link based on user role */}
              {user ? (
                user.role === 'Admin' ? (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className="text-cream-300 hover:text-anzac-400 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                ) : user.role === 'Distributor' ? (
                  <li>
                    <Link
                      href="/distributor/dashboard"
                      className="text-cream-300 hover:text-anzac-400 transition-colors"
                    >
                      Distributor Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-cream-300 hover:text-anzac-400 transition-colors"
                    >
                      My Account
                    </Link>
                  </li>
                )
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="text-cream-300 hover:text-anzac-400 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Contact Us</h3>
            <p className="text-cream-300">
              Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@puxxpremium.com'}
            </p>
            <p className="text-cream-300">
              Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE || '(250) 415-5678'}
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Social links ... */}
              <a
                href={process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-300 hover:text-anzac-400 transition-colors"
                aria-label="Follow us on X (formerly Twitter)"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-300 hover:text-anzac-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-300 hover:text-anzac-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-secondary-800 text-secondary-400 mt-8 border-t pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} PUXX Premium. All rights reserved.</p>
          <p className="mt-2 text-xs">
            These products contain nicotine. Nicotine is an addictive chemical. For adult use only.
          </p>
        </div>
      </div>
    </footer>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
