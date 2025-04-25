'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout'; // Corrected path
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Corrected path & import type
import { logger } from '@/lib/logger'; // Corrected path

interface InventoryItem {
  id: string;
  productId: string;
  productName: string; // Need to fetch this based on productId
  quantity: number;
  location: string; // Or specific location field if needed
  lastUpdated: string;
}

export default function DistributorInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API call to fetch distributor inventory
        const response = await fetch('/api/distributor/inventory');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch inventory');
        }
        const data = await response.json();
        setInventory(data);

      } catch (err) {
        logger.error('Failed to fetch distributor inventory:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    // Removed userRole prop as DashboardLayout gets it from context
    <DashboardLayout> 
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Management</h1>

      {isLoading && <LoadingSpinner />} 
      {error && <p className="text-red-500">Error loading inventory: {error}</p>}

      {!isLoading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  {/* Add more columns as needed, e.g., Location, SKU */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  {/* Maybe Actions like Request Stock? */}
                  {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.length > 0 ? (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">ID: {item.productId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.lastUpdated).toLocaleString()}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">Request</button> 
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No inventory items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* TODO: Add Low Stock Alerts section */}
      {/* TODO: Add Inventory Request section/button */}
      {/* TODO: Add Inventory Reporting section/button */}
    </DashboardLayout>
  );
}
