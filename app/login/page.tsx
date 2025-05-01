'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import FormFeedback from '../components/ui/FormFeedback';
import { useCsrf } from '../context/CsrfContext';
import CsrfToken from '../components/CsrfToken';
import { useState } from 'react';

// Note: Metadata can't be used in client components, so it's removed
// The page title will need to be set via other means (e.g., through a layout component)

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token: csrfToken, headerName: csrfHeaderName } = useCsrf();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear any previous error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [csrfHeaderName]: csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      router.refresh(); // Refresh the current page to update auth state

      // Redirect after successful login
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-gold-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gold-500">Sign In</h1>
        <p className="mt-2 text-gray-300">Access your premium Hockey Pouches account</p>
      </div>

      {error && <FormFeedback type="error" message={error} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <CsrfToken />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
          disabled={isLoading}
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
          disabled={isLoading}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-gold-400 hover:text-gold-300">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
