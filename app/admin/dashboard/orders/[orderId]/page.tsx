'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/layout/NewLayout';
// import { useAuth } from '../../../../../context/AuthContext'; // Example auth context

// Placeholder Types - Reuse or adapt from customer/distributor views
type OrderItem = { id: string; productId: string; name: string; quantity: number; price: number; imageUrl: string };
type Address = { street: string; city: string; province: string; postalCode: string; country: string };
type OrderHistory = { timestamp: string; status: string; user?: string; notes?: string }; // User who made the change
type Distributor = { id: string; name: string; location: string }; // For assignment dropdown
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
  // const { user, loading: authLoading } = useAuth(); // Example
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [availableDistributors, setAvailableDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !orderId) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/orders/[orderId]
        // TODO: Fetch available distributors (based on order region/inventory? or just all?)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        
        // Placeholder Data Simulation
        const data: AdminOrderDetails = {
            id: orderId,
            date: '2023-10-27',
            status: 'Pending Approval', // Example starting status
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
        
        // Simulate fetching distributors
        setAvailableDistributors([
             { id: 'dist-1', name: 'Vancouver Distributor', location: 'Vancouver' },
             { id: 'dist-2', name: 'Calgary Distributor', location: 'Calgary' },
             { id: 'dist-3', name: 'Edmonton Distributor', location: 'Edmonton' }, // Match shipping address city
             { id: 'dist-4', name: 'Toronto Distributor', location: 'Toronto' },
        ]);
        // Pre-select distributor if already assigned
        setSelectedDistributor(data.assignedDistributorId || '');

      } catch (err) {
        setError('Failed to load order details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [isAuthenticated, isAdmin, orderId]);

  // --- Action Handlers --- 
  const handleAction = async (action: 'approve' | 'assign-distributor' | 'verify-fulfillment' | 'ship' | 'update-status', payload?: any) => {
      if (!order) return;
      setIsActionLoading(true);
      setActionError(null);
      let endpoint = '';
      let method = 'POST';
      let body: any = payload;

      switch (action) {
          case 'approve':
              endpoint = `/api/admin/orders/${orderId}/approve`;
              break;
          case 'assign-distributor':
              if (!selectedDistributor) { setActionError('Please select a distributor.'); setIsActionLoading(false); return; }
              endpoint = `/api/admin/orders/${orderId}/assign-distributor`;
              body = { distributorId: selectedDistributor };
              break;
           case 'verify-fulfillment':
              endpoint = `/api/admin/orders/${orderId}/verify-fulfillment`;
              break;
           case 'ship':
              endpoint = `/api/admin/orders/${orderId}/ship`;
               // Maybe add tracking number if needed?
              break;
           case 'update-status':
                // Need UI to select new status and provide reason
                method = 'PUT';
                endpoint = `/api/admin/orders/${orderId}/status`;
                body = payload; // Expects { status: string, reason: string }
                if (!body?.status || !body?.reason) { setActionError('Status and Reason required for manual update.'); setIsActionLoading(false); return; }
                break;
           default: 
                setActionError('Invalid action');
                setIsActionLoading(false);
                return;
      }

      try {
          const response = await fetch(endpoint, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              ...(body && { body: JSON.stringify(body) }),
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `Action '${action}' failed.`);
          }
          const result = await response.json();
          console.log('Action successful:', result);

          // Refresh order data to show updated status/info
          // TODO: Implement a more efficient update than full reload
           await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before reload
           window.location.reload(); // Simple reload for now
           // Ideally, update order state directly based on successful response

      } catch (err: any) {
          setActionError(err.message || 'An unexpected error occurred.');
      } finally {
          setIsActionLoading(false);
      }
  };
  
  // TODO: Function to handle manual status update (show modal/form)
  const triggerManualStatusUpdate = () => {
      const newStatus = prompt("Enter new status (e.g., Cancelled, Refunded):");
      const reason = prompt("Enter reason for manual update:");
      if (newStatus && reason) {
          handleAction('update-status', { status: newStatus, reason });
      } else {
          alert('Status and reason are required.');
      }
  };

  // Determine available actions based on current status
   const getAvailableActions = (status: string) => {
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
          if (status === 'Awaiting Shipment') { // Assuming this status exists after verification
             actions.push(<button key="ship" onClick={() => handleAction('ship')} disabled={isActionLoading} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Mark as Shipped</button>);
         }
          // Always allow manual status update?
          actions.push(<button key="manual" onClick={triggerManualStatusUpdate} disabled={isActionLoading} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Manual Status Update</button>); 
          
        return actions;
    };


  if (isLoading) {
    return <Layout><div className="p-8">Loading order details...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }
  if (error) {
    return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  }
  if (!order) {
     return <Layout><div className="p-8">Order not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/admin/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to All Orders</Link>
        </div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Manage Order #{order.id.split('-')[1]}</h1>
                <p className="text-gray-600">Placed on {new Date(order.date).toLocaleString()} by <Link href={`/admin/dashboard/users/${order.customerId}`} className="text-primary-600 hover:underline">{order.customerName}</Link></p>
            </div>
            <div>
                 <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${order.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                     Status: {order.status}
                 </span>
            </div>
        </div>

        {/* Action Buttons */} 
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Actions</h2>
             {actionError && <p className="text-red-500 text-sm mb-3">Error: {actionError}</p>}
            <div className="flex flex-wrap gap-3 items-center">
                {getAvailableActions(order.status)}
                 {isActionLoading && <span className="text-sm text-gray-500">Processing...</span>}
            </div>
             {/* TODO: Add Edit Order Details button if needed (calls PUT /api/admin/orders/[orderId]) */} 
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Items & Fulfillment */} 
            <div className="lg:col-span-2 space-y-6">
                 {/* Order Items */} 
                <div className="bg-white shadow rounded-lg p-6">
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
                    <div className="bg-white shadow rounded-lg p-6">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">Fulfillment Info</h2>
                         <dl className="space-y-2 text-sm">
                            {order.assignedDistributorId && (
                                 <div className="grid grid-cols-3 gap-4">
                                     <dt className="font-medium text-gray-500">Assigned Distributor</dt>
                                     <dd className="text-gray-900 col-span-2">
                                         <Link href={`/admin/dashboard/users/${order.assignedDistributorId}`} className="hover:underline">{order.assignedDistributorName || order.assignedDistributorId}</Link>
                                     </dd>
                                 </div>
                            )}
                             {order.trackingNumber && (
                                 <div className="grid grid-cols-3 gap-4">
                                     <dt className="font-medium text-gray-500">Tracking #</dt>
                                     <dd className="text-gray-900 col-span-2">{order.trackingNumber}</dd>
                                 </div>
                            )}
                            {order.fulfillmentPhotoUrl && (
                                 <div className="grid grid-cols-3 gap-4 items-center">
                                     <dt className="font-medium text-gray-500">Fulfillment Photo</dt>
                                     <dd className="col-span-2"><a href={order.fulfillmentPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Photo</a></dd>
                                 </div>
                            )}
                             {order.fulfillmentNotes && (
                                 <div className="grid grid-cols-3 gap-4">
                                     <dt className="font-medium text-gray-500">Fulfillment Notes</dt>
                                     <dd className="text-gray-900 col-span-2 whitespace-pre-wrap">{order.fulfillmentNotes}</dd>
                                 </div>
                            )}
                         </dl>
                    </div>
                )}
            </div>

            {/* Right Column: Customer, Addresses, Payment, History */} 
            <div className="lg:col-span-1 space-y-6">
                 {/* Customer Info */} 
                 <div className="bg-white shadow rounded-lg p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer</h2>
                     <p><Link href={`/admin/dashboard/users/${order.customerId}`} className="font-medium text-primary-600 hover:underline">{order.customerName}</Link></p>
                     <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      {/* TODO: Add link to view customer's other orders */} 
                 </div>
                 
                 {/* Addresses */} 
                 <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Addresses</h2>
                       <div className="mb-3">
                            <h3 className="font-medium text-gray-600 text-sm mb-1">Shipping Address</h3>
                            <address className="not-italic text-sm text-gray-800">
                            {order.shippingAddress.street}<br/>
                            {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br/>
                            {order.shippingAddress.country}
                            </address>
                       </div>
                       <div>
                            <h3 className="font-medium text-gray-600 text-sm mb-1">Billing Address</h3>
                            {/* TODO: Check if same as shipping */} 
                            <address className="not-italic text-sm text-gray-800">
                            {order.billingAddress.street}<br/>
                            {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.postalCode}<br/>
                            {order.billingAddress.country}
                            </address>
                       </div>
                        {/* TODO: Add Edit Address button (if allowed at certain stages) */} 
                 </div>
                 
                 {/* Payment Info */} 
                  <div className="bg-white shadow rounded-lg p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment</h2>
                     <dl className="space-y-1 text-sm">
                         <div className="flex justify-between">
                             <dt className="text-gray-500">Method:</dt>
                             <dd className="text-gray-800 font-medium">{order.paymentMethod}</dd>
                         </div>
                         <div className="flex justify-between">
                             <dt className="text-gray-500">Status:</dt>
                             <dd className="text-gray-800 font-medium">{order.paymentStatus}</dd>
                         </div>
                         <div className="flex justify-between pt-2 border-t mt-2 border-gray-200">
                             <dt className="text-gray-500 font-semibold">Order Total:</dt>
                             <dd className="text-gray-800 font-semibold">${order.total.toFixed(2)}</dd>
                         </div>
                     </dl>
                     {/* TODO: Add button to confirm manual payments if applicable (e.g., if status is Awaiting E-Transfer) */} 
                 </div>

                 {/* Order History */} 
                  <div className="bg-white shadow rounded-lg p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Order History</h2>
                     <ul className="space-y-3">
                        {order.orderHistory.map((entry, index) => (
                            <li key={index} className="text-sm border-b pb-2 last:border-b-0">
                                <p className="font-medium text-gray-700">{entry.status} <span className="text-gray-400 font-normal"> - {new Date(entry.timestamp).toLocaleString()}</span></p>
                                {entry.user && <p className="text-xs text-gray-500">By: {entry.user}</p>}
                                {entry.notes && <p className="text-xs text-gray-600 mt-1">Notes: {entry.notes}</p>}
                            </li>
                        ))}
                     </ul>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
