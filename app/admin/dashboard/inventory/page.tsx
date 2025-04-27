'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

// Add new interface for transfer
interface TransferData {
  sourceInventoryId: number;
  targetLocation: string;
  quantity: number;
  reason: string;
  newLocationName?: string; // Add for new location support
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
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState('');

  // State for adjustment action
  const [isAdjusting, setIsAdjusting] = useState<number | null>(null); // Store ID of item being adjusted
  const [actionError, setActionError] = useState<string | null>(null);

  // Add transfer state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<TransferData>({
    sourceInventoryId: 0,
    targetLocation: '',
    quantity: 0,
    reason: '',
  });
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  // --- Auth Check Effect ---
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // --- Data Fetching Function ---
  const loadInventory = useCallback(
    async (page = pagination.page) => {
      // Ensure token/user are available before fetching
      if (!token || !user) {
        console.log('Inventory: Skipping fetch, no user/token');
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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          const errData = await response
            .json()
            .catch(() => ({ message: 'Failed to fetch inventory' }));
          throw new Error(errData.message || `Failed to fetch inventory (${response.status})`);
        }
        const data = await response.json();
        setInventory(data.inventory || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });

        // Extract unique locations for transfer dropdown
        if (data.inventory && Array.isArray(data.inventory)) {
          const locations = [
            ...new Set(data.inventory.map((item: InventoryItemAdmin) => item.location)),
          ] as string[];
          setAvailableLocations(locations);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to load inventory.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    },
    [token, user, filterLocation, pagination.limit, pagination.page, logout, router]
  );

  // --- Initial Data Load & Filter Change Effect ---
  useEffect(() => {
    if (user && token && user.role === 'Admin') {
      loadInventory(1); // Load page 1 when filter changes or on initial load
    } else if (!authLoading) {
      setIsLoadingData(false); // Ensure loading stops if not authorized
    }
  }, [user, token, filterLocation, authLoading, loadInventory]); // Added missing dependencies

  // --- Page Change Effect ---
  useEffect(() => {
    if (user && token && user.role === 'Admin') {
      // Fetch data only when page changes (and not the initial load handled above)
      if (pagination.page !== 1 || !isLoadingData) {
        // Avoid refetch on initial mount if filter is also changing page to 1
        loadInventory(pagination.page);
      }
    }
  }, [pagination.page, user, token, isLoadingData, loadInventory]); // Added missing dependencies

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // --- IMPLEMENTED ADJUST QUANTITY API CALL ---
  const handleEditQuantity = async (item: InventoryItemAdmin) => {
    if (isAdjusting !== null || !token) return;

    const newQuantityStr = prompt(
      `Enter new quantity for ${item.productName} (${item.variationName || 'Base'}) at ${item.location}:`,
      item.quantity.toString()
    );
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
          Authorization: `Bearer ${token}`, // Send auth token
        },
        body: JSON.stringify({ quantity: qty, reason: reason.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.message || `Failed to update quantity (${response.status})`);
      }

      alert('Quantity updated successfully! Reloading list...');
      loadInventory(pagination.page); // Refresh data on success
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Adjust quantity error:', err);
      const errorMsg = `Item ${item.inventoryId}: ${error.message}` || 'Could not update quantity.';
      setActionError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsAdjusting(null);
    }
  };

  const handleInitiateTransfer = (item?: InventoryItemAdmin) => {
    if (item) {
      setTransferData({
        sourceInventoryId: item.inventoryId,
        targetLocation: '',
        quantity: Math.min(10, item.quantity), // Default to 10 or max available
        reason: '',
      });
    } else {
      setTransferData({
        sourceInventoryId: 0,
        targetLocation: '',
        quantity: 0,
        reason: '',
      });
    }
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferData({
      sourceInventoryId: 0,
      targetLocation: '',
      quantity: 0,
      reason: '',
    });
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Validation
    if (transferData.quantity <= 0) {
      setActionError('Transfer quantity must be greater than zero');
      return;
    }

    if (!transferData.targetLocation) {
      setActionError('Target location is required');
      return;
    }

    if (!transferData.reason.trim()) {
      setActionError('Reason for transfer is required');
      return;
    }

    setIsTransferring(true);
    setActionError(null);

    try {
      const response = await fetch('/api/admin/inventory/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }

        const errData = await response.json();
        throw new Error(errData.message || `Failed to transfer inventory (${response.status})`);
      }

      // Close modal and refresh inventory
      setIsTransferModalOpen(false);
      alert('Inventory transferred successfully!');
      loadInventory(pagination.page);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Transfer error:', err);
      setActionError(error.message || 'Failed to transfer inventory');
    } finally {
      setIsTransferring(false);
    }
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-100">Loading inventory...</div>
      </Layout>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-100">
          Access Denied. Admin privileges required.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-100">Inventory Management</h1>
          <div className="flex flex-wrap gap-2">
            <div>
              <label htmlFor="locationFilter" className="mr-2 text-sm font-medium text-gray-300">
                Filter Location:
              </label>
              <select
                id="locationFilter"
                value={filterLocation}
                onChange={e => {
                  setFilterLocation(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 sm:text-sm"
              >
                <option value="">All Locations</option>
                {availableLocations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleInitiateTransfer()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              New Transfer
            </button>
          </div>
        </div>
        {/* Display Errors */}
        {error && <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">Error: {error}</p>}
        {actionError && (
          <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">Action Error: {actionError}</p>
        )}

        {/* Inventory Table */}
        {isLoadingData && !error && (
          <div className="p-8 text-center">Loading inventory data...</div>
        )}
        {!isLoadingData && !error && (
          <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-300"
                  >
                    Quantity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {inventory.length > 0 ? (
                  inventory.map(item => (
                    <tr key={item.inventoryId} className="hover:bg-gray-750">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        #{item.inventoryId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.imageUrl ? (
                            <div className="mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                className="h-full w-full object-contain"
                                width={48}
                                height={48}
                              />
                            </div>
                          ) : (
                            <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-gray-700 bg-gray-900">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-200">
                              <Link
                                href={`/admin/dashboard/products/${item.productId}`}
                                className="hover:text-gold-400"
                              >
                                {item.productName}
                              </Link>
                            </div>
                            {item.variationName && (
                              <div className="text-sm text-gray-400">{item.variationName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {item.location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                        <span
                          className={`font-semibold ${item.quantity <= (item.lowStockThreshold || 5) ? 'text-red-400' : 'text-green-400'}`}
                        >
                          {item.quantity}
                        </span>
                        {item.lowStockThreshold && (
                          <span className="ml-1 text-xs text-gray-500">
                            (Threshold: {item.lowStockThreshold})
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEditQuantity(item)}
                          disabled={isAdjusting === item.inventoryId}
                          className="mr-3 text-gold-400 hover:text-gold-300 disabled:text-gray-500"
                        >
                          {isAdjusting === item.inventoryId ? 'Updating...' : 'Adjust Qty'}
                        </button>
                        <button
                          onClick={() => handleInitiateTransfer(item)}
                          disabled={isAdjusting === item.inventoryId || item.quantity <= 0}
                          className="text-gold-400 hover:text-gold-300 disabled:text-gray-500"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      No inventory items found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative ml-3 inline-flex items-center rounded border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>

                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                        <span className="font-medium">{pagination.totalPages}</span> (
                        {pagination.total} items)
                      </p>
                    </div>
                    <div>
                      <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">First</span>
                          &laquo;
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          &lsaquo;
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            // Show all pages if 5 or fewer total pages
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            // Near the start
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            // Near the end
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageNum = pagination.page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                pageNum === pagination.page
                                  ? 'z-10 bg-gold-500 text-gray-900 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500'
                                  : 'text-gray-300 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          &rsaquo;
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Last</span>
                          &raquo;
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>

              {/* Modal content */}
              <div className="inline-block transform overflow-hidden rounded-lg bg-gray-800 text-left align-bottom shadow-gold-sm transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <form onSubmit={handleTransferSubmit}>
                  <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 w-full text-left sm:mt-0">
                        <h3 className="text-lg font-medium leading-6 text-gray-100">
                          Transfer Inventory
                        </h3>
                        <div className="mt-4 space-y-4">
                          {/* Source Item - shows if not already set */}
                          {transferData.sourceInventoryId === 0 && (
                            <div>
                              <label
                                htmlFor="sourceInventoryId"
                                className="block text-sm font-medium text-gray-300"
                              >
                                Source Item
                              </label>
                              <select
                                id="sourceInventoryId"
                                value={transferData.sourceInventoryId}
                                onChange={e =>
                                  setTransferData({
                                    ...transferData,
                                    sourceInventoryId: parseInt(e.target.value),
                                  })
                                }
                                required
                                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                              >
                                <option value={0}>Select Item</option>
                                {inventory
                                  .filter(item => item.quantity > 0)
                                  .map(item => (
                                    <option key={item.inventoryId} value={item.inventoryId}>
                                      {item.productName}
                                      {item.variationName ? ` - ${item.variationName}` : ''} (
                                      {item.location}: {item.quantity} units)
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* Source Info - shown if pre-selected */}
                          {transferData.sourceInventoryId > 0 && (
                            <div className="rounded bg-gray-700 p-3 text-gray-200">
                              <h4 className="font-medium">Source Item</h4>
                              <p>
                                {
                                  inventory.find(
                                    item => item.inventoryId === transferData.sourceInventoryId
                                  )?.productName
                                }
                                {inventory.find(
                                  item => item.inventoryId === transferData.sourceInventoryId
                                )?.variationName
                                  ? ` - ${
                                      inventory.find(
                                        item => item.inventoryId === transferData.sourceInventoryId
                                      )?.variationName
                                    }`
                                  : ''}
                              </p>
                              <p className="text-sm text-gray-400">
                                Current Location:{' '}
                                {
                                  inventory.find(
                                    item => item.inventoryId === transferData.sourceInventoryId
                                  )?.location
                                }{' '}
                                (
                                {
                                  inventory.find(
                                    item => item.inventoryId === transferData.sourceInventoryId
                                  )?.quantity
                                }{' '}
                                units)
                              </p>
                            </div>
                          )}

                          {/* Target Location */}
                          <div>
                            <label
                              htmlFor="targetLocation"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Target Location
                            </label>
                            <select
                              id="targetLocation"
                              value={transferData.targetLocation}
                              onChange={e =>
                                setTransferData({ ...transferData, targetLocation: e.target.value })
                              }
                              required
                              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                            >
                              <option value="">Select Target Location</option>
                              {availableLocations.map(location => (
                                <option
                                  key={location}
                                  value={location}
                                  disabled={
                                    transferData.sourceInventoryId > 0 &&
                                    inventory.find(
                                      item => item.inventoryId === transferData.sourceInventoryId
                                    )?.location === location
                                  }
                                >
                                  {location}
                                  {transferData.sourceInventoryId > 0 &&
                                  inventory.find(
                                    item => item.inventoryId === transferData.sourceInventoryId
                                  )?.location === location
                                    ? ' (Current Location)'
                                    : ''}
                                </option>
                              ))}
                              <option value="new">+ Add New Location</option>
                            </select>
                          </div>

                          {/* New Location Field */}
                          {transferData.targetLocation === 'new' && (
                            <div>
                              <label
                                htmlFor="newLocation"
                                className="block text-sm font-medium text-gray-300"
                              >
                                New Location Name
                              </label>
                              <input
                                type="text"
                                id="newLocation"
                                placeholder="Enter new location name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                                onChange={e =>
                                  setTransferData({
                                    ...transferData,
                                    newLocationName: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}

                          {/* Quantity */}
                          <div>
                            <label
                              htmlFor="quantity"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Quantity to Transfer
                            </label>
                            <input
                              type="number"
                              id="quantity"
                              value={transferData.quantity}
                              onChange={e =>
                                setTransferData({
                                  ...transferData,
                                  quantity: parseInt(e.target.value),
                                })
                              }
                              min="1"
                              max={
                                transferData.sourceInventoryId > 0
                                  ? inventory.find(
                                      item => item.inventoryId === transferData.sourceInventoryId
                                    )?.quantity || 1
                                  : 1
                              }
                              required
                              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                            />
                          </div>

                          {/* Reason */}
                          <div>
                            <label
                              htmlFor="reason"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Reason for Transfer
                            </label>
                            <textarea
                              id="reason"
                              value={transferData.reason}
                              onChange={e =>
                                setTransferData({ ...transferData, reason: e.target.value })
                              }
                              required
                              rows={2}
                              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={isTransferring}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isTransferring ? 'Processing...' : 'Transfer'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseTransferModal}
                      disabled={isTransferring}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-base font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
