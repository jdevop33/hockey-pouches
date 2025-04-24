'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useToast } from '../context/ToastContext';
import { useCsrf } from '../context/CsrfContext';
import Button from '../components/ui/Button';
import FormFeedback from '../components/ui/FormFeedback';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FormInput from '../components/ui/FormInput';
import FormCheckbox from '../components/ui/FormCheckbox';
import CsrfToken from '../components/CsrfToken';
import {
  isValidEmail,
  validatePassword,
  passwordsMatch,
  isValidName,
  isMinimumAge,
} from '../lib/validation';

// Loading component for Suspense fallback
function RegisterFormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner size="large" color="primary" />
          <p className="mt-4 text-gray-600">Loading registration form...</p>
        </div>
      </div>
    </div>
  );
}

// Separate component that uses useSearchParams
function RegisterForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { token, headerName } = useCsrf();

  // Get referral code from URL if present
  const initialReferralCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: initialReferralCode,
    birthDate: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  // Check for referral code in localStorage (from referral landing page)
  useEffect(() => {
    // Use a ref to track if this is the first render
    const isFirstRender = React.useRef(true);

    if (isFirstRender.current) {
      isFirstRender.current = false;

      const storedReferralCode =
        typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;
      if (storedReferralCode && !formData.referralCode) {
        setFormData(prev => ({ ...prev, referralCode: storedReferralCode }));

        // Validate the referral code and get referrer name
        const validateReferralCode = async () => {
          try {
            const response = await fetch(`/api/referrals/validate?code=${storedReferralCode}`);
            if (response.ok) {
              const data = await response.json();
              if (data.referrer) {
                setReferrerName(data.referrer.name);
              }
            }
          } catch (err) {
            console.error('Error validating referral code:', err);
          }
        };

        validateReferralCode();
      }
    }
  }, [formData.referralCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError(null); // Clear any previous error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Comprehensive validation
    if (!isValidName(formData.name)) {
      setError('Please enter a valid name.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (!passwordsMatch(formData.password, formData.confirmPassword)) {
      setError('Passwords do not match.');
      return;
    }

    // Age verification
    if (!formData.birthDate) {
      setError('Please enter your date of birth.');
      return;
    }

    // Check if user is at least 21 years old (legal age for nicotine products)
    if (!isMinimumAge(formData.birthDate, 21)) {
      setError('You must be at least 21 years old to register.');
      return;
    }

    // Terms of service agreement
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      // Call the registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [headerName]: token,
        },
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
      showToast('Registration successful! You can now log in.', 'success');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      showToast('Registration failed. Please check your information.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <div className="text-center">
            <FormFeedback type="success" message="Registration Successful!" />
            <p className="mt-2 text-sm text-gray-700">Please proceed to login.</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => (window.location.href = '/login')}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <FormFeedback type="error" message={error} />}

            <input type="hidden" name="remember" defaultValue="true" />
            <CsrfToken />
            <div className="space-y-4">
              <FormInput
                id="name"
                name="name"
                label="Full Name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                validate={value => ({
                  isValid: isValidName(value),
                  message: 'Please enter a valid name',
                })}
                validateOnBlur={true}
                validateOnChange={false}
              />

              <FormInput
                id="email"
                name="email"
                label="Email Address"
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
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                validate={value => validatePassword(value)}
                validateOnBlur={true}
                validateOnChange={false}
              />

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                validate={value => ({
                  isValid: passwordsMatch(formData.password, value),
                  message: 'Passwords do not match',
                })}
                validateOnBlur={true}
                validateOnChange={true}
              />

              <div>
                <label
                  htmlFor="referralCode"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Referral Code {referrerName && <span className="text-green-600">(Valid)</span>}
                </label>
                <div className="relative">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    className={`relative block w-full appearance-none rounded-md border ${
                      referrerName ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    } focus:border-primary-500 focus:ring-primary-500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm`}
                    placeholder="Referral Code (Optional)"
                    value={formData.referralCode}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {referrerName && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {referrerName && (
                  <p className="mt-1 text-sm text-green-600">Referred by: {referrerName}</p>
                )}
                {!referrerName && formData.referralCode && (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a valid referral code if you were referred by someone
                  </p>
                )}
              </div>
              <FormInput
                id="birthDate"
                name="birthDate"
                label="Date of Birth (Must be 21+ to register)"
                type="date"
                required
                value={formData.birthDate}
                onChange={handleChange}
                disabled={isLoading}
                max={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 21))
                    .toISOString()
                    .split('T')[0]
                }
                validate={value => ({
                  isValid: isMinimumAge(value, 21),
                  message: 'You must be at least 21 years old to register',
                })}
                validateOnBlur={true}
                validateOnChange={false}
              />
              <p className="mt-1 text-xs text-gray-500">
                You must be at least 21 years old to purchase nicotine products.
              </p>
            </div>

            <FormCheckbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms as boolean}
              onChange={handleChange}
              disabled={isLoading}
              required
              validate={checked => ({
                isValid: checked,
                message: 'You must agree to the Terms of Service and Privacy Policy',
              })}
              label={
                <span className="text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function RegisterPage() {
  return (
    <Layout>
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </Layout>
  );
}
