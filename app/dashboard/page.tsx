'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useAuth } from '../context/AuthContext';

// Define the full profile type expected from /api/users/me
interface UserProfile extends User {
  // Extends basic User from AuthContext
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
type CommissionSummary = {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutDate: string | null;
};

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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            logout();
            router.push('/login');
            return;
          } // Handle bad token
          throw new Error(`Failed to fetch profile (${profileResponse.status})`);
        }
        const profileData: UserProfile = await profileResponse.json();
        setProfile(profileData);

        // --- Fetch recent orders ---
        const orderResponse = await fetch('/api/orders/me?limit=3', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!orderResponse.ok) {
          if (orderResponse.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          console.error(`Order fetch failed with status: ${orderResponse.status}`); // Log specific error but don't block dashboard
          // throw new Error(`Failed to fetch orders (${orderResponse.status})`);
          setOrders([]); // Set empty orders on failure
        } else {
          const orderData = await orderResponse.json();
          setOrders(orderData.orders || []);
        }

        // Fetch commission summary data
        try {
          const commissionResponse = await fetch('/api/users/me/commissions?limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!commissionResponse.ok) {
            if (commissionResponse.status === 401) {
              logout();
              router.push('/login');
              return;
            }
            console.error(`Commission fetch failed with status: ${commissionResponse.status}`);
          } else {
            const commissionData = await commissionResponse.json();
            const commissions = commissionData.commissions || [];

            // Calculate total earned and pending payout
            const totalEarned = commissions.reduce(
              (sum: number, commission: any) =>
                commission.status !== 'Cancelled' ? sum + parseFloat(commission.amount) : sum,
              0
            );

            const pendingPayout = commissions.reduce(
              (sum: number, commission: any) =>
                commission.status === 'Pending' ? sum + parseFloat(commission.amount) : sum,
              0
            );

            // Find the most recent payout date
            const paidCommissions = commissions.filter(
              (commission: any) => commission.status === 'Paid'
            );
            const lastPayoutDate =
              paidCommissions.length > 0
                ? new Date(
                    Math.max(...paidCommissions.map((c: any) => new Date(c.updated_at).getTime()))
                  )
                    .toISOString()
                    .split('T')[0]
                : null;

            setCommissions({
              totalEarned,
              pendingPayout,
              lastPayoutDate,
            });
          }
        } catch (err) {
          console.error('Failed to fetch commission data:', err);
          // Set default values if commission fetch fails
          setCommissions({ totalEarned: 0, pendingPayout: 0, lastPayoutDate: null });
        }
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
    return (
      <Layout>
        <div className="p-8 text-center">Loading dashboard...</div>
      </Layout>
    );
  }

  // Now check for the fetched profile data
  if (!profile) {
    // Error should be set if fetching failed, otherwise might still be redirecting
    return (
      <Layout>
        <div className="p-8 text-center">{error || 'Loading user data...'}</div>
      </Layout>
    );
  }

  // Use profile.name and profile.referral_code below
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Welcome, {profile.name}!</h1>

        {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-red-700">Error: {error}</p>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Orders Section */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            {/* ... orders rendering ... */}
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Recent Orders</h2>
            {orders.length > 0 ? (
              <ul className="space-y-3">
                {orders.map(order => (
                  <li key={order.id} className="border-b pb-3 last:border-b-0">
                    <Link href={`/dashboard/orders/${order.id}`} className="hover:text-primary-600">
                      <div className="flex items-center justify-between">
                        <span>Order #{order.id.split('-')[1]}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-lg font-medium">${order.total.toFixed(2)}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-sm ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent orders found.</p>
            )}
            <Link
              href="/dashboard/orders"
              className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {/* Referral/Commission Section */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Your Referrals & Commissions
            </h2>
            {/* Referral code with copy functionality */}
            {profile.referral_code && (
              <div className="mb-4">
                <p className="mb-1 text-gray-600">Your Referral Code:</p>
                <div className="flex items-center">
                  <p className="rounded-l bg-gray-100 p-2 font-mono text-lg">
                    {profile.referral_code}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(profile.referral_code || '');
                      alert('Referral code copied to clipboard!');
                    }}
                    className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600"
                    aria-label="Copy referral code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-4 mb-1 text-gray-600">Your Referral Link:</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code}`}
                    className="w-full rounded-l bg-gray-100 p-2 text-sm text-gray-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code}`
                      );
                      alert('Referral link copied to clipboard!');
                    }}
                    className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600"
                    aria-label="Copy referral link"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Share this link with friends and earn 5% commission on their purchases!
                </p>
              </div>
            )}
            {commissions ? (
              <div className="space-y-2">
                <p className="text-gray-600">
                  Total Earned:{' '}
                  <span className="font-semibold text-gray-800">
                    ${commissions.totalEarned.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Pending Payout:{' '}
                  <span className="font-semibold text-green-600">
                    ${commissions.pendingPayout.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Last Payout: {commissions.lastPayoutDate || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No commission data available.</p>
            )}
            <Link
              href="/dashboard/referrals"
              className="text-primary-600 hover:text-primary-700 mt-4 inline-block font-medium"
            >
              View Commission Details &rarr;
            </Link>
          </div>

          {/* Account Quick Links */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Account Settings</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard/profile"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Manage Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/profile#addresses"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Manage Addresses
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
