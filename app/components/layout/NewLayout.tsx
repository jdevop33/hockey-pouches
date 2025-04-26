'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import CartIcon from '../cart/CartIcon';
import Logo from '../ui/Logo';
import { ThemeToggle } from '../ui/theme-toggle';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import AccessibilityMenu from './AccessibilityMenu';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean; // Optionally hide/show based on auth
  roles?: string[]; // Optionally show only for specific roles
}

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter(); // For redirect after logout
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isLoading: authIsLoading } = useAuth(); // Get auth state and functions
  const [mounted, setMounted] = useState(false);

  // Add useEffect to handle client-side rendering
  useEffect(() => {
    setMounted(true);
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
    { href: '/research', label: 'Benefits' },
    { href: '/about', label: 'Our Story' },
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

  // Only render dynamic content after component is mounted
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-28 items-center justify-between">
            <div className="flex-shrink-0">
              <Logo size="large" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {/* Static placeholder links with consistent styling */}
                {baseNavItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="ml-4 flex items-center space-x-4">
                  {/* Placeholder for ThemeToggle and CartIcon */}
                  <div className="h-6 w-6"></div>
                  <div className="h-6 w-6"></div>
                </div>
              </div>
            </div>
            <div className="flex md:hidden">
              {/* Placeholder for mobile menu toggle */}
              <div className="h-6 w-6"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Desktop navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-28 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="large" />
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {visibleNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    // Handle potential dashboard parent paths for active state
                    pathname === item.href ||
                    (item.href.includes('dashboard') && pathname.startsWith(item.href))
                      ? 'font-semibold text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Auth Buttons / User Info */}
              <div className="ml-4 flex items-center space-x-4">
                <ThemeToggle />
                <CartIcon />
                <AccessibilityMenu className="hidden md:block" />
                {authIsLoading ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : user ? (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Hi, {user.name.split(' ')[0]}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login" // Changed from /account to /login
                    className="flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
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
            {/* Cart icon for mobile */}
            <CartIcon />
            <button
              type="button"
              className="ml-4 inline-flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* ... menu icon ... */}
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-t border-gray-200 bg-white px-2 pb-3 pt-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  pathname === item.href ||
                  (item.href.includes('dashboard') && pathname.startsWith(item.href))
                    ? 'bg-gray-100 font-semibold text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile Auth Button/Logout */}
            <div className="mt-4 border-t border-gray-200 px-3 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Toggle theme
                </span>
                <ThemeToggle />
              </div>
              {authIsLoading ? (
                <span className="block text-base font-medium text-gray-500">Loading...</span>
              ) : user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-md bg-red-50 px-3 py-2 text-left text-base font-medium text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-md bg-primary-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
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
  const [mounted, setMounted] = useState(false);

  // Add useEffect to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a simplified footer for server rendering to avoid hydration mismatch
  if (!mounted) {
    return (
      <footer className="bg-gray-800 py-8 text-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Nicotine Tins</h3>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 py-8 text-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Nicotine Tins</h3>
            <p className="text-gray-300">
              Premium tobacco-free nicotine pouches by Hockey Puxx, designed for hockey players and
              fans across Canada.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-gray-300 hover:text-white">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  Our Story
                </Link>
              </li>
              {/* Dynamic account link based on user role */}
              {user ? (
                user.role === 'Admin' ? (
                  <li>
                    <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">
                      Admin Dashboard
                    </Link>
                  </li>
                ) : user.role === 'Distributor' ? (
                  <li>
                    <Link href="/distributor/dashboard" className="text-gray-300 hover:text-white">
                      Distributor Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white">
                      My Account
                    </Link>
                  </li>
                )
              ) : (
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white">
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <p className="text-gray-300">
              Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@nicotinetins.com'}
            </p>
            <p className="text-gray-300">
              Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE || '(250) 415-5678'}
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Social links ... */}
              <a
                href={process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
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
                className="text-gray-300 hover:text-white"
                aria-label="Follow us on Facebook"
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
                className="text-gray-300 hover:text-white"
                aria-label="Follow us on Instagram"
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
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} Nicotine Tins by Hockey Puxx. All rights reserved.
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
