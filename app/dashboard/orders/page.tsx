'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout'; // Adjust layout import as needed
// import { useAuth } from '../../context/AuthContext'; // Example auth context

// Placeholder type - replace with actual data type
type Order = { 
  id: string; 
  date: string; 
  total: number; 
  status: string; 
  itemCount: number; 
};

export default function OrdersListPage() {
  // const { user, loading: authLoading } = useAuth(); // Example context usage
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // TODO: Implement proper authentication check and redirect if not logged in
  const isAuthenticated = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/login'); // Redirect if not logged in
      return;
    }

    const loadOrders = async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/orders/me?page={page}
        // const response = await fetch(`/api/orders/me?page=${page}&limit=10`); // Example with limit
        // if (!response.ok) throw new Error('Failed to fetch orders');
        // const data = await response.json();
        
        // Placeholder data simulation
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const data = {
           orders: [
             { id: 'order-789', date: '2023-10-26', total: 45.50, status: 'Shipped', itemCount: 3 },
             { id: 'order-654', date: '2023-10-20', total: 80.00, status: 'Delivered', itemCount: 5 },
             { id: 'order-543', date: '2023-09-15', total: 32.00, status: 'Delivered', itemCount: 2 },
             // Add more dummy orders if needed for pagination testing
           ],
           pagination: {
             page: page,
             limit: 10,
             total: 15, // Example total orders
             totalPages: 2 // Example total pages
           }
        };

        setOrders(data.orders);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load orders.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders(currentPage);
  }, [isAuthenticated, currentPage]);

   if (!isAuthenticated) {
     // This part might not be reached if redirect happens in useEffect
     return <Layout><div className="p-8">Redirecting to login...</div></Layout>;
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

        {isLoading && <p>Loading orders...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.split('-')[1]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
             {/* Pagination Controls */}
             {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                        <span className="sr-only">Previous</span>
                        &lt;
                      </button>
                      {/* TODO: Add page number buttons if needed */} 
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                        <span className="sr-only">Next</span>
                        &gt;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
