'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; // Updated path alias
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminOrder = {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  total: number;
  status: string; // e.g., 'Pending Approval', 'Awaiting Fulfillment', 'Shipped', etc.
  distributorId?: string | null;
};

export default function AdminOrdersPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (status, customer, date range) and pagination
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/orders?status={filterStatus}&page={currentPage}...
        const query = new URLSearchParams({
           page: currentPage.toString(),
           limit: '15', // Example limit
           ...(filterStatus && { status: filterStatus }), // Add status if selected
           // Add other filters like date ranges, customer search
        }).toString();

        // const response = await fetch(`/api/admin/orders?${query}`);
        // if (!response.ok) throw new Error('Failed to fetch orders');
        // const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
            orders: [
                { id: 'order-abc', date: '2023-10-27', customerName: 'Alice Smith', customerId: 'cust-1', total: 55.50, status: 'Pending Approval', distributorId: null },
                { id: 'order-def', date: '2023-10-26', customerName: 'Bob Jones', customerId: 'cust-2', total: 120.00, status: 'Awaiting Fulfillment', distributorId: 'dist-1' },
                { id: 'order-ghi', date: '2023-10-25', customerName: 'Charlie Brown', customerId: 'cust-3', total: 35.00, status: 'Shipped', distributorId: 'dist-2' },
                 { id: 'order-jkl', date: '2023-10-28', customerName: 'Diana Prince', customerId: 'cust-4', total: 75.00, status: 'Pending Approval', distributorId: null },
            ],
            pagination: { page: currentPage, totalPages: 3, total: 40 }
        };

        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load orders.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, isAdmin, currentPage, filterStatus]); // Reload on page or filter change

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

   const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
            case 'Awaiting Fulfillment': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-green-200 text-green-900';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  if (isLoading) {
    return <Layout><div className="p-8">Loading orders...</div></Layout>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>

        {/* TODO: Add Filter controls (status, date range, customer search) */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
            <select 
                id="statusFilter" 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} // Reset page on filter change
                className="rounded-md border-gray-300 shadow-sm sm:text-sm"
            >
                <option value="">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Awaiting Fulfillment">Awaiting Fulfillment</option>
                <option value="Pending Fulfillment Verification">Pending Verification</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                 {/* Add other relevant statuses */} 
            </select>
             {/* Add more filters here */} 
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-800">
                       <Link href={`/admin/dashboard/orders/${order.id}`}>#{order.id.split('-')[1]}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/admin/dashboard/users/${order.customerId}`} className="hover:underline">{order.customerName}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {order.distributorId ? 
                         (<Link href={`/admin/dashboard/users/${order.distributorId}`} className="hover:underline">{order.distributorId}</Link>) 
                         : 'N/A'}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">Manage</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No orders found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
           {/* TODO: Add Pagination Controls component */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
        </div>
      </div>
    </Layout>
  );
}
