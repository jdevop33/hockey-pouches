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

// Add new interface for transfer
interface TransferData {
  sourceInventoryId: number;
  targetLocation: string;
  quantity: number;
  reason: string;
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
  const loadInventory = async (page = pagination.page) => {
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
      if (pagination.page !== 1 || !isLoadingData) {
        // Avoid refetch on initial mount if filter is also changing page to 1
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
  if (authLoading)
    return (
      <Layout>
        <div className="p-8 text-center">Authenticating...</div>
      </Layout>
    ); // Separate auth loading
  if (!user || user.role !== 'Admin')
    return (
      <Layout>
        <div className="p-8 text-center">Access Denied.</div>
      </Layout>
    ); // Auth check complete, user not admin

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        {/* Header & Transfer Button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Manage Inventory</h1>
          <button
            onClick={() => handleInitiateTransfer()}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          >
            Initiate Transfer
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-md bg-white p-4 shadow">
          <div className="flex items-center space-x-4">
            <label htmlFor="locationFilter" className="font-medium text-gray-700">
              Filter by Location:
            </label>
            <select
              id="locationFilter"
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-500">
            Error loading inventory: {error}
          </p>
        )}
        {actionError && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-500">Action Error: {actionError}</p>
        )}

        {/* Inventory Table */}
        {isLoadingData && !error && (
          <div className="p-8 text-center">Loading inventory data...</div>
        )}
        {!isLoadingData && !error && (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Variation
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {inventory.length > 0 ? (
                  inventory.map(item => (
                    <tr
                      key={item.inventoryId}
                      className={`${item.lowStockThreshold && item.quantity < item.lowStockThreshold ? 'bg-red-50' : ''}`}
                    >
                      <td className="flex items-center whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        <Image
                          src={item.imageUrl || '/images/products/placeholder.svg'}
                          alt={item.productName}
                          width={32}
                          height={32}
                          className="mr-3 h-8 w-8 rounded-md border object-contain p-0.5"
                        />
                        <Link
                          href={`/admin/dashboard/products/${item.productId}`}
                          className="hover:text-primary-600"
                        >
                          {item.productName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.variationName || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditQuantity(item)}
                            className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isAdjusting === item.inventoryId}
                          >
                            {isAdjusting === item.inventoryId ? 'Saving...' : 'Adjust Qty'}
                          </button>

                          {item.quantity > 0 && (
                            <button
                              onClick={() => handleInitiateTransfer(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Transfer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No inventory data found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">First</span>«
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>‹
                      </button>

                      {/* Page numbers */}
                      {[...Array(pagination.totalPages).keys()].map(idx => {
                        const pageNum = idx + 1;
                        // Only show a few pages around current page
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={pagination.page === pageNum}
                              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                pagination.page === pageNum
                                  ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>›
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Last</span>»
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold">Transfer Inventory</h3>

              {actionError && (
                <div className="mb-4 rounded-md bg-red-100 p-3 text-red-600">{actionError}</div>
              )}

              <form onSubmit={handleTransferSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="quantity"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Quantity to Transfer
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={transferData.quantity}
                    onChange={e =>
                      setTransferData({
                        ...transferData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-md border p-2"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="targetLocation"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Target Location
                  </label>
                  <select
                    id="targetLocation"
                    value={transferData.targetLocation}
                    onChange={e =>
                      setTransferData({
                        ...transferData,
                        targetLocation: e.target.value,
                      })
                    }
                    className="w-full rounded-md border p-2"
                    required
                  >
                    <option value="">Select Target Location</option>
                    {availableLocations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-700">
                    Reason for Transfer
                  </label>
                  <textarea
                    id="reason"
                    value={transferData.reason}
                    onChange={e =>
                      setTransferData({
                        ...transferData,
                        reason: e.target.value,
                      })
                    }
                    className="w-full rounded-md border p-2"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseTransferModal}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={isTransferring}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isTransferring}
                  >
                    {isTransferring ? 'Processing...' : 'Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
