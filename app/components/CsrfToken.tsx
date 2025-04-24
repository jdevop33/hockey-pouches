'use client';

import React from 'react';
import { useCsrfToken, CsrfToken as CsrfTokenType } from '@/lib/csrf-client';

/**
 * CSRF form field component props
 */
export interface CsrfFormFieldProps {
  // Whether to use a hidden input field (default: true)
  hidden?: boolean;
}

/**
 * CSRF token form field component
 * Adds a hidden input field with the CSRF token to a form
 */
export default function CsrfToken({ hidden = true }: CsrfFormFieldProps) {
  const { token, formFieldName } = useCsrfToken();

  if (hidden) {
    return <input type="hidden" name={formFieldName} value={token} />;
  }

  return (
    <div className="mb-4">
      <label htmlFor={formFieldName} className="block text-sm font-medium text-gray-700">
        CSRF Token
      </label>
      <input
        type="text"
        id={formFieldName}
        name={formFieldName}
        value={token}
        readOnly
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
}
