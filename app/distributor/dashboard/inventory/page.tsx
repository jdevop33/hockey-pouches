'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout'; // Corrected path
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Corrected path & import type
import { logger } from '@/lib/logger'; // Corrected path
import clsx from 'clsx'; // Import clsx for conditional classes

interface InventoryItem {
  id: string;
  productId: string;
  productName: string; 
  quantity: number;
  location: string; 
  lastUpdated: string;
}

const LOW_STOCK_THRESHOLD = 10; // Define the threshold for low stock

export default function DistributorInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
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

  const lowStockItems = inventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD);

  return (
    <DashboardLayout> 
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Management</h1>

      {isLoading && <LoadingSpinner />} 
      {error && <p className="text-red-500 mb-4">Error loading inventory: {error}</p>}

      {/* Optional: Display a summary of low stock items */}
      {!isLoading && !error && lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Alerts ({lowStockItems.length})</h2>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {lowStockItems.map(item => (
              <li key={`low-${item.id}`}>{item.productName} (Qty: {item.quantity})</li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.length > 0 ? (
                  inventory.map((item) => {
                    const isLowStock = item.quantity < LOW_STOCK_THRESHOLD;
                    return (
                      // Add conditional background/text color for low stock rows
                      <tr key={item.id} className={clsx({'bg-red-50 text-red-900': isLowStock})}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={clsx("text-sm font-medium", {'font-bold': isLowStock})}>{item.productName}</div>
                          <div className={clsx("text-sm", isLowStock ? 'text-red-700' : 'text-gray-500')}>ID: {item.productId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={clsx("text-sm", {'font-bold text-red-600': isLowStock})}>{item.quantity}</div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {item.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No inventory items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* TODO: Add Inventory Request section/button */}
      {/* TODO: Add Inventory Reporting section/button */}
    </DashboardLayout>
  );
}
