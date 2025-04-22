'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminTask = {
  id: string;
  title: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred';
  assignedUserId?: string | null;
  assignedUserName?: string | null; // Optional denormalized name
  dueDate?: string | null;
  relatedTo?: { type: string; id: string; };
  priority?: 'Low' | 'Medium' | 'High';
  createdAt: string;
};

export default function AdminTasksPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (status, category, assigned user), sorting, search, pagination
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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

    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/tasks?status=...&page=...
        const query = new URLSearchParams({
           page: currentPage.toString(),
           limit: '15',
           ...(filterStatus && { status: filterStatus }),
           ...(filterCategory && { category: filterCategory }),
           // Add other filters
        }).toString();
        // const response = await fetch(`/api/admin/tasks?${query}`);
        // if (!response.ok) throw new Error('Failed to fetch tasks');
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
             tasks: [
                { id: 'task-1', title: 'Approve Order #order-xyz', category: 'Order Approval', status: 'Pending', assignedUserId: 'admin-1', assignedUserName: 'Admin User', dueDate: null, relatedTo: { type: 'Order', id: 'order-xyz' }, priority: 'High', createdAt: '2023-10-28' },
                { id: 'task-2', title: 'Assign Distributor for Order #order-abc', category: 'Distributor Assignment', status: 'Pending', assignedUserId: 'admin-1', assignedUserName: 'Admin User', dueDate: null, relatedTo: { type: 'Order', id: 'order-abc' }, priority: 'Medium', createdAt: '2023-10-27' },
                { id: 'task-3', title: 'Verify Fulfillment for Order #order-def', category: 'Fulfillment Verification', status: 'Pending', assignedUserId: 'admin-2', assignedUserName: 'Another Admin', dueDate: null, relatedTo: { type: 'Order', id: 'order-def' }, priority: 'Medium', createdAt: '2023-10-26' },
                { id: 'task-4', title: 'Follow up with Customer #cust-1', category: 'Customer Service', status: 'Completed', assignedUserId: 'admin-1', assignedUserName: 'Admin User', dueDate: '2023-10-25', relatedTo: { type: 'User', id: 'cust-1' }, priority: 'Low', createdAt: '2023-10-24' },
             ],
             pagination: { page: currentPage, totalPages: 3, total: 45 }
        };
        // Assert types for status and priority in placeholder data
        const typedTasks = data.tasks.map(task => ({
            ...task,
            status: task.status as AdminTask['status'],
            priority: task.priority as AdminTask['priority']
        }))

        setTasks(typedTasks);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load tasks.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [isAuthenticated, isAdmin, currentPage, filterStatus, filterCategory]); // Reload on page or filter change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // TODO: Implement Add/Edit Task Modals/Forms
  const handleAddTask = () => { alert('Open Add Task Modal'); };
  // Edit might navigate to a detail page or open a modal

   const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Deferred': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
     const getPriorityColor = (priority?: string) => {
         switch (priority) {
            case 'High': return 'text-red-600 font-semibold';
            case 'Medium': return 'text-orange-600';
            case 'Low': return 'text-gray-500';
            default: return 'text-gray-500';
        }
     };


  if (isLoading) {
    return <Layout><div className="p-8">Loading tasks...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Tasks</h1>
            <button 
              onClick={handleAddTask}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Add New Task
            </button>
        </div>

        {/* TODO: Add Filters (Status, Category, Assigned User), Search Bar */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow flex space-x-4">
             Filters Placeholder (Status, Category, Assigned User, Due Date)
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                 {/* TODO: Add checkbox for bulk actions? */} 
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related To</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/admin/dashboard/tasks/${task.id}`} className="hover:text-primary-600">{task.title}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                     <td className={`px-6 py-4 whitespace-nowrap text-sm ${getPriorityColor(task.priority)}`}>{task.priority || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedUserId ? 
                        (<Link href={`/admin/dashboard/users/${task.assignedUserId}`} className="hover:underline">{task.assignedUserName || task.assignedUserId}</Link>) 
                        : 'Unassigned'}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.dueDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.relatedTo ? 
                           (<Link href={`/admin/dashboard/${task.relatedTo.type.toLowerCase()}s/${task.relatedTo.id}`} className="hover:underline">{task.relatedTo.type} #{task.relatedTo.id.split('-')[1]}</Link>) 
                           : '-'}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={`/admin/dashboard/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900">View/Edit</Link>
                       {/* TODO: Add Quick Complete/Assign actions? Delete? */} 
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No tasks found matching criteria.</td>
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
