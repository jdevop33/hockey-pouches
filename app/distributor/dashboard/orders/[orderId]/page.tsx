'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/layout/NewLayout'; // Adjust layout import
// import { useAuth } from '../../../../context/AuthContext'; // Example auth context

// Placeholder Types - Adapt as needed
type OrderItem = { id: string; productId: string; name: string; quantity: number; imageUrl: string };
type Address = { street: string; city: string; province: string; postalCode: string; country: string };
type AssignedOrderDetails = {
  id: string;
  dateAssigned: string;
  status: 'Assigned' | 'Fulfilled - Pending Verification' | 'Verified' | 'Shipped'; // Relevant statuses
  items: OrderItem[];
  shippingAddress: Address;
  customerName: string;
  customerPhone?: string; // Optional
  // Details added by distributor during fulfillment:
  trackingNumber?: string | null;
  fulfillmentPhotoUrl?: string | null;
  fulfillmentNotes?: string | null;
};

export default function DistributorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const { user, loading: authLoading } = useAuth(); // Example
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<AssignedOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for fulfillment form
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  // TODO: State/logic for photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Distributor'
  const isAuthenticated = true; // Placeholder
  const isDistributor = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isDistributor || !orderId) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/distributor/orders/[orderId]
        // The API should verify this order belongs to this distributor
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        
        // Placeholder Data Simulation
        const data: AssignedOrderDetails = {
            id: orderId,
            dateAssigned: '2023-10-27',
            status: 'Assigned', // Or 'Fulfilled - Pending Verification' if already fulfilled
            customerName: 'Alice Smith',
            customerPhone: '555-123-4567',
            shippingAddress: { street: '789 Rinkside Rd', city: 'Vancouver', province: 'BC', postalCode: 'V6B 1A1', country: 'Canada' },
            items: [
                { id: 'item-x', productId: 'prod-3', name: 'Berry Pouch (12mg)', quantity: 2, imageUrl: '/images/products/berry/berry-12mg.png' },
            ],
            // Populate these if status is already Fulfilled/Verified
            trackingNumber: null, 
            fulfillmentPhotoUrl: null,
            fulfillmentNotes: null,
        };
        setOrder(data);
        // Pre-fill form if already fulfilled
        setTrackingNumber(data.trackingNumber || '');
        setFulfillmentNotes(data.fulfillmentNotes || '');

      } catch (err) {
        setError('Failed to load order details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [isAuthenticated, isDistributor, orderId]);

  const handleFulfillmentSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!order || order.status !== 'Assigned') return; // Can only fulfill if assigned

     setIsSubmitting(true);
     setError(null);

     try {
        // TODO: Handle photo upload first if photoFile exists
        // Example: upload to cloud storage, get URL
        let photoUrl = null;
        if (photoFile) {
            console.log('Uploading photo...', photoFile.name);
            // photoUrl = await uploadPhotoAndGetUrl(photoFile);
            photoUrl = '/placeholder/fulfillment-photo.jpg'; // Placeholder URL
        }

        // Call the fulfillment API endpoint
        const response = await fetch(`/api/distributor/orders/${orderId}/fulfill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trackingNumber: trackingNumber || null,
                fulfillmentPhotoUrl: photoUrl,
                notes: fulfillmentNotes || null,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to mark order as fulfilled.');
        }

        // Update local order state to reflect fulfillment
        setOrder(prev => prev ? { ...prev, status: 'Fulfilled - Pending Verification', trackingNumber, fulfillmentPhotoUrl: photoUrl, fulfillmentNotes } : null);
        alert('Order marked as fulfilled! Awaiting verification.');
        // Optionally disable the form or redirect

     } catch (err: any) {
         setError(err.message || 'An error occurred during fulfillment.');
     } finally {
        setIsSubmitting(false);
     }
  };

  if (isLoading) {
    return <Layout><div className="p-8">Loading order details...</div></Layout>;
  }
  if (!isAuthenticated || !isDistributor) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }
  if (error) {
    return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  }
  if (!order) {
     return <Layout><div className="p-8">Order not found or not assigned to you.</div></Layout>;
  }

  const canFulfill = order.status === 'Assigned';

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/distributor/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to Assigned Orders</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Fulfill Order</h1>
        <p className="text-gray-600 mb-6">Order #{order.id.split('-')[1]} &bull; Assigned on {new Date(order.dateAssigned).toLocaleDateString()}</p>

        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order/Customer Info */} 
                <div className="md:col-span-1 space-y-4 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6 border-gray-200">
                    <div>
                         <h3 className="font-semibold text-gray-700">Current Status</h3>
                         <p className={`mt-1 font-medium ${order.status === 'Assigned' ? 'text-yellow-600' : 'text-green-600'}`}>{order.status}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Customer</h3>
                        <p className="mt-1 text-sm text-gray-600">{order.customerName}</p>
                        {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Shipping Address</h3>
                        <address className="mt-1 not-italic text-sm text-gray-600">
                        {order.shippingAddress.street}<br/>
                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br/>
                        {order.shippingAddress.country}
                        </address>
                    </div>
                     {/* Display fulfillment info if already submitted */} 
                     {!canFulfill && (
                        <> 
                           {order.trackingNumber && ( <div><h3 className="font-semibold text-gray-700">Tracking #</h3><p className="text-sm text-gray-600">{order.trackingNumber}</p></div>)}
                           {order.fulfillmentPhotoUrl && ( <div><h3 className="font-semibold text-gray-700">Fulfillment Photo</h3><a href={order.fulfillmentPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">View Photo</a></div>)}
                           {order.fulfillmentNotes && ( <div><h3 className="font-semibold text-gray-700">Notes</h3><p className="text-sm text-gray-600">{order.fulfillmentNotes}</p></div>)}
                        </>
                    )}
                </div>

                {/* Order Items */} 
                 <div className="md:col-span-2 space-y-4">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Items to Ship</h2>
                     <ul className="divide-y divide-gray-200">
                        {order.items.map(item => (
                        <li key={item.id} className="py-3 flex items-center">
                            <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-md object-contain mr-4 bg-gray-100 p-1" />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                            </div>
                            <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                        </li>
                        ))}
                    </ul>
                 </div>
            </div>
            
            {/* Fulfillment Form (Only if status is 'Assigned') */} 
            {canFulfill && (
                <div className="mt-6 border-t pt-6 border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Submit Fulfillment Details</h2>
                    <form onSubmit={handleFulfillmentSubmit} className="space-y-4">
                       {error && <p className="text-red-500 text-sm">Error: {error}</p>}
                        <div>
                            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">Tracking Number (Optional)</label>
                            <input 
                                type="text" 
                                id="trackingNumber" 
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="mt-1 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                             <label htmlFor="fulfillmentPhoto" className="block text-sm font-medium text-gray-700">Fulfillment Photo (Optional)</label>
                             {/* TODO: Implement actual file input and preview */} 
                             <input 
                                type="file" 
                                id="fulfillmentPhoto"
                                accept="image/*"
                                onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                             />
                        </div>
                         <div>
                            <label htmlFor="fulfillmentNotes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                            <textarea 
                                id="fulfillmentNotes" 
                                rows={3} 
                                value={fulfillmentNotes}
                                onChange={(e) => setFulfillmentNotes(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
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
