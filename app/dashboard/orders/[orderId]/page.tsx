'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../../context/AuthContext'; // Example auth context

// Placeholder types - replace with actual data types
type OrderItem = { id: string; productId: string; name: string; quantity: number; price: number; imageUrl: string };
type Address = { street: string; city: string; province: string; postalCode: string; country: string };
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
  // Add order history if needed
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const { user, loading: authLoading } = useAuth(); // Example context usage
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and redirect if not logged in or order doesn't belong to user
  const isAuthenticated = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      // router.push('/login'); // Redirect if not logged in
      return;
    }

    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/orders/me/[orderId]
        // const response = await fetch(`/api/orders/me/${orderId}`);
        // if (!response.ok) {
        //    if (response.status === 404 || response.status === 403) throw new Error('Order not found or access denied.');
        //    else throw new Error('Failed to fetch order details');
        // }
        // const data = await response.json();

        // Placeholder data simulation
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const data: OrderDetails = {
          id: orderId,
          date: '2023-10-26',
          status: 'Shipped',
          items: [
            { id: 'item-1', productId: 'prod-1', name: 'Cool Mint Pouch (12mg)', quantity: 2, price: 5.99, imageUrl: '/images/products/mint/mint-12mg.png' },
            { id: 'item-2', productId: 'prod-2', name: 'Cherry Pouch (6mg)', quantity: 1, price: 6.49, imageUrl: '/images/products/placeholder.svg' }, // Example placeholder image
          ],
          subtotal: 18.47,
          shipping: 5.00,
          taxes: 2.03,
          total: 25.50,
          shippingAddress: { street: '123 Hockey St', city: 'Toronto', province: 'ON', postalCode: 'M5H 2N2', country: 'Canada' },
          billingAddress: { street: '123 Hockey St', city: 'Toronto', province: 'ON', postalCode: 'M5H 2N2', country: 'Canada' },
          paymentMethod: 'Credit Card',
          trackingNumber: 'XYZ123456TRACKING',
        };

        setOrder(data);

      } catch (err: any) {
        setError(err.message || 'Failed to load order details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [isAuthenticated, orderId]);

  if (!isAuthenticated) {
     // This part might not be reached if redirect happens in useEffect
     return <Layout><div className="p-8">Redirecting to login...</div></Layout>;
  }

  if (isLoading) {
    // TODO: Add a proper loading skeleton component
    return <Layout><div className="p-8">Loading order details...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="p-8 text-red-600">Error: {error}</div></Layout>;
  }

  if (!order) {
     return <Layout><div className="p-8">Order not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to Orders</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
        <p className="text-gray-600 mb-6">Order #{order.id.split('-')[1]} &bull; Placed on {new Date(order.date).toLocaleDateString()}</p>

        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Order Status and Tracking */} 
           <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Status: {order.status}</h2>
              {/* TODO: Add a more visual status tracker (e.g., progress bar) */}
              {order.trackingNumber && (
                 <p className="text-gray-600">
                   Tracking Number: {' '}
                   {/* TODO: Add link to carrier tracking page */} 
                   <span className="font-medium text-primary-600">{order.trackingNumber}</span>
                 </p>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Items Ordered</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-contain mr-4 bg-gray-100 p-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Summary & Info */}
            <div className="md:col-span-1 space-y-6">
               {/* Financial Summary */}
              <div>
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Summary</h2>
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
                   <div className="flex justify-between border-t pt-2 mt-2 border-gray-200">
                     <dt className="text-base font-semibold text-gray-900">Total</dt>
                     <dd className="text-base font-semibold text-gray-900">${order.total.toFixed(2)}</dd>
                   </div>
                 </dl>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-700">Shipping Address</h3>
                <address className="mt-2 not-italic text-sm text-gray-600">
                  {order.shippingAddress.street}<br/>
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br/>
                  {order.shippingAddress.country}
                </address>
              </div>
              
              {/* Billing Address */}
               <div>
                <h3 className="font-semibold text-gray-700">Billing Address</h3>
                <address className="mt-2 not-italic text-sm text-gray-600">
                  {/* TODO: Display only if different from shipping */} 
                  {order.billingAddress.street}<br/>
                  {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.postalCode}<br/>
                  {order.billingAddress.country}
                </address>
              </div>

              {/* Payment Method */} 
              <div>
                 <h3 className="font-semibold text-gray-700">Payment Method</h3>
                 <p className="mt-2 text-sm text-gray-600">{order.paymentMethod}</p>
                  {/* TODO: Display last 4 digits for CC etc. */} 
              </div>

            </div>
          </div>
            {/* TODO: Add Order History/Timeline Section */} 
            {/* TODO: Add options like "Reorder", "Return Items" if applicable */}
        </div>
      </div>
    </Layout>
  );
}
