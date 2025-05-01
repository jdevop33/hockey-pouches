'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/layout/NewLayout'; // Relative path (4 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type - Adapt as needed
type AdminTaskDetails = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred';
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  dueDate?: string | null;
  relatedTo?: { type: string; id: string; };
  priority?: 'Low' | 'Medium' | 'High';
  createdAt: string;
  createdBy?: string; // User ID or name
  completedAt?: string | null;
};

type AssignableUser = { id: string; name: string }; // For assignee dropdown

export default function AdminTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const { user: adminUser, loading: authLoading } = useAuth(); // Example
  const taskId = $1?.$2 as string;

  const [task, setTask] = useState<AdminTaskDetails | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]); // Admins/Distributors?
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AdminTaskDetails>>({});

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !taskId) return;

    const loadTask = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API calls
        // - Fetch task details from /api/tasks/[taskId] (ensure admin access allowed)
        // - Fetch list of assignable users (e.g., /api/admin/users?role=Admin&role=Distributor)

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data: AdminTaskDetails = {
            id: taskId,
            title: `Task ${taskId.substring(0,5)} Title`,
            description: 'This is a detailed task description that the admin can edit.',
            category: 'Order Approval',
            status: 'Pending',
            assignedUserId: 'admin-1',
            assignedUserName: 'Admin User',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 3 days
            relatedTo: { type: 'Order', id: 'order-xyz' },
            priority: 'Medium',
            createdAt: '2023-10-28',
            createdBy: 'system',
            completedAt: null,
        };
         // Assert types for status and priority
        data.status = data.status as AdminTaskDetails['status'];
        data.priority = data.priority as AdminTaskDetails['priority'];

        setTask(data);
        setEditData(data);

        // Simulate assignable users
        setAssignableUsers([
            { id: 'admin-1', name: 'Admin User' },
            { id: 'admin-2', name: 'Another Admin' },
            { id: 'dist-1', name: 'Vancouver Distributor' },
        ]);

      } catch (err: unknown) {
        setError('Failed to load task details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [isAuthenticated, isAdmin, taskId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: string | null | undefined = e.target.value;
      // Handle empty string for optional fields like dueDate or assignedUserId
      if (e.target.name === 'dueDate' && value === '') value = null;
      if (e.target.name === 'assignedUserId' && value === '') value = null;

      setEditData(prev => ({ ...prev, [e.target.name]: value }));
  };

   const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!task) return;

      // TODO: Call PUT /api/tasks/[taskId] with relevant fields from editData
      try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
          setTask(editData as AdminTaskDetails); // Update displayed data
          setIsEditing(false);
          alert('Task updated!');
      } catch (err: unknown) {
          alert('Failed to update task.');
          console.error(err);
      }
  };

   const handleCompleteTask = async () => {
      if (!task || task.status === 'Completed') return;
      const confirmAction = confirm(`Mark this task as complete?`);
      if (!confirmAction) return;

      setIsActionLoading(true);
      setActionError(null);
      const endpoint = `/api/tasks/${taskId}/complete`;

      try {
          // TODO: Call POST endpoint
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate action
          const newStatus = 'Completed';
          const completionTime = new Date().toISOString();
          // Corrected line below: use setTask instead of setUser
          setTask(prev => prev ? { ...prev, status: newStatus, completedAt: completionTime } : null);
          setEditData(prev => ({ ...prev, status: newStatus, completedAt: completionTime }));
          alert('Task marked as complete!');
      } catch (err: unknown) {
           setActionError(err instanceof Error ? err.message : `Failed to complete task.`);
      } finally {
           setIsActionLoading(false);
      }
  };

  if (isLoading) return <Layout><div className="p-8">Loading task details...</div></Layout>;
  if (!isAuthenticated || !isAdmin) return <Layout><div className="p-8">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  if (!task) return <Layout><div className="p-8">Task not found.</div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/admin/dashboard/tasks" className="text-primary-600 hover:text-primary-700">&larr; Back to Tasks</Link>
        </div>

        <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">
                   {isEditing ? 'Edit Task' : 'Task Details'}
                 </h1>
                 <div>
                     {/* Action Buttons */}
                     {!isEditing && task.status !== 'Completed' && (
                          <button type="button" onClick={handleCompleteTask} disabled={isActionLoading} className="mr-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Processing...' : 'Mark Complete'}
                          </button>
                     )}
                     {isEditing ? (
                        <>
                             <button type="button" onClick={() => { setIsEditing(false); setEditData(task); }} className="mr-2 text-gray-600 hover:text-gray-800 py-2 px-4 rounded">
                                 Cancel
                             </button>
                             <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                 Save Changes
                             </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                            Edit Task
                        </button>
                    )}
                 </div>
            </div>
             {actionError && <p className="text-red-500 text-sm mb-3">Error: {actionError}</p>}

            {/* Task Details Form/Display */}
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                 {/* Core Task Info */}
                 <div>
                     <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                     <input type="text" id="title" name="title" value={editData.title || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                 </div>
                  <div>
                     <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                     <textarea id="description" name="description" rows={3} value={editData.description || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                 </div>

                 {/* Status, Priority, Category, Assignee, Due Date */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                         <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                         <select id="status" name="status" value={editData.status || ''} onChange={handleInputChange} disabled={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`}>
                             <option value="Pending">Pending</option>
                             <option value="In Progress">In Progress</option>
                             <option value="Completed">Completed</option>
                             <option value="Deferred">Deferred</option>
                         </select>
                     </div>
                     <div>
                         <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                          <select id="priority" name="priority" value={editData.priority || ''} onChange={handleInputChange} disabled={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`}>
                             <option value="">- None -</option>
                             <option value="Low">Low</option>
                             <option value="Medium">Medium</option>
                             <option value="High">High</option>
                         </select>
                     </div>
                       <div>
                         <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         {/* TODO: Make category a dropdown or predefined list? */}
                         <input type="text" id="category" name="category" value={editData.category || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                        <label htmlFor="assignedUserId" className="block text-sm font-medium text-gray-700">Assigned To</label>
                         <select id="assignedUserId" name="assignedUserId" value={editData.assignedUserId || ''} onChange={handleInputChange} disabled={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`}>
                             <option value="">- Unassigned -</option>
                             {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                         </select>
                     </div>
                      <div>
                         <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                         <input type="date" id="dueDate" name="dueDate" value={editData.dueDate || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                 </div>

                  {/* Related Item & Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6 mt-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-500">Related To</label>
                           {task.relatedTo ? (
                                <Link href={`/admin/dashboard/${task.relatedTo.type.toLowerCase()}s/${task.relatedTo.id}`} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                                    {task.relatedTo.type} #{task.relatedTo.id.split('-')[1]}
                                </Link>
                            ) : (
                                <p className="text-sm text-gray-800 mt-1">-</p>
                            )}
                     </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-500">Created</label>
                          <p className="text-sm text-gray-800 mt-1">{new Date(task.createdAt).toLocaleString()} {task.createdBy && `by ${task.createdBy}`}</p>
                      </div>
                      {task.completedAt && (
                          <div>
                             <label className="block text-sm font-medium text-gray-500">Completed</label>
                             <p className="text-sm text-gray-800 mt-1">{new Date(task.completedAt).toLocaleString()}</p>
                         </div>
                      )}
                  </div>
             </div>
        </form>
      </div>
    </Layout>
  );
}
