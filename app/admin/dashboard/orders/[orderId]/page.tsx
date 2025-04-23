'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; 
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

// --- Types --- (Should match API response structure)
type OrderItemDetails = { id: number; product_id: number; product_name: string; quantity: number; price_per_item: number; image_url?: string | null };
interface Address { street?: string; city?: string; province?: string; postalCode?: string; country?: string; name?: string; phone?: string; }
interface OrderHistory { timestamp: string; status: string; user?: string; notes?: string; }
interface Distributor { id: string; name: string; location?: string | null; } 
interface AdminOrderDetails {
    id: number;
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
        <address className="not-italic">
            {addr.name && <>{addr.name}<br/></>}
            {addr.street}<br/>
            {addr.city}, {addr.province} {addr.postalCode}<br/>
            {addr.country || 'Canada'}
            {addr.phone && <><br/>{addr.phone}</>}
        </address>
    );
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser, token, isLoading: authLoading, logout } = useAuth(); 
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
    if (!authLoading && (!adminUser || !token || adminUser.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard'); 
    }
  }, [adminUser, token, authLoading, router]);

  // Data Fetching Function
  const loadOrderData = async () => {
      if (!token || !adminUser || !orderId) return; // Ensure prerequisites
      setIsLoadingData(true);
      setError(null);
      setActionError(null);
      try {
          // Fetch order details
          const orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!orderResponse.ok) {
              if (orderResponse.status === 401) { logout(); router.push('/login'); return; } 
              if (orderResponse.status === 404) { throw new Error('Order not found.'); }
              throw new Error(`Failed to fetch order (${orderResponse.status})`);
          }
          const orderData = await orderResponse.json();
          setOrder(orderData as AdminOrderDetails); 
          setSelectedDistributor(orderData.assigned_distributor_id || '');

          // Fetch available distributors
          const distResponse = await fetch(`/api/admin/users?role=Distributor&limit=200`, { 
               headers: { 'Authorization': `Bearer ${token}` }
          });
           if (!distResponse.ok) {
              console.warn('Failed to fetch distributors, assignment may not work.');
              setAvailableDistributors([]);
           } else {
              const distData = await distResponse.json();
              setAvailableDistributors(distData.users || []);
           }

      } catch (err: any) {
          setError(err.message || 'Failed to load order data.');
          console.error(err);
      } finally {
          setIsLoadingData(false);
      }
  };

  // Initial Data Load Effect
  useEffect(() => {
    if (adminUser && token && adminUser.role === 'Admin' && orderId) {
        loadOrderData();
    }
  }, [adminUser, token, orderId]); // Only refetch if these core identifiers change
  
  // --- Action Handlers --- 
  const handleAction = async (action: 'approve' | 'assign-distributor' | 'verify-fulfillment' | 'ship' | 'update-status', payload?: any) => {
      if (!order || !token) return;
      setIsActionLoading(true);
      setActionError(null);
      let endpoint = `/api/admin/orders/${orderId}/${action}`;
      let method = 'POST';
      let body: any = payload;

      if (action === 'assign-distributor') {
          if (!selectedDistributor) { setActionError('Please select a distributor.'); setIsActionLoading(false); return; }
          body = { distributorId: selectedDistributor };
      }
      if (action === 'update-status') {
          method = 'PUT';
          if (!body?.status || !body?.reason) { setActionError('Status and Reason required.'); setIsActionLoading(false); return; }
      }

      console.log(`Performing action: ${action} on order ${orderId}`);
      try {
          const response = await fetch(endpoint, {
              method: method,
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              ...(body && { body: JSON.stringify(body) }),
          });
          if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errorData = await response.json();
              throw new Error(errorData.message || `Action '${action}' failed (${response.status})`);
          }
          const result = await response.json();
          console.log('Action successful:', result);
          alert(`Action '${action}' successful! Refreshing data...`);
          // Refresh data after action by re-fetching order details
          await loadOrderData(); // Call the fetch function again

      } catch (err: any) {
          setActionError(err.message || 'An unexpected error occurred performing action.');
          console.error('Action failed:', err);
      } finally {
          setIsActionLoading(false);
      }
  };
  
  const triggerManualStatusUpdate = () => {
      const newStatus = prompt("Enter new status (e.g., Cancelled, Refunded):");
      const reason = prompt("Enter reason for manual update:");
      if (newStatus && reason) {
          handleAction('update-status', { status: newStatus, reason });
      } else {
          alert('Status and reason are required.');
      }
  };

  const getAvailableActions = (status: string): ReactNode[] => { 
        const actions: ReactNode[] = [];
        if (status === 'Pending Approval') {
            actions.push(<button key="approve" onClick={() => handleAction('approve')} disabled={isActionLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">Approve Order</button>);
        }
        if (status === 'Awaiting Fulfillment') {
            actions.push(
                <div key="assign" className="flex items-center space-x-2">
                    <select value={selectedDistributor} onChange={(e) => setSelectedDistributor(e.target.value)} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                        <option value="">Select Distributor...</option>
                        {availableDistributors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.location || 'N/A'})</option>)}
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

  // --- Render Logic --- 
  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;
  if (!adminUser || adminUser.role !== 'Admin') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-600 bg-red-100 rounded">Error loading order: {error}</div></Layout>;
  if (!order) return <Layout><div className="p-8 text-center">Order not found.</div></Layout>;

  const actionButtons = getAvailableActions(order.status);

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="mb-6"><Link href="/admin/dashboard/orders" className="text-primary-600 hover:text-primary-700">&larr; Back to All Orders</Link></div>
         <div className="flex justify-between items-center mb-6">
             <div>
                 <h1 className="text-3xl font-bold text-gray-800">Manage Order #{order.id}</h1>
                 <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleString()} by <Link href={`/admin/dashboard/users/${order.user_id}`} className="text-primary-600 hover:underline">{order.customer_name || `User (${order.user_id.substring(0,6)}...)`}</Link></p>
             </div>
             {/* TODO: Better status badge needed */} 
             <div><span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full`}>Status: {order.status}</span></div>
         </div>

        {/* Action Buttons */} 
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Actions</h2>
             {actionError && <p className="text-red-500 text-sm mb-3 bg-red-100 p-2 rounded">Action Error: {actionError}</p>}
            <div className="flex flex-wrap gap-3 items-center">
                {actionButtons}
                 {isActionLoading && <span className="text-sm text-gray-500">Processing...</span>}
            </div>
        </div>

        {/* Order Details Layout */} 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Items & Fulfillment */} 
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items ({order.items.length})</h2>
                     <ul className="divide-y divide-gray-200">
                        {order.items.map(item => (
                        <li key={item.id} className="py-3 flex items-center">
                            <Image src={item.image_url || '/images/products/placeholder.svg'} alt={item.product_name} width={64} height={64} className="h-16 w-16 rounded-md object-contain border p-1 mr-4" />
                            <div className="flex-1">
                                <Link href={`/admin/dashboard/products/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary-600">{item.product_name}</Link>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">${(item.quantity * item.price_per_item).toFixed(2)}</p>
                        </li>
                        ))}
                    </ul>
                 </div>
                 {/* Fulfillment Details */} 
                 {(order.assigned_distributor_id || order.tracking_number || order.fulfillment_photo_url || order.fulfillment_notes) && (
                    <div className="bg-white shadow rounded-lg p-6">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">Fulfillment Info</h2>
                          {/* ... Render fulfillment details ... */} 
                    </div>
                 )}
            </div>
            {/* Right Column: Customer, Addresses, Payment, History */} 
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white shadow rounded-lg p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer</h2>
                     <p><Link href={`/admin/dashboard/users/${order.user_id}`} className="font-medium text-primary-600 hover:underline">{order.customer_name || `User (${order.user_id.substring(0,6)}...)`}</Link></p>
                     <p className="text-sm text-gray-600">{order.customer_email || 'No email provided'}</p>
                 </div>
                 <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Addresses</h2>
                       <div className="mb-3">
                            <h3 className="font-medium text-gray-600 text-sm mb-1">Shipping Address</h3>
                            {formatAddress(order.shipping_address)}
                       </div>
                       <div>
                            <h3 className="font-medium text-gray-600 text-sm mb-1">Billing Address</h3>
                            {formatAddress(order.billing_address)}
                       </div>
                 </div>
                 <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment</h2>
                      {/* ... Render payment details ... */} 
                 </div>
                 <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Order History</h2>
                     {/* TODO: Render order history from order.orderHistory */} 
                     <p className="text-sm text-gray-500">(History rendering pending)</p>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
