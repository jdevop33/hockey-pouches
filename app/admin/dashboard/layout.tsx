'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/NewLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminBreadcrumbs from '../../components/admin/AdminBreadcrumbs';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gold-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'Admin') {
    return null; // Prevent flash of content before redirect
  }

  return (
    <Layout>
      <div className="relative min-h-screen bg-dark-900">
        <AdminSidebar />
        <div className="md:pl-64">
          <main className="min-h-screen p-4">
            <AdminBreadcrumbs
              customLabels={{
                '/admin/dashboard/products': 'Products',
                '/admin/dashboard/orders': 'Orders',
                '/admin/dashboard/users': 'Users',
                '/admin/dashboard/inventory': 'Inventory',
                '/admin/dashboard/commissions': 'Commissions',
                '/admin/dashboard/discount-codes': 'Discount Codes',
                '/admin/dashboard/tasks': 'Tasks',
                '/admin/dashboard/logs': 'System Logs',
                '/admin/dashboard/settings': 'Settings',
                '/admin/dashboard/wholesale': 'Wholesale',
                '/admin/dashboard/distribution': 'Distribution',
              }}
            />
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
}
