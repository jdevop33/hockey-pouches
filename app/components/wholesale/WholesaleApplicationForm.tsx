'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Minimum unit threshold for wholesale accounts
const WHOLESALE_MIN_UNITS = 100;

// Validation schema for wholesale application
const wholesaleApplicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  business_address: z.string().min(1, 'Business address is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().min(1, 'Contact phone is required'),
  estimated_order_size: z
    .number()
    .int()
    .min(
      WHOLESALE_MIN_UNITS,
      `Wholesale accounts require a minimum order size of ${WHOLESALE_MIN_UNITS} units`
    ),
});

// Type for form data
type WholesaleApplicationData = z.infer<typeof wholesaleApplicationSchema>;

export default function WholesaleApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WholesaleApplicationData>({
    resolver: zodResolver(wholesaleApplicationSchema),
    defaultValues: {
      estimated_order_size: WHOLESALE_MIN_UNITS,
    },
  });

  const onSubmit = async (data: WholesaleApplicationData) => {
    setIsSubmitting(true);
    setSubmitResult({});

    try {
      const response = await fetch('/api/wholesale/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: 'Application submitted successfully. We will review your application shortly.',
        });
        reset();
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Failed to submit application. Please try again.',
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'An error occurred while submitting your application. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gold-500/30 bg-dark-800/60 p-8 shadow-lg backdrop-blur-sm">
      <h2 className="mb-6 text-2xl font-bold text-white">Wholesale Application</h2>

      {submitResult.success && (
        <div className="mb-6 rounded-lg bg-green-500/20 p-4 text-green-200">
          <p>{submitResult.message}</p>
        </div>
      )}

      {submitResult.success === false && (
        <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-200">
          <p>{submitResult.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="company_name" className="mb-1 block text-sm text-gray-300">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company_name"
                type="text"
                {...register('company_name')}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-400">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tax_id" className="mb-1 block text-sm text-gray-300">
                Tax ID / Business Number <span className="text-red-500">*</span>
              </label>
              <input
                id="tax_id"
                type="text"
                {...register('tax_id')}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.tax_id && (
                <p className="mt-1 text-sm text-red-400">{errors.tax_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="business_address" className="mb-1 block text-sm text-gray-300">
              Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="business_address"
              {...register('business_address')}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
            />
            {errors.business_address && (
              <p className="mt-1 text-sm text-red-400">{errors.business_address.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="contact_name" className="mb-1 block text-sm text-gray-300">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_name"
                type="text"
                {...register('contact_name')}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.contact_name && (
                <p className="mt-1 text-sm text-red-400">{errors.contact_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_email" className="mb-1 block text-sm text-gray-300">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-400">{errors.contact_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="contact_phone" className="mb-1 block text-sm text-gray-300">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_phone"
                type="tel"
                {...register('contact_phone')}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-400">{errors.contact_phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="estimated_order_size" className="mb-1 block text-sm text-gray-300">
                Estimated Order Size (units) <span className="text-red-500">*</span>
              </label>
              <input
                id="estimated_order_size"
                type="number"
                min={WHOLESALE_MIN_UNITS}
                {...register('estimated_order_size', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
              />
              {errors.estimated_order_size && (
                <p className="mt-1 text-sm text-red-400">{errors.estimated_order_size.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Minimum order size: {WHOLESALE_MIN_UNITS} units
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex items-center justify-center rounded-xl bg-gold-500 px-8 py-3.5 text-base font-bold text-black shadow-gold transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-lg disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
            {!isSubmitting && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
