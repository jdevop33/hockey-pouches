'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For redirecting after login
import Layout from '../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../context/AuthContext'; // Example if using context for auth state

export default function LoginPage() {
  const router = useRouter();
  // const { login } = useAuth(); // Example context usage
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call the login API endpoint
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

      // TODO: Handle successful login:
      // 1. Store the authentication token (e.g., in localStorage, sessionStorage, or HttpOnly cookie managed by the backend response)
      //    localStorage.setItem('authToken', data.token); // Example
      // 2. Update application auth state (e.g., using Context API or Zustand/Redux)
      //    login(data.user, data.token); // Example context usage
      // 3. Redirect the user based on their role (Admin, Distributor, Retail Customer)
      //    - Fetch user profile (/api/users/me) to get role if not returned by login
      //    - Example Redirects:
      //      if (data.user.role === 'Admin') router.push('/admin/dashboard');
      //      else if (data.user.role === 'Distributor') router.push('/distributor/dashboard');
      //      else router.push('/dashboard'); // Retail Customer dashboard

      console.log('Login successful:', data); // Placeholder
      alert('Login successful! Redirecting...'); // Placeholder alert
      router.push('/dashboard'); // Default redirect placeholder

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
              Sign in to your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
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
                <label htmlFor="email-address" className="sr-only">Email address</label> 
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
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
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Optional: Remember me checkbox */}
                {/* <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label> */} 
              </div>

              <div className="text-sm">
                {/* Optional: Forgot password link */}
                {/* <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Forgot your password?</a> */}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="focus:ring-primary-500 group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
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
