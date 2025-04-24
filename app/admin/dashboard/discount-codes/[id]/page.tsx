'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// Type for discount code from API
interface DiscountCode {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DiscountCodeFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const isNewCode = params.id === 'new';
  const discountCodeId = isNewCode ? null : Number(params.id);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load discount code data if editing
  useEffect(() => {
    const loadDiscountCode = async () => {
      if (authLoading || !token) return;
      if (isNewCode) {
        setIsLoading(false);
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, startDate: today }));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/discount-codes/${discountCodeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load discount code');
        }

        const data: DiscountCode = await response.json();
        
        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (dateString: string | null) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };

        setFormData({
          code: data.code,
          description: data.description || '',
          discountType: data.discount_type,
          discountValue: data.discount_value.toString(),
          minOrderAmount: data.min_order_amount.toString(),
          maxDiscountAmount: data.max_discount_amount?.toString() || '',
          startDate: formatDate(data.start_date),
          endDate: formatDate(data.end_date),
          usageLimit: data.usage_limit?.toString() || '',
          isActive: data.is_active,
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the discount code');
        console.error('Error loading discount code:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscountCode();
  }, [token, authLoading, discountCodeId, isNewCode]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      errors.code = 'Discount code is required';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code.trim())) {
      errors.code = 'Code can only contain letters, numbers, underscores, and hyphens';
    }
    
    if (!formData.discountType) {
      errors.discountType = 'Discount type is required';
    }
    
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      errors.discountValue = 'Discount value must be a positive number';
    } else if (formData.discountType === 'percentage' && discountValue > 100) {
      errors.discountValue = 'Percentage discount cannot exceed 100%';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    const minOrderAmount = parseFloat(formData.minOrderAmount);
    if (isNaN(minOrderAmount) || minOrderAmount < 0) {
      errors.minOrderAmount = 'Minimum order amount must be a non-negative number';
    }
    
    if (formData.maxDiscountAmount) {
      const maxDiscountAmount = parseFloat(formData.maxDiscountAmount);
      if (isNaN(maxDiscountAmount) || maxDiscountAmount <= 0) {
        errors.maxDiscountAmount = 'Maximum discount amount must be a positive number';
      }
    }
    
    if (formData.usageLimit) {
      const usageLimit = parseInt(formData.usageLimit);
      if (isNaN(usageLimit) || usageLimit <= 0 || !Number.isInteger(usageLimit)) {
        errors.usageLimit = 'Usage limit must be a positive integer';
      }
    }
    
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!token) {
      setError('You must be logged in to perform this action');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const url = isNewCode 
        ? '/api/admin/discount-codes' 
        : `/api/admin/discount-codes/${discountCodeId}`;
      
      const method = isNewCode ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: formData.code.trim(),
          description: formData.description.trim() || null,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
          maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          isActive: formData.isActive,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isNewCode ? 'create' : 'update'} discount code`);
      }
      
      // Redirect back to discount codes list
      router.push('/admin/dashboard/discount-codes');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the discount code');
      console.error('Error saving discount code:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    router.push('/admin/dashboard/discount-codes');
  };

  // Check if user is authorized
  if (!authLoading && (!user || user.role !== 'Admin')) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600">
          Access Denied. You must be an Admin to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isNewCode ? 'Create New Discount Code' : 'Edit Discount Code'}
          </h1>
        </div>

        {/* Display Errors */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading discount code...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code*
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`w-full rounded-md shadow-sm ${
                      formErrors.code ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="e.g., SUMMER2023"
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., Summer sale discount"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type*
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className={`w-full rounded-md shadow-sm ${
                      formErrors.discountType ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                  {formErrors.discountType && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.discountType}</p>
                  )}
                </div>

                {/* Discount Value */}
                <div>
                  <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value*
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">
                        {formData.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      min="0"
                      className={`w-full rounded-md pl-7 ${
                        formErrors.discountValue ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                      placeholder={formData.discountType === 'percentage' ? '10' : '15.00'}
                    />
                  </div>
                  {formErrors.discountValue && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.discountValue}</p>
                  )}
                </div>

                {/* Min Order Amount */}
                <div>
                  <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="minOrderAmount"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full rounded-md pl-7 ${
                        formErrors.minOrderAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.minOrderAmount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.minOrderAmount}</p>
                  )}
                </div>

                {/* Max Discount Amount */}
                <div>
                  <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Discount Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full rounded-md pl-7 ${
                        formErrors.maxDiscountAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                      placeholder="50.00"
                    />
                  </div>
                  {formErrors.maxDiscountAmount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.maxDiscountAmount}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank for no maximum
                  </p>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full rounded-md shadow-sm ${
                      formErrors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full rounded-md shadow-sm ${
                      formErrors.endDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank for no expiration
                  </p>
                </div>

                {/* Usage Limit */}
                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className={`w-full rounded-md shadow-sm ${
                      formErrors.usageLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="100"
                  />
                  {formErrors.usageLimit && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.usageLimit}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank for unlimited usage
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center h-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSaving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? 'Saving...' : isNewCode ? 'Create Discount Code' : 'Update Discount Code'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
