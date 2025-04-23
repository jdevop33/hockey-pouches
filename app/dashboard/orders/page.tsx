'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import Layout from '../../components/layout/NewLayout'; 
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Placeholder type - replace with actual data type
type Order = { 
  id: string; 
  date: string; 
  total: number; 
  status: string; 
  itemCount: number; 
};

export default function OrdersListPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate data loading state
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Wait for auth state to load
    if (authLoading) return;
    
    // Redirect if not logged in
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // Fetch orders if authenticated
    const loadOrders = async (page: number) => {
      setIsLoadingData(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/me?page=${page}&limit=10`, { // Example with limit
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) { 
             if (response.status === 401) { logout(); router.push('/login'); return; }
             throw new Error(`Failed to fetch orders (${response.status})`);
        }
        const data = await response.json();
        
        setOrders(data.orders || []); // Adjust based on actual API response
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);

      } catch (err: any) {
        setError('Failed to load orders.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadOrders(currentPage);
    
  }, [user, token, authLoading, currentPage, router, logout]);

   // Display loading state
   if (authLoading || isLoadingData) {
     return <Layout><div className="p-8">Loading orders...</div></Layout>;
   }
   
   // User should be defined here if loading is done and authenticated
   if (!user) { 
       // Should have been redirected, but render fallback just in case
       return <Layout><div className="p-8">Please log in to view orders.</div></Layout>; 
   }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
             {/* ... table headers ... */} 
             <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    {/* ... table row data ... */} 
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.split('-')[1]}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                     <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span></td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemCount}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">${order.total.toFixed(2)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Link href={`/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">View</Link></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
           {/* ... Pagination Controls ... */} 
           {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  {/* ... pagination buttons ... */} 
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div><p className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></p></div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Previous</span>&lt;</button>
                          {/* TODO: Add page number buttons */} 
                          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Next</span>&gt;</button>
                        </nav>
                      </div>
                    </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
