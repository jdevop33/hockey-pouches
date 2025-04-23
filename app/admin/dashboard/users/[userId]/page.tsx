'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/layout/NewLayout'; // Relative path (4 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type - Adapt as needed
type AdminUserDetails = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Distributor' | 'Retail Customer' | 'Wholesale Buyer';
  status: 'Active' | 'Suspended' | 'Pending Verification';
  joinDate: string;
  // Add other details like addresses, order history summary, commission summary etc.
  lastLogin?: string;
  referralCode?: string;
  referredByCode?: string;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const { user: adminUser, loading: authLoading } = useAuth(); // Example
  const userId = params.userId as string;

  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AdminUserDetails>>({});

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !userId) return;

    const loadUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/users/[userId]
        // const response = await fetch(`/api/admin/users/${userId}`);
        // if (!response.ok) throw new Error('Failed to fetch user');
        // const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data: AdminUserDetails = {
            id: userId,
            name: `User ${userId.substring(0, 5)} Name`, 
            email: `user-${userId.substring(0, 5)}@example.com`,
            role: 'Retail Customer', // Default example
            status: 'Active',
            joinDate: '2023-10-01',
            lastLogin: '2023-10-28',
            referralCode: `USER${userId.substring(0, 5).toUpperCase()}`,
            referredByCode: userId === 'cust-1' ? 'REFERRER123' : undefined,
        };
        // Adjust placeholder based on ID for variety
        if (userId.startsWith('dist')) data.role = 'Distributor';
        if (userId.startsWith('admin')) data.role = 'Admin';
        if (userId === 'cust-2') data.status = 'Suspended';
        
        setUser(data);
        setEditData(data);

      } catch (err) {
        setError('Failed to load user details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [isAuthenticated, isAdmin, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

   const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      console.log('Saving user changes...', editData);
      // TODO: Call PUT /api/admin/users/[userId] with relevant fields from editData
      try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
          setUser(editData as AdminUserDetails); // Update displayed data
          setIsEditing(false);
          alert('User updated!');
      } catch (err) { 
          alert('Failed to update user.');
          console.error(err);
      }
  };
  
  const handleStatusAction = async (action: 'suspend' | 'activate') => {
      if (!user) return;
      const confirmAction = confirm(`Are you sure you want to ${action} this user?`);
      if (!confirmAction) return;
      
      setIsActionLoading(true);
      setActionError(null);
      const endpoint = `/api/admin/users/${userId}/${action}`;
      console.log(`Calling ${action} endpoint...`);
      try {
          // TODO: Call POST endpoint
          // const response = await fetch(endpoint, { method: 'POST' });
          // if (!response.ok) throw new Error(`Failed to ${action} user.`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate action
          const newStatus = action === 'suspend' ? 'Suspended' : 'Active';
          setUser(prev => prev ? { ...prev, status: newStatus as AdminUserDetails['status'] } : null);
          setEditData(prev => ({ ...prev, status: newStatus as AdminUserDetails['status'] }));
          alert(`User ${action}d successfully!`);
      } catch (err: any) {
           setActionError(err.message || `Failed to ${action} user.`);
      } finally {
           setIsActionLoading(false);
      }
  };


  if (isLoading) {
    return <Layout><div className="p-8">Loading user details...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }
  if (error) {
    return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  }
  if (!user) {
     return <Layout><div className="p-8">User not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/admin/dashboard/users" className="text-primary-600 hover:text-primary-700">&larr; Back to Users</Link>
        </div>

        <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">
                   {isEditing ? 'Edit User' : 'User Details'} - {user.name}
                 </h1>
                 <div>
                     {/* Status Action Buttons */} 
                      {!isEditing && user.status === 'Active' && (
                        <button type="button" onClick={() => handleStatusAction('suspend')} disabled={isActionLoading} className="mr-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            {isActionLoading ? 'Processing...' : 'Suspend User'}
                        </button>
                      )}
                      {!isEditing && user.status === 'Suspended' && (
                        <button type="button" onClick={() => handleStatusAction('activate')} disabled={isActionLoading} className="mr-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            {isActionLoading ? 'Processing...' : 'Activate User'}
                        </button>
                      )}
                      
                     {/* Edit/Save Buttons */} 
                     {isEditing ? (
                        <>
                             <button type="button" onClick={() => { setIsEditing(false); setEditData(user); }} className="mr-2 text-gray-600 hover:text-gray-800 py-2 px-4 rounded">
                                 Cancel
                             </button>
                             <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                 Save Changes
                             </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                            Edit User
                        </button>
                    )}
                 </div>
            </div>
             {actionError && <p className="text-red-500 text-sm mb-3">Error: {actionError}</p>}

            {/* User Details Form/Display */} 
             <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                         <input type="text" id="name" name="name" value={editData.name || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                         <input type="email" id="email" name="email" value={editData.email || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                         <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                          <select id="role" name="role" value={editData.role || ''} onChange={handleInputChange} disabled={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`}>
                             <option value="Retail Customer">Retail Customer</option>
                             <option value="Distributor">Distributor</option>
                             <option value="Wholesale Buyer">Wholesale Buyer</option>
                             <option value="Admin">Admin</option>
                         </select>
                     </div>
                     <div>
                         <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                         <input type="text" id="status" name="status" value={editData.status || ''} readOnly className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100`} />
                         {/* Status changed via buttons */} 
                     </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                         <p className="text-sm text-gray-800 mt-1">{new Date(user.joinDate).toLocaleDateString()}</p>
                     </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-500">Last Login</label>
                         <p className="text-sm text-gray-800 mt-1">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-500">User's Referral Code</label>
                         <p className="text-sm text-gray-800 mt-1 font-mono">{user.referralCode || 'N/A'}</p>
                     </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-500">Referred By Code</label>
                         <p className="text-sm text-gray-800 mt-1 font-mono">{user.referredByCode || '-'}</p>
                          {/* TODO: Link to referrer user profile? */} 
                     </div>
                 </div>
                  {/* TODO: Add Change Password section (requires separate handling) */} 
                  {/* TODO: Add section for viewing/managing user addresses */} 
             </div>
        </form>
        
         {/* Related Info Sections */} 
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TODO: Display summary of user's orders */} 
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Order History</h2>
                <p className="text-sm text-gray-500">(Order summary placeholder)</p>
                {/* Link to full order list filtered by this user */} 
                 <Link href={`/admin/dashboard/orders?customerId=${userId}`} className="text-sm text-primary-600 hover:underline mt-3 inline-block">View All Orders</Link>
            </div>
            {/* TODO: Display summary of user's commissions earned/paid */} 
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Commission Summary</h2>
                 <p className="text-sm text-gray-500">(Commission summary placeholder)</p>
                 <Link href={`/admin/dashboard/commissions?userId=${userId}`} className="text-sm text-primary-600 hover:underline mt-3 inline-block">View Commission Details</Link>
            </div>
         </div>

      </div>
    </Layout>
  );
}
