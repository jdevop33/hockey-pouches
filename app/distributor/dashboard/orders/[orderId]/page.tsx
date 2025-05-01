'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';
import { type PutBlobResult } from '@vercel/blob';

// --- Types ---
type OrderItemDetails = {
  id: number;
  order_id: number; // Added missing property
  product_id: number;
  product_name: string;
  quantity: number;
  price_per_item: number;
  image_url?: string | null;
};
interface Address {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  phone?: string;
}
interface AssignedOrderDetails {
  id: number;
  created_at: string;
  status:
    | 'Assigned'
    | 'Awaiting Fulfillment'
    | 'Fulfilled - Pending Verification'
    | 'Verified'
    | 'Shipped';
  items: OrderItemDetails[];
  shipping_address: Address | null;
  customer_name: string | null;
  tracking_number?: string | null;
  fulfillment_photo_url?: string | null;
  fulfillment_notes?: string | null;
}

// Helper to format Address (Moved outside component)
const formatAddress = (addr: Address | null | undefined): ReactNode => {
  if (!addr) return <span className="text-gray-500">Not available</span>;
  return (
    <address className="text-sm not-italic">
      {addr.name && (
        <>
          {addr.name}
          <br />
        </>
      )}
      {addr.street}
      <br />
      {addr.city}, {addr.province} {addr.postalCode}
      <br />
      {addr.country || 'Canada'}
      {/* Removed phone number display for brevity, add back if needed */}
    </address>
  );
};

export default function DistributorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: distributorUser, token, isLoading: authLoading, logout } = useAuth();
  const orderId = params.orderId as string;

  // --- State ---
  const [order, setOrder] = useState<AssignedOrderDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    /* Auth Check */
    if (!authLoading && (!distributorUser || !token || distributorUser.role !== 'Distributor')) {
      router.push('/login?redirect=/distributor/dashboard');
    }
  }, [distributorUser, token, authLoading, router]);

  useEffect(() => {
    /* Data Fetching */
    if (distributorUser && token && distributorUser.role === 'Distributor' && orderId) {
      // ... (loadOrder function as before, using the updated OrderItemDetails type) ...
      const loadOrder = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          console.warn('Using placeholder data for distributor order fetch!');
          await new Promise(resolve => setTimeout(resolve, 300));
          const data: AssignedOrderDetails = {
            id: parseInt(orderId),
            created_at: '2023-10-27',
            status: 'Awaiting Fulfillment',
            customer_name: 'Alice Test Customer',
            shipping_address: {
              street: '100 Fulfillment Rd',
              city: 'Calgary',
              province: 'AB',
              postalCode: 'T1Y 0A1',
              country: 'Canada',
            },
            items: [
              {
                id: 101,
                order_id: parseInt(orderId),
                product_id: 8,
                product_name: 'Peppermint (12mg)',
                quantity: 5,
                price_per_item: 6.99,
                image_url: '/images/products/puxxperpermint22mg.png',
              },
              {
                id: 102,
                order_id: parseInt(orderId),
                product_id: 15,
                product_name: 'Spearmint (12mg)',
                quantity: 3,
                price_per_item: 6.99,
                image_url: '/images/products/puxxspearmint22mg.png',
              },
            ],
            tracking_number: null,
            fulfillment_photo_url: null,
            fulfillment_notes: null,
          };
          setOrder(data);
          setTrackingNumber(data.tracking_number || '');
          setFulfillmentNotes(data.fulfillment_notes || '');
        } catch (err: unknown) {
          setError('Failed to load order details.');
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadOrder();
    }
  }, [distributorUser, token, orderId, router, logout]);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPEG, PNG, WEBP, HEIC, or PDF file.');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadError('File size exceeds the 10MB limit.');
        return;
      }

      setPhotoFile(file);
      setUploadError(null);
    }
  };

  const handleFulfillmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input - require either tracking number or photo
    if (!trackingNumber && !photoFile) {
      setSubmitError(
        'Please provide either a tracking number or upload a photo of the shipping label.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let fulfillmentPhotoUrl = null;

      // If a photo was uploaded, send it to the upload API first
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('orderId', orderId);
        formData.append('type', 'fulfillment');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        fulfillmentPhotoUrl = uploadResult.url;
      }

      // Now submit the fulfillment data
      const response = await fetch(`/api/distributor/orders/${orderId}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber || null,
          fulfillmentPhotoUrl,
          notes: fulfillmentNotes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit fulfillment');
      }

      // Success - update the order status locally
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'Fulfilled - Pending Verification',
          tracking_number: trackingNumber || null,
          fulfillment_photo_url: fulfillmentPhotoUrl,
          fulfillment_notes: fulfillmentNotes || null,
        };
      });

      // Redirect to the orders list
      router.push('/distributor/dashboard/orders?success=true');
    } catch (error: unknown) {
      console.error('Error submitting fulfillment:', error);
      setSubmitError(error.message || 'Failed to submit fulfillment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData)
    return (
      <Layout>
        <div className="p-8 text-center">Loading...</div>
      </Layout>
    );
  if (!distributorUser || distributorUser.role !== 'Distributor')
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied.</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="rounded bg-red-100 p-8 text-red-600">Error: {error}</div>
      </Layout>
    );
  if (!order)
    return (
      <Layout>
        <div className="p-8 text-center">Order not found or not assigned to you.</div>
      </Layout>
    );

  const canFulfill = order.status === 'Awaiting Fulfillment';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mb-6">
          <Link
            href="/distributor/dashboard/orders"
            className="text-primary-600 hover:text-primary-700"
          >
            &larr; Back to Assigned Orders
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Fulfill Order #{order.id}</h1>
        <p className="mb-6 text-gray-600">
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </p>
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Order/Customer Info */}
            <div className="space-y-4 border-b border-gray-200 pb-6 md:col-span-1 md:border-r md:border-b-0 md:pr-6 md:pb-0">
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <p className={`mt-1 font-medium`}>{order.status}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Customer</h3>
                <p className="mt-1 text-sm text-gray-600">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Shipping Address</h3>
                {formatAddress(order.shipping_address)}
              </div>
              {/* Display saved fulfillment info */}
            </div>
            {/* Order Items */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Items to Ship</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="flex items-center py-3">
                    <Image
                      src={item.image_url || '/images/products/placeholder.svg'}
                      alt={item.product_name}
                      width={48}
                      height={48}
                      className="mr-3 h-12 w-12 rounded-md border object-contain p-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.quantity * item.price_per_item).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Fulfillment Form */}
          {canFulfill && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Fulfill This Order</h2>

              {submitError && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleFulfillmentSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="trackingNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Canada Post Tracking Number (Optional if uploading photo)
                  </label>
                  <input
                    type="text"
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                    placeholder="e.g. 1234567890123456"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the tracking number from Canada Post
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">- OR -</p>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Photo of Shipping Label (Optional if providing tracking number)
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="text-primary-600 focus-within:ring-primary-500 hover:text-primary-500 relative cursor-pointer rounded-md bg-white font-medium focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP, HEIC or PDF up to 10MB
                      </p>
                    </div>
                  </div>
                  {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                  {photoFile && (
                    <p className="mt-2 text-sm text-green-600">
                      File selected: {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)}{' '}
                      MB)
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="fulfillmentNotes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="fulfillmentNotes"
                    value={fulfillmentNotes}
                    onChange={e => setFulfillmentNotes(e.target.value)}
                    rows={3}
                    className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                    placeholder="Any additional information about this fulfillment"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Mark as Fulfilled'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
