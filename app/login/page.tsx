'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth(); // Use the hook
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in (and auth state is loaded)
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Already logged in, redirecting...');
      // Determine redirect path based on role
      switch (user.role) {
        case 'Admin':
          router.push('/admin/dashboard');
          break;
        case 'Distributor':
          router.push('/distributor/dashboard');
          break;
        default: // Retail Customer
          router.push('/dashboard');
          break;
      }
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const data = await response.json();

      // Get token from Authorization header
      const authHeader = response.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;

      // Call the login function from AuthContext
      if (data.user && (token || data.token)) {
        // Use token from header if available, otherwise fall back to token in response body
        login(data.user, token || data.token);
        console.log('Login successful, redirecting...');
        // Redirect is handled by the useEffect hook now
      } else {
        console.error('Login response:', data);
        console.error('Auth header:', authHeader);
        throw new Error('Login response missing user data or token.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the form if we are loading auth state or already logged in
  if (authLoading || user) {
    return (
      <Layout>
        <div className="p-8">Loading...</div>
      </Layout>
    ); // Or a loading spinner
  }

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">{/* Optional: Remember me checkbox */}</div>
              <div className="text-sm">{/* Optional: Forgot password link */}</div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="focus:ring-primary-500 group bg-primary-600 hover:bg-primary-700 relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
