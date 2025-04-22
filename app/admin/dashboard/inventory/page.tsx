'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type InventoryItem = {
  inventoryId: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  location: string; // e.g., 'Warehouse A', 'Vancouver', 'Calgary' etc.
  quantity: number;
  lowStockThreshold?: number; // Optional: For highlighting
};

export default function AdminInventoryPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (location, product, low stock), sorting, search, pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/inventory?page={currentPage}...
        // const response = await fetch(`/api/admin/inventory?page=${currentPage}&limit=20`);
        // if (!response.ok) throw new Error('Failed to fetch inventory');
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
             inventory: [
                 { inventoryId: 'inv-1', productId: 'prod-1', productName: 'Cool Mint (12mg)', variationId: 'var-1a', variationName: '12mg', location: 'Vancouver', quantity: 150, lowStockThreshold: 50 },
                 { inventoryId: 'inv-2', productId: 'prod-2', productName: 'Cherry (6mg)', variationId: 'var-2a', variationName: '6mg', location: 'Vancouver', quantity: 25, lowStockThreshold: 30 }, // Low stock example
                 { inventoryId: 'inv-3', productId: 'prod-1', productName: 'Cool Mint (12mg)', variationId: 'var-1a', variationName: '12mg', location: 'Calgary', quantity: 300, lowStockThreshold: 50 },
                 { inventoryId: 'inv-4', productId: 'prod-3', productName: 'Berry (12mg)', variationId: 'var-3a', variationName: '12mg', location: 'Toronto', quantity: 500, lowStockThreshold: 100 },
             ],
             pagination: { page: currentPage, totalPages: 4, total: 75 }
        };

        setInventory(data.inventory);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load inventory data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, [isAuthenticated, isAdmin, currentPage]); // Reload on page change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // TODO: Implement Edit Quantity Modal/Form & Transfer Modal/Form
  const handleEditQuantity = (item: InventoryItem) => {
      const newQuantity = prompt(`Enter new quantity for ${item.productName} (${item.variationName || ''}) at ${item.location}:`, item.quantity.toString());
      const reason = prompt('Reason for adjustment:');
      if (newQuantity !== null && reason) {
          const qty = parseInt(newQuantity);
          if (!isNaN(qty) && qty >= 0) {
              console.log(`Updating inventory ${item.inventoryId} to ${qty}. Reason: ${reason}`);
              // TODO: Call PUT /api/admin/inventory/[inventoryId] with { quantity: qty, reason: reason }
              // Handle success/error and refresh list
              alert('Quantity updated (simulation).');
          } else {
              alert('Invalid quantity.');
          }
      } else {
          alert('Quantity and reason are required for adjustment.');
      }
  };
  
  const handleInitiateTransfer = () => {
      alert('Open Initiate Inventory Transfer Modal');
      // TODO: Implement modal to collect product, variation, qty, fromLocation, toLocation
      // Then call POST /api/admin/inventory/transfer
  };


  if (isLoading) {
    return <Layout><div className="p-8">Loading inventory...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Inventory</h1>
            {/* TODO: Add Initiate Transfer button? */} 
             <button 
              onClick={handleInitiateTransfer}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Initiate Transfer
            </button>
        </div>

        {/* TODO: Add Filters (Location, Product, Low Stock), Search Bar */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            Filters Placeholder (Location, Product, Low Stock Only)
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th> */} 
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.inventoryId} className={`${item.lowStockThreshold && item.quantity < item.lowStockThreshold ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/admin/dashboard/products/${item.productId}`} className="hover:text-primary-600">{item.productName}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.variationName || 'N/A'} 
                      {/* TODO: Link to variation if possible */} 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{item.quantity}</td>
                     {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.lowStockThreshold ?? '-'}</td> */} 
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditQuantity(item)} className="text-indigo-600 hover:text-indigo-900">Adjust Qty</button>
                       {/* Add other actions like View History? */} 
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No inventory data found.</td>
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
