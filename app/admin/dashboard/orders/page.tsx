'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

// Updated type to match API response
type AdminOrderListItem = {
  id: number; 
  created_at: string; 
  status: string;
  total_amount: number;
  customer_id: string; 
  customer_name: string | null; 
  assigned_distributor_id?: string | null;
};

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  // TODO: Add state for other filters (customer, distributor, date)

  // Auth and Role Check Effect
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/admin/dashboard/orders');
      } else if (user.role !== 'Admin') {
        router.push('/dashboard'); 
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
          const params = new URLSearchParams({
             page: pagination.page.toString(),
             limit: pagination.limit.toString(),
             ...(filterStatus && { status: filterStatus }),
             // TODO: Add other filter params
          });
          
          const response = await fetch(`/api/admin/orders?${params.toString()}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; }
             const errData = await response.json();
             throw new Error(errData.message || `Failed to fetch orders (${response.status})`);
          }
          const data = await response.json();
          
          setOrders(data.orders || []);
          setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });

        } catch (err: any) {
           setError(err.message || 'Failed to load orders.');
           console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadOrders();
    } else if (!authLoading) {
         setIsLoadingData(false); 
    }
  }, [user, token, authLoading, pagination.page, pagination.limit, filterStatus, router, logout]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
       setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusColor = (status: string): string => { 
        switch (status) {
            case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
            case 'Awaiting Fulfillment': return 'bg-blue-100 text-blue-800';
            case 'Pending Fulfillment Verification': return 'bg-purple-100 text-purple-800';
            case 'Awaiting Shipment': return 'bg-cyan-100 text-cyan-800';
            case 'Shipped': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-emerald-100 text-emerald-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8 text-center">Loading orders...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>
        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
             <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
            <select id="statusFilter" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                <option value="">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Awaiting Fulfillment">Awaiting Fulfillment</option>
                <option value="Pending Fulfillment Verification">Pending Verification</option>
                <option value="Awaiting Shipment">Awaiting Shipment</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
             {/* TODO: Add other filters (customer, distributor, date) */} 
        </div>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-800">
                       <Link href={`/admin/dashboard/orders/${order.id}`}>{`#${order.id}`}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/admin/dashboard/users/${order.customer_id}`} className="hover:underline">{order.customer_name || `User ${order.customer_id.substring(0,6)}...`}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {order.assigned_distributor_id ? 
                         (<Link href={`/admin/dashboard/users/${order.assigned_distributor_id}`} className="hover:underline">{order.assigned_distributor_id.substring(0,6)}...</Link>) 
                         : 'N/A'}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">${order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">Manage</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No orders found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
           {/* Pagination Controls */} 
           {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                {/* ... Buttons ... */} 
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div><p className="text-sm text-gray-700">Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} results)</p></div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Previous</span>&lt;</button>
                      {/* TODO: Add page number buttons */} 
                      <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Next</span>&gt;</button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
