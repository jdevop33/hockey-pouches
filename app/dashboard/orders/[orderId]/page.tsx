'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth

// Placeholder types - replace with actual data types
type OrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
};
type Address = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};
type OrderDetails = {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
};

// Helper functions for order status display
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending Approval':
      return 'text-yellow-600';
    case 'Processing':
      return 'text-blue-600';
    case 'Awaiting Fulfillment':
      return 'text-purple-600';
    case 'Fulfilled - Pending Verification':
      return 'text-orange-600';
    case 'Shipped':
      return 'text-green-600';
    case 'Delivered':
      return 'text-green-700';
    case 'Cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'Pending Approval':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
    case 'Processing':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </span>
      );
    case 'Awaiting Fulfillment':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </span>
      );
    case 'Fulfilled - Pending Verification':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
    case 'Shipped':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    case 'Delivered':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </span>
      );
    case 'Cancelled':
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      );
    default:
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
  }
};

const getOrderTimeline = (order: OrderDetails) => {
  const steps = [
    {
      label: 'Order Placed',
      completed: true,
      date: new Date(order.date).toLocaleDateString(),
    },
    {
      label: 'Processing',
      completed: [
        'Processing',
        'Awaiting Fulfillment',
        'Fulfilled - Pending Verification',
        'Shipped',
        'Delivered',
      ].includes(order.status),
      date: [
        'Processing',
        'Awaiting Fulfillment',
        'Fulfilled - Pending Verification',
        'Shipped',
        'Delivered',
      ].includes(order.status)
        ? new Date(new Date(order.date).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()
        : null,
    },
    {
      label: 'Preparing for Shipment',
      completed: [
        'Awaiting Fulfillment',
        'Fulfilled - Pending Verification',
        'Shipped',
        'Delivered',
      ].includes(order.status),
      date: [
        'Awaiting Fulfillment',
        'Fulfilled - Pending Verification',
        'Shipped',
        'Delivered',
      ].includes(order.status)
        ? new Date(new Date(order.date).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : null,
    },
    {
      label: 'Shipped',
      completed: ['Shipped', 'Delivered'].includes(order.status),
      date: order.trackingNumber
        ? new Date(new Date(order.date).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : null,
    },
    {
      label: 'Delivered',
      completed: order.status === 'Delivered',
      date:
        order.status === 'Delivered'
          ? new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : null,
    },
  ];

  // If order is cancelled, show only the cancelled step
  if (order.status === 'Cancelled') {
    return [
      {
        label: 'Order Placed',
        completed: true,
        date: new Date(order.date).toLocaleDateString(),
      },
      {
        label: 'Order Cancelled',
        completed: true,
        date: new Date(
          new Date(order.date).getTime() + 1 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
      },
    ];
  }

  return steps;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate data loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth state
    if (authLoading) return;

    // Redirect if not authenticated or token/orderId missing
    if (!user || !token || !orderId) {
      router.push('/login');
      return;
    }

    const loadOrder = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/me/${orderId}`, {
          // Fetch specific order
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403 || response.status === 404) {
            // Unauthorized, Forbidden, or Not Found
            
            logout();
            router.push('/login');
            return;
          }
          throw new Error(`Failed to fetch order details (${response.status})`);
        }
        const data = await response.json();
        setOrder(data);
      } catch (err: unknown) {
        setError(err.message || 'Failed to load order details.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadOrder();
  }, [user, token, authLoading, orderId, router, logout]);

  // Show loading states
  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8 text-center">Loading order details...</div>
      </Layout>
    );
  }

  // Should be authenticated here
  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">Please log in.</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded bg-red-100 p-8 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="p-8 text-center">
          Order not found or you do not have permission to view it.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mb-6">
          <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-700">
            &larr; Back to Orders
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Order Details</h1>
        <p className="mb-6 text-gray-600">
          Order #{order.id.split('-')[1]} &bull; Placed on{' '}
          {new Date(order.date).toLocaleDateString()}
        </p>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          {/* Order Status and Tracking */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700">
                Status: <span className={`${getStatusColor(order.status)}`}>{order.status}</span>
              </h2>
              {getStatusIcon(order.status)}
            </div>

            {/* Order Timeline */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute top-0 left-0 h-full w-0.5 bg-gray-200"></div>
                <ul className="space-y-4">
                  {getOrderTimeline(order).map((step, index) => (
                    <li key={index} className="relative ml-6">
                      <span
                        className={`absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        {step.completed ? (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white"></span>
                        )}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {step.label}
                        </span>
                        {step.date && <span className="text-xs text-gray-500">{step.date}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-gray-700">
                  Tracking Number:{' '}
                  <span className="text-primary-600 font-medium">{order.trackingNumber}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Your order has been shipped. You can track your package using the tracking number
                  above.
                </p>
                <a
                  href={`https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center text-sm"
                >
                  Track Package
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Order Items */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Items Ordered</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="flex py-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="mr-4 h-16 w-16 rounded-md bg-gray-100 object-contain p-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Summary & Info */}
            <div className="space-y-6 md:col-span-1">
              {/* Financial Summary */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-700">Summary</h2>
                {/* ... summary dl ... */}
                <dl className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="text-gray-900">${order.subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd className="text-gray-900">${order.shipping.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Taxes</dt>
                    <dd className="text-gray-900">${order.taxes.toFixed(2)}</dd>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                    <dt className="text-base font-semibold text-gray-900">Total</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-700">Shipping Address</h3>
                {/* ... address ... */}
                <address className="mt-2 text-sm text-gray-600 not-italic">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
              {/* Billing Address */}
              <div>
                <h3 className="font-semibold text-gray-700">Billing Address</h3>
                {/* ... address ... */}
                <address className="mt-2 text-sm text-gray-600 not-italic">
                  {order.billingAddress.street}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.province}{' '}
                  {order.billingAddress.postalCode}
                  <br />
                  {order.billingAddress.country}
                </address>
              </div>
              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-700">Payment Method</h3>
                <p className="mt-2 text-sm text-gray-600">{order.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
