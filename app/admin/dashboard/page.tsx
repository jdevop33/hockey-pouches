'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout'; // Corrected relative path (2 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context using alias

// Placeholder Types
type Metric = { value: string | number; label: string; change?: string };
type PendingTask = { id: string; title: string; category: string; relatedTo?: { type: string; id: string; } };

export default function AdminDashboardPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholders with actual API calls for admin data
        // - Fetch key metrics (sales today/week, new users, pending orders)
        // - Fetch pending tasks (/api/admin/tasks/pending)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        setMetrics([
            { value: '$' + '1,250.50', label: 'Sales Today', change: '+5.2%' },
            { value: 15, label: 'Pending Orders' },
            { value: 5, label: 'New Users Today' },
            { value: 3, label: 'Pending Tasks' },
        ]);
        setPendingTasks([
            { id: 'task-1', title: 'Approve Order #order-xyz', category: 'Order Approval', relatedTo: { type: 'Order', id: 'order-xyz' } },
            { id: 'task-2', title: 'Assign Distributor for Order #order-abc', category: 'Distributor Assignment', relatedTo: { type: 'Order', id: 'order-abc' } },
            { id: 'task-3', title: 'Verify Fulfillment for Order #order-def', category: 'Fulfillment Verification', relatedTo: { type: 'Order', id: 'order-def' } },
            // Add more tasks like payment confirmations if manual
        ]);

      } catch (err) {
        setError('Failed to load admin dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isAdmin]);

  if (isLoading) {
    // TODO: Implement loading skeleton
    return <Layout><div className="p-8">Loading Admin Dashboard...</div></Layout>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        {/* Key Metrics */} 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500 uppercase mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{metric.value}</p>
                    {metric.change && (
                         <p className={`text-sm mt-1 ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change} vs yesterday
                         </p>
                    )}
                </div>
            ))}
        </div>

        {/* Pending Tasks (Inspired by Insightly) */} 
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-gray-700">Pending Tasks ({pendingTasks.length})</h2>
                 <Link href="/admin/dashboard/tasks" className="text-sm text-primary-600 hover:text-primary-800 font-medium">View All Tasks &rarr;</Link>
            </div>
            {pendingTasks.length > 0 ? (
               <ul className="divide-y divide-gray-200">
                 {pendingTasks.map(task => (
                   <li key={task.id} className="py-3 flex justify-between items-center">
                     <div>
                        <Link href={`/admin/dashboard/tasks/${task.id}`} className="text-gray-800 hover:text-primary-600 font-medium">{task.title}</Link>
                        <p className="text-sm text-gray-500">Category: {task.category}
                        {task.relatedTo && 
                          <> | Related: <Link href={`/admin/dashboard/${task.relatedTo.type.toLowerCase()}s/${task.relatedTo.id}`} className="text-primary-600 hover:underline">{task.relatedTo.type} #{task.relatedTo.id.split('-')[1]}</Link></>
                        }
                        </p>
                     </div>
                      {/* TODO: Add quick actions like 'Assign' or 'Complete'? */} 
                      <Link href={`/admin/dashboard/tasks/${task.id}`} className="text-sm text-primary-600 hover:text-primary-800 font-medium">View</Link>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-gray-500">No pending tasks.</p>
             )}
        </div>

        {/* Quick Links to Management Sections */} 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/dashboard/orders" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Orders</h3>
                <p className="text-sm text-gray-500">View, approve, assign, and track all customer orders.</p>
            </Link>
             <Link href="/admin/dashboard/products" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Products</h3>
                <p className="text-sm text-gray-500">Add, edit, and manage product details and variations.</p>
            </Link>
             <Link href="/admin/dashboard/users" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Users</h3>
                <p className="text-sm text-gray-500">View and manage customers, distributors, and wholesalers.</p>
            </Link>
             <Link href="/admin/dashboard/inventory" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Inventory</h3>
                <p className="text-sm text-gray-500">Track stock levels across distribution centers.</p>
            </Link>
             <Link href="/admin/dashboard/commissions" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Commissions</h3>
                <p className="text-sm text-gray-500">Review earned commissions and process payouts.</p>
            </Link>
            <Link href="/admin/dashboard/reports" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Reports & Analytics</h3>
                <p className="text-sm text-gray-500">View sales reports and business performance.</p>
            </Link>
            {/* TODO: Add link for Consignment Tracking if needed */} 
        </div>

      </div>
    </Layout>
  );
}
