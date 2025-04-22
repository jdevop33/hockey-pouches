'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout'; // Adjust layout import as needed

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    // Add age verification fields if needed (e.g., date of birth)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setSuccess(false);

    // TODO: Implement Age Verification Logic if required before proceeding

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) { // Example length check
        setError('Password must be at least 8 characters long.');
        setIsLoading(false);
        return;
    }

    try {
      // Call the registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode || null, // Send null if empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Handle successful registration
      setSuccess(true);
      // Optionally redirect to login or dashboard after a delay
      // setTimeout(() => router.push('/login'), 2000);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Create your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          {success ? (
            <div className="rounded-md bg-green-50 p-4 text-center">
              <h3 className="text-lg font-medium text-green-800">Registration Successful!</h3>
              <p className="mt-2 text-sm text-green-700">Please proceed to login.</p>
              <Link href="/login" className="text-primary-600 hover:text-primary-500 mt-4 inline-block font-medium">
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}
              
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label> {/* Fixed class to className */} 
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label> {/* Fixed class to className */} 
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="referralCode" className="sr-only">Referral Code (Optional)</label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Referral Code (Optional)"
                    value={formData.referralCode}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {/* TODO: Add Age Verification Input Field(s) here if needed */}
              </div>

              {/* TODO: Add Terms of Service / Privacy Policy agreement checkbox */}
              {/* <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">I agree to the <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a></label>
              </div> */} 

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="focus:ring-primary-500 group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
