'use client';

import React, { useEffect, useState, ReactNode, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// --- Types ---
type OrderItemDetails = {
  id: number;
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
interface OrderHistory {
  timestamp: string;
  status: string;
  notes?: string;
  user_id?: string;
  user_role?: string;
  user_name?: string;
}
interface Distributor {
  id: string;
  name: string;
  location?: string | null;
}
interface AdminOrderDetails {
  /* ... same as before ... */ id: number;
  created_at: string;
  status: string;
  items: OrderItemDetails[];
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total_amount: number;
  shipping_address: Address | null;
  billing_address: Address | null;
  payment_method: string | null;
  payment_status: string | null;
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  assigned_distributor_id?: string | null;
  assigned_distributor_name?: string | null;
  tracking_number?: string | null;
  fulfillment_notes?: string | null;
  fulfillment_photo_url?: string | null;
  orderHistory?: OrderHistory[];
}

// Helper to format Address
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
      {addr.phone && (
        <>
          <br />
          {addr.phone}
        </>
      )}
    </address>
  );
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser, token, isLoading: authLoading, logout } = useAuth();
  const orderId = params.orderId as string;

  // --- State ---
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [availableDistributors, setAvailableDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Auth Check Effect ---
  useEffect(() => {
    if (!authLoading && (!adminUser || !token || adminUser.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [adminUser, token, authLoading, router]);

  // --- Data Fetching ---
  const loadOrderData = useCallback(async () => {
    if (!token || !adminUser || !orderId) return;
    setIsLoadingData(true);
    setError(null);
    setActionError(null);
    try {
      // Fetch order details from the implemented API endpoint
      console.log(`Fetching order details from: /api/admin/orders/${orderId}`);
      const orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        if (orderResponse.status === 404) {
          throw new Error('Order not found.');
        }
        const errData = await orderResponse.json();
        throw new Error(errData.message || `Failed to fetch order (${orderResponse.status})`);
      }
      const orderData = await orderResponse.json();
      console.log('Order data received:', orderData);
      setOrder(orderData as AdminOrderDetails);
      setSelectedDistributor(orderData.assigned_distributor_id || '');

      // Fetch available distributors
      const distResponse = await fetch(`/api/admin/users?role=Distributor&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!distResponse.ok) {
        console.warn('Failed to fetch distributors.');
        setAvailableDistributors([]);
      } else {
        const distData = await distResponse.json();
        setAvailableDistributors(distData.users || []);
        console.log('Distributors fetched:', distData.users?.length || 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load order data.');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token, adminUser, orderId, logout, router]);

  // Initial Data Load Effect
  useEffect(() => {
    if (adminUser && token && adminUser.role === 'Admin' && orderId) {
      loadOrderData();
    }
  }, [adminUser, token, orderId, loadOrderData]); // Depend on auth state and orderId

  // --- Action Handlers ---
  const handleAction = async (
    action: 'approve' | 'assign-distributor' | 'verify-fulfillment' | 'ship' | 'update-status',
    payload?: Record<string, unknown>
  ) => {
    if (!order || !token) return;
    setIsActionLoading(true);
    setActionError(null);
    const endpoint = `/api/admin/orders/${orderId}/${action}`;
    let method = 'POST';
    let body: Record<string, unknown> = payload || {};

    // Prepare body/endpoint based on action
    if (action === 'assign-distributor') {
      if (!selectedDistributor) {
        setActionError('Please select a distributor.');
        setIsActionLoading(false);
        return;
      }
      body = { distributorId: selectedDistributor };
    }
    if (action === 'update-status') {
      method = 'PUT';
      if (!body?.status || !body?.reason) {
        setActionError('Status and Reason required.');
        setIsActionLoading(false);
        return;
      }
    }

    console.log(`Performing action: ${action} on order ${orderId}`);
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body && { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Action '${action}' failed (${response.status})`);
      }
      const result = await response.json();
      console.log('Action successful:', result);
      alert(`Action '${action}' successful! Refreshing data...`);
      await loadOrderData(); // Re-fetch data to update UI
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'An unexpected error occurred performing action.'
      );
      console.error('Action failed:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const triggerManualStatusUpdate = () => {
    const newStatus = prompt('Enter new status (e.g., Cancelled, Refunded):');
    const reason = prompt('Enter reason for manual update:');
    if (newStatus && reason) {
      handleAction('update-status', { status: newStatus, reason });
    } else {
      alert('Status and reason are required.');
    }
  };

  const getAvailableActions = (status: string): ReactNode[] => {
    const actions: ReactNode[] = [];
    // Simplified status checks based on expected flow
    if (status === 'Pending Approval') {
      actions.push(
        <button
          key="approve"
          onClick={() => handleAction('approve')}
          disabled={isActionLoading}
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50"
        >
          Approve Order
        </button>
      );
    }
    if (status === 'Awaiting Fulfillment') {
      actions.push(
        <div key="assign" className="flex items-center space-x-2">
          <select
            value={selectedDistributor}
            onChange={e => setSelectedDistributor(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm sm:text-sm"
            aria-label="Select distributor"
          >
            <option value="">Select Distributor...</option>
            {availableDistributors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.location || 'N/A'})
              </option>
            ))}
          </select>
          <button
            onClick={() => handleAction('assign-distributor')}
            disabled={isActionLoading || !selectedDistributor}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Assign Distributor
          </button>
        </div>
      );
    }
    if (status === 'Pending Fulfillment Verification') {
      actions.push(
        <button
          key="verify"
          onClick={() => handleAction('verify-fulfillment')}
          disabled={isActionLoading}
          className="rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-600 disabled:opacity-50"
        >
          Verify Fulfillment
        </button>
      );
    }
    // Status might be different after verification, e.g., 'Verified - Awaiting Shipment'
    if (status === 'Awaiting Shipment' || status === 'Verified - Awaiting Shipment') {
      actions.push(
        <button
          key="ship"
          onClick={() => handleAction('ship')}
          disabled={isActionLoading}
          className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600 disabled:opacity-50"
        >
          Mark as Shipped
        </button>
      );
    }
    actions.push(
      <button
        key="manual"
        onClick={triggerManualStatusUpdate}
        disabled={isActionLoading}
        className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600 disabled:opacity-50"
      >
        Manual Status Update
      </button>
    );
    return actions;
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData)
    return (
      <Layout>
        <div className="p-8 text-center">Loading...</div>
      </Layout>
    );
  if (!adminUser || adminUser.role !== 'Admin')
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied.</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="rounded bg-red-100 p-8 text-red-600">Error loading order: {error}</div>
      </Layout>
    );
  if (!order)
    return (
      <Layout>
        <div className="p-8 text-center">Order not found.</div>
      </Layout>
    );

  const actionButtons = getAvailableActions(order.status);
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Awaiting Fulfillment':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Fulfillment Verification':
        return 'bg-purple-100 text-purple-800';
      case 'Awaiting Shipment':
        return 'bg-cyan-100 text-cyan-800'; // Or Verified...
      case 'Shipped':
        return 'bg-green-100 text-green-800';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mb-6">
          <Link href="/admin/dashboard/orders" className="text-primary-600 hover:text-primary-700">
            &larr; Back to All Orders
          </Link>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleString()} by{' '}
              <Link
                href={`/admin/dashboard/users/${order.user_id}`}
                className="text-primary-600 hover:underline"
              >
                {order.customer_name || `User (${order.user_id.substring(0, 6)}...)`}
              </Link>
            </p>
          </div>
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5 ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold text-gray-700">Actions</h2>
          {actionError && (
            <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-500">
              Action Error: {actionError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {actionButtons}
            {isActionLoading && <span className="text-sm text-gray-500">Processing...</span>}
          </div>
        </div>

        {/* Order Details Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Items & Fulfillment */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">
                Order Items ({order.items.length})
              </h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="flex items-center py-3">
                    <Image
                      src={item.image_url || '/images/products/placeholder.svg'}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="mr-4 h-16 w-16 rounded-md border object-contain p-1"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/admin/dashboard/products/${item.product_id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.quantity * item.price_per_item).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            {/* Fulfillment Details */}
            {(order.assigned_distributor_id ||
              order.tracking_number ||
              order.fulfillment_photo_url ||
              order.fulfillment_notes) && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold text-gray-700">Fulfillment Info</h2>
                <dl className="space-y-3 text-sm">
                  {order.assigned_distributor_id && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Assigned Distributor:</dt>
                      <dd className="font-medium text-gray-800">
                        <Link
                          href={`/admin/dashboard/users/${order.assigned_distributor_id}`}
                          className="text-primary-600 hover:underline"
                        >
                          {order.assigned_distributor_name || order.assigned_distributor_id}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tracking Number:</dt>
                      <dd className="font-medium text-gray-800">{order.tracking_number}</dd>
                    </div>
                  )}
                  {order.fulfillment_notes && (
                    <div>
                      <dt className="mb-1 text-gray-500">Fulfillment Notes:</dt>
                      <dd className="text-gray-800">{order.fulfillment_notes}</dd>
                    </div>
                  )}
                  {order.fulfillment_photo_url && (
                    <div>
                      <dt className="mb-1 text-gray-500">Fulfillment Photo:</dt>
                      <dd>
                        <div className="mt-2 overflow-hidden rounded-md border">
                          <a
                            href={order.fulfillment_photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block"
                          >
                            <Image
                              src={order.fulfillment_photo_url}
                              alt="Fulfillment verification"
                              width={400}
                              height={300}
                              className="w-full object-contain transition-opacity hover:opacity-90"
                            />
                            <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                              Click to view full size
                            </div>
                          </a>
                          {order.fulfillment_photo_url.toLowerCase().endsWith('.pdf') ? (
                            <div className="mt-2 text-center">
                              <a
                                href={order.fulfillment_photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary-600 hover:text-primary-700"
                              >
                                <svg
                                  className="mr-1 h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                View PDF Document
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
          {/* Right Column: Customer, Addresses, Payment, History */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Customer</h2>
              <p>
                <Link
                  href={`/admin/dashboard/users/${order.user_id}`}
                  className="font-medium text-primary-600 hover:underline"
                >
                  {order.customer_name || 'N/A'}
                </Link>
              </p>
              <p className="text-sm text-gray-600">{order.customer_email || 'N/A'}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Addresses</h2>
              <div className="mb-3">
                <h3 className="mb-1 text-sm font-medium text-gray-600">Shipping Address</h3>
                {formatAddress(order.shipping_address)}
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-600">Billing Address</h3>
                {formatAddress(order.billing_address)}
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Payment</h2>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Method:</dt>
                  <dd className="font-medium text-gray-800">{order.payment_method || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status:</dt>
                  <dd className="font-medium text-gray-800">{order.payment_status || 'N/A'}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2">
                  <dt className="font-semibold text-gray-500">Total:</dt>
                  <dd className="font-semibold text-gray-800">${order.total_amount.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
            {/* Order History */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Order History</h2>
              {order.orderHistory && order.orderHistory.length > 0 ? (
                <ul className="space-y-3">
                  {order.orderHistory.map((entry, index) => (
                    <li key={index} className="border-b pb-2 text-sm last:border-b-0">
                      <p className="font-medium text-gray-700">
                        {entry.status}{' '}
                        <span className="font-normal text-gray-400">
                          {' '}
                          - {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </p>
                      {entry.user_name && (
                        <p className="text-xs text-gray-500">
                          By: {entry.user_name} ({entry.user_role || 'User'})
                        </p>
                      )}
                      {entry.notes && (
                        <p className="mt-1 text-xs text-gray-600">Notes: {entry.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No history recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
