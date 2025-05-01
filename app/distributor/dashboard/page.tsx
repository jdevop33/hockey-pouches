'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useAuth } from '../../context/AuthContext';

// Proper types for API responses
type AssignedOrderSummary = {
  id: string;
  customerName: string;
  dateAssigned: string;
  itemsCount: number;
};
type FulfillmentHistorySummary = { id: string; dateFulfilled: string; status: string };
type DistributorCommissionSummary = { pendingPayout: number; totalEarnedLifetime: number };

export default function DistributorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrderSummary[]>([]);
  const [fulfillmentHistory, setFulfillmentHistory] = useState<FulfillmentHistorySummary[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<DistributorCommissionSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has distributor role
  const isDistributor = user?.role === 'distributor';

  useEffect(() => {
    // Wait for auth to load before checking permissions
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isDistributor) {
      router.push('/dashboard');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch assigned orders awaiting fulfillment
        const ordersResponse = await fetch('/api/distributor/orders?status=assigned&limit=5');
        if (!ordersResponse.ok) throw new Error('Failed to fetch assigned orders');
        const ordersData = await ordersResponse.json();

        // Fetch recent fulfillment history
        const historyResponse = await fetch('/api/distributor/orders/history?limit=5');
        if (!historyResponse.ok) throw new Error('Failed to fetch fulfillment history');
        const historyData = await historyResponse.json();

        // Fetch commission summary
        const commissionResponse = await fetch('/api/users/me/commissions/summary');
        if (!commissionResponse.ok) throw new Error('Failed to fetch commission data');
        const commissionData = await commissionResponse.json();

        setAssignedOrders(ordersData.orders || []);
        setFulfillmentHistory(historyData.history || []);
        setCommissionSummary(commissionData);
      } catch (err) {
        setError('Failed to load distributor dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isDistributor, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="p-8">Loading dashboard...</div>
      </Layout>
    );
  }

  if (!isAuthenticated || !isDistributor) {
    return (
      <Layout>
        <div className="p-8">Access Denied. Redirecting...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Distributor Dashboard</h1>
        <p className="mb-8 text-xl text-gray-600">Welcome, {user?.name || 'Distributor'}!</p>

        {error && <p className="mb-4 text-red-500">Error: {error}</p>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Orders Awaiting Fulfillment */}
          <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Orders Awaiting Fulfillment ({assignedOrders.length})
            </h2>
            {assignedOrders.length > 0 ? (
              <ul className="space-y-3">
                {assignedOrders.map(order => (
                  <li key={order.id} className="border-b pb-3 last:border-b-0">
                    <Link
                      href={`/distributor/dashboard/orders/${order.id}`}
                      className="block hover:text-primary-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Order #{order.id.split('-')[1]}</span>
                        <span className="text-sm text-gray-500">
                          Assigned: {order.dateAssigned}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
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
            <Link
              href="/distributor/dashboard/orders"
              className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700"
            >
              View All Assigned Orders &rarr;
            </Link>
          </div>

          {/* Commission Summary */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Commissions</h2>
            {commissionSummary ? (
              <div className="space-y-4">
                <div className="mb-3 border-b pb-3 text-center">
                  <p className="text-sm uppercase text-gray-500">Pending Payout</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${commissionSummary.pendingPayout.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase text-gray-500">Total Earned (Lifetime)</p>
                  <p className="text-xl font-semibold text-gray-800">
                    ${commissionSummary.totalEarnedLifetime.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Next payout scheduled:{' '}
                    {new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}
                  </p>
                  <p>Method: Direct deposit to registered account</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Commission data not available.</p>
            )}
            <Link
              href="/distributor/dashboard/commissions"
              className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700"
            >
              View Commission History &rarr;
            </Link>
          </div>

          {/* Fulfillment History Quick View */}
          <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-3">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Recent Fulfillment History</h2>
            {fulfillmentHistory.length > 0 ? (
              <ul className="space-y-2">
                {fulfillmentHistory.map(hist => (
                  <li key={hist.id} className="flex justify-between text-sm">
                    <Link
                      href={`/distributor/dashboard/orders/${hist.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      Order #{hist.id.split('-')[1]}
                    </Link>
                    <span>Fulfilled: {hist.dateFulfilled}</span>
                    <span>Status: {hist.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent fulfillment history.</p>
            )}
          </div>

          {/* Inventory Status Summary */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Inventory Status</h2>
            <p className="text-gray-600">View current inventory levels and manage your stock.</p>
            <Link
              href="/distributor/dashboard/inventory"
              className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700"
            >
              Manage Inventory &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
