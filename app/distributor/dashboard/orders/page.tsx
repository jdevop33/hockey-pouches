'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/NewLayout';
import { useAuth } from '../../../context/AuthContext';

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
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (e.g., by status) and pagination
  const [filterStatus, setFilterStatus] = useState('Assigned'); // Default to show pending

  const isDistributor = user?.role === 'Distributor';

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !isDistributor) {
      router.push('/login?from=distributor/dashboard/orders');
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
            {
              id: 'order-abc',
              customerName: 'Alice Smith',
              dateAssigned: '2023-10-27',
              city: 'Vancouver',
              itemsCount: 2,
              status: 'Assigned',
            },
            {
              id: 'order-def',
              customerName: 'Bob Jones',
              dateAssigned: '2023-10-26',
              city: 'Calgary',
              itemsCount: 1,
              status: 'Assigned',
            },
            {
              id: 'order-ghi',
              customerName: 'Charlie Brown',
              dateAssigned: '2023-10-25',
              city: 'Toronto',
              itemsCount: 5,
              status: 'Assigned',
            },
          ];
        } else if (filterStatus === 'Fulfilled - Pending Verification') {
          fetchedOrders = [
            {
              id: 'order-jkl',
              customerName: 'Diana Prince',
              dateAssigned: '2023-10-24',
              city: 'Edmonton',
              itemsCount: 3,
              status: 'Fulfilled - Pending Verification',
            },
          ];
        } else {
          // Assume 'All' or other statuses
          fetchedOrders = [
            {
              id: 'order-abc',
              customerName: 'Alice Smith',
              dateAssigned: '2023-10-27',
              city: 'Vancouver',
              itemsCount: 2,
              status: 'Assigned',
            },
            {
              id: 'order-def',
              customerName: 'Bob Jones',
              dateAssigned: '2023-10-26',
              city: 'Calgary',
              itemsCount: 1,
              status: 'Assigned',
            },
            {
              id: 'order-ghi',
              customerName: 'Charlie Brown',
              dateAssigned: '2023-10-25',
              city: 'Toronto',
              itemsCount: 5,
              status: 'Assigned',
            },
            {
              id: 'order-jkl',
              customerName: 'Diana Prince',
              dateAssigned: '2023-10-24',
              city: 'Edmonton',
              itemsCount: 3,
              status: 'Fulfilled - Pending Verification',
            },
            {
              id: 'order-mno',
              customerName: 'Eva Green',
              dateAssigned: '2023-10-23',
              city: 'Vancouver',
              itemsCount: 1,
              status: 'Verified',
            },
          ];
        }

        setOrders(fetchedOrders);
        // TODO: Set pagination data from API response
      } catch (error) {
        setError('Failed to load assigned orders.');
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, isDistributor, filterStatus, authLoading, router]); // Reload when filter changes

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="p-8">Loading orders...</div>
      </Layout>
    );
  }

  if (!isAuthenticated || !isDistributor) {
    return (
      <Layout>
        <div className="p-8">Access Denied. Redirecting...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">My Assigned Orders</h1>

        {/* TODO: Add Filter controls (by status) */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm sm:text-sm"
          >
            <option value="Assigned">Awaiting Fulfillment</option>
            <option value="Fulfilled - Pending Verification">Pending Verification</option>
            <option value="Verified">Verified/Shipped</option>
            <option value="All">All My Orders</option>
          </select>
        </div>

        {error && <p className="mb-4 text-red-500">Error: {error}</p>}

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Date Assigned
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  City
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View/Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id.split('-')[1]}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.dateAssigned}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.city}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {order.itemsCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${order.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Fulfilled - Pending Verification' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/distributor/dashboard/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {order.status === 'Assigned' ? 'Fulfill' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders match the selected criteria.
                  </td>
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
