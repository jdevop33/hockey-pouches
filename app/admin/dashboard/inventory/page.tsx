'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

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
  const [filterLocation, setFilterLocation] = useState('');
  
  // State for adjustment action
  const [isAdjusting, setIsAdjusting] = useState<number | null>(null); // Store ID of item being adjusted
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Auth Check Effect --- 
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
        router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // --- Data Fetching Function --- 
  const loadInventory = async (page = pagination.page) => {
    // Ensure token/user are available before fetching
    if (!token || !user) {
        console.log("Inventory: Skipping fetch, no user/token");
        setIsLoadingData(false); // Stop loading if auth isn't ready
        return; 
    }
    console.log(`Inventory: Loading page ${page} with location filter: '${filterLocation}'`);
    setIsLoadingData(true);
    setError(null);
    setActionError(null); 
    try {
      const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(filterLocation && { location: filterLocation }),
      });
      const response = await fetch(`/api/admin/inventory?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
          if (response.status === 401) { logout(); router.push('/login'); return; }
          const errData = await response.json().catch(() => ({ message: 'Failed to fetch inventory' }));
          throw new Error(errData.message || `Failed to fetch inventory (${response.status})`);
      }
      const data = await response.json();
      setInventory(data.inventory || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      // Use setCurrentPage if you have separate state for it, otherwise use pagination.page
      // setCurrentPage(data.pagination?.page || 1); 
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory.');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- Initial Data Load & Filter Change Effect --- 
  useEffect(() => {
    if (user && token && user.role === 'Admin') {
      loadInventory(1); // Load page 1 when filter changes or on initial load
    } else if (!authLoading) {
        setIsLoadingData(false); // Ensure loading stops if not authorized
    }
  }, [user, token, filterLocation]); // Depend on user/token and filters

   // --- Page Change Effect --- 
   useEffect(() => {
     if (user && token && user.role === 'Admin') {
        // Fetch data only when page changes (and not the initial load handled above)
        if (pagination.page !== 1 || !isLoadingData) { // Avoid refetch on initial mount if filter is also changing page to 1
             loadInventory(pagination.page); 
        }
     }
   }, [pagination.page]); // Only trigger refetch on page change

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // --- IMPLEMENTED ADJUST QUANTITY API CALL --- 
  const handleEditQuantity = async (item: InventoryItemAdmin) => {
      if (isAdjusting !== null || !token) return;

      const newQuantityStr = prompt(`Enter new quantity for ${item.productName} (${item.variationName || 'Base'}) at ${item.location}:`, item.quantity.toString());
      if (newQuantityStr === null) return;
      
      const reason = prompt('Reason for adjustment:');
      if (reason === null || reason.trim() === '') {
           alert('Adjustment reason is required.');
           return;
      }

      const qty = parseInt(newQuantityStr);
      if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
          alert('Invalid quantity. Please enter a non-negative whole number.');
          return;
      }

      setIsAdjusting(item.inventoryId);
      setActionError(null);
      
      console.log(`Calling API: PUT /api/admin/inventory/item/${item.inventoryId}`);
      try {
          const response = await fetch(`/api/admin/inventory/item/${item.inventoryId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Send auth token
              },
              body: JSON.stringify({ quantity: qty, reason: reason.trim() })
          });

          if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errData = await response.json();
              throw new Error(errData.message || `Failed to update quantity (${response.status})`);
          }
          
          alert('Quantity updated successfully! Reloading list...'); 
          loadInventory(pagination.page); // Refresh data on success

      } catch (err: any) {
          console.error('Adjust quantity error:', err);
          const errorMsg = `Item ${item.inventoryId}: ${err.message}` || 'Could not update quantity.';
          setActionError(errorMsg);
          alert(`Error: ${errorMsg}`);
      } finally {
          setIsAdjusting(null); 
      }
  };
  
  const handleInitiateTransfer = () => { alert('Initiate Transfer UI Needed'); };

  // --- Render Logic --- 
  if (authLoading) return <Layout><div className="p-8 text-center">Authenticating...</div></Layout>; // Separate auth loading
  if (!user || user.role !== 'Admin') return <Layout><div className="p-8 text-center">Access Denied.</div></Layout>; // Auth check complete, user not admin

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        {/* Header & Transfer Button */} 
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Inventory</h1>
            <button onClick={handleInitiateTransfer} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Initiate Transfer</button>
        </div>
        {/* Filters */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            {/* Location Filter */} 
        </div>
        {/* Error Display */} 
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error loading inventory: {error}</p>}
        {actionError && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Action Error: {actionError}</p>}

        {/* Inventory Table */} 
        {isLoadingData && !error && <div className="p-8 text-center">Loading inventory data...</div>} 
        {!isLoadingData && !error && (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                 {/* Table Head */} 
                 <thead className="bg-gray-50">{/* ... th elements ... */}</thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {inventory.length > 0 ? (
                     inventory.map((item) => (
                       <tr key={item.inventoryId} className={`${item.lowStockThreshold && item.quantity < item.lowStockThreshold ? 'bg-red-50' : ''}`}>
                         {/* ... Table Cells ... */} 
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                               <Image src={item.imageUrl || '/images/products/placeholder.svg'} alt={item.productName} width={32} height={32} className="h-8 w-8 rounded-md object-contain border p-0.5 mr-3" />
                              <Link href={`/admin/dashboard/products/${item.productId}`} className="hover:text-primary-600">{item.productName}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.variationName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                             <button 
                               onClick={() => handleEditQuantity(item)} 
                               className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                               disabled={isAdjusting === item.inventoryId} 
                             >
                               {isAdjusting === item.inventoryId ? 'Saving...' : 'Adjust Qty'}
                             </button>
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No inventory data found for selected filters.</td></tr>
                   )}
                 </tbody>
              </table>
               {/* Pagination Controls */} 
               {pagination.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"> {/* ... Pagination Buttons ... */} </div>
               )}
            </div>
        )}
      </div>
    </Layout>
  );
}
