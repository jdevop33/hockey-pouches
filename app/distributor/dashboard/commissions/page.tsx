'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/NewLayout';
import { useAuth } from '../../../context/AuthContext';

// Placeholder Types
type Commission = {
  id: string;
  date: string;
  type: 'Fulfillment' | 'Wholesale Referral' | 'Bonus'; // Distributor specific types
  orderId?: string;
  amount: number;
  status: 'Pending Payout' | 'Paid' | 'Cancelled';
  payoutDate?: string;
};

export default function DistributorCommissionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, pendingPayout: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for pagination

  const isDistributor = user?.role === 'Distributor';

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !isDistributor) {
      router.push('/login?from=distributor/dashboard/commissions');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch data:
        // - Commissions list (/api/users/me/commissions)
        // - Commission summary (/api/users/me/commissions/summary)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        setCommissionSummary({ totalEarned: 1250.5, pendingPayout: 150.75 });
        setCommissions([
          {
            id: 'comm-d1',
            date: '2023-10-26',
            type: 'Fulfillment',
            orderId: String('order-xyz'),
            amount: 15.0,
            status: 'Pending Payout',
          },
          {
            id: 'comm-d2',
            date: '2023-10-25',
            type: 'Fulfillment',
            orderId: String('order-uvw'),
            amount: 12.5,
            status: 'Pending Payout',
          },
          {
            id: 'comm-d3',
            date: '2023-10-15',
            type: 'Fulfillment',
            orderId: String('order-rst'),
            amount: 20.0,
            status: 'Paid',
            payoutDate: '2023-10-20',
          },
          {
            id: 'comm-d4',
            date: '2023-09-30',
            type: 'Wholesale Referral',
            amount: 100.0,
            status: 'Paid',
            payoutDate: '2023-10-05',
          }, // Example wholesale referral
        ]);
      } catch (error) {
        console.error('Error loading commission data:', error);
        setError('Failed to load commission data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, isDistributor, authLoading, router]);

  if (authLoading || isLoading)
    return (
      <Layout>
        <div className="p-8">Loading commissions...</div>
      </Layout>
    );
  if (!isAuthenticated || !isDistributor)
    return (
      <Layout>
        <div className="p-8">Access Denied. Redirecting...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="p-8 text-red-500">Error: {error}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">My Commissions</h1>

        {/* Summary Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Summary</h2>
          <div className="flex flex-col justify-around space-y-4 md:flex-row md:space-y-0">
            <div className="text-center">
              <p className="text-sm uppercase text-gray-500">Total Earned (Lifetime)</p>
              <p className="text-2xl font-bold text-gray-800">
                ${commissionSummary.totalEarned.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase text-gray-500">Pending Payout</p>
              <p className="text-2xl font-bold text-green-600">
                ${commissionSummary.pendingPayout.toFixed(2)}
              </p>
              {/* TODO: Explain payout process/schedule */}
            </div>
          </div>
        </div>

        {/* Commission History Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <h2 className="border-b p-6 text-xl font-semibold text-gray-700">Commission History</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {commissions.length > 0 ? (
                commissions.map(comm => (
                  <tr key={comm.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {comm.date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {comm.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {comm.orderId && (
                        <Link
                          href={`/distributor/dashboard/orders/${comm.orderId}`}
                          className="hover:underline"
                        >
                          Order #{comm.orderId.split('-')[1]}
                        </Link>
                      )}
                      {comm.type === 'Wholesale Referral' && (
                        <span>Referred: [Wholesaler Name]</span>
                      )}{' '}
                      {/* TODO: Add actual referred name */}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600">
                      +${comm.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${comm.status === 'Paid' ? 'bg-green-100 text-green-800' : comm.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {comm.status}
                      </span>
                      {comm.status === 'Paid' && comm.payoutDate && (
                        <span className="ml-1 text-xs text-gray-400">({comm.payoutDate})</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No commission history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* TODO: Add pagination if needed */}
        </div>
      </div>
    </Layout>
  );
}
