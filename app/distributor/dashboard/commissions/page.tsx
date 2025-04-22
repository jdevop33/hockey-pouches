'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // <--- Added import
import Layout from '../../../components/layout/NewLayout'; // Adjust layout import
// import { useAuth } from '../../../context/AuthContext'; // Example auth context

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
  // const { user, loading: authLoading } = useAuth(); // Example
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, pendingPayout: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for pagination

  // TODO: Implement proper authentication check and ensure user role is 'Distributor'
  const isAuthenticated = true; // Placeholder
  const isDistributor = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isDistributor) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch data:
        // - Commissions list (/api/users/me/commissions)
        // - Commission summary (/api/users/me/commissions/summary)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        setCommissionSummary({ totalEarned: 1250.50, pendingPayout: 150.75 });
        setCommissions([
            { id: 'comm-d1', date: '2023-10-26', type: 'Fulfillment', orderId: 'order-xyz', amount: 15.00, status: 'Pending Payout' },
            { id: 'comm-d2', date: '2023-10-25', type: 'Fulfillment', orderId: 'order-uvw', amount: 12.50, status: 'Pending Payout' },
            { id: 'comm-d3', date: '2023-10-15', type: 'Fulfillment', orderId: 'order-rst', amount: 20.00, status: 'Paid', payoutDate: '2023-10-20' },
            { id: 'comm-d4', date: '2023-09-30', type: 'Wholesale Referral', amount: 100.00, status: 'Paid', payoutDate: '2023-10-05' }, // Example wholesale referral
        ]);

      } catch (err) {
        setError('Failed to load commission data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, isDistributor]);

  if (isLoading) return <Layout><div className="p-8">Loading commissions...</div></Layout>;
  if (!isAuthenticated || !isDistributor) return <Layout><div className="p-8">Access Denied. Redirecting...</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;

  return (
    <Layout>
        <div className="bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Commissions</h1>

            {/* Summary Section */} 
             <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Summary</h2>
                 <div className="flex flex-col md:flex-row justify-around space-y-4 md:space-y-0">
                     <div className="text-center">
                         <p className="text-sm text-gray-500 uppercase">Total Earned (Lifetime)</p>
                         <p className="text-2xl font-bold text-gray-800">${commissionSummary.totalEarned.toFixed(2)}</p>
                     </div>
                      <div className="text-center">
                         <p className="text-sm text-gray-500 uppercase">Pending Payout</p>
                         <p className="text-2xl font-bold text-green-600">${commissionSummary.pendingPayout.toFixed(2)}</p>
                         {/* TODO: Explain payout process/schedule */} 
                     </div>
                 </div>
            </div>

             {/* Commission History Table */} 
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h2 className="text-xl font-semibold text-gray-700 p-6 border-b">Commission History</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {commissions.length > 0 ? (
                        commissions.map((comm) => (
                            <tr key={comm.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comm.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {comm.orderId && <Link href={`/distributor/dashboard/orders/${comm.orderId}`} className="hover:underline">Order #{comm.orderId.split('-')[1]}</Link>}
                                {comm.type === 'Wholesale Referral' && <span>Referred: [Wholesaler Name]</span>} { /* TODO: Add actual referred name */} 
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">+${comm.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comm.status === 'Paid' ? 'bg-green-100 text-green-800' : comm.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {comm.status}
                                </span>
                                {comm.status === 'Paid' && comm.payoutDate && <span className="text-xs text-gray-400 ml-1">({comm.payoutDate})</span>}
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No commission history found.</td>
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
