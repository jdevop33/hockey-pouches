'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../context/AuthContext'; // Assuming you have auth context

// Placeholder Types
type AssignedOrderSummary = { id: string; customerName: string; dateAssigned: string; itemsCount: number };
type FulfillmentHistorySummary = { id: string; dateFulfilled: string; status: string };
type DistributorCommissionSummary = { pendingPayout: number; totalEarnedLifetime: number };

export default function DistributorDashboardPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrderSummary[]>([]);
  const [fulfillmentHistory, setFulfillmentHistory] = useState<FulfillmentHistorySummary[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<DistributorCommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Distributor'
  const isAuthenticated = true; // Placeholder
  const isDistributor = true; // Placeholder
  const distributorName = "Distributor Dave"; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isDistributor) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholders with actual API calls for distributor data
        // Fetch assigned orders awaiting fulfillment (e.g., /api/distributor/orders?status=assigned&limit=5)
        // Fetch recent fulfillment history (e.g., /api/distributor/orders/history?limit=5)
        // Fetch commission summary (e.g., /api/users/me/commissions/summary)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        setAssignedOrders([
          { id: 'order-abc', customerName: 'Alice Smith', dateAssigned: '2023-10-27', itemsCount: 2 },
          { id: 'order-def', customerName: 'Bob Jones', dateAssigned: '2023-10-26', itemsCount: 1 },
        ]);
        setFulfillmentHistory([
           { id: 'order-xyz', dateFulfilled: '2023-10-25', status: 'Verified' },
           { id: 'order-uvw', dateFulfilled: '2023-10-24', status: 'Shipped' }, // Example of different statuses
        ]);
        setCommissionSummary({ pendingPayout: 150.75, totalEarnedLifetime: 1250.50 });

      } catch (err) {
        setError('Failed to load distributor dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isDistributor]);

  if (isLoading) {
    return <Layout><div className="p-8">Loading dashboard...</div></Layout>;
  }

  if (!isAuthenticated || !isDistributor) {
    return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="p-8 text-red-600">Error: {error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Distributor Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">Welcome, {distributorName}!</p>
        
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

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
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Commissions</h2>
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
