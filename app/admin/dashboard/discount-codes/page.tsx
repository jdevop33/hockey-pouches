'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// Type for discount code from API
interface DiscountCode {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DiscountCodesPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle creating a new discount code
  const handleAddDiscountCode = () => {
    $1?.$2('/admin/dashboard/discount-codes/new');
  };

  // Handle editing a discount code
  const handleEditDiscountCode = (id: number) => {
    $1?.$2(`/admin/dashboard/discount-codes/${id}`);
  };

  // Handle toggling a discount code's active status
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!token) return;

    try {
      setActionError(null);
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update discount code');
      }

      // Update the local state
      setDiscountCodes(prevCodes =>
        prevCodes.map(code =>
          code.id === id ? { ...code, is_active: !currentStatus } : code
        )
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'An error occurred while updating the discount code');
      console.error('Error toggling discount code status:', err);
    }
  };

  // Handle deleting a discount code
  const handleDeleteDiscountCode = async (id: number) => {
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return;
    }

    try {
      setActionError(null);
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error($1?.$2 || 'Failed to delete discount code');
      }

      // Remove the deleted code from the local state
      setDiscountCodes(prevCodes => prevCodes.filter(code => code.id !== id));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'An error occurred while deleting the discount code');
      console.error('Error deleting discount code:', err);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Load discount codes from API
  useEffect(() => {
    const loadDiscountCodes = async () => {
      if (authLoading || !token) return;

      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());

        if (filterActive !== null) {
          queryParams.append('isActive', filterActive.toString());
        }

        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        const response = await fetch(`/api/admin/discount-codes?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load discount codes');
        }

        const data = await response.json();
        setDiscountCodes(data.discountCodes || []);

        // Update pagination if provided
        if (data.pagination) {
          setPagination({
            page: $1?.$2.currentPage || 1,
            limit: $1?.$2.limit || 10,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || 1,
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading discount codes');
        console.error('Error loading discount codes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscountCodes();
  }, [token, authLoading, pagination.page, pagination.limit, filterActive, searchQuery]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  };

  // Check if user is authorized
  if (!authLoading && (!user || user.role !== 'Admin')) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600">
          Access Denied. You must be an Admin to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Discount Codes</h1>
          <button
            onClick={handleAddDiscountCode}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Add New Discount Code
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-md shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by code or description"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="w-40">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterActive(val === '' ? null : val === 'true');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterActive(null);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Display Errors */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            Error loading discount codes: {error}
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            Action Error: {actionError}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading discount codes...</p>
          </div>
        )}

        {/* Discount Codes Table */}
        {!isLoading && !error && (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discountCodes.length > 0 ? (
                  discountCodes.map((code) => (
                    <tr key={code.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{code.code}</div>
                        {code.description && (
                          <div className="text-xs text-gray-500">{code.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {code.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {code.discount_type === 'percentage'
                          ? `${code.discount_value}%`
                          : `$${code.discount_value.toFixed(2)}`}
                        {code.min_order_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: ${code.min_order_amount.toFixed(2)}
                          </div>
                        )}
                        {code.max_discount_amount && (
                          <div className="text-xs text-gray-500">
                            Max: ${code.max_discount_amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>From: {formatDate(code.start_date)}</div>
                        <div>To: {formatDate(code.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Used: {code.times_used}</div>
                        <div>Limit: {code.usage_limit || 'Unlimited'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            code.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {code.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditDiscountCode(code.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(code.id, code.is_active)}
                          className={`${
                            code.is_active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          } mr-4`}
                        >
                          {code.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteDiscountCode(code.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No discount codes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pagination.page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pagination.page === pagination.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(
                          page =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.page) <= 1
                        )
                        .map((page, index, array) => {
                          // Add ellipsis
                          const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                          const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pagination.page === page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                              {showEllipsisAfter && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page === pagination.totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
