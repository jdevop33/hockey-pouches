'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../context/AuthContext'; // Example auth context

// Placeholder types
type UserProfileData = {
    name: string;
    email: string;
    // Add other fields like phone number etc.
};
type Address = { id: string; type: 'Shipping' | 'Billing'; street: string; city: string; province: string; postalCode: string; isDefault: boolean };

export default function ProfilePage() {
    // const { user, loading: authLoading } = useAuth(); // Example context usage
    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editProfile, setEditProfile] = useState(false);
    const [editAddressId, setEditAddressId] = useState<string | null>(null); // ID of address being edited

    // TODO: Implement proper authentication check
    const isAuthenticated = true; // Placeholder

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // TODO: Fetch profile data from /api/users/me
                // TODO: Fetch addresses (might be part of user profile or separate endpoint)
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

                setProfileData({ name: 'Jane Doe', email: 'jane@example.com' });
                setAddresses([
                    { id: 'addr-1', type: 'Shipping', street: '123 Hockey St', city: 'Toronto', province: 'ON', postalCode: 'M5H 2N2', isDefault: true },
                    { id: 'addr-2', type: 'Billing', street: '456 Puck Ave', city: 'Calgary', province: 'AB', postalCode: 'T2P 2V6', isDefault: false },
                ]);
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isAuthenticated]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // TODO: Call API /api/users/me (PUT) to update profile
        console.log('Updating profile:', profileData);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setEditProfile(false);
        alert('Profile updated!'); // Placeholder
    };

    const handleAddressUpdate = async (e: React.FormEvent, addressId: string) => {
        e.preventDefault();
        setError(null);
        const addressToUpdate = addresses.find(a => a.id === addressId);
        // TODO: Call API to update address (e.g., PUT /api/users/me/addresses/{addressId})
        console.log(`Updating address ${addressId}:`, addressToUpdate);
        await new Promise(resolve => setTimeout(resolve, 500));
        setEditAddressId(null);
         alert('Address updated!'); // Placeholder
    };
    
    const handleAddAddress = async (e: React.FormEvent) => {
       e.preventDefault();
       setError(null);
       // TODO: Call API to add new address (e.g., POST /api/users/me/addresses)
       console.log('Adding new address...'); 
       await new Promise(resolve => setTimeout(resolve, 500));
       alert('Address added!'); // Placeholder
       // Reset form and potentially refresh address list
    };
    
     const handleDeleteAddress = async (addressId: string) => {
       if (!confirm('Are you sure you want to delete this address?')) return;
       setError(null);
       // TODO: Call API to delete address (e.g., DELETE /api/users/me/addresses/{addressId})
       console.log(`Deleting address ${addressId}...`); 
       await new Promise(resolve => setTimeout(resolve, 500));
       setAddresses(addresses.filter(a => a.id !== addressId)); // Optimistic UI update
       alert('Address deleted!'); // Placeholder
    };

    if (isLoading) return <Layout><div className="p-8">Loading profile...</div></Layout>;
    if (!isAuthenticated) return <Layout><div className="p-8">Redirecting...</div></Layout>;
    if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
    if (!profileData) return <Layout><div className="p-8">Could not load profile.</div></Layout>;

    return (
        <Layout>
            <div className="bg-gray-100 min-h-screen p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Profile</h1>

                {/* Profile Information Section */} 
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
                        <button onClick={() => setEditProfile(!editProfile)} className="text-sm text-primary-600 hover:text-primary-800">
                            {editProfile ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {editProfile ? (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            {/* TODO: Add other editable fields like phone */} 
                            <div className="text-right">
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="space-y-2">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{profileData.name}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{profileData.email}</dd>
                            </div>
                             {/* TODO: Display other profile fields */} 
                        </dl>
                    )}
                     {/* TODO: Add Change Password section */} 
                </div>

                {/* Address Management Section */} 
                <div id="addresses" className="bg-white shadow-md rounded-lg p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Addresses</h2>
                     {addresses.length > 0 && (
                        <div className="space-y-6">
                            {addresses.map(address => (
                                <div key={address.id} className="border-b pb-6 last:border-b-0">
                                   {editAddressId === address.id ? (
                                        // Edit Address Form (Componentize this ideally)
                                        <form onSubmit={(e) => handleAddressUpdate(e, address.id)} className="space-y-3">
                                            <h3 className="text-lg font-medium text-gray-800">Editing {address.type} Address</h3>
                                            {/* Add form fields for street, city, province, postalCode */} 
                                             <div>
                                                <label htmlFor={`street-${address.id}`} className="block text-sm font-medium text-gray-700">Street</label>
                                                <input type="text" id={`street-${address.id}`} value={address.street} onChange={(e) => setAddresses(addresses.map(a => a.id === address.id ? {...a, street: e.target.value} : a))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                                            </div>
                                            {/* ... other fields ... */} 
                                            <div className="flex justify-end space-x-3">
                                                 <button type="button" onClick={() => setEditAddressId(null)} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                                <button type="submit" className="inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Save Address</button>
                                            </div>
                                        </form>
                                   ) : (
                                        // Display Address
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{address.type} Address {address.isDefault && <span className="text-xs text-gray-500">(Default)</span>}</h3>
                                                    <address className="mt-1 not-italic text-sm text-gray-600">
                                                        {address.street}<br/>
                                                        {address.city}, {address.province} {address.postalCode}
                                                    </address>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <button onClick={() => setEditAddressId(address.id)} className="text-sm text-primary-600 hover:text-primary-800">Edit</button>
                                                    <button onClick={() => handleDeleteAddress(address.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                                     {/* TODO: Add Set as Default button */} 
                                                </div>
                                            </div>
                                        </div>
                                   )}
                                </div>
                            ))}
                        </div>
                     )}
                     {/* TODO: Add "Add New Address" Form/Button */} 
                     <div className="mt-6 border-t pt-6">
                         <button onClick={() => alert('Show Add Address form')} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                             Add New Address
                         </button>
                         {/* <AddAddressForm onAdd={handleAddAddress} /> */} 
                     </div>
                </div>
            </div>
        </Layout>
    );
}
