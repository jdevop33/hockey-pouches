'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout'; // Using alias
import { useAuth } from '@/context/AuthContext'; // Using alias

// Placeholder Type
type AdminOrder = {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  total: number;
  status: string; 
  distributorId?: string | null;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auth and Role Check Effect
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/admin/dashboard/orders');
      } else if (user.role !== 'Admin') {
        router.push('/dashboard'); // Redirect non-admins
      }
    }
  }, [user, token, authLoading, router]);

  // Data Fetching Effect
  useEffect(() => {
    if (!authLoading && user && token && user.role === 'Admin') {
      const loadOrders = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const query = new URLSearchParams({
             page: currentPage.toString(),
             limit: '15', 
             ...(filterStatus && { status: filterStatus }),
          }).toString();
          
          const response = await fetch(`/api/admin/orders?${query}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; }
             throw new Error(`Failed to fetch orders (${response.status})`);
          }
          const data = await response.json();
          
          setOrders(data.orders || []);
          setTotalPages(data.pagination?.totalPages || 1);

        } catch (err: any) {
           if (err.message?.includes('401')) { 
                logout();
                router.push('/login?redirect=/admin/dashboard/orders');
           } else {
               setError('Failed to load orders.');
               console.error(err);
           }
        } finally {
          setIsLoadingData(false);
        }
      };
      loadOrders();
    } else if (!authLoading) {
         setIsLoadingData(false);
    }
  }, [user, token, authLoading, currentPage, filterStatus, router, logout]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusColor = (status: string) => { /* ... */ };

  // Render Loading / Unauthorized states
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8">Loading orders...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  // Render Orders Table
  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>
        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">{/* ... */}</div>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... table ... */} 
          </table>
           {/* Pagination */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
        </div>
      </div>
    </Layout>
  );
}
