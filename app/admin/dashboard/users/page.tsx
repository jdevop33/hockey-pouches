'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Distributor' | 'Retail Customer' | 'Wholesale Buyer';
  status: 'Active' | 'Suspended' | 'Pending Verification';
  joinDate: string;
};

export default function AdminUsersPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (role, status), sorting, search, pagination
  const [filterRole, setFilterRole] = useState('');
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

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/users?role={filterRole}...&page={currentPage}...
        const query = new URLSearchParams({
           page: currentPage.toString(),
           limit: '15', // Example limit
           ...(filterRole && { role: filterRole }),
           ...(filterStatus && { status: filterStatus }),
           // Add other filters like search
        }).toString();

        // const response = await fetch(`/api/admin/users?${query}`);
        // if (!response.ok) throw new Error('Failed to fetch users');
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
             // Explicitly cast roles to match AdminUser type
             users: [
                 { id: 'user-1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' as AdminUser['role'], status: 'Active' as AdminUser['status'], joinDate: '2023-01-15' },
                 { id: 'dist-1', name: 'Vancouver Distributor', email: 'van@example.com', role: 'Distributor' as AdminUser['role'], status: 'Active' as AdminUser['status'], joinDate: '2023-03-10' },
                 { id: 'cust-1', name: 'Alice Smith', email: 'alice@example.com', role: 'Retail Customer' as AdminUser['role'], status: 'Active' as AdminUser['status'], joinDate: '2023-10-27' },
                 { id: 'whsl-1', name: 'Retail Store Inc.', email: 'store@example.com', role: 'Wholesale Buyer' as AdminUser['role'], status: 'Active' as AdminUser['status'], joinDate: '2023-08-01' },
                 { id: 'cust-2', name: 'Bob Jones', email: 'bob@example.com', role: 'Retail Customer' as AdminUser['role'], status: 'Suspended' as AdminUser['status'], joinDate: '2023-10-26' },
             ],
             pagination: { page: currentPage, totalPages: 6, total: 85 }
        };

        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load users.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [isAuthenticated, isAdmin, currentPage, filterRole, filterStatus]); // Reload on page or filter change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // TODO: Implement Add/Edit User Modals/Forms
  const handleAddUser = () => { alert('Open Add User Modal'); };
  // Edit would likely navigate to a dedicated page like /admin/dashboard/users/[userId]/edit

   const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Suspended': return 'bg-red-100 text-red-800';
            case 'Pending Verification': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
      const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-800';
            case 'Distributor': return 'bg-blue-100 text-blue-800';
            case 'Wholesale Buyer': return 'bg-indigo-100 text-indigo-800';
            case 'Retail Customer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  if (isLoading) {
    return <Layout><div className="p-8">Loading users...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            {/* TODO: Add User Button? Or is user creation handled differently (e.g., registration only)? */}
            {/* <button onClick={handleAddUser} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Add New User</button> */} 
        </div>

        {/* TODO: Add Filters (Role, Status), Search Bar */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow flex space-x-4">
             <div>
                <label htmlFor="roleFilter" className="mr-2 text-sm font-medium text-gray-700">Role:</label>
                <select 
                    id="roleFilter" 
                    value={filterRole} 
                    onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }} 
                    className="rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Wholesale Buyer">Wholesale Buyer</option>
                    <option value="Retail Customer">Retail Customer</option>
                </select>
            </div>
             <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                <select 
                    id="statusFilter" 
                    value={filterStatus} 
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} 
                    className="rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending Verification">Pending Verification</option>
                </select>
            </div>
            {/* TODO: Add Search Input */} 
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((usr) => (
                  <tr key={usr.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usr.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usr.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(usr.role)}`}>
                            {usr.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(usr.status)}`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usr.joinDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* TODO: Link to a user detail/edit page */} 
                      <Link href={`/admin/dashboard/users/${usr.id}`} className="text-primary-600 hover:text-primary-900">View/Edit</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No users found matching criteria.</td>
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
