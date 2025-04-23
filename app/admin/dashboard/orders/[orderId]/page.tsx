'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; // Using path alias
import { useAuth } from '@/context/AuthContext'; // Using path alias

// Placeholder Types
type OrderItem = { id: string; productId: string; name: string; quantity: number; price: number; imageUrl: string };
type Address = { street: string; city: string; province: string; postalCode: string; country: string };
type OrderHistory = { timestamp: string; status: string; user?: string; notes?: string };
type Distributor = { id: string; name: string; location: string };
type AdminOrderDetails = {
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
  paymentStatus: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedDistributorId?: string | null;
  assignedDistributorName?: string | null;
  trackingNumber?: string | null;
  fulfillmentPhotoUrl?: string | null;
  fulfillmentNotes?: string | null;
  orderHistory: OrderHistory[];
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth(); 
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [availableDistributors, setAvailableDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Auth and Role Check Effect
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/admin/dashboard/orders'); 
      } else if (user.role !== 'Admin') {
        router.push('/dashboard'); 
      }
    }
  }, [user, token, authLoading, router]);

  // Data Fetching Effect
  useEffect(() => {
    if (!authLoading && user && token && user.role === 'Admin' && orderId) {
        console.log(`Admin Order Detail: Fetching data for order ${orderId}`);
        const loadOrder = async () => {
          setIsLoadingData(true);
          setError(null);
          try {
            // TODO: Fetch order details from /api/admin/orders/[orderId]
            // TODO: Fetch available distributors 
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const data: AdminOrderDetails = {
                id: orderId,
                date: '2023-10-27',
                status: 'Pending Approval', 
                items: [
                     { id: 'item-a', productId: 'prod-1', name: 'Cool Mint (12mg)', quantity: 3, price: 5.99, imageUrl: '/images/products/mint/mint-12mg.png' },
                     { id: 'item-b', productId: 'prod-5', name: 'Citrus (6mg)', quantity: 1, price: 5.99, imageUrl: '/images/products/citrus/citrus-6mg.png' },
                ],
                subtotal: 23.96,
                shipping: 5.00,
                taxes: 2.90,
                total: 31.86,
                shippingAddress: { street: '111 Admin Lane', city: 'Edmonton', province: 'AB', postalCode: 'T5J 0K6', country: 'Canada' },
                billingAddress: { street: '111 Admin Lane', city: 'Edmonton', province: 'AB', postalCode: 'T5J 0K6', country: 'Canada' },
                paymentMethod: 'E-Transfer', 
                paymentStatus: 'Awaiting Confirmation', 
                customerId: 'cust-123',
                customerName: 'Admin Tester',
                customerEmail: 'tester@example.com',
                assignedDistributorId: null,
                assignedDistributorName: null,
                orderHistory: [
                    { timestamp: '2023-10-27 10:00:00', status: 'Pending Approval', notes: 'Order placed by customer.' },
                ],
            };
            setOrder(data);
            setAvailableDistributors([
                 { id: 'dist-1', name: 'Vancouver Distributor', location: 'Vancouver' },
                 { id: 'dist-2', name: 'Calgary Distributor', location: 'Calgary' },
                 { id: 'dist-3', name: 'Edmonton Distributor', location: 'Edmonton' }, 
                 { id: 'dist-4', name: 'Toronto Distributor', location: 'Toronto' },
            ]);
            setSelectedDistributor(data.assignedDistributorId || '');

          } catch (err: any) {
             if (err.message?.includes('401')) { 
                 logout();
                 router.push('/login?redirect=/admin/dashboard/orders');
             } else {
                 setError('Failed to load order details.');
                 console.error(err);
             }
          } finally {
            setIsLoadingData(false);
          }
        };
        loadOrder();
    } else if (!authLoading) {
         setIsLoadingData(false);
    }
  }, [user, token, authLoading, orderId, router, logout]);

  // --- Action Handlers (need token) ---
  const handleAction = async (action: 'approve' | 'assign-distributor' | 'verify-fulfillment' | 'ship' | 'update-status', payload?: any) => {
      if (!order || !token) return;
      setIsActionLoading(true);
      setActionError(null);
      let endpoint = '';
      let method = 'POST';
      let body: any = payload;

      switch (action) {
          case 'approve': endpoint = `/api/admin/orders/${orderId}/approve`; break;
          case 'assign-distributor':
              if (!selectedDistributor) { setActionError('Please select a distributor.'); setIsActionLoading(false); return; }
              endpoint = `/api/admin/orders/${orderId}/assign-distributor`;
              body = { distributorId: selectedDistributor };
              break;
           case 'verify-fulfillment': endpoint = `/api/admin/orders/${orderId}/verify-fulfillment`; break;
           case 'ship': endpoint = `/api/admin/orders/${orderId}/ship`; break;
           case 'update-status':
                method = 'PUT';
                endpoint = `/api/admin/orders/${orderId}/status`;
                body = payload; 
                if (!body?.status || !body?.reason) { setActionError('Status and Reason required.'); setIsActionLoading(false); return; }
                break;
           default: setActionError('Invalid action'); setIsActionLoading(false); return;
      }

      try {
          const response = await fetch(endpoint, {
              method: method,
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Include token
              },
              ...(body && { body: JSON.stringify(body) }),
          });
          if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errorData = await response.json();
              throw new Error(errorData.message || `Action '${action}' failed.`);
          }
          const result = await response.json();
          console.log('Action successful:', result);
          window.location.reload(); // Simple refresh for now
      } catch (err: any) {
          setActionError(err.message || 'An unexpected error occurred.');
      } finally {
          setIsActionLoading(false);
      }
  };
  
  const triggerManualStatusUpdate = () => { /* ... as before ... */ 
        const newStatus = prompt("Enter new status (e.g., Cancelled, Refunded):");
      const reason = prompt("Enter reason for manual update:");
      if (newStatus && reason) {
          handleAction('update-status', { status: newStatus, reason });
      } else {
          alert('Status and reason are required.');
      }
  };

  const getAvailableActions = (status: string) => { /* ... as before ... */ 
        const actions: React.ReactNode[] = [];
        if (status === 'Pending Approval') {
            actions.push(<button key="approve" onClick={() => handleAction('approve')} disabled={isActionLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Approve Order</button>);
        }
        if (status === 'Awaiting Fulfillment') {
            actions.push(
                <div key="assign" className="flex items-center space-x-2">
                    <select value={selectedDistributor} onChange={(e) => setSelectedDistributor(e.target.value)} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                        <option value="">Select Distributor...</option>
                        {availableDistributors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.location})</option>)}
                    </select>
                    <button onClick={() => handleAction('assign-distributor')} disabled={isActionLoading || !selectedDistributor} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Assign Distributor</button>
                </div>
            );
        }
         if (status === 'Pending Fulfillment Verification') {
             actions.push(<button key="verify" onClick={() => handleAction('verify-fulfillment')} disabled={isActionLoading} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Verify Fulfillment</button>);
         }
          if (status === 'Awaiting Shipment') { 
             actions.push(<button key="ship" onClick={() => handleAction('ship')} disabled={isActionLoading} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Mark as Shipped</button>);
         }
          actions.push(<button key="manual" onClick={triggerManualStatusUpdate} disabled={isActionLoading} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Manual Status Update</button>); 
        return actions;
    };


  // Render loading/unauthorized states
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8 text-center">Loading order details...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  }
  if (error) {
    return <Layout><div className="p-8 text-red-600 bg-red-100 rounded">Error: {error}</div></Layout>;
  }
  if (!order) {
     return <Layout><div className="p-8 text-center">Order not found.</div></Layout>;
  }

  // Render Order Management UI
  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        {/* ... Back link, Header ... */} 
          <div className="mb-6"><Link href="/admin/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to All Orders</Link></div>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Manage Order #{order.id.split('-')[1]}</h1>
                <p className="text-gray-600">Placed on {new Date(order.date).toLocaleString()} by <Link href={`/admin/dashboard/users/${order.customerId}`} className="text-primary-600 hover:underline">{order.customerName}</Link></p>
            </div>
            <div><span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${order.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>Status: {order.status}</span></div>
         </div>

        {/* Action Buttons */} 
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Actions</h2>
             {actionError && <p className="text-red-500 text-sm mb-3">Error: {actionError}</p>}
            <div className="flex flex-wrap gap-3 items-center">
                {getAvailableActions(order.status)}
                 {isActionLoading && <span className="text-sm text-gray-500">Processing...</span>}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Items & Fulfillment */} 
            <div className="lg:col-span-2 space-y-6">
                 {/* Order Items */} 
                <div className="bg-white shadow rounded-lg p-6">
                     {/* ... items list ... */} 
                       <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items ({order.items.length})</h2>
                     <ul className="divide-y divide-gray-200">
                        {order.items.map(item => (
                        <li key={item.id} className="py-3 flex items-center">
                            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-contain mr-4 bg-gray-100 p-1" />
                            <div className="flex-1">
                                <Link href={`/admin/dashboard/products/${item.productId}`} className="font-medium text-gray-900 hover:text-primary-600">{item.name}</Link>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                        </li>
                        ))}
                    </ul>
                </div>
                {/* Fulfillment Details (if applicable) */} 
                {(order.assignedDistributorId || order.trackingNumber || order.fulfillmentPhotoUrl) && (
                    <div className="bg-white shadow rounded-lg p-6">{/* ... fulfillment info ... */}</div>
                )}
            </div>

            {/* Right Column: Customer, Addresses, Payment, History */} 
            <div className="lg:col-span-1 space-y-6">
                 {/* Customer Info */} 
                 <div className="bg-white shadow rounded-lg p-6">{/* ... customer info ... */}</div>
                 {/* Addresses */} 
                 <div className="bg-white shadow rounded-lg p-6">{/* ... addresses ... */}</div>
                 {/* Payment Info */} 
                  <div className="bg-white shadow rounded-lg p-6">{/* ... payment info ... */}</div>
                 {/* Order History */} 
                  <div className="bg-white shadow rounded-lg p-6">{/* ... history ... */}</div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
