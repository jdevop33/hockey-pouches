'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout'; 
import { useAuth } from '../../context/AuthContext';

// Placeholder types
type UserProfileData = {
    name: string;
    email: string;
};
type Address = { id: string; type: 'Shipping' | 'Billing'; street: string; city: string; province: string; postalCode: string; isDefault: boolean };

export default function ProfilePage() {
    const router = useRouter();
    const { user, token, isLoading: authLoading, logout, updateUser } = useAuth(); 

    const [formData, setFormData] = useState<UserProfileData>({ name: '', email: '' }); 
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        if (authLoading) return;
        if (!user || !token) {
          router.push('/login');
          return;
        }

        setFormData({ name: user.name, email: user.email }); 

        const loadAddresses = async () => {
            setIsLoadingData(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 300)); 
                const addressData = [
                    { id: 'addr-1', type: 'Shipping', street: '123 Hockey St', city: 'Toronto', province: 'ON', postalCode: 'M5H 2N2', isDefault: true },
                    { id: 'addr-2', type: 'Billing', street: '456 Puck Ave', city: 'Calgary', province: 'AB', postalCode: 'T2P 2V6', isDefault: false },
                ] as Address[]; 
                setAddresses(addressData);
            } catch (err: any) {
                setError('Failed to load addresses.');
                console.error(err);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadAddresses();

    }, [user, token, authLoading, router, logout]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !token || !formData) return; 
        
        setError(null);
        setIsSubmitting(true);
        
        const updatePayload: Partial<UserProfileData> = {};
        if (formData.name !== user.name) updatePayload.name = formData.name.trim();
        
        if (Object.keys(updatePayload).length === 0 || !updatePayload.name) { 
            setIsEditing(false); 
            setIsSubmitting(false);
            if(updatePayload.name === '') setError('Name cannot be empty.'); 
            return;
        }
        
        console.log('Updating profile:', updatePayload);
        try {
          const response = await fetch('/api/users/me', {
               method: 'PUT',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(updatePayload)
          });
          if (!response.ok) {
               if (response.status === 401) { logout(); router.push('/login'); return; }
               const errData = await response.json();
               throw new Error(errData.message || 'Failed to update profile');
          }
          
          updateUser(updatePayload); 
          setIsEditing(false); 
          alert('Profile updated!'); 
      } catch (err: any) {
          setError(err.message || 'Failed to update profile.');
          console.error(err);
      } finally {
          setIsSubmitting(false);
      }
    };

    const handleAddressUpdate = async (e: React.FormEvent, addressId: string) => { /* ... */ };
    const handleAddAddress = async (e: React.FormEvent) => { /* ... */ };
    const handleDeleteAddress = async (addressId: string) => { /* ... */ };

    if (authLoading || isLoadingData) { 
         return <Layout><div className="p-8">Loading profile...</div></Layout>;
    }
    if (!user) { 
         return <Layout><div className="p-8">Please log in.</div></Layout>; 
    }

    return (
        <Layout>
            <div className="bg-gray-100 min-h-screen p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Profile</h1>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
                        {!isEditing && (
                             <button onClick={() => { setFormData({ name: user.name, email: user.email }); setIsEditing(true); }} className="text-sm text-primary-600 hover:text-primary-800" disabled={isSubmitting}>
                                Edit
                            </button>
                        )}
                    </div>
                    {/* Corrected conditional rendering check below */} 
                    {isEditing ? (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm`} />
                             </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="text-sm text-gray-800 mt-1">{user.email}</p>
                            </div>
                            <div className="text-right space-x-3">
                                 <button type="button" onClick={() => setIsEditing(false)} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={isSubmitting}>
                                     Cancel
                                 </button>
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="space-y-2">
                             <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{user.name}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
                            </div>
                        </dl>
                    )}
                </div>
                <div id="addresses" className="bg-white shadow-md rounded-lg p-6">{/* Address Management UI */}</div>
            </div>
        </Layout>
    );
}
