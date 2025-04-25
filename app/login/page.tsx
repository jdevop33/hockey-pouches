'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCsrf } from '../context/CsrfContext';
import { Button } from '../components/ui/button-shadcn';
import FormFeedback from '../components/ui/FormFeedback';
import PageLoading from '../components/ui/PageLoading';
import FormInput from '../components/ui/FormInput';
import CsrfToken from '../components/CsrfToken';
import { isValidEmail } from '../lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { token: csrfToken, headerName } = useCsrf();
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
    setError(null); // Clear any previous error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form before submission
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Please enter a valid password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [headerName]: csrfToken,
        },
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
        showToast('Login successful!', 'success');
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
        <PageLoading message="Checking authentication status..." />
      </Layout>
    );
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
            {error && <FormFeedback type="error" message={error} />}
            <input type="hidden" name="remember" defaultValue="true" />
            <CsrfToken />
            <div className="space-y-4">
              <FormInput
                id="email-address"
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                validate={value => ({
                  isValid: isValidEmail(value),
                  message: 'Please enter a valid email address',
                })}
                validateOnBlur={true}
                validateOnChange={false}
              />
              <FormInput
                id="password"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                validate={value => ({
                  isValid: value.length >= 6,
                  message: 'Password must be at least 6 characters',
                })}
                validateOnBlur={true}
                validateOnChange={false}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">{/* Optional: Remember me checkbox */}</div>
              <div className="text-sm">{/* Optional: Forgot password link */}</div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading || authLoading}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
