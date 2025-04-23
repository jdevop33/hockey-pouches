'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/NewLayout'; 
import { useAuth } from '../../../context/AuthContext'; 

// Placeholder Type
type AdminOrder = {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  total: number;
  status: string; 
  distributorId?: string | null;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auth and Role Check Effect
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/admin/dashboard/orders');
      } else if (user.role !== 'Admin') {
        router.push('/dashboard'); // Redirect non-admins
      }
    }
  }, [user, token, authLoading, router]);

  // Data Fetching Effect
  useEffect(() => {
    if (!authLoading && user && token && user.role === 'Admin') {
      const loadOrders = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const query = new URLSearchParams({
             page: currentPage.toString(),
             limit: '15', 
             ...(filterStatus && { status: filterStatus }),
          }).toString();
          
          const response = await fetch(`/api/admin/orders?${query}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; }
             throw new Error(`Failed to fetch orders (${response.status})`);
          }
          const data = await response.json();
          
          setOrders(data.orders || []);
          setTotalPages(data.pagination?.totalPages || 1);

        } catch (err: any) {
           if (err.message?.includes('401')) { // Basic check for token errors from API
                logout();
                router.push('/login?redirect=/admin/dashboard/orders');
           } else {
               setError('Failed to load orders.');
               console.error(err);
           }
        } finally {
          setIsLoadingData(false);
        }
      };
      loadOrders();
    } else if (!authLoading) {
         setIsLoadingData(false); // Stop loading if not authorized
    }
  }, [user, token, authLoading, currentPage, filterStatus, router, logout]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusColor = (status: string) => { /* ... as before ... */ 
        switch (status) {
            case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
            case 'Awaiting Fulfillment': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-green-200 text-green-900';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  // Render Loading / Unauthorized states
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8">Loading orders...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  // Render Orders Table
  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>
        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            {/* ... filter controls ... */} 
             <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
            <select id="statusFilter" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                <option value="">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Awaiting Fulfillment">Awaiting Fulfillment</option>
                <option value="Pending Fulfillment Verification">Pending Verification</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... table head ... */} 
             <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    {/* ... table row data ... */} 
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-800"><Link href={`/admin/dashboard/orders/${order.id}`}>#{order.id.split('-')[1]}</Link></td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><Link href={`/admin/dashboard/users/${order.customerId}`} className="hover:underline">{order.customerName}</Link></td>
                       <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.distributorId ? (<Link href={`/admin/dashboard/users/${order.distributorId}`} className="hover:underline">{order.distributorId}</Link>) : 'N/A'}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">${order.total.toFixed(2)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Link href={`/admin/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">Manage</Link></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No orders found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
           {/* Pagination */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
        </div>
      </div>
    </Layout>
  );
}
