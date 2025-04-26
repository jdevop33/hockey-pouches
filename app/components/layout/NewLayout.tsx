'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import CartIcon from '../cart/CartIcon';
import { ThemeToggle } from '../ui/theme-toggle';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import AccessibilityMenu from './AccessibilityMenu';
import Image from 'next/image';

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

  // Luxury dark mode only nav with brand palette and logo
  return (
    <>
      {/* Desktop nav */}
      <nav className="border-brand-gold/20 bg-brand-black/80 sticky top-0 z-50 hidden border-b shadow-lg backdrop-blur-xl transition-all duration-200 md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-10">
              <Image
                src="/images/logo/PUXX-LOGO-LONG-WHITE-650x195.png"
                alt="PUXX Logo"
                width={180}
                height={54}
                priority
                className="h-12 w-auto object-contain"
              />
              <div className="flex items-center gap-2">
                {visibleNavItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`focus-visible:ring-brand-gold rounded-full bg-transparent px-5 py-2 text-lg font-extrabold uppercase tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      pathname === item.href ||
                      (item.href.includes('dashboard') && pathname.startsWith(item.href))
                        ? 'bg-brand-gold/20 text-brand-gold shadow-md'
                        : 'text-brand-cream/90 hover:bg-brand-blue/20 hover:text-brand-blue'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <CartIcon />
              <AccessibilityMenu className="hidden md:block" />
              {authIsLoading ? (
                <span className="text-brand-gold/80 text-base">Loading...</span>
              ) : user ? (
                <>
                  <span className="text-brand-gold/90 text-base font-bold">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-brand-gold/90 hover:bg-brand-gold/20 hover:text-brand-gold focus-visible:ring-brand-gold rounded-full px-5 py-2 text-lg font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-brand-gold text-brand-black hover:bg-brand-blue hover:text-brand-cream focus-visible:ring-brand-gold flex items-center rounded-full px-5 py-2 text-lg font-extrabold uppercase shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
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
      </nav>
      {/* Mobile sticky bottom nav */}
      <nav className="shadow-t border-brand-gold/20 bg-brand-black/90 fixed bottom-0 left-0 right-0 z-50 flex border-t transition-all duration-200 md:hidden">
        <div className="flex h-16 flex-1 items-center justify-around">
          {visibleNavItems.slice(0, 4).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-visible:ring-brand-gold flex flex-col items-center justify-center bg-transparent px-2 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                pathname === item.href
                  ? 'text-brand-gold'
                  : 'text-brand-cream/90 hover:text-brand-blue'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* Hamburger menu for extras */}
          <button
            type="button"
            aria-label="Open menu"
            className="text-brand-cream/90 hover:text-brand-gold focus-visible:ring-brand-gold flex flex-col items-center justify-center px-2 py-1 text-xs font-bold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            More
          </button>
        </div>
        {/* Slide-in mobile menu */}
        <div
          className={`bg-brand-black/80 fixed inset-0 z-50 transition-opacity duration-200 ${mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`bg-brand-black/95 fixed bottom-0 left-0 right-0 z-50 min-h-[40vh] rounded-t-2xl p-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="flex flex-col gap-6">
            <button
              type="button"
              aria-label="Close menu"
              className="text-brand-gold/80 hover:text-brand-blue self-end focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-visible:ring-brand-gold block rounded-full bg-transparent px-4 py-3 text-lg font-extrabold uppercase tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  pathname === item.href
                    ? 'bg-brand-gold/20 text-brand-gold shadow-md'
                    : 'text-brand-cream/90 hover:bg-brand-blue/20 hover:text-brand-blue'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex items-center gap-6">
              <ThemeToggle />
              <CartIcon />
              <AccessibilityMenu />
            </div>
            {authIsLoading ? (
              <span className="text-brand-gold/80 text-base">Loading...</span>
            ) : user ? (
              <>
                <span className="text-brand-gold/90 text-lg font-bold">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-brand-gold/90 hover:bg-brand-gold/20 hover:text-brand-gold focus-visible:ring-brand-gold rounded-full px-4 py-3 text-lg font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-brand-gold text-brand-black hover:bg-brand-blue hover:text-brand-cream focus-visible:ring-brand-gold flex items-center rounded-full px-4 py-3 text-lg font-extrabold uppercase shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
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
        </aside>
      </nav>
    </>
  );
};

const Footer: React.FC = () => {
  // Get auth context for the footer
  // Removed unused 'user' variable

  // Use a simplified footer for server rendering to avoid hydration mismatch
  return (
    <footer className="border-t border-yellow-600/30 bg-gray-950 py-12 text-yellow-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-xl font-extrabold uppercase tracking-widest text-yellow-400">
              Nicotine Tins
            </h3>
            <p className="text-lg text-yellow-200/80">
              Premium tobacco-free nicotine pouches by Hockey Puxx, designed for hockey players and
              fans across Canada.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-extrabold uppercase tracking-widest text-yellow-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-yellow-200/80 hover:text-yellow-300">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-yellow-200/80 hover:text-yellow-300">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-yellow-200/80 hover:text-yellow-300">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-yellow-200/80 hover:text-yellow-300">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-yellow-200/80 hover:text-yellow-300">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-extrabold uppercase tracking-widest text-yellow-400">
              Contact Us
            </h3>
            <p className="text-lg text-yellow-200/80">Email: info@nicotinetins.com</p>
            <p className="text-lg text-yellow-200/80">Phone: (250) 415-5678</p>
            <div className="mt-4 flex space-x-4">
              {/* Social links ... */}
              <a
                href="#"
                className="text-yellow-200/80 hover:text-yellow-300"
                aria-label="Follow us on X (formerly Twitter)"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-yellow-200/80 hover:text-yellow-300"
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
                href="#"
                className="text-yellow-200/80 hover:text-yellow-300"
                aria-label="Follow us on Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.683-.566 1.15-.748.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-yellow-600/30 pt-8 text-center text-yellow-200/70">
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
