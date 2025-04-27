'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/NewLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';

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
          <main className="min-h-screen pt-4">{children}</main>
        </div>
      </div>
    </Layout>
  );
}
