'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '@/lib/utils/api';

// Placeholder type - replace with actual data type
type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  itemCount: number;
};

// Helper function for status badge colors
const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'Pending Approval':
      return 'bg-yellow-100 text-yellow-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'Awaiting Fulfillment':
      return 'bg-purple-100 text-purple-800';
    case 'Fulfilled - Pending Verification':
      return 'bg-orange-100 text-orange-800';
    case 'Shipped':
      return 'bg-indigo-100 text-indigo-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

export default function OrdersListPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const { fetchApi, isLoading: isLoadingApi } = useApi({
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Wait for auth state to load
    if (authLoading) return;

    // Redirect if not logged in
    if (!user || !token) {
      $1?.$2('/login');
      return;
    }

    // Fetch orders if authenticated
    const loadOrders = async (page: number) => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        // Add filters if they're not set to 'all'
        if (statusFilter !== 'all') {
          queryParams.append('status', statusFilter);
        }

        if (dateFilter !== 'all') {
          queryParams.append('dateRange', dateFilter);
        }

        if (searchTerm.trim()) {
          queryParams.append('search', searchTerm.trim());
        }

        const data = await fetchApi<OrdersResponse>(`/api/orders/me?${queryParams.toString()}`);

        setOrders(data.orders || []);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        const error = err as Error & { status?: number };
        if (error.status === 401) {
          logout();
          router.push('/login');
        }
      }
    };

    loadOrders(currentPage);
  }, [
    user,
    token,
    authLoading,
    currentPage,
    statusFilter,
    dateFilter,
    searchTerm,
    router,
    logout,
    fetchApi,
  ]);

  // Display loading state
  if (authLoading || isLoadingApi) {
    return (
      <Layout>
        <div className="p-8">Loading orders...</div>
      </Layout>
    );
  }

  // User should be defined here if loading is done and authenticated
  if (!user) {
    // Should have been redirected, but render fallback just in case
    return (
      <Layout>
        <div className="p-8">Please log in to view orders.</div>
      </Layout>
    );
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">My Orders</h1>

        {/* Filter Controls */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            {/* Search */}
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Processing">Processing</option>
                <option value="Awaiting Fulfillment">Awaiting Fulfillment</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-48">
              <label htmlFor="dateFilter" className="block text-xs font-medium text-gray-700">
                Time Period
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="last180">Last 6 Months</option>
                <option value="last365">Last Year</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... table headers ... */}
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
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Total
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id}>
                    {/* ... table row data ... */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id.split('-')[1]}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.itemCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* ... Pagination Controls ... */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              {/* ... pagination buttons ... */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>&lt;
                    </button>
                    {/* TODO: Add page number buttons */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>&gt;
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
