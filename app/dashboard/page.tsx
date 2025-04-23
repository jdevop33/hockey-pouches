'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import Layout from '../components/layout/NewLayout'; 
import { useAuth } from '../context/AuthContext'; 

// Define the full profile type expected from /api/users/me
interface UserProfile extends User { // Extends basic User from AuthContext
    status: string;
    referral_code: string | null;
    created_at: string;
}
// Basic User type from AuthContext
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Placeholder types
type OrderSummary = { id: string; date: string; total: number; status: string };
type CommissionSummary = { totalEarned: number; pendingPayout: number; lastPayoutDate: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, token, isLoading: authLoading, logout } = useAuth(); 
  
  // State for the full profile data fetched from API
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [commissions, setCommissions] = useState<CommissionSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; 
    if (!authUser || !token) {
      router.push('/login');
      return;
    }
    
    const loadData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        // --- Fetch full profile data --- 
        const profileResponse = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileResponse.ok) {
             if (profileResponse.status === 401) { logout(); router.push('/login'); return; } // Handle bad token
            throw new Error(`Failed to fetch profile (${profileResponse.status})`);
        }
        const profileData: UserProfile = await profileResponse.json();
        setProfile(profileData);

        // --- Fetch recent orders --- 
        const orderResponse = await fetch('/api/orders/me?limit=3', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!orderResponse.ok) {
             if (orderResponse.status === 401) { logout(); router.push('/login'); return; }
            console.error(`Order fetch failed with status: ${orderResponse.status}`); // Log specific error but don't block dashboard
            // throw new Error(`Failed to fetch orders (${orderResponse.status})`);
             setOrders([]); // Set empty orders on failure
        } else {
            const orderData = await orderResponse.json();
            setOrders(orderData.orders || []);
        }

        // TODO: Fetch commission summary data
        setCommissions({ totalEarned: 25.75, pendingPayout: 15.25, lastPayoutDate: '2023-10-15' }); // Placeholder

      } catch (err: any) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
    
  }, [authUser, token, authLoading, router, logout]);

  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8 text-center">Loading dashboard...</div></Layout>;
  }
  
  // Now check for the fetched profile data
  if (!profile) {
     // Error should be set if fetching failed, otherwise might still be redirecting
     return <Layout><div className="p-8 text-center">{error || 'Loading user data...'}</div></Layout>; 
  }

  // Use profile.name and profile.referral_code below
  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {profile.name}!</h1>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Orders Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             {/* ... orders rendering ... */} 
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Orders</h2>
                {orders.length > 0 ? (
                  <ul className="space-y-3">
                    {orders.map(order => (
                      <li key={order.id} className="border-b pb-3 last:border-b-0">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:text-primary-600">
                            <div className="flex justify-between items-center">
                            <span>Order #{order.id.split('-')[1]}</span>
                            <span className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
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
            {/* Use profile.referral_code here */}
            {profile.referral_code && (
               <div className="mb-4">
                 <p className="text-gray-600 mb-1">Your Referral Code:</p>
                 <p className="text-lg font-mono bg-gray-100 p-2 rounded inline-block">{profile.referral_code}</p>
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
          </div>

          {/* Account Quick Links */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Settings</h2>
            <ul className="space-y-3">
              <li><Link href="/dashboard/profile" className="text-primary-600 hover:text-primary-700 font-medium">Manage Profile</Link></li>
              <li><Link href="/dashboard/profile#addresses" className="text-primary-600 hover:text-primary-700 font-medium">Manage Addresses</Link></li> 
            </ul>
          </div>

        </div>
      </div>
    </Layout>
  );
}
