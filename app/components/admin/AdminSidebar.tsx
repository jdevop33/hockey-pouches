'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  Package,
  DollarSign,
  Settings,
  Truck,
  Store,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      href: '/admin/dashboard/products',
      label: 'Products',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      href: '/admin/dashboard/orders',
      label: 'Orders',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      href: '/admin/dashboard/inventory',
      label: 'Inventory',
      icon: <Package className="h-5 w-5" />,
    },
    { href: '/admin/dashboard/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/dashboard/wholesale', label: 'Wholesale', icon: <Store className="h-5 w-5" /> },
    {
      href: '/admin/dashboard/distribution',
      label: 'Distribution',
      icon: <Truck className="h-5 w-5" />,
    },
    {
      href: '/admin/dashboard/commissions',
      label: 'Commissions',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      href: '/admin/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="fixed left-4 top-20 z-20 block md:hidden">
        <button
          onClick={toggleMobileNav}
          className="rounded-xl border border-gold-500/30 bg-dark-800 p-2.5 text-white shadow-md"
          aria-label="Toggle admin sidebar"
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-10 w-64 transform border-r border-gold-500/20 bg-dark-900/95 shadow-lg backdrop-blur-sm transition-transform duration-300 md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto py-4">
          <div className="px-4 py-2">
            <h2 className="mb-2 text-lg font-bold text-white">Admin Portal</h2>
            <p className="text-sm text-gray-400">Manage your store</p>
          </div>

          <nav className="mt-4 flex-1 space-y-1 px-2">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500 text-dark-900 shadow-gold-sm'
                      : 'text-gray-300 hover:bg-dark-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
