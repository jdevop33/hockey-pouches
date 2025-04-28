'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCsrf } from '../context/CsrfContext';
import { Button } from '../components/ui/Button';
import FormFeedback from '../components/ui/FormFeedback';
import PageLoading from '../components/ui/PageLoading';
import FormInput from '../components/ui/FormInput';
import CsrfToken from '../components/CsrfToken';
import { isValidEmail } from '../lib/validation';

// Safely access hooks to prevent errors during SSR
function useSafeToast() {
  try {
    return useToast();
  } catch {
    // Return a dummy implementation during SSR
    return {
      showToast: () => {},
      hideToast: () => {},
      toasts: [],
    };
  }
}

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    // Return a dummy implementation during SSR
    return {
      user: null,
      token: null,
      isLoading: true,
      login: () => {},
      logout: () => {},
      update: () => {},
    };
  }
}

function useSafeCsrf() {
  try {
    return useCsrf();
  } catch {
    // Return a dummy implementation during SSR
    return {
      token: '',
      headerName: 'X-CSRF-Token',
      isLoading: true,
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useSafeAuth();
  const { showToast } = useSafeToast();
  const { token: csrfToken, headerName } = useSafeCsrf();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already logged in (and auth state is loaded)
  useEffect(() => {
    if (isMounted && !authLoading && user) {
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
  }, [user, authLoading, router, isMounted]);

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
    } catch (err: unknown) {
      // Type guard to handle the error safely
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the form if we are loading auth state or already logged in
  if (!isMounted || authLoading || user) {
    return (
      <Layout>
        <PageLoading message="Checking authentication status..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="border-gold-subtle w-full max-w-md space-y-8 rounded-lg border bg-secondary-900 p-8 shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gold-500">
              Sign in to your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{' '}
              <Link href="/register" className="font-medium text-gold-500 hover:text-gold-400">
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
              <div className="text-sm">
                <Link href="/reset-password" className="text-gold-500 hover:text-gold-400">
                  Forgot your password?
                </Link>
              </div>
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
