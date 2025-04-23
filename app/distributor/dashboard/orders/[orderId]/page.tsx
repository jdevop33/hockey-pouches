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
interface Address { street?: string; city?: string; province?: string; postalCode?: string; country?: string; name?: string; phone?: string; }
interface AssignedOrderDetails {
  id: number;
  created_at: string; 
  status: 'Assigned' | 'Awaiting Fulfillment' | 'Fulfilled - Pending Verification' | 'Verified' | 'Shipped'; 
  items: OrderItemDetails[];
  shipping_address: Address | null;
  customer_name: string | null;
  tracking_number?: string | null;
  fulfillment_photo_url?: string | null;
  fulfillment_notes?: string | null;
};

// Helper to format Address (Moved outside component)
const formatAddress = (addr: Address | null | undefined): ReactNode => {
    if (!addr) return <span className="text-gray-500">Not available</span>;
    return (
        <address className="not-italic text-sm">
            {addr.name && <>{addr.name}<br/></>}
            {addr.street}<br/>
            {addr.city}, {addr.province} {addr.postalCode}<br/>
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
  useEffect(() => { /* Auth Check */ 
      if (!authLoading && (!distributorUser || !token || distributorUser.role !== 'Distributor')) {
        router.push('/login?redirect=/distributor/dashboard'); 
      }
  }, [distributorUser, token, authLoading, router]);
  
  useEffect(() => { /* Data Fetching */ 
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
                        shipping_address: { street: '100 Fulfillment Rd', city: 'Calgary', province: 'AB', postalCode: 'T1Y 0A1', country: 'Canada' },
                        items: [
                            { id: 101, order_id: parseInt(orderId), product_id: 8, product_name: 'Peppermint (12mg)', quantity: 5, price_per_item: 6.99, image_url: '/images/products/puxxperpermint22mg.png' },
                            { id: 102, order_id: parseInt(orderId), product_id: 15, product_name: 'Spearmint (12mg)', quantity: 3, price_per_item: 6.99, image_url: '/images/products/puxxspearmint22mg.png' },
                        ],
                        tracking_number: null, fulfillment_photo_url: null, fulfillment_notes: null
                    };
                    setOrder(data);
                    setTrackingNumber(data.tracking_number || '');
                    setFulfillmentNotes(data.fulfillment_notes || '');
                } catch (err: any) {
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
  const handleFulfillmentSubmit = async (e: React.FormEvent) => { /* ... as before ... */ };

  // --- Render Logic --- 
  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;
  if (!distributorUser || distributorUser.role !== 'Distributor') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-600 bg-red-100 rounded">Error: {error}</div></Layout>;
  if (!order) return <Layout><div className="p-8 text-center">Order not found or not assigned to you.</div></Layout>;

  const canFulfill = order.status === 'Awaiting Fulfillment';

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="mb-6"><Link href="/distributor/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to Assigned Orders</Link></div>
         <h1 className="text-3xl font-bold text-gray-800 mb-2">Fulfill Order #{order.id}</h1>
         <p className="text-gray-600 mb-6">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
         <div className="bg-white shadow-lg rounded-lg p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Order/Customer Info */} 
                 <div className="md:col-span-1 space-y-4 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6 border-gray-200">
                      <div><h3 className="font-semibold text-gray-700">Status</h3><p className={`mt-1 font-medium`}>{order.status}</p></div>
                      <div><h3 className="font-semibold text-gray-700">Customer</h3><p className="mt-1 text-sm text-gray-600">{order.customer_name || 'N/A'}</p></div>
                      <div><h3 className="font-semibold text-gray-700">Shipping Address</h3>{formatAddress(order.shipping_address)}</div>
                      {/* Display saved fulfillment info */} 
                 </div>
                 {/* Order Items */} 
                  <div className="md:col-span-2 space-y-4">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Items to Ship</h2>
                      <ul className="divide-y divide-gray-200">
                        {order.items.map(item => (
                        <li key={item.id} className="py-3 flex items-center">
                            <Image src={item.image_url || '/images/products/placeholder.svg'} alt={item.product_name} width={48} height={48} className="h-12 w-12 rounded-md object-contain border p-1 mr-3" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">${(item.quantity * item.price_per_item).toFixed(2)}</p>
                        </li>
                        ))}
                    </ul>
                  </div>
             </div>
             {/* Fulfillment Form */} 
             {canFulfill && (
                 <div className="mt-6 border-t pt-6 border-gray-200">
                      {/* ... Form JSX ... */} 
                 </div>
             )}
         </div>
      </div>
    </Layout>
  );
}
