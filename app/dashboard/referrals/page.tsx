'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../context/AuthContext'; // Example auth context

// Placeholder types - replace with actual data types
type Commission = {
  id: string;
  date: string;
  type: 'Referral Sale' | 'Bonus' | 'Fulfillment'; // Extend as needed
  orderId?: string; // Link to order if applicable
  referredUserName?: string; // Name of referred user for sale commissions
  amount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  payoutDate?: string;
};
type Referral = { 
  id: string;
  name: string;
  joinDate: string;
  totalSalesReferred: number; // Example summary data
};

export default function ReferralsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example context usage
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]); // List of users referred
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, pendingPayout: 0 });
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for pagination if lists are long

  // TODO: Implement proper authentication check
  const isAuthenticated = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch data:
        // - User profile (/api/users/me) for referral code
        // - Commissions list (/api/users/me/commissions)
        // - Referred users list (new endpoint? /api/users/me/referred-users)
        // - Commission summary (new endpoint? /api/users/me/commissions/summary)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        setReferralCode('JANE123');
        setCommissionSummary({ totalEarned: 25.75, pendingPayout: 15.25 });
        setCommissions([
            { id: 'comm-1', date: '2023-10-25', type: 'Referral Sale', orderId: 'order-abc', referredUserName: 'Bob K.', amount: 5.50, status: 'Pending', payoutDate: undefined },
            { id: 'comm-2', date: '2023-10-15', type: 'Referral Sale', orderId: 'order-def', referredUserName: 'Alice M.', amount: 10.25, status: 'Paid', payoutDate: '2023-10-20' },
             { id: 'comm-3', date: '2023-09-30', type: 'Bonus', amount: 10.00, status: 'Paid', payoutDate: '2023-10-05' },
        ]);
        setReferrals([
            { id: 'user-bob', name: 'Bob K.', joinDate: '2023-10-25', totalSalesReferred: 110.00 },
            { id: 'user-alice', name: 'Alice M.', joinDate: '2023-10-15', totalSalesReferred: 205.00 },
        ]);

      } catch (err) {
        setError('Failed to load referral and commission data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated]);

   if (isLoading) return <Layout><div className="p-8">Loading referral data...</div></Layout>;
   if (!isAuthenticated) return <Layout><div className="p-8">Redirecting...</div></Layout>;
   if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Referrals & Commissions</h1>

        {/* Referral Code & Summary Section */} 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Referral Code</h2>
                {referralCode ? (
                    <div>
                         <p className="text-lg font-mono bg-gray-100 p-3 rounded inline-block mb-3">{referralCode}</p>
                         {/* TODO: Add Copy button/link */} 
                         <p className="text-sm text-gray-500">Share this code with friends! You earn 5% when they make a purchase.</p>
                         {/* TODO: Provide full referral link */} 
                    </div>
                ) : (
                    <p className="text-gray-500">Referral code not found.</p>
                )}
            </div>
             <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Commission Summary</h2>
                 <div className="flex justify-around">
                     <div className="text-center">
                         <p className="text-sm text-gray-500 uppercase">Total Earned</p>
                         <p className="text-2xl font-bold text-gray-800">${commissionSummary.totalEarned.toFixed(2)}</p>
                     </div>
                      <div className="text-center">
                         <p className="text-sm text-gray-500 uppercase">Pending Payout</p>
                         <p className="text-2xl font-bold text-green-600">${commissionSummary.pendingPayout.toFixed(2)}</p>
                         {/* TODO: Explain payout process/schedule (e.g., e-Transfer monthly) */} 
                     </div>
                 </div>
            </div>
        </div>

        {/* Commissions History Table */} 
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
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
                        {comm.orderId && <Link href={`/dashboard/orders/${comm.orderId}`} className="hover:underline">Order #{comm.orderId.split('-')[1]}</Link>}
                        {comm.referredUserName && ` (User: ${comm.referredUserName})`}
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
        
         {/* Referred Users List (Optional) */} 
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
             <h2 className="text-xl font-semibold text-gray-700 p-6 border-b">Your Referrals</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referred Sales</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.length > 0 ? (
                  referrals.map((ref) => (
                    <tr key={ref.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${ref.totalSalesReferred.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">You haven't referred anyone yet.</td>
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
