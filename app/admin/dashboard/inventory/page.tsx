'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout'; // Use alias
import { useAuth } from '@/context/AuthContext'; // Use alias

// Type matches API response
interface InventoryItemAdmin {
  inventoryId: number; 
  productId: number;   
  productName: string; 
  variationName?: string | null; 
  location: string;
  quantity: number;
  lowStockThreshold?: number | null; 
  imageUrl?: string | null; 
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [inventory, setInventory] = useState<InventoryItemAdmin[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filters (location, product, lowStock)
  const [filterLocation, setFilterLocation] = useState('');
  
  // Auth Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
        router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // Data Fetching
  useEffect(() => {
    if (user && token && user.role === 'Admin') {
        const loadInventory = async () => {
            setIsLoadingData(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    ...(filterLocation && { location: filterLocation }),
                    // TODO: Add other filters
                });
                const response = await fetch(`/api/admin/inventory?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    if (response.status === 401) { logout(); router.push('/login'); return; }
                    throw new Error(`Failed to fetch inventory (${response.status})`);
                }
                const data = await response.json();
                setInventory(data.inventory || []);
                setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
            } catch (err: any) {
                setError(err.message || 'Failed to load inventory.');
                console.error(err);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInventory();
    }
  }, [user, token, pagination.page, pagination.limit, filterLocation, logout, router]); // Re-fetch on filter/page change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleEditQuantity = (item: InventoryItemAdmin) => {
      const newQuantity = prompt(`Enter new quantity for ${item.productName} (${item.variationName || 'Base'}) at ${item.location}:`, item.quantity.toString());
      const reason = prompt('Reason for adjustment:');
      if (newQuantity !== null && reason) {
          const qty = parseInt(newQuantity);
          if (!isNaN(qty) && qty >= 0) {
              console.log(`Updating inventory ${item.inventoryId} to ${qty}. Reason: ${reason}`);
              // TODO: Call PUT /api/admin/inventory/item/[inventoryId] with { quantity: qty, reason: reason } and token
              // Handle success/error and refresh list: loadInventory(pagination.page);
              alert('Quantity updated (simulation).');
          } else {
              alert('Invalid quantity.');
          }
      } 
      // Removed unnecessary else alert from placeholder
  };
  
  const handleInitiateTransfer = () => {
      alert('Open Initiate Inventory Transfer Modal (Not Implemented)');
  };

  if (authLoading || isLoadingData) return <Layout><div className="p-8 text-center">Loading inventory...</div></Layout>;
  if (!user || user.role !== 'Admin') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Inventory</h1>
             <button onClick={handleInitiateTransfer} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Initiate Transfer
            </button>
        </div>

        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            <label htmlFor="locationFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Location:</label>
            <select id="locationFilter" value={filterLocation} onChange={e => { setFilterLocation(e.target.value); setPagination(prev => ({ ...prev, page: 1})); }} className="rounded-md border-gray-300 shadow-sm sm:text-sm">
                 <option value="">All Locations</option>
                 <option value="Vancouver">Vancouver</option>
                 <option value="Calgary">Calgary</option>
                 <option value="Edmonton">Edmonton</option>
                 <option value="Toronto">Toronto</option>
                 {/* Add other locations if needed */} 
            </select>
             {/* TODO: Add Product Filter, Low Stock Filter */} 
        </div>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  // TODO: Add low stock highlighting based on threshold
                  <tr key={item.inventoryId} > 
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                       <Image src={item.imageUrl || '/images/products/placeholder.svg'} alt={item.productName} width={32} height={32} className="h-8 w-8 rounded-md object-contain border p-0.5 mr-3" />
                      <Link href={`/admin/dashboard/products/${item.productId}`} className="hover:text-primary-600">{item.productName}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.variationName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditQuantity(item)} className="text-indigo-600 hover:text-indigo-900">Adjust Qty</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No inventory data found.</td></tr>
              )}
            </tbody>
          </table>
           {/* Pagination */} 
           {pagination.totalPages > 1 && (
               <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"> {/* ... Pagination Controls ... */} </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
