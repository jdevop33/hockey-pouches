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
    birthDate: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setSuccess(false);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    // Age verification
    if (!formData.birthDate) {
      setError('Please enter your date of birth.');
      setIsLoading(false);
      return;
    }

    // Calculate age based on birth date
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check if user is at least 21 years old (legal age for nicotine products)
    if (age < 21) {
      setError('You must be at least 21 years old to register.');
      setIsLoading(false);
      return;
    }

    // Terms of service agreement
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
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
          birthDate: formData.birthDate,
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
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-500 mt-4 inline-block font-medium"
              >
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
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>{' '}
                  {/* Fixed class to className */}
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                    placeholder="Password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>{' '}
                  {/* Fixed class to className */}
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="referralCode" className="sr-only">
                    Referral Code (Optional)
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                    placeholder="Referral Code (Optional)"
                    value={formData.referralCode}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="birthDate"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Date of Birth (Must be 21+ to register)
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    required
                    className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:outline-none sm:text-sm"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() - 21))
                        .toISOString()
                        .split('T')[0]
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You must be at least 21 years old to purchase nicotine products.
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                  checked={formData.agreeToTerms as boolean}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="focus:ring-primary-500 group bg-primary-600 hover:bg-primary-700 relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
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
