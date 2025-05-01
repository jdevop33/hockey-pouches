'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// Type for detailed user view by Admin
interface AdminUserDetails {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Distributor' | 'Retail Customer' | 'Wholesale Buyer';
  status: 'Active' | 'Suspended' | 'Pending Verification';
  created_at: string; // Changed from joinDate for consistency with DB
  lastLogin?: string | null;
  referral_code?: string | null;
  referred_by_code?: string | null;
  location?: string | null; // For Distributors
  // TODO: Add address array? Order count? Commission summary?
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUserSession, token, isLoading: authLoading, logout } = useAuth();
  const userId = params.userId as string;

  // State
  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AdminUserDetails>>({});

  // Auth Check
  useEffect(() => {
    if (!authLoading && (!adminUserSession || adminUserSession.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [adminUserSession, authLoading, router]);

  // Data Fetching Function
  const loadUserData = async () => {
    if (!token || !userId) return;
    setIsLoadingData(true);
    setError(null);
    setActionError(null);
    try {

      const response = await fetch(`/api/admin/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
          if (response.status === 401) { logout(); router.push('/login'); return; }
          if (response.status === 404) { throw new Error('User not found.'); }
          const errData = await response.json();
          throw new Error(errData.message || `Failed to fetch user (${response.status})`);
      }
      const data = await response.json();

      setUser(data as AdminUserDetails);
      setEditData(data); // Initialize edit form state
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load user details.');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (adminUserSession && token && adminUserSession.role === 'Admin' && userId) {
      loadUserData();
    }
  }, [adminUserSession, token, userId]); // Rerun if userId changes

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !token || !editData) return;
      setIsActionLoading(true);
      setActionError(null);

      // Construct payload with only changed fields relevant for PUT /api/admin/users/[userId]
      const payload: Partial<AdminUserDetails> = {};
      if (editData.name !== user.name) payload.name = editData.name;
      if (editData.role !== user.role) payload.role = editData.role;
      if (editData.location !== user.location) payload.location = editData.location;
      // Add other editable fields (maybe not status/email here)

      if (Object.keys(payload).length === 0) {
          setIsEditing(false); setIsActionLoading(false); return; // No changes
      }


      try {
          const response = await fetch(`/api/admin/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errData = await response.json();
              throw new Error(errData.message || 'Failed to update user');
          }
          alert('User updated successfully! Reloading data...');
          setIsEditing(false);
          await loadUserData(); // Refresh data
      } catch (err: unknown) {
          setActionError(err instanceof Error ? err.message : 'Could not update user.');
          console.error(err);
      } finally {
          setIsActionLoading(false);
      }
  };

  const handleStatusAction = async (action: 'suspend' | 'activate') => {
      if (!user || !token) return;
      const confirmAction = confirm(`Are you sure you want to ${action} this user?`);
      if (!confirmAction) return;

      setIsActionLoading(true);
      setActionError(null);
      const endpoint = `/api/admin/users/${userId}/${action}`;

      try {
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
          });
           if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errData = await response.json();
              throw new Error(errData.message || `Failed to ${action} user.`);
          }
          alert(`User ${action}d successfully! Reloading data...`);
          await loadUserData(); // Refresh data
      } catch (err: unknown) {
           setActionError(err instanceof Error ? err.message : `Failed to ${action} user.`);
           console.error(err);
      } finally {
           setIsActionLoading(false);
      }
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;
  if (!adminUserSession || adminUserSession.role !== 'Admin') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-600 bg-red-100 rounded">Error: {error}</div></Layout>;
  if (!user) return <Layout><div className="p-8 text-center">User not found.</div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6"><Link href="/admin/dashboard/users" className="text-primary-600 hover:text-primary-700">&larr; Back to Users</Link></div>

        <form onSubmit={handleSaveChanges}>
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">
                   {isEditing ? 'Edit User' : 'User Details'} - {user.name}
                   <span className={`ml-3 text-sm font-medium px-2.5 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                 </h1>
                 <div>{/* Action Buttons */}</div>
             </div>
             {actionError && <p className="text-red-500 text-sm mb-3 bg-red-100 p-2 rounded">Action Error: {actionError}</p>}

             {/* User Details/Edit Form */}
             <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                         <input type="text" id="name" name="name" value={editData.name || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`...`} />
                     </div>
                     <div>
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                         {/* Usually email is not directly editable */}
                         <input type="email" id="email" name="email" value={editData.email || ''} readOnly className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100`} />
                     </div>
                      <div>
                         <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                          <select id="role" name="role" value={editData.role || ''} onChange={handleInputChange} disabled={!isEditing} required className={`mt-1 block w-full ... ${!isEditing ? 'bg-gray-100' : ''}`}>
                              {/* Options */}
                         </select>
                     </div>
                     <div>
                         <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Distributor)</label>
                         <input type="text" id="location" name="location" value={editData.location || ''} onChange={handleInputChange} readOnly={!isEditing || editData.role !== 'Distributor'} className={`mt-1 block w-full ... ${!isEditing || editData.role !== 'Distributor' ? 'bg-gray-100' : ''}`} />
                     </div>
                      {/* Display Only Fields */}
                 </div>
                  {isEditing && <div className="text-right"><button type="submit" className="..." disabled={isActionLoading}>{isActionLoading ? 'Saving...' : 'Save Changes'}</button></div>}
             </div>
        </form>

         {/* Related Info Sections */}
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white shadow rounded-lg p-6">{/* Order History Placeholder */}</div>
             <div className="bg-white shadow rounded-lg p-6">{/* Commission Summary Placeholder */}</div>
         </div>
      </div>
    </Layout>
  );
}
