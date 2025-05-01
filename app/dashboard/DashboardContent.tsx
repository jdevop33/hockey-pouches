'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Types
interface UserProfile {
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  referral_code?: string;
  avatar?: string;
}

interface OrderSummary {
  id: string;
  date: string;
  total: number;
  status: string;
  items: { id: string; name: string; quantity: number }[];
}

interface CommissionData {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutDate?: string;
}

interface ProfileData {
  profile: UserProfile;
  orders: OrderSummary[];
  commissions?: CommissionData;
}

interface DashboardContentProps {
  token: string;
  getProfileDataAction: (token: string) => Promise<ProfileData>;
}

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

export function DashboardContent({ token, getProfileDataAction }: DashboardContentProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [commissions, setCommissions] = useState<CommissionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getProfileDataAction(token);
        setProfile(data.profile);
        setOrders($1?.$2);
        setCommissions($1?.$2 || null);
      } catch (err) {
        setError('Unable to load profile data. Please try again later.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data. Please try again later.',
        });
        console.error('Error loading profile data:', err);
      }
    };

    loadData();
  }, [token, getProfileDataAction]);

  if (error) {
    return (
      <div className="min-h-screen bg-dark-500 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="text-lg text-red-300">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 rounded-md bg-gold-500 px-4 py-2 text-dark-900 hover:bg-gold-400"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                  onClick={() => $1?.$2('/dashboard/profile')}
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
                onClick={() => $1?.$2('/dashboard/orders')}
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
                        <p className="font-medium text-gold-400">Order #{order.id.split('-')[1]}</p>
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

          {/* Commissions Section */}
          {(profile.role === 'distributor' || (commissions && commissions.totalEarned > 0)) && (
            <div className="col-span-3 rounded-lg border border-gold-500/10 bg-dark-600 p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gold-500">Commissions & Referrals</h2>
                <button
                  onClick={() => $1?.$2('/dashboard/referrals')}
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
                        ${(commissions.totalEarned - commissions.pendingPayout).toFixed(2)}
                      </p>
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
                            ? `${process.env.NEXT_PUBLIC_APP_URL}/ref/${profile.referral_code}`
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
                            navigator.clipboard
                              .writeText(
                                `${process.env.NEXT_PUBLIC_APP_URL}/ref/${profile.referral_code}`
                              )
                              .then(() => {
                                toast({
                                  title: 'Success',
                                  description: 'Referral link copied to clipboard',
                                  variant: 'success',
                                });
                              });
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
  );
}
