'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminCommission = {
  id: string;
  userId: string;
  userName: string; // Denormalized likely
  orderId?: string;
  type: 'Referral Sale' | 'Fulfillment' | 'Wholesale Referral' | 'Bonus';
  amount: number;
  status: 'Pending Payout' | 'Paid' | 'Cancelled';
  earnedDate: string;
  payoutDate?: string | null;
  payoutBatchId?: string | null;
};

export default function AdminCommissionsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (status, user, type, date range), sorting, search, pagination
  const [filterStatus, setFilterStatus] = useState(''); // e.g., 'Pending Payout'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set()); // For bulk payout
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadCommissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/commissions?status=...&page=...
        // const query = new URLSearchParams({
        //    page: currentPage.toString(),
        //    limit: '15',
        //    ...(filterStatus && { status: filterStatus }),
        //    // Add other filters
        // }).toString();
        // const response = await fetch(`/api/admin/commissions?${query}`);
        // if (!response.ok) throw new Error('Failed to fetch commissions');
        // const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = {
          // Simulated Response
          commissions: [
            {
              id: 'comm-d1',
              userId: 'dist-1',
              userName: 'Vancouver Dist',
              type: 'Fulfillment',
              orderId: 'order-xyz',
              amount: 15.0,
              status: 'Pending Payout',
              earnedDate: '2023-10-26',
              payoutDate: null,
              payoutBatchId: null,
            },
            {
              id: 'comm-r1',
              userId: 'cust-1',
              userName: 'Alice Smith',
              type: 'Referral Sale',
              orderId: 'order-abc',
              amount: 2.78,
              status: 'Pending Payout',
              earnedDate: '2023-10-27',
              payoutDate: null,
              payoutBatchId: null,
            },
            {
              id: 'comm-d3',
              userId: 'dist-2',
              userName: 'Calgary Dist',
              type: 'Fulfillment',
              orderId: 'order-rst',
              amount: 20.0,
              status: 'Paid',
              earnedDate: '2023-10-15',
              payoutDate: '2023-10-20',
              payoutBatchId: 'batch-001',
            },
            {
              id: 'comm-w1',
              userId: 'dist-1',
              userName: 'Vancouver Dist',
              type: 'Wholesale Referral',
              amount: 50.0,
              status: 'Pending Payout',
              earnedDate: '2023-10-28',
              payoutDate: null,
              payoutBatchId: null,
            },
            {
              id: 'comm-c1',
              userId: 'cust-2',
              userName: 'Bob Jones',
              type: 'Referral Sale',
              orderId: 'order-ghi',
              amount: 1.75,
              status: 'Cancelled',
              earnedDate: '2023-10-25',
              payoutDate: null,
              payoutBatchId: null,
            },
          ],
          pagination: { page: currentPage, totalPages: 7, total: 100 },
        };
        // Assert types for status and type
        const typedCommissions = data.commissions.map(c => ({
          ...c,
          type: c.type as AdminCommission['type'],
          status: c.status as AdminCommission['status'],
        })) as AdminCommission[];

        setCommissions(typedCommissions);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError('Failed to load commissions.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissions();
  }, [isAuthenticated, isAdmin, currentPage, filterStatus]); // Reload on page or filter change

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectionChange = (commissionId: string, isSelected: boolean) => {
    setSelectedCommissions(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(commissionId);
      } else {
        newSet.delete(commissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      // Select only pending commissions on the current page
      const pendingIds = commissions.filter(c => c.status === 'Pending Payout').map(c => c.id);
      setSelectedCommissions(new Set(pendingIds));
    } else {
      setSelectedCommissions(new Set());
    }
  };

  const handlePayout = async () => {
    if (selectedCommissions.size === 0) {
      alert('Please select commissions to pay out.');
      return;
    }
    setIsPayoutLoading(true);
    setPayoutError(null);
    const idsToPayout = Array.from(selectedCommissions);
    console.log('Initiating payout for:', idsToPayout);
    try {
      // TODO: Call POST /api/admin/commissions/payout with { commissionIds: idsToPayout }
      // const response = await fetch('/api/admin/commissions/payout', {...});
      // if (!response.ok) { //... handle error }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert(`Payout processed successfully for ${idsToPayout.length} commissions (simulation).`);
      setSelectedCommissions(new Set()); // Clear selection
      // TODO: Refresh the commission list or update status locally
      window.location.reload(); // Simple refresh
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Payout failed.';
      setPayoutError(errorMessage);
    } finally {
      setIsPayoutLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900/40 text-green-300';
      case 'Cancelled':
        return 'bg-red-900/40 text-red-300';
      case 'Pending Payout':
        return 'bg-yellow-900/40 text-yellow-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 text-center">Loading commissions...</div>
      </Layout>
    );
  }
  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-100">Manage Commissions</h1>
          {/* Payout Button */}
          <button
            onClick={handlePayout}
            disabled={selectedCommissions.size === 0 || isPayoutLoading}
            className="rounded bg-gold-500 px-4 py-2 font-bold text-dark-900 hover:bg-gold-400 disabled:opacity-50"
          >
            {isPayoutLoading
              ? 'Processing Payout...'
              : `Payout Selected (${selectedCommissions.size})`}
          </button>
        </div>

        {/* TODO: Add Filters (Status, User, Type, Date Range), Search Bar */}
        <div className="mb-6 flex space-x-4 rounded-md bg-gray-800 p-4 shadow">
          <div>
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-300">
              Status:
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
                setSelectedCommissions(new Set());
              }}
              className="rounded-md border-gray-700 shadow-sm sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Pending Payout">Pending Payout</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* Add more filters here */}
          {payoutError && (
            <p className="self-center text-sm text-red-400">Payout Error: {payoutError}</p>
          )}
        </div>

        {error && <p className="mb-4 text-red-400">Error: {error}</p>}

        <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  <input
                    type="checkbox"
                    onChange={e => handleSelectAll(e.target.checked)}
                    title="Select all pending commissions"
                    className="rounded"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Earned Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Amount
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
                  Payout Info
                </th>
                {/* Maybe remove Actions column if handled via checkbox/bulk */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {commissions.length > 0 ? (
                commissions.map(comm => (
                  <tr key={comm.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      {comm.status === 'Pending Payout' && (
                        <input
                          type="checkbox"
                          checked={selectedCommissions.has(comm.id)}
                          onChange={e => handleSelectionChange(comm.id, e.target.checked)}
                          title={`Select commission for ${comm.userName}`}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {comm.earnedDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-200">
                      <Link
                        href={`/admin/dashboard/users/${comm.userId}`}
                        className="hover:underline"
                      >
                        {comm.userName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {comm.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {comm.orderId && (
                        <Link
                          href={`/admin/dashboard/orders/${comm.orderId}`}
                          className="hover:underline"
                        >
                          Order #{comm.orderId.split('-')[1]}
                        </Link>
                      )}
                      {/* Display other details based on type */}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-400">
                      ${comm.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(comm.status)}`}
                      >
                        {comm.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {comm.payoutDate || '-'}
                      {comm.payoutBatchId && (
                        <span className="text-xs"> (Batch: {comm.payoutBatchId})</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No commissions found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">First</span>
                      &laquo;
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Previous</span>
                      &lsaquo;
                    </button>

                    {[...Array(totalPages).keys()].map(idx => {
                      const pageNumber = idx + 1;
                      // Show current page, first, last, and 1 page before/after current
                      if (
                        pageNumber === currentPage ||
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        pageNumber === currentPage - 1 ||
                        pageNumber === currentPage + 1
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            aria-current={pageNumber === currentPage ? 'page' : undefined}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNumber === currentPage
                                ? 'z-10 bg-gold-500 text-gray-900 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500'
                                : 'text-gray-300 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      // Show ellipsis where needed
                      if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-700 focus:outline-offset-0"
                          >
                            &hellip;
                          </span>
                        );
                      }

                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Next</span>
                      &rsaquo;
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Last</span>
                      &raquo;
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
