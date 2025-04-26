'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../components/layout/NewLayout';
import { useAuth } from '../context/AuthContext';

// Define the user profile type
type UserProfile = {
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  referral_code?: string;
  avatar?: string;
};

// Order summary type
type OrderSummary = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: { id: string; name: string; quantity: number }[];
};

// Commission data type
type CommissionData = {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutDate?: string;
};

// Define the full profile type expected from /api/users/me
type ProfileData = {
  profile: UserProfile;
  orders: OrderSummary[];
  commissions?: CommissionData;
};

// Loading spinner component
const Spinner = ({ className }: { className?: string }) => (
  <div
    className={`animate-spin rounded-full border-b-2 border-t-2 border-current ${className}`}
  ></div>
);

// Format relative time (similar to date-fns formatDistance)
const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Toast notification function (simple implementation)
const toast = {
  success: (message: string) => {
    console.log(message);
    // In a real implementation, this would show a toast notification
  },
  error: (message: string) => {
    console.error(message);
    // In a real implementation, this would show a toast notification
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, token, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [commissions, setCommissions] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user profile data
      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data: ProfileData = await res.json();
      setProfile(data.profile);
      setOrders(data.orders);
      setCommissions(data.commissions || null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Unable to load profile data. Please try again later.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
      return;
    }

    if (authUser && token) {
      loadData();
    }
  }, [authUser, authLoading, token, router, loadData]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-dark-500">
          <div className="text-center">
            <Spinner className="mx-auto h-12 w-12 text-gold-500" />
            <p className="mt-4 text-lg text-white">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-dark-500 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-lg text-red-300">{error}</p>
              <button
                onClick={() => {
                  if (authUser && token) {
                    loadData();
                  } else {
                    router.push('/login');
                  }
                }}
                className="mt-4 rounded-md bg-gold-500 px-4 py-2 text-dark-900 hover:bg-gold-400"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-dark-500 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gold-500/20 bg-gradient-to-r from-dark-700 to-dark-800 shadow-md">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-gold-500 sm:text-3xl">
                    Welcome, {profile.name}!
                  </h1>
                  <p className="mt-2 text-gray-300">
                    Manage your orders, track commissions, and access your referral program
                  </p>
                </div>
                <div className="flex-shrink-0 rounded-full border-2 border-gold-500/50 p-1">
                  <Image
                    src={profile.avatar || '/images/default-avatar.png'}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Account Summary */}
            <div className="col-span-1 rounded-lg border border-gold-500/10 bg-dark-600 p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gold-500">Account Overview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Account Type</p>
                  <p className="text-white">{profile.role || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="w-full rounded-md border border-gold-500 bg-transparent px-4 py-2 text-gold-500 transition-all hover:bg-gold-500 hover:text-dark-900"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="col-span-2 rounded-lg border border-gold-500/10 bg-dark-600 p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gold-500">Recent Orders</h2>
                <button
                  onClick={() => router.push('/dashboard/orders')}
                  className="text-sm text-gold-400 hover:text-gold-300"
                >
                  View All
                </button>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map(order => (
                    <div
                      key={order.id}
                      className="rounded-md border border-gold-500/10 bg-dark-700 p-4 hover:border-gold-500/20"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gold-400">
                            Order #{order.id.split('-')[1]}
                          </p>
                          <p className="mt-1 text-sm text-gray-300">
                            {new Date(order.date).toLocaleDateString()} -{' '}
                            {formatRelativeTime(order.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">${order.total.toFixed(2)}</p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${
                              order.status === 'Shipped'
                                ? 'bg-green-900/30 text-green-400'
                                : order.status === 'Processing'
                                  ? 'bg-yellow-900/30 text-yellow-400'
                                  : 'bg-gray-900/30 text-gray-400'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-gold-500/10 bg-dark-700 p-6 text-center">
                  <p className="text-gray-300">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="mt-4 rounded-md bg-gold-500 px-4 py-2 text-dark-900 hover:bg-gold-400"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>

            {/* Commissions (shown if user is a distributor or has referrals) */}
            {(profile.role === 'distributor' || (commissions && commissions.totalEarned > 0)) && (
              <div className="col-span-3 rounded-lg border border-gold-500/10 bg-dark-600 p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gold-500">Commissions & Referrals</h2>
                  <button
                    onClick={() => router.push('/dashboard/referrals')}
                    className="text-sm text-gold-400 hover:text-gold-300"
                  >
                    Referral Program
                  </button>
                </div>

                {commissions ? (
                  <div>
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-md border border-gold-500/10 bg-dark-700 p-4 text-center">
                        <p className="text-sm text-gray-400">Total Earned</p>
                        <p className="text-2xl font-bold text-gold-500">
                          ${commissions.totalEarned.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-md border border-gold-500/10 bg-dark-700 p-4 text-center">
                        <p className="text-sm text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          ${commissions.pendingPayout.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-md border border-gold-500/10 bg-dark-700 p-4 text-center">
                        <p className="text-sm text-gray-400">Paid</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${commissions.totalEarned.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-medium text-white">Recent Commissions</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="border-b border-gold-500/10 text-sm uppercase text-gray-400">
                            <tr>
                              <th className="py-3 pr-6">Order</th>
                              <th className="py-3 pr-6">Date</th>
                              <th className="py-3 pr-6">Amount</th>
                              <th className="py-3 pr-6">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold-500/10">
                            {orders.slice(0, 5).map(order => (
                              <tr key={order.id} className="hover:bg-dark-700/50">
                                <td className="py-3 pr-6 text-gold-400">
                                  #{order.id.split('-')[1]}
                                </td>
                                <td className="py-3 pr-6">
                                  {new Date(order.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 pr-6">${order.total.toFixed(2)}</td>
                                <td className="py-3 pr-6">
                                  <span
                                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                                      order.status === 'Shipped'
                                        ? 'bg-green-900/30 text-green-400'
                                        : order.status === 'Processing'
                                          ? 'bg-yellow-900/30 text-yellow-400'
                                          : 'bg-gray-900/30 text-gray-400'
                                    }`}
                                  >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-gold-500/10 bg-dark-700 p-6 text-center">
                    <p className="text-gray-300">
                      You haven't earned any commissions yet. Share your referral link to start
                      earning!
                    </p>
                    <div className="mt-6">
                      <p className="mb-2 text-sm text-gray-400">Your Referral Link:</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={
                            profile.referral_code
                              ? `https://puxx.com/ref/${profile.referral_code}`
                              : 'Loading...'
                          }
                          readOnly
                          className="flex-grow rounded-l-md border-gold-500/20 bg-dark-800 px-3 py-2 text-gray-300 focus:outline-none"
                          aria-label="Your referral link"
                          title="Your referral link"
                          placeholder="Your referral link"
                        />
                        <button
                          onClick={() => {
                            if (profile.referral_code) {
                              navigator.clipboard.writeText(
                                `https://puxx.com/ref/${profile.referral_code}`
                              );
                              toast.success('Referral link copied to clipboard');
                            }
                          }}
                          className="rounded-r-md bg-gold-500 px-4 py-2 text-dark-900 hover:bg-gold-400"
                          aria-label="Copy referral link"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/dashboard/referrals')}
                      className="mt-4 rounded-md border border-gold-500 bg-dark-700 px-4 py-2 text-gold-500 hover:bg-gold-500 hover:text-dark-800"
                    >
                      Learn More About Referrals
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
