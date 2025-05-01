'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Auth context

// User Types
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Distributor' | 'Retail Customer' | 'Referral Partner' | 'Wholesale Buyer';
  status: 'Active' | 'Suspended' | 'Pending Approval' | 'Pending Verification' | 'Rejected';
  joinDate: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Filters and pagination
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check for admin access
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // Load users data
  useEffect(() => {
    if (authLoading || !user || user.role !== 'Admin' || !token) {
      return;
    }

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch users based on filters
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: '15', // Example limit
          ...(filterRole && { role: filterRole }),
          ...(filterStatus && { status: filterStatus }),
        }).toString();

        const response = await fetch(`/api/admin/users?${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);

        // Fetch pending approval users as a separate list
        const pendingResponse = await fetch('/api/admin/users?status=Pending+Approval', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingUsers($1?.$2 || []);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError('Failed to load users data.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [authLoading, user, token, currentPage, filterRole, filterStatus]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!token) return;

    setProcessingAction(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      // Update the UI by removing from pending list and refreshing main list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));

      // If the current filter includes the approved user's new status, refresh the main list
      if (!filterStatus || filterStatus === 'Active') {
        // Refresh the main users list
        const refreshResponse = await fetch(
          `/api/admin/users?${new URLSearchParams({
            page: currentPage.toString(),
            limit: '15',
            ...(filterRole && { role: filterRole }),
            ...(filterStatus && { status: filterStatus }),
          })}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if ($1?.$2k) {
          const refreshData = await $1?.$2();
          setUsers(refreshData.users || []);
        }
      }

      alert('User approved successfully');
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Failed to approve user. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!token) return;

    // Ask for rejection reason
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return; // User cancelled

    setProcessingAction(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
          setStatus: 'Rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      // Update the UI
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      alert('User rejected successfully');
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Failed to reject user. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/40 text-green-300';
      case 'Suspended':
        return 'bg-red-900/40 text-red-300';
      case 'Pending Approval':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'Pending Verification':
        return 'bg-blue-900/40 text-blue-300';
      case 'Rejected':
        return 'bg-red-900/40 text-red-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-900/40 text-purple-300';
      case 'Distributor':
        return 'bg-blue-900/40 text-blue-300';
      case 'Wholesale Buyer':
        return 'bg-indigo-900/40 text-indigo-300';
      case 'Referral Partner':
        return 'bg-teal-900/40 text-teal-300';
      case 'Retail Customer':
        return 'bg-gray-900/40 text-gray-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="p-8 text-center">Authenticating...</div>
      </Layout>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied. Admin privileges required.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-100">Manage Users</h1>
        </div>

        {/* Pending Approval Users Section */}
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-100">Pending Approval Requests</h2>
            <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Requested Role
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
                      Joined
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {pendingUsers.map(user => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-200">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          disabled={processingAction === user.id}
                          className="mr-2 text-green-400 hover:text-green-300 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          disabled={processingAction === user.id}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-md bg-gray-800 p-4 shadow">
          <div>
            <label htmlFor="roleFilter" className="mr-2 text-sm font-medium text-gray-300">
              Role:
            </label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={e => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border-gray-700 shadow-sm sm:text-sm"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Distributor">Distributor</option>
              <option value="Referral Partner">Referral Partner</option>
              <option value="Wholesale Buyer">Wholesale Buyer</option>
              <option value="Retail Customer">Retail Customer</option>
            </select>
          </div>
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
              }}
              className="rounded-md border-gray-700 shadow-sm sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-500">Error: {error}</p>}

        {/* Main Users Table */}
        {isLoading ? (
          <div className="p-8 text-center">Loading users data...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Role
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
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {users.length > 0 ? (
                  users.map(usr => (
                    <tr key={usr.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-200">
                        {usr.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {usr.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(usr.role)}`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(usr.status)}`}
                        >
                          {usr.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {new Date(usr.joinDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <Link
                          href={`/admin/dashboard/users/${usr.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View/Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching criteria.
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
                                  ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
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
        )}
      </div>
    </Layout>
  );
}
