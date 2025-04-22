'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../../context/AuthContext'; // Example auth context

// Placeholder Type
type AssignedOrder = {
  id: string;
  customerName: string;
  dateAssigned: string;
  city: string;
  itemsCount: number;
  status: 'Assigned' | 'Fulfilled - Pending Verification' | 'Verified'; // Distributor relevant statuses
};

export default function DistributorOrdersPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (e.g., by status) and pagination
  const [filterStatus, setFilterStatus] = useState('Assigned'); // Default to show pending

  // TODO: Implement proper authentication check and ensure user role is 'Distributor'
  const isAuthenticated = true; // Placeholder
  const isDistributor = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isDistributor) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/distributor/orders?status={filterStatus}&page=...
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        // Simulate API response based on filter
        let fetchedOrders: AssignedOrder[] = [];
        if (filterStatus === 'Assigned') {
           fetchedOrders = [
               { id: 'order-abc', customerName: 'Alice Smith', dateAssigned: '2023-10-27', city: 'Vancouver', itemsCount: 2, status: 'Assigned' },
               { id: 'order-def', customerName: 'Bob Jones', dateAssigned: '2023-10-26', city: 'Calgary', itemsCount: 1, status: 'Assigned' },
               { id: 'order-ghi', customerName: 'Charlie Brown', dateAssigned: '2023-10-25', city: 'Toronto', itemsCount: 5, status: 'Assigned' },
           ];
        } else if (filterStatus === 'Fulfilled - Pending Verification') {
            fetchedOrders = [
                 { id: 'order-jkl', customerName: 'Diana Prince', dateAssigned: '2023-10-24', city: 'Edmonton', itemsCount: 3, status: 'Fulfilled - Pending Verification' },
            ];
        } else { // Assume 'All' or other statuses
             fetchedOrders = [
               { id: 'order-abc', customerName: 'Alice Smith', dateAssigned: '2023-10-27', city: 'Vancouver', itemsCount: 2, status: 'Assigned' },
               { id: 'order-def', customerName: 'Bob Jones', dateAssigned: '2023-10-26', city: 'Calgary', itemsCount: 1, status: 'Assigned' },
               { id: 'order-ghi', customerName: 'Charlie Brown', dateAssigned: '2023-10-25', city: 'Toronto', itemsCount: 5, status: 'Assigned' },
               { id: 'order-jkl', customerName: 'Diana Prince', dateAssigned: '2023-10-24', city: 'Edmonton', itemsCount: 3, status: 'Fulfilled - Pending Verification' },
               { id: 'order-mno', customerName: 'Eva Green', dateAssigned: '2023-10-23', city: 'Vancouver', itemsCount: 1, status: 'Verified' },
           ];
        }

        setOrders(fetchedOrders);
        // TODO: Set pagination data from API response

      } catch (err) {
        setError('Failed to load assigned orders.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, isDistributor, filterStatus]); // Reload when filter changes

  if (isLoading) {
    return <Layout><div className="p-8">Loading orders...</div></Layout>;
  }

  if (!isAuthenticated || !isDistributor) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Orders</h1>

        {/* TODO: Add Filter controls (by status) */} 
        <div className="mb-6">
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
            <select 
                id="statusFilter" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm sm:text-sm"
            >
                <option value="Assigned">Awaiting Fulfillment</option>
                <option value="Fulfilled - Pending Verification">Pending Verification</option>
                <option value="Verified">Verified/Shipped</option>
                <option value="All">All My Orders</option> 
            </select>
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Assigned</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View/Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.split('-')[1]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.dateAssigned}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{order.itemsCount}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Fulfilled - Pending Verification' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                         {order.status}
                       </span>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/distributor/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">
                        {order.status === 'Assigned' ? 'Fulfill' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No orders match the selected criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* TODO: Add Pagination Controls */} 
        </div>
      </div>
    </Layout>
  );
}
