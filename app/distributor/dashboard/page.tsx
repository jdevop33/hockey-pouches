'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import Layout from '../../components/layout/NewLayout'; // Adjust layout import as needed
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Placeholder Types
type AssignedOrderSummary = { id: string; customerName: string; dateAssigned: string; itemsCount: number };
type FulfillmentHistorySummary = { id: string; dateFulfilled: string; status: string };
type DistributorCommissionSummary = { pendingPayout: number; totalEarnedLifetime: number };

export default function DistributorDashboardPage() {
  const router = useRouter();
  // --- Use the actual useAuth hook --- 
  const { user, token, isLoading: authLoading, logout } = useAuth(); 

  const [assignedOrders, setAssignedOrders] = useState<AssignedOrderSummary[]>([]);
  const [fulfillmentHistory, setFulfillmentHistory] = useState<FulfillmentHistorySummary[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<DistributorCommissionSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate data loading state
  const [error, setError] = useState<string | null>(null);

  // --- Authentication and Authorization Check --- 
  useEffect(() => {
    // Only run checks after auth state is loaded
    if (!authLoading) {
      const currentUrl = window.location.pathname;
      const isDistributorDashboard = currentUrl.startsWith('/distributor/dashboard');

      if (!user || !token) {
        // Not logged in
        console.log('Distributor Dashboard: Not logged in, redirecting...');
        if (isDistributorDashboard) {
            router.push('/login?redirect=/distributor/dashboard');
        }
      } else if (user.role !== 'Distributor') {
        // Logged in, but not a Distributor
        console.log(`Distributor Dashboard: User is ${user.role}, not Distributor. Redirecting...`);
        if (isDistributorDashboard) {
             router.push(user.role === 'Admin' ? '/admin/dashboard' : '/dashboard');
        }
      }
      // If user exists and role is Distributor, proceed with loading data (handled below)
    }
  }, [user, token, authLoading, router]);

  // --- Data Fetching Effect (only runs if authenticated and distributor) --- 
  useEffect(() => {
    const currentUrl = window.location.pathname;
    const isDistributorDashboard = currentUrl.startsWith('/distributor/dashboard');
    
    // Ensure we only fetch data if the user is authenticated and confirmed as Distributor
    if (!authLoading && user && token && user.role === 'Distributor') {
        console.log('Distributor Dashboard: Fetching distributor data...');
        const loadData = async () => {
          setIsLoadingData(true);
          setError(null);
          try {
            // TODO: Replace placeholders with actual API calls for distributor data
            // Fetch assigned orders awaiting fulfillment (e.g., /api/distributor/orders?status=assigned&limit=5)
            // Fetch recent fulfillment history (e.g., /api/distributor/orders/history?limit=5)
            // Fetch commission summary (Need specific Distributor endpoint - e.g., GET /api/distributor/me/commissions/summary?)
            
            // Include token in headers
            const headers = { Authorization: `Bearer ${token}` };
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

            setAssignedOrders([
              { id: 'order-abc', customerName: 'Alice Smith', dateAssigned: '2023-10-27', itemsCount: 2 },
              { id: 'order-def', customerName: 'Bob Jones', dateAssigned: '2023-10-26', itemsCount: 1 },
            ]);
            setFulfillmentHistory([
               { id: 'order-xyz', dateFulfilled: '2023-10-25', status: 'Verified' },
               { id: 'order-uvw', dateFulfilled: '2023-10-24', status: 'Shipped' },
            ]);
            // TODO: Fetch actual commission based on 5% fulfillment rule
            setCommissionSummary({ pendingPayout: 150.75, totalEarnedLifetime: 1250.50 }); // Placeholder

          } catch (err: any) {
             // Handle potential 401 from API calls if token expires mid-session
             if (err.message?.includes('401')) { // Basic check, improve if needed
                 logout();
                 if(isDistributorDashboard) {
                    router.push('/login?redirect=/distributor/dashboard');
                 }
             } else {
                 setError('Failed to load distributor dashboard data.');
                 console.error(err);
             }
          } finally {
            setIsLoadingData(false);
          }
        };
        loadData();
    } else if (!authLoading) {
         // If auth is loaded but user is not distributor/logged in, stop data loading
        setIsLoadingData(false);
    }
  }, [user, token, authLoading, logout, router]); // Depend on auth state

  // Render loading state or unauthorized message
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8 text-center">Loading Distributor Dashboard...</div></Layout>;
  }
  if (!user || user.role !== 'Distributor') {
    // This state might be brief before redirect, or if redirect fails
    return <Layout><div className="p-8 text-center text-red-600">Access Denied. You must be a Distributor.</div></Layout>;
  }

  // Render actual dashboard content for Distributor
  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        {/* Use user.name from context */} 
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Distributor Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">Welcome, {user.name}!</p>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Awaiting Fulfillment */} 
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Orders Awaiting Fulfillment ({assignedOrders.length})</h2>
             {assignedOrders.length > 0 ? (
               <ul className="space-y-3">
                 {assignedOrders.map(order => (
                   <li key={order.id} className="border-b pb-3 last:border-b-0">
                     <Link href={`/distributor/dashboard/orders/${order.id}`} className="hover:text-primary-600 block">
                       <div className="flex justify-between items-center">
                         <span className="font-medium">Order #{order.id.split('-')[1]}</span>
                         <span className="text-sm text-gray-500">Assigned: {order.dateAssigned}</span>
                       </div>
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-gray-600">Customer: {order.customerName}</span>
                         <span className="text-sm text-gray-500">Items: {order.itemsCount}</span>
                       </div>
                     </Link>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-gray-500">No orders currently assigned for fulfillment.</p>
             )}
             <Link href="/distributor/dashboard/orders" className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium">
               View All Assigned Orders &rarr;
             </Link>
          </div>

          {/* Commission Summary */} 
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Commissions (Fulfillment Based)</h2>
             {commissionSummary ? (
              <div className="space-y-4">
                  <div className="text-center border-b pb-3 mb-3">
                      <p className="text-sm text-gray-500 uppercase">Pending Payout</p>
                      <p className="text-3xl font-bold text-green-600">${commissionSummary.pendingPayout.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-sm text-gray-500 uppercase">Total Earned (Lifetime)</p>
                      <p className="text-xl font-semibold text-gray-800">${commissionSummary.totalEarnedLifetime.toFixed(2)}</p>
                  </div>
              </div>
             ) : (
                <p className="text-gray-500">Commission data not available.</p>
             )}
              <Link href="/distributor/dashboard/commissions" className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium">
               View Commission History &rarr;
             </Link>
             {/* TODO: Add info on payout schedule/method */} 
          </div>
          
          {/* Fulfillment History Quick View (Optional) */} 
           <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Fulfillment History</h2>
                {fulfillmentHistory.length > 0 ? (
                  <ul className="space-y-2">
                   {fulfillmentHistory.map(hist => (
                     <li key={hist.id} className="text-sm flex justify-between">
                       <Link href={`/distributor/dashboard/orders/${hist.id}`} className="text-primary-600 hover:underline">Order #{hist.id.split('-')[1]}</Link>
                       <span>Fulfilled: {hist.dateFulfilled}</span>
                       <span>Status: {hist.status}</span>
                     </li>
                   ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No recent fulfillment history.</p>
                )}
                {/* Optional Link to full history */} 
           </div>
           
           {/* TODO: Add sections for Inventory Overview (if applicable), Wholesale Referrals (if applicable) */} 

        </div>
      </div>
    </Layout>
  );
}
