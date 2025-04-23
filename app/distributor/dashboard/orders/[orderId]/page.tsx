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
  dateAssigned?: string; 
  status: 'Assigned' | 'Awaiting Fulfillment' | 'Fulfilled - Pending Verification' | 'Verified' | 'Shipped'; 
  items: OrderItemDetails[];
  shipping_address: Address | null;
  customer_name: string | null;
  customer_phone?: string | null; 
  tracking_number?: string | null;
  fulfillment_photo_url?: string | null;
  fulfillment_notes?: string | null;
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

  // --- Effects --- 
  useEffect(() => { /* Auth Check */ }, [distributorUser, token, authLoading, router]);
  useEffect(() => { /* Data Fetching */ }, [distributorUser, token, orderId, router, logout]);
  
  // --- Handlers --- 
  const handleFulfillmentSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!order || !token || (order.status !== 'Awaiting Fulfillment' && order.status !== 'Assigned')) return;
     setIsSubmitting(true);
     setError(null);
     setUploadError(null);
     let uploadedPhotoUrl: string | null = null;
     try {
        // 1. Upload photo
        if (photoFile) {
            const uploadResponse = await fetch(`/api/upload-fulfillment?filename=${encodeURIComponent(orderId + '_' + photoFile.name)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: photoFile,
            });
            if (!uploadResponse.ok) throw new Error(`Photo upload failed: ${(await uploadResponse.json()).message || 'Unknown error'}`);
            const blob = (await uploadResponse.json()) as PutBlobResult;
            uploadedPhotoUrl = blob.url;
        }

        // 2. Submit fulfillment details
        const fulfillPayload = { trackingNumber: trackingNumber?.trim() || null, fulfillmentPhotoUrl: uploadedPhotoUrl, notes: fulfillmentNotes?.trim() || null, };
        if (!fulfillPayload.trackingNumber && !fulfillPayload.fulfillmentPhotoUrl) throw new Error('Tracking number or fulfillment photo is required.');
        
        const fulfillResponse = await fetch(`/api/distributor/orders/${orderId}/fulfill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(fulfillPayload),
        });
        if (!fulfillResponse.ok) {
            if (fulfillResponse.status === 401) { logout(); router.push('/login'); return; }
            throw new Error((await fulfillResponse.json()).message || 'Failed to mark order as fulfilled.');
        }

        setOrder(prev => prev ? { ...prev, status: 'Fulfilled - Pending Verification', tracking_number: fulfillPayload.trackingNumber, fulfillment_photo_url: fulfillPayload.fulfillmentPhotoUrl, fulfillment_notes: fulfillPayload.notes } : null);
        alert('Order marked as fulfilled! Awaiting verification.');
        setPhotoFile(null);

     } catch (err: any) {
         setError(err.message || 'An error occurred during fulfillment.');
         console.error('Fulfillment Error:', err);
     } finally {
        setIsSubmitting(false);
     }
  };

  // --- Render Logic --- 
  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;
  if (!distributorUser || distributorUser.role !== 'Distributor') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-600 bg-red-100 rounded">Error: {error}</div></Layout>;
  if (!order) return <Layout><div className="p-8 text-center">Order not found or not assigned to you.</div></Layout>;

  const canFulfill = order.status === 'Awaiting Fulfillment' || order.status === 'Assigned';

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="mb-6"><Link href="/distributor/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to Assigned Orders</Link></div>
         <h1 className="text-3xl font-bold text-gray-800 mb-2">Fulfill Order #{order.id}</h1>
         <p className="text-gray-600 mb-6">Assigned on {new Date(order.created_at).toLocaleDateString()}</p>
         <div className="bg-white shadow-lg rounded-lg p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Order/Customer Info */} 
                 <div className="md:col-span-1 space-y-4 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6 border-gray-200">{/* ... */}</div>
                 {/* Order Items */} 
                  <div className="md:col-span-2 space-y-4">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Items to Ship</h2>
                      {/* ... Items list ... */} 
                  </div>
             </div>
             {/* Fulfillment Form */} 
             {canFulfill && (
                 <div className="mt-6 border-t pt-6 border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Submit Fulfillment Details</h2>
                     <form onSubmit={handleFulfillmentSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm">Error: {error}</p>} 
                        {uploadError && <p className="text-red-500 text-sm">Upload Error: {uploadError}</p>}
                         <div>
                             <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">Tracking Number</label>
                             <input type="text" id="trackingNumber" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="mt-1 block w-full max-w-md rounded-md border-gray-300 shadow-sm ..."/>
                         </div>
                         <div>
                              <label htmlFor="fulfillmentPhoto" className="block text-sm font-medium text-gray-700">Fulfillment Photo</label>
                              <input type="file" id="fulfillmentPhoto" accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 ..."/>
                              {photoFile && <p className="text-xs text-gray-500 mt-1">Selected: {photoFile.name}</p>}
                              <p className="text-xs text-gray-500 mt-1">Upload tracking label or photo of package. (Required if no tracking number)</p>
                         </div>
                          <div>
                             <label htmlFor="fulfillmentNotes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                             <textarea id="fulfillmentNotes" rows={3} value={fulfillmentNotes} onChange={(e) => setFulfillmentNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm ..."/>
                         </div>
                         <div>
                             <button type="submit" disabled={isSubmitting || (!trackingNumber && !photoFile)} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
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
