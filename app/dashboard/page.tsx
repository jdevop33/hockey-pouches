'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../context/AuthContext'; // Example auth context
// import { fetchDashboardData } from '../lib/dashboardService'; // Example service

// Placeholder types - replace with actual data types
type OrderSummary = { id: string; date: string; total: number; status: string };
type CommissionSummary = { totalEarned: number; pendingPayout: number; lastPayoutDate: string | null };
type UserProfile = { name: string; email: string; referralCode: string };

export default function DashboardPage() {
  // const { user, loading: authLoading } = useAuth(); // Example context usage
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [commissions, setCommissions] = useState<CommissionSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and redirect if not logged in
  const isAuthenticated = true; // Placeholder
  const user = { name: 'Jane Doe', email: 'jane@example.com', referralCode: 'JANE123' }; // Placeholder

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/login'); // Redirect if not logged in
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholders with actual API calls
        // const profileData = await fetch('/api/users/me').then(res => res.json());
        // const orderData = await fetch('/api/orders/me?limit=3').then(res => res.json()); // Fetch recent 3 orders
        // const commissionData = await fetch('/api/users/me/commissions/summary').then(res => res.json()); // Hypothetical summary endpoint

        // Placeholder data simulation
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setProfile(user);
        setOrders([
          { id: 'order-789', date: '2023-10-26', total: 45.50, status: 'Shipped' },
          { id: 'order-654', date: '2023-10-20', total: 80.00, status: 'Delivered' },
        ]);
        setCommissions({ totalEarned: 25.75, pendingPayout: 15.25, lastPayoutDate: '2023-10-15' });

      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (isLoading) {
    // TODO: Add a proper loading skeleton component
    return <Layout><div className="p-8">Loading dashboard...</div></Layout>;
  }
  
  if (!isAuthenticated) {
     // This part might not be reached if redirect happens in useEffect
     return <Layout><div className="p-8">Redirecting to login...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="p-8 text-red-600">Error: {error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {profile?.name}!</h1>
        
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Orders Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <ul className="space-y-3">
                {orders.map(order => (
                  <li key={order.id} className="border-b pb-3 last:border-b-0">
                    <Link href={`/dashboard/orders/${order.id}`} className="hover:text-primary-600">
                      <div className="flex justify-between items-center">
                        <span>Order #{order.id.split('-')[1]}</span>
                        <span className="text-sm text-gray-500">{order.date}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-lg font-medium">${order.total.toFixed(2)}</span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{order.status}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent orders found.</p>
            )}
            <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium">
              View All Orders &rarr;
            </Link>
          </div>

          {/* Referral/Commission Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Referrals & Commissions</h2>
            {profile?.referralCode && (
               <div className="mb-4">
                 <p className="text-gray-600 mb-1">Your Referral Code:</p>
                 <p className="text-lg font-mono bg-gray-100 p-2 rounded inline-block">{profile.referralCode}</p>
                 {/* TODO: Add functionality to copy referral code/link */}
               </div>
            )}
            {commissions ? (
              <div className="space-y-2">
                <p className="text-gray-600">Total Earned: <span className="font-semibold text-gray-800">${commissions.totalEarned.toFixed(2)}</span></p>
                <p className="text-gray-600">Pending Payout: <span className="font-semibold text-green-600">${commissions.pendingPayout.toFixed(2)}</span></p>
                <p className="text-sm text-gray-500">Last Payout: {commissions.lastPayoutDate || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No commission data available.</p>
            )}
             <Link href="/dashboard/referrals" className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium">
              View Commission Details &rarr;
            </Link>
             {/* TODO: Add link/info about how the referral program works */} 
          </div>

          {/* Account Quick Links */} 
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Settings</h2>
            <ul className="space-y-3">
              <li><Link href="/dashboard/profile" className="text-primary-600 hover:text-primary-700 font-medium">Manage Profile</Link></li>
              <li><Link href="/dashboard/profile#addresses" className="text-primary-600 hover:text-primary-700 font-medium">Manage Addresses</Link></li> 
              {/* TODO: Add links for Payment Methods, Password Change etc. if applicable */}
            </ul>
          </div>

        </div>
      </div>
    </Layout>
  );
}
