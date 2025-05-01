'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';

// Placeholder Type
type AdminProduct = {
  id: number; // Assuming SERIAL id from DB now
  name: string;
  category?: string | null;
  price: number;
  stock?: number; // This might still be complex
  is_active: boolean;
};

export default function AdminProductsPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null); // For delete errors
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Function to fetch products - wrapped in useCallback
  const loadProducts = useCallback(
    async (page = 1) => {
      setIsLoadingData(true);
      setError(null);
      setActionError(null); // Clear action errors on reload
      try {
        const query = new URLSearchParams({
          page: $1?.$2(),
          limit: '15',
          // TODO: Add filters
        }).toString();

        const response = await fetch(`/api/admin/products?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          throw new Error(`Failed to fetch products (${response.status})`);
        }
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.page || 1);
      } catch (err: unknown) {
        const error = err as Error;
        setError('Failed to load products.');
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    },
    [token, logout, router]
  );

  // Auth and Role Check Effect
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/admin/dashboard/products');
      } else if (user.role !== 'Admin') {
        router.push('/dashboard');
      }
    }
  }, [user, token, authLoading, router]);

  // Data Fetching Effect (depends on user and page)
  useEffect(() => {
    if (!authLoading && user && token && user.role === 'Admin') {
      loadProducts(currentPage);
    }
  }, [user, token, authLoading, currentPage, loadProducts]); // Added loadProducts to dependency array

  // --- CRUD Handlers ---
  const handleAddProduct = () => {
    // TODO: Implement actual modal logic
    alert('Open Add Product Modal (Not Implemented)');
    // After successful add in modal, call loadProducts() to refresh
  };

  const handleEditProduct = (productId: number) => {
    $1?.$2(`/admin/dashboard/products/${productId}`);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setActionError(null); // Clear previous errors
    if (!confirm(`Are you sure you want to deactivate product #${productId} (${productName})?`))
      return;

    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.message || `Failed to deactivate product (${response.status})`);
      }
      alert(`Product ${productName} deactivated successfully!`);
      // Refresh the list after successful deactivation
      loadProducts(currentPage);
      // Alternative: Optimistic UI update
      // setProducts(products.filter(p => p.id !== productId));
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Delete product error:', error);
      setActionError(errorMessage || 'Could not deactivate product.');
    }
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData) {
    return (
      <Layout>
        <div className="p-8">Loading products...</div>
      </Layout>
    );
  }
  if (!user || user.role !== 'Admin') {
    return (
      <Layout>
        <div className="p-8">Access Denied.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-100">Manage Products</h1>
          <button
            onClick={handleAddProduct}
            className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-500"
          >
            Add New Product
          </button>
        </div>
        {/* Filters Placeholder */}
        <div className="mb-6 rounded-md bg-gray-800 p-4 shadow-gold-sm">Filters Placeholder</div>
        {/* Display Errors */}
        {error && (
          <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">
            Error loading products: {error}
          </p>
        )}
        {actionError && (
          <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">Action Error: {actionError}</p>
        )}

        <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-gold-sm">
          <table className="min-w-full divide-y divide-gray-700">
            {/* Table Head */}
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
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {product.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-200">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {product.category || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-200">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          product.is_active
                            ? 'bg-green-900/40 text-green-300'
                            : 'bg-red-900/40 text-red-300'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="space-x-3 whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="text-gold-400 hover:text-gold-300"
                      >
                        Edit
                      </button>
                      {/* Changed Delete to Deactivate to match API */}
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-center space-x-2 border-t border-gray-700 p-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`rounded px-3 py-1 ${
                  currentPage === pageNum
                    ? 'bg-gold-500 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
