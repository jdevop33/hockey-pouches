'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useAuth } from '../../context/AuthContext';

// Placeholder types
type UserProfileData = {
  name: string;
  email: string;
};

/**
 * Address type definition for future implementation of address management
 * @todo Implement address management functionality
 */
export type Address = {
  id: string;
  type: 'Shipping' | 'Billing';
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

// Custom error type
interface ApiError extends Error {
  status?: number;
  code?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout, updateUser } = useAuth();

  const [formData, setFormData] = useState<UserProfileData>({ name: '', email: '' });
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
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(
          'Failed to retrieve your address information. Please try again or contact our premium support team.'
        );
        console.error(apiError);
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
      if (updatePayload.name === '')
        setError('Your name is an essential part of your profile and cannot be empty.');
      return;
    }

    
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      updateUser(updatePayload);
      setIsEditing(false);
      alert('Your profile has been refined to your specifications.');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.message ||
          'We encountered an issue updating your profile. Our team has been notified.'
      );
      console.error(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8">Preparing your profile experience...</div>
      </Layout>
    );
  }
  if (!user) {
    return (
      <Layout>
        <div className="p-8">Please sign in to access your exclusive profile.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Your Personal Profile</h1>
        {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-500">Error: {error}</p>}

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">Your Exclusive Details</h2>
            {!isEditing && (
              <button
                onClick={() => {
                  setFormData({ name: user.name, email: user.email });
                  setIsEditing(true);
                }}
                className="text-sm text-primary-600 hover:text-primary-800"
                disabled={isSubmitting}
              >
                Refine Details
              </button>
            )}
          </div>
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-800">{user.email}</p>
              </div>
              <div className="space-x-3 text-right">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Perfecting Your Profile...' : 'Save Your Preferences'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="col-span-2 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="col-span-2 text-sm text-gray-900">{user.email}</dd>
              </div>
            </dl>
          )}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              Your information is securely stored and protected with enterprise-grade encryption. We
              respect your privacy and never share your details with third parties.
            </p>
          </div>
        </div>
        <div id="addresses" className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Your Delivery Destinations</h2>
          <p className="text-sm text-gray-500">Address management features coming soon.</p>
        </div>
      </div>
    </Layout>
  );
}
