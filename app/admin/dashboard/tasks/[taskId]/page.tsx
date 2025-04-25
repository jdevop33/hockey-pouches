'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/layout/NewLayout';
import { useAuth } from '../../../../context/AuthContext'; // Corrected relative path
import { Task } from '@\/types'; // Use the Task type

// Define a more specific type for this page if needed, or use Task directly
// Assuming Task type from '@\/types' includes all snake_case fields and relatedTo
type AdminTaskDetails = Task & {
  assignedUserName?: string | null; // Added by API join
  createdByUserName?: string | null; // Added by API join
};

type AssignableUser = { id: string; name: string }; // For assignee dropdown

export default function AdminTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook

  const taskIdString = params.taskId as string;
  const taskId = taskIdString ? parseInt(taskIdString) : undefined;

  // Use AdminTaskDetails which includes snake_case from Task
  const [task, setTask] = useState<AdminTaskDetails | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // Use Partial<AdminTaskDetails> for edit state, keys will be snake_case
  const [editData, setEditData] = useState<Partial<AdminTaskDetails>>({});

  // --- Authentication and Role Check ---
  useEffect(() => {
    if (!authLoading) {
      if (!adminUser || !token) {
        router.push('/login?redirect=/admin/dashboard/tasks');
      } else if (adminUser.role !== 'Admin') {
        router.push('/dashboard'); // Redirect non-admins
      }
    }
  }, [adminUser, token, authLoading, router]);

  // --- Load Task Data --- 
  useEffect(() => {
    if (adminUser && token && adminUser.role === 'Admin' && taskId) {
      const loadTask = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // --- Fetch Task Details --- 
          const response = await fetch(`/api/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            if (response.status === 401) {
              logout(); router.push('/login'); return;
            }
            if (response.status === 403) throw new Error('Access Forbidden.');
            if (response.status === 404) throw new Error('Task not found.');
            throw new Error(`Failed to fetch task (${response.status})`);
          }
          const data: AdminTaskDetails = await response.json();
          setTask(data);
          setEditData(data); // Initialize edit form data (will have snake_case keys)

          // --- Fetch Assignable Users (Admins + Distributors) --- 
          const usersResponse = await fetch(`/api/admin/users?limit=500`, {
             headers: { Authorization: `Bearer ${token}` }
          });
           if (!usersResponse.ok) throw new Error('Failed to fetch assignable users');
           const usersData = await usersResponse.json();
           setAssignableUsers(usersData.users?.map((u: any) => ({ id: u.id, name: u.name })) || []);

        } catch (err: any) {
          setError(err.message || 'Failed to load task details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadTask();
    }
  }, [adminUser, token, taskId, router, logout]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target; // name is now snake_case from HTML
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    // Handle optional empty values for nullables
    if ((name === 'due_date' || name === 'assigned_user_id' || name === 'priority') && value === '') {
        finalValue = null;
    } 
     // Ensure status is one of the allowed values
     if (name === 'status' && !['Pending', 'In Progress', 'Completed', 'Deferred'].includes(value)) {
         finalValue = task?.status || 'Pending'; // Revert or default
     }
     // Ensure priority is one of the allowed values or null
      if (name === 'priority' && !['', 'Low', 'Medium', 'High'].includes(value)) {
         finalValue = task?.priority || null;
     }
     // Ensure numbers are stored as numbers (or null)
     if (name === 'strength' && value !== '') { // Assuming strength is handled elsewhere if not directly on task
        finalValue = parseInt(value, 10);
        if (isNaN(finalValue)) finalValue = null;
     }

    // Use snake_case key directly
    setEditData(prev => ({ ...prev, [name]: finalValue }));
  };


  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !token || !taskId) return;

    setIsActionLoading(true);
    setActionError(null);

    // Prepare only changed fields for the payload (already snake_case)
    const payload: Partial<AdminTaskDetails> = {};
    let hasChanges = false;

    // Define the keys to skip with the specific union type
    const keysToSkip: Array<keyof AdminTaskDetails> = [
        'id',
        'created_at',
        'completed_at',
        'relatedTo',
        'assignedUserName',
        'createdByUserName',
        'updated_at',
        'created_by_user_id',
        'related_entity_id',
        'related_entity_type'
    ];

    (Object.keys(editData) as Array<keyof AdminTaskDetails>).forEach(key => {
        // Check if the current key should be skipped using the explicitly typed array
        if (keysToSkip.includes(key)) { // <-- Check against the typed array
            return;
        }

        // Ensure the key exists in the original task for comparison
        // This check might not be strictly necessary if editData is always initialized from task
        // but provides extra safety.
        // if (!(key in task)) { // Optional safety check
             // console.warn(`Skipping key "${key}" not found in original task data.`);
        //    return;
        // }

        let currentVal = task[key];
        let editedVal = editData[key];

         // Handle null/empty string comparison for edited values
        if (currentVal === null && editedVal === '') {
             editedVal = null;
        }
        // No need to adjust currentVal for comparison if it's empty string and editedVal is null

        // Compare values, considering undefined for partial updates
        if (editedVal !== currentVal) {
            // Check for undefined explicitly because editedVal could be undefined in Partial<>
            // if (editedVal !== undefined || currentVal !== undefined) { // Ensure we are not comparing undefined === undefined if key was not present in editData
                 payload[key] = editedVal; // Assign the edited value (could be string, number, boolean, null, object, etc.)
                 hasChanges = true;
           // }
        }
    });


    if (!hasChanges) {
        setIsEditing(false);
        setIsActionLoading(false);
        return;
    }

    console.log('Saving task changes via PUT /api/tasks/[taskId]...', payload);

    try {
      // API expects snake_case payload
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) { logout(); router.push('/login'); return; }
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save changes');
      }

      const updatedTaskData: AdminTaskDetails = await response.json();
      setTask(updatedTaskData); // API returns snake_case
      setEditData(updatedTaskData); // Update edit state with snake_case
      setIsEditing(false);
      alert('Task updated successfully!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to save changes.');
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Generic task completion handler
  const handleCompleteTask = async (showConfirm = true) => {
    // Use snake_case task.completed_at
    if (!task || task.status === 'Completed' || !token || !taskId) return false; // Return success status

    if (showConfirm) {
      const confirmAction = confirm(`Mark this task as complete?`);
      if (!confirmAction) return false;
    }

    setIsActionLoading(true);
    setActionError(null);
    const endpoint = `/api/tasks/${taskId}/complete`;
    console.log(`Calling complete endpoint: POST ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) { logout(); router.push('/login'); return false; }
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to complete task.');
      }

      const result = await response.json();
      console.log('Task completion result:', result);

      // Update task state locally using snake_case completed_at
      const newStatus = 'Completed';
      const completionTime = new Date().toISOString();
      setTask(prev => (prev ? { ...prev, status: newStatus, completed_at: completionTime } : null));
      setEditData(prev => ({ ...prev, status: newStatus, completed_at: completionTime }));
      // Only show alert if called directly, not as part of another action
      if (showConfirm) {
        alert('Task marked as complete!');
      }
      return true; // Indicate success

    } catch (err: any) {
      setActionError(err.message || `Failed to complete task.`);
      return false; // Indicate failure
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Specific Action Handlers --- 
  const handleApproveOrder = async () => {
      // Use snake_case task properties if needed (relatedTo is formatted by API)
      if (!task?.relatedTo || task.relatedTo.type !== 'Order' || !token) return;
      const orderId = task.relatedTo.id;
      console.log(`Attempting to approve order: ${orderId}`);
      
      setIsActionLoading(true);
      setActionError(null);
      
      try {
         const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
         });
         
         if (!response.ok) {
            if (response.status === 401) { logout(); router.push('/login'); return; }
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to approve order.');
         }
         const resultData = await response.json();
         alert(resultData.message || `Order ${orderId} approved successfully!`);
         
         // Now complete the associated task
         const taskCompleted = await handleCompleteTask(false); // Complete without confirm prompt
         if (taskCompleted) {
             // Optionally refresh data or navigate after short delay
              setTimeout(() => router.push('/admin/dashboard/tasks'), 1000);
         }
          
      } catch (err: any) {
           setActionError(err.message);
           console.error('Error approving order:', err);
      } finally {
          setIsActionLoading(false);
      }
  };

  const handleConfirmPayment = async () => {
      // Use snake_case task properties if needed (relatedTo is formatted by API)
      if (!task?.relatedTo || task.relatedTo.type !== 'Order' || !token) return;
      const orderId = task.relatedTo.id;
      
      // Determine payment type from task title
      const paymentType = task.title.toLowerCase().includes('bitcoin') ? 'btc' : 'etransfer';
      const endpoint = `/api/payments/manual/${paymentType}-confirm`;
      
      // Prompt for transaction ID (replace with a proper input later if needed)
      const transactionId = prompt(`Enter the ${paymentType.toUpperCase()} transaction ID/Reference for order ${orderId}:`);
      if (!transactionId) {
          setActionError('Transaction ID is required to confirm payment.');
          return;
      }
      
      console.log(`Attempting to confirm ${paymentType} payment for order: ${orderId}`);
      setIsActionLoading(true);
      setActionError(null);
      
      try {
         const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
             },
             // API expects orderId as number - ensure conversion if needed
             body: JSON.stringify({ orderId: parseInt(orderId), transactionId }) 
         });
         
         if (!response.ok) {
            if (response.status === 401) { logout(); router.push('/login'); return; }
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to confirm payment.');
         }

         const result = await response.json();
         alert(result.message || `Payment confirmed for order ${orderId}!`);
         
         // Now complete the associated task
         const taskCompleted = await handleCompleteTask(false); 
         if (taskCompleted) {
             // Optionally refresh data or navigate after short delay
             setTimeout(() => router.push('/admin/dashboard/tasks'), 1000);
         }
          
      } catch (err: any) {
           setActionError(err.message);
           console.error('Error confirming payment:', err);
      } finally {
          setIsActionLoading(false);
      }
  };
  
   const handleAssignDistributor = async () => {
      // Use snake_case task properties if needed (relatedTo is formatted by API)
      // Check snake_case editData.assigned_user_id
      if (!task?.relatedTo || task.relatedTo.type !== 'Order' || !editData.assigned_user_id || !token) {
          setActionError('Please select a distributor to assign.');
          return;
      }
      const orderId = task.relatedTo.id;
      const distributorId = editData.assigned_user_id; // Use snake_case
      
      console.log(`Attempting to assign distributor ${distributorId} to order ${orderId}`);
      setIsActionLoading(true);
      setActionError(null);

       try {
         const response = await fetch(`/api/admin/orders/${orderId}/assign-distributor`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            },
             // API expects camelCase body { distributorId } according to its definition
            body: JSON.stringify({ distributorId })
         });
         
         if (!response.ok) {
            if (response.status === 401) { logout(); router.push('/login'); return; }
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to assign distributor.');
         }
         const result = await response.json();
         alert(result.message || `Distributor assigned successfully!`);

         // Now complete the associated task
         const taskCompleted = await handleCompleteTask(false); 
         if (taskCompleted) {
             // Optionally refresh data or navigate after short delay
             setTimeout(() => router.push('/admin/dashboard/tasks'), 1000);
         }
          
      } catch (err: any) {
           setActionError(err.message);
           console.error('Error assigning distributor:', err);
      } finally {
          setIsActionLoading(false);
      }
  };
  
   const handleVerifyFulfillment = async () => {
      // Use snake_case task properties if needed (relatedTo is formatted by API)
      if (!task?.relatedTo || task.relatedTo.type !== 'Order' || !token) return;
      const orderId = task.relatedTo.id;
      
      console.log(`Attempting to verify fulfillment for order ${orderId}`);
      setIsActionLoading(true);
      setActionError(null);

       try {
         const response = await fetch(`/api/admin/orders/${orderId}/verify-fulfillment`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
         });
         
         if (!response.ok) {
            if (response.status === 401) { logout(); router.push('/login'); return; }
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to verify fulfillment.');
         }
         const result = await response.json();
         alert(result.message || `Fulfillment verified successfully!`);

         // Now complete the associated task
         const taskCompleted = await handleCompleteTask(false); 
         if (taskCompleted) {
             // Optionally refresh data or navigate after short delay
             setTimeout(() => router.push('/admin/dashboard/tasks'), 1000);
         }
          
      } catch (err: any) {
           setActionError(err.message);
           console.error('Error verifying fulfillment:', err);
      } finally {
          setIsActionLoading(false);
      }
  };


  // --- Render Logic ---
  if (authLoading || isLoading) return <Layout><div className="p-8">Loading task details...</div></Layout>;
  if (!adminUser || adminUser.role !== 'Admin') return <Layout><div className="p-8">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  if (!task) return <Layout><div className="p-8">Task not found.</div></Layout>;

  // Determine which specific action button to show (using snake_case task.status)
  const showApproveOrderButton = task.status === 'Pending' && task.category === 'Order' && task.title.toLowerCase().includes('approve order');
  const showConfirmPaymentButton = task.status === 'Pending' && task.category === 'Payment' && task.title.toLowerCase().includes('confirm');
  // Use snake_case editData.assigned_user_id
  const showAssignDistributorButton = task.status === 'Pending' && task.category === 'Order' && task.title.toLowerCase().includes('assign distributor');
  const showVerifyFulfillmentButton = task.status === 'Pending' && task.category === 'Order' && task.title.toLowerCase().includes('verify fulfillment');

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/admin/dashboard/tasks" className="text-primary-600 hover:text-primary-700">&larr; Back to Tasks</Link>
        </div>

        <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                 <h1 className="text-3xl font-bold text-gray-800">
                   {isEditing ? 'Edit Task' : 'Task Details'}
                 </h1>
                 {/* Action Buttons Area */} 
                 <div className="flex gap-2 flex-wrap">
                     {/* Contextual Action Buttons */} 
                     {!isEditing && showApproveOrderButton && (
                          <button type="button" onClick={handleApproveOrder} disabled={isActionLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Approving...' : 'Approve Related Order'}
                          </button>
                     )}
                      {!isEditing && showConfirmPaymentButton && (
                          <button type="button" onClick={handleConfirmPayment} disabled={isActionLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Confirming...' : 'Confirm Related Payment'}
                          </button>
                     )}
                     {!isEditing && showAssignDistributorButton && (
                          // Check snake_case editData.assigned_user_id
                          <button type="button" onClick={handleAssignDistributor} disabled={isActionLoading || !editData.assigned_user_id} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Assigning...' : 'Assign Selected Distributor'}
                          </button>
                     )}
                      {!isEditing && showVerifyFulfillmentButton && (
                          <button type="button" onClick={handleVerifyFulfillment} disabled={isActionLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Verifying...' : 'Verify Order Fulfillment'}
                          </button>
                     )}
                     
                     {/* Generic Complete Button (only if no specific action shown and not completed) */} 
                     {/* Use snake_case task.status */} 
                     {!isEditing && task.status !== 'Completed' && 
                      !showApproveOrderButton && !showConfirmPaymentButton && 
                      !showAssignDistributorButton && !showVerifyFulfillmentButton && (
                          <button type="button" onClick={() => handleCompleteTask()} disabled={isActionLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                              {isActionLoading ? 'Completing...' : 'Mark Task Complete'}
                          </button>
                     )}
                     
                     {/* Edit/Save Buttons */} 
                     {isEditing ? (
                        <>
                             <button type="button" onClick={() => { setIsEditing(false); setEditData(task); setActionError(null); }} disabled={isActionLoading} className="mr-2 text-gray-600 hover:text-gray-800 py-2 px-4 rounded border border-gray-300 bg-white disabled:opacity-50">
                                 Cancel
                             </button>
                             <button type="submit" disabled={isActionLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                 {isActionLoading ? 'Saving...' : 'Save Changes'}
                             </button>
                        </>
                    ) : (
                         task.status !== 'Completed' && // Don't allow editing completed tasks (snake_case)
                            <button type="button" onClick={() => setIsEditing(true)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                Edit Task Details
                            </button>
                    )}
                 </div>
            </div>
             {actionError && <p className="text-red-500 text-sm mb-3 bg-red-100 p-2 rounded">Error: {actionError}</p>}

            {/* Task Details Form/Display - Use snake_case for name attributes and values */} 
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
                             <option value="">- None -</option> {/* Use empty string for null */} 
                             <option value="Low">Low</option>
                             <option value="Medium">Medium</option>
                             <option value="High">High</option>
                         </select>
                     </div>
                       <div>
                         <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         <input type="text" id="category" name="category" value={editData.category || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                        {/* Use snake_case for name */} 
                        <label htmlFor="assigned_user_id" className="block text-sm font-medium text-gray-700">Assigned To</label>
                         <select id="assigned_user_id" name="assigned_user_id" value={editData.assigned_user_id || ''} onChange={handleInputChange} 
                          // Only allow editing assignee if the task is relevant (e.g., assigning distributor) or if editing generally
                          disabled={!isEditing && !showAssignDistributorButton} 
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${(!isEditing && !showAssignDistributorButton) ? 'bg-gray-100' : ''}`}>
                             <option value="">- Unassigned -</option> {/* Use empty string for null */} 
                             {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                         </select>
                         {/* Display assignee name if not editing */} 
                         {!isEditing && task.assignedUserName && (
                             <p className="text-sm text-gray-600 mt-1">({task.assignedUserName})</p>
                         )}
                     </div>
                      <div>
                        {/* Use snake_case for name */} 
                         <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
                         <input type="date" id="due_date" name="due_date" value={editData.due_date || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                 </div>
                 
                  {/* Related Item & Meta Info - Use snake_case properties */} 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6 mt-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-500">Related To</label>
                           {task.relatedTo ? (
                               <Link href={`/admin/dashboard/${task.relatedTo.type.toLowerCase()}s/${task.relatedTo.id}`} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                                   {task.relatedTo.type} #{task.relatedTo.id} 
                               </Link>
                           ) : (
                               <p className="text-sm text-gray-800 mt-1">-</p>
                           )}
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-500">Created By</label>
                          {/* Use createdByUserName from join, fallback to id */} 
                          <p className="text-sm text-gray-800 mt-1">{task.createdByUserName || task.created_by_user_id || 'System'}</p>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-500">Created At</label>
                           <p className="text-sm text-gray-800 mt-1">{new Date(task.created_at).toLocaleString()}</p>
                       </div>
                       {task.completed_at && ( // Use snake_case
                           <div>
                              <label className="block text-sm font-medium text-gray-500">Completed At</label>
                              <p className="text-sm text-gray-800 mt-1">{new Date(task.completed_at).toLocaleString()}</p>
                          </div>
                       )}
                  </div>
            </div>
        </form>
      </div>
    </Layout>
  );
}
