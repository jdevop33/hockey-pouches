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
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
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
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            if (response.status === 401) {
              logout();
              router.push('/login');
              return;
            }
            const errData = await response.json();
            throw new Error(errData.message || `Failed to fetch orders (${response.status})`);
          }
          const data = await response.json();

          setOrders(data.orders || []);
          setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
        } catch (err: unknown) {
          const error = err as Error;
          setError(error instanceof Error ? error.message : String(error) || 'Failed to load orders.');
          console.error(error);
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
      case 'Pending Approval':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'Awaiting Fulfillment':
        return 'bg-blue-900/40 text-blue-300';
      case 'Pending Fulfillment Verification':
        return 'bg-purple-900/40 text-purple-300';
      case 'Awaiting Shipment':
        return 'bg-cyan-900/40 text-cyan-300';
      case 'Shipped':
        return 'bg-green-900/40 text-green-300';
      case 'Delivered':
        return 'bg-emerald-900/40 text-emerald-300';
      case 'Cancelled':
        return 'bg-red-900/40 text-red-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8 text-center">Loading orders...</div>
      </Layout>
    );
  }
  if (!user || user.role !== 'Admin') {
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <h1 className="mb-6 text-3xl font-bold text-gray-100">Manage Orders</h1>
        {/* Filters */}
        <div className="mb-6 rounded-md bg-gray-800 p-4 shadow-gold-sm">
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-300">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={e => {
              setFilterStatus(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 sm:text-sm"
          >
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
        {error && <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">Error: {error}</p>}
        <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Distributor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Total
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gold-400 hover:text-gold-300">
                      <Link href={`/admin/dashboard/orders/${order.id}`}>{`#${order.id}`}</Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-200">
                      <Link
                        href={`/admin/dashboard/users/${order.customer_id}`}
                        className="text-gold-400 hover:text-gold-300 hover:underline"
                      >
                        {order.customer_name || `User ${order.customer_id.substring(0, 6)}...`}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {order.assigned_distributor_id ? (
                        <Link
                          href={`/admin/dashboard/users/${order.assigned_distributor_id}`}
                          className="text-gold-400 hover:text-gold-300 hover:underline"
                        >
                          {order.assigned_distributor_id.substring(0, 6)}...
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-200">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/admin/dashboard/orders/${order.id}`}
                        className="text-gold-400 hover:text-gold-300"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-700 bg-gray-700 px-4 py-3 sm:px-6">
              {/* ... Buttons ... */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span> ({pagination.total}{' '}
                    results)
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-600 bg-gray-800 px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &lt;
                    </button>
                    {/* TODO: Add page number buttons */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-600 bg-gray-800 px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &gt;
                    </button>
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
