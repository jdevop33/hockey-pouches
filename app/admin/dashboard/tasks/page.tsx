'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

// Type matches API response
interface AdminTaskList {
    id: number;
    title: string;
    category: string;
    status: string;
    priority?: string | null;
    assignedUserId?: string | null;
    assignedUserName?: string | null; 
    dueDate?: string | null;
    relatedTo?: { type: string | null; id: string | null };
    createdAt: string; 
}
interface PaginationState { page: number; limit: number; total: number; totalPages: number; }
interface AssignableUser { id: string; name: string; } // For filter dropdown

export default function AdminTasksPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  // State
  const [tasks, setTasks] = useState<AdminTaskList[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  
  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAssignedUser, setFilterAssignedUser] = useState(''); 

  // Auth Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch Assignable Users (for filter dropdown)
  useEffect(() => {
      if (user && token && user.role === 'Admin') {
          const fetchUsers = async () => {
              try {
                   const response = await fetch(`/api/admin/users?limit=500`, { // Fetch a good number of potential assignees
                       headers: { 'Authorization': `Bearer ${token}` }
                   });
                   if (!response.ok) throw new Error('Failed to fetch users');
                   const data = await response.json();
                   setAssignableUsers(data.users?.map((u: any) => ({ id: u.id, name: u.name })) || []);
              } catch (err) {
                   console.error("Failed to fetch assignable users:", err);
              }
          };
          fetchUsers();
      }
  }, [user, token]);

  // Fetch Tasks Data
  useEffect(() => {
    if (user && token && user.role === 'Admin') {
        const loadTasks = async () => {
            setIsLoadingData(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    ...(filterStatus && { status: filterStatus }),
                    ...(filterCategory && { category: filterCategory }),
                    ...(filterAssignedUser && { assignedUserId: filterAssignedUser }),
                });
                const response = await fetch(`/api/admin/tasks?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    if (response.status === 401) { logout(); router.push('/login'); return; }
                    const errData = await response.json();
                    throw new Error(errData.message || `Failed to fetch tasks (${response.status})`);
                }
                const data = await response.json();
                setTasks(data.tasks || []);
                setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
            } catch (err: any) {
                setError(err.message || 'Failed to load tasks.');
                console.error(err);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadTasks();
    }
  }, [user, token, pagination.page, pagination.limit, filterStatus, filterCategory, filterAssignedUser, logout, router]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleAddTask = () => { alert('Open Add Task Modal (Not Implemented)'); };
  const getStatusColor = (status: string) => { /* ... */ };
  const getPriorityColor = (priority?: string | null) => { /* ... */ };

  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading tasks...</div></Layout>;
  if (!user || user.role !== 'Admin') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Tasks</h1>
            <button onClick={handleAddTask} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Add New Task</button>
        </div>

        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow flex flex-wrap gap-4">
            {/* Status Filter */} 
            <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                <select id="statusFilter" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({...p, page: 1})); }} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                </select>
            </div>
            {/* Category Filter (Simple Input for now) */} 
            <div>
                 <label htmlFor="categoryFilter" className="mr-2 text-sm font-medium text-gray-700">Category:</label>
                 <input type="text" id="categoryFilter" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPagination(p => ({...p, page: 1})); }} placeholder="Enter category..." className="rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
             {/* Assigned User Filter */} 
            <div>
                <label htmlFor="assigneeFilter" className="mr-2 text-sm font-medium text-gray-700">Assignee:</label>
                <select id="assigneeFilter" value={filterAssignedUser} onChange={(e) => { setFilterAssignedUser(e.target.value); setPagination(p => ({...p, page: 1})); }} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                    <option value="">All Users</option>
                    <option value="unassigned">Unassigned</option>
                    {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
             {/* TODO: Add Due Date Filter, Priority Filter, Search */} 
        </div>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Head */} 
            <thead className="bg-gray-50"><tr>{/* ... th ... */}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    {/* Table Cells */} 
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         <Link href={`/admin/dashboard/tasks/${task.id}`} className="hover:text-primary-600">{task.title}</Link>
                     </td>
                     {/* ... Other cells for category, status, priority, assignee, due date, relatedTo ... */} 
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                       <Link href={`/admin/dashboard/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900">View/Edit</Link>
                       {/* Quick actions? */} 
                     </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No tasks found.</td></tr>
              )}
            </tbody>
          </table>
           {/* Pagination */} 
            {pagination.totalPages > 1 && (
               <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"> {/* ... Pagination Controls ... */} </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
