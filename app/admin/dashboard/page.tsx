'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import Layout from '../../components/layout/NewLayout'; // Relative path (2 levels up)
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Placeholder Types
type Metric = { value: string | number; label: string; change?: string };
type PendingTask = {
  id: string;
  title: string;
  category: string;
  relatedTo?: { type: string; id: string };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate data loading
  const [error, setError] = useState<string | null>(null);

  // Authentication and Authorization Check
  useEffect(() => {
    // Only run checks after auth state is loaded and not during initial render
    if (!authLoading) {
      // Store the current URL to prevent redirection loops
      const currentUrl = window.location.pathname;
      const isAdminDashboard = currentUrl.startsWith('/admin/dashboard');

      if (!user || !token) {
        // Not logged in
        
        // Only redirect if we're not already in a redirection process
        if (isAdminDashboard) {
          router.push('/login?redirect=/admin/dashboard');
        }
      } else if (user.role !== 'Admin') {
        // Logged in, but not an Admin
        
        // Only redirect if we're not already in a redirection process
        if (isAdminDashboard) {
          // Redirect to their appropriate dashboard or home
          router.push(user.role === 'Distributor' ? '/distributor/dashboard' : '/dashboard');
        }
      }
      // If user exists and role is Admin, proceed with loading data (handled below)
    }
  }, [user, token, authLoading, router]);

  // Data Fetching Effect (only runs if authenticated and admin)
  useEffect(() => {
    // Prevent redirection loops by checking the current URL
    const currentUrl = window.location.pathname;
    const isAdminDashboard = currentUrl.startsWith('/admin/dashboard');

    // Ensure we only fetch data if the user is authenticated and confirmed as Admin
    if (!authLoading && user && token && user.role === 'Admin') {
      
      const loadData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          // TODO: Replace placeholders with actual API calls for admin data
          // Need to include token in headers for protected admin API routes
          // const metricsResponse = await fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` }});
          // const tasksResponse = await fetch('/api/admin/tasks/pending', { headers: { Authorization: `Bearer ${token}` }});
          // Check responses, handle 401 etc.

          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

          setMetrics([
            { value: '$' + '1,250.50', label: 'Sales Today', change: '+5.2%' },
            { value: 15, label: 'Pending Orders' },
            { value: 5, label: 'New Users Today' },
            { value: 3, label: 'Pending Tasks' },
          ]);
          setPendingTasks([
            {
              id: 'task-1',
              title: 'Approve Order #order-xyz',
              category: 'Order Approval',
              relatedTo: { type: 'Order', id: 'order-xyz' },
            },
            {
              id: 'task-2',
              title: 'Assign Distributor for Order #order-abc',
              category: 'Distributor Assignment',
              relatedTo: { type: 'Order', id: 'order-abc' },
            },
            {
              id: 'task-3',
              title: 'Verify Fulfillment for Order #order-def',
              category: 'Fulfillment Verification',
              relatedTo: { type: 'Order', id: 'order-def' },
            },
          ]);
        } catch (err: unknown) {
          const error = err as Error;
          // Handle potential 401 from API calls if token expires mid-session
          if (error.message?.includes('401')) {
            // Basic check, improve if needed
            logout();
            // Only redirect if we're still on the admin dashboard
            if (isAdminDashboard) {
              router.push('/login?redirect=/admin/dashboard');
            }
          } else {
            setError('Failed to load admin dashboard data.');
            console.error(err);
          }
        } finally {
          setIsLoadingData(false);
        }
      };
      loadData();
    } else if (!authLoading) {
      // If auth is loaded but user is not admin/logged in, stop data loading
      setIsLoadingData(false);
    }
  }, [user, token, authLoading, logout, router]); // Depend on auth state

  // Render loading state or unauthorized message
  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8 text-center text-white">Loading Admin Dashboard...</div>
      </Layout>
    );
  }
  if (!user || user.role !== 'Admin') {
    // This state might be brief before redirect, or if redirect fails
    return (
      <Layout>
        <div className="p-8 text-center text-red-400">Access Denied. You must be an Admin.</div>
      </Layout>
    );
  }

  // Render actual dashboard content for Admin
  return (
    <Layout>
      <div className="min-h-screen bg-dark-800 p-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Admin Dashboard</h1>

        {error && (
          <p className="mb-4 rounded-md border border-red-500/50 bg-red-900/50 p-3 text-red-400">
            Error: {error}
          </p>
        )}

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* ... metrics mapping ... */}
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm"
            >
              <p className="mb-1 text-sm uppercase text-gray-400">{metric.label}</p>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              {metric.change && (
                <p
                  className={`mt-1 text-sm ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
                >
                  {metric.change} vs yesterday
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pending Tasks */}
        <div className="mb-8 rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm">
          {/* ... task list ... */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Pending Tasks ({pendingTasks.length})
            </h2>
            <Link
              href="/admin/dashboard/tasks"
              className="text-sm font-medium text-gold-500 hover:text-gold-300"
            >
              View All Tasks &rarr;
            </Link>
          </div>
          {pendingTasks.length > 0 ? (
            <ul className="divide-y divide-gold-500/20">
              {pendingTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between py-3">
                  {/* ... task details ... */}
                  <div>
                    <Link
                      href={`/admin/dashboard/tasks/${task.id}`}
                      className="font-medium text-gray-200 hover:text-gold-500"
                    >
                      {task.title}
                    </Link>
                    <p className="text-sm text-gray-400">
                      Category: {task.category}
                      {task.relatedTo && (
                        <>
                          {' '}
                          | Related:{' '}
                          <Link
                            href={`/admin/dashboard/${task.relatedTo.type.toLowerCase()}s/${task.relatedTo.id}`}
                            className="text-gold-500 hover:underline"
                          >
                            {task.relatedTo.type} #{task.relatedTo.id.split('-')[1]}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/admin/dashboard/tasks/${task.id}`}
                    className="text-sm font-medium text-gold-500 hover:text-gold-300"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No pending tasks.</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* ... quick links ... */}
          <Link
            href="/admin/dashboard/orders"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Manage Orders</h3>
            <p className="text-sm text-gray-300">
              View, approve, assign, and track all customer orders.
            </p>
          </Link>
          <Link
            href="/admin/dashboard/products"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Manage Products</h3>
            <p className="text-sm text-gray-300">
              Add, edit, and manage product details and variations.
            </p>
          </Link>
          <Link
            href="/admin/dashboard/users"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Manage Users</h3>
            <p className="text-sm text-gray-300">Add, edit roles, and manage user accounts.</p>
          </Link>
          <Link
            href="/admin/dashboard/commissions"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Commissions</h3>
            <p className="text-sm text-gray-300">Manage distributor and referral commissions.</p>
          </Link>
          <Link
            href="/admin/dashboard/discount-codes"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Discount Codes</h3>
            <p className="text-sm text-gray-300">Create and manage promotional discount codes.</p>
          </Link>
          <Link
            href="/admin/dashboard/inventory"
            className="block rounded-lg border border-gold-500/20 bg-dark-900/95 p-6 shadow-gold-sm transition-all hover:border-gold-500/50 hover:shadow-gold"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold-500">Inventory</h3>
            <p className="text-sm text-gray-300">Manage product inventory across locations.</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
