'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminCommission = {
  id: string;
  userId: string;
  userName: string; // Denormalized likely
  orderId?: string;
  type: 'Referral Sale' | 'Fulfillment' | 'Wholesale Referral' | 'Bonus';
  amount: number;
  status: 'Pending Payout' | 'Paid' | 'Cancelled';
  earnedDate: string;
  payoutDate?: string | null;
  payoutBatchId?: string | null;
};

export default function AdminCommissionsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (status, user, type, date range), sorting, search, pagination
  const [filterStatus, setFilterStatus] = useState(''); // e.g., 'Pending Payout'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set()); // For bulk payout
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadCommissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/commissions?status=...&page=...
        const query = new URLSearchParams({
           page: currentPage.toString(),
           limit: '15',
           ...(filterStatus && { status: filterStatus }),
           // Add other filters
        }).toString();
        // const response = await fetch(`/api/admin/commissions?${query}`);
        // if (!response.ok) throw new Error('Failed to fetch commissions');
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
             commissions: [
                 { id: 'comm-d1', userId: 'dist-1', userName: 'Vancouver Dist', type: 'Fulfillment', orderId: 'order-xyz', amount: 15.00, status: 'Pending Payout', earnedDate: '2023-10-26', payoutDate: null, payoutBatchId: null },
                 { id: 'comm-r1', userId: 'cust-1', userName: 'Alice Smith', type: 'Referral Sale', orderId: 'order-abc', amount: 2.78, status: 'Pending Payout', earnedDate: '2023-10-27', payoutDate: null, payoutBatchId: null },
                 { id: 'comm-d3', userId: 'dist-2', userName: 'Calgary Dist', type: 'Fulfillment', orderId: 'order-rst', amount: 20.00, status: 'Paid', earnedDate: '2023-10-15', payoutDate: '2023-10-20', payoutBatchId: 'batch-001' },
                 { id: 'comm-w1', userId: 'dist-1', userName: 'Vancouver Dist', type: 'Wholesale Referral', amount: 50.00, status: 'Pending Payout', earnedDate: '2023-10-28', payoutDate: null, payoutBatchId: null },
                 { id: 'comm-c1', userId: 'cust-2', userName: 'Bob Jones', type: 'Referral Sale', orderId: 'order-ghi', amount: 1.75, status: 'Cancelled', earnedDate: '2023-10-25', payoutDate: null, payoutBatchId: null },
             ],
             pagination: { page: currentPage, totalPages: 7, total: 100 }
        };
         // Assert types for status and type
        const typedCommissions = data.commissions.map(c => ({
            ...c,
            type: c.type as AdminCommission['type'],
            status: c.status as AdminCommission['status'],
        })) as AdminCommission[];

        setCommissions(typedCommissions);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load commissions.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissions();
  }, [isAuthenticated, isAdmin, currentPage, filterStatus]); // Reload on page or filter change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSelectionChange = (commissionId: string, isSelected: boolean) => {
      setSelectedCommissions(prev => {
          const newSet = new Set(prev);
          if (isSelected) {
              newSet.add(commissionId);
          } else {
              newSet.delete(commissionId);
          }
          return newSet;
      });
  };
  
   const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            // Select only pending commissions on the current page
            const pendingIds = commissions.filter(c => c.status === 'Pending Payout').map(c => c.id);
            setSelectedCommissions(new Set(pendingIds));
        } else {
            setSelectedCommissions(new Set());
        }
    };
  
  const handlePayout = async () => {
      if (selectedCommissions.size === 0) {
          alert('Please select commissions to pay out.');
          return;
      }
      setIsPayoutLoading(true);
      setPayoutError(null);
      const idsToPayout = Array.from(selectedCommissions);
      console.log('Initiating payout for:', idsToPayout);
      try {
            // TODO: Call POST /api/admin/commissions/payout with { commissionIds: idsToPayout }
            // const response = await fetch('/api/admin/commissions/payout', {...});
            // if (!response.ok) { //... handle error }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            alert(`Payout processed successfully for ${idsToPayout.length} commissions (simulation).`);
            setSelectedCommissions(new Set()); // Clear selection
            // TODO: Refresh the commission list or update status locally
            window.location.reload(); // Simple refresh

      } catch(err: any) {
            setPayoutError(err.message || 'Payout failed.');
      } finally {
            setIsPayoutLoading(false);
      }
  };

   const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Pending Payout': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  if (isLoading) {
    return <Layout><div className="p-8">Loading commissions...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Commissions</h1>
            {/* Payout Button */} 
            <button 
              onClick={handlePayout}
              disabled={selectedCommissions.size === 0 || isPayoutLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isPayoutLoading ? 'Processing Payout...' : `Payout Selected (${selectedCommissions.size})`}
            </button>
        </div>

        {/* TODO: Add Filters (Status, User, Type, Date Range), Search Bar */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow flex space-x-4">
             <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                <select 
                    id="statusFilter" 
                    value={filterStatus} 
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); setSelectedCommissions(new Set()); }}
                    className="rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="Pending Payout">Pending Payout</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
             {/* Add more filters here */} 
             {payoutError && <p className="text-red-500 text-sm self-center">Payout Error: {payoutError}</p>}
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     <input 
                        type="checkbox" 
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        // TODO: Determine indeterminate state 
                        className="rounded"
                     /> 
                 </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earned Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Info</th>
                 {/* Maybe remove Actions column if handled via checkbox/bulk */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.length > 0 ? (
                commissions.map((comm) => (
                  <tr key={comm.id}>
                     <td className="px-6 py-4 whitespace-nowrap">
                         {comm.status === 'Pending Payout' && (
                             <input 
                                type="checkbox" 
                                checked={selectedCommissions.has(comm.id)}
                                onChange={(e) => handleSelectionChange(comm.id, e.target.checked)}
                                className="rounded"
                             />
                         )}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.earnedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/admin/dashboard/users/${comm.userId}`} className="hover:underline">{comm.userName}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {comm.orderId && <Link href={`/admin/dashboard/orders/${comm.orderId}`} className="hover:underline">Order #{comm.orderId.split('-')[1]}</Link>}
                         {/* Display other details based on type */} 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">${comm.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(comm.status)}`}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comm.payoutDate || '-'} 
                        {comm.payoutBatchId && <span className="text-xs"> (Batch: {comm.payoutBatchId})</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No commissions found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
           {/* TODO: Add Pagination Controls component */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
        </div>
      </div>
    </Layout>
  );
}
