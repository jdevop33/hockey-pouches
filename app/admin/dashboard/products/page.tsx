'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/NewLayout'; // Using relative path as alias might still be iffy
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Type
type AdminProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number; // Overall stock might be complex with variations/locations
  isActive: boolean;
};

export default function AdminProductsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filtering (category, status), sorting, search, pagination
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

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/products?page={currentPage}...
        // const response = await fetch(`/api/admin/products?page=${currentPage}&limit=15`);
        // if (!response.ok) throw new Error('Failed to fetch products');
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data = { // Simulated Response
             products: [
                { id: 'prod-1', name: 'Cool Mint Pouch (12mg)', category: 'Mint', price: 5.99, stock: 1000, isActive: true },
                { id: 'prod-2', name: 'Cherry Pouch (6mg)', category: 'Fruit', price: 6.49, stock: 500, isActive: true },
                { id: 'prod-old', name: 'Discontinued Flavor', category: 'Special', price: 4.99, stock: 0, isActive: false },
             ],
             pagination: { page: currentPage, totalPages: 5, total: 70 }
        };

        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);

      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [isAuthenticated, isAdmin, currentPage]); // Reload on page change

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // TODO: Implement Add/Edit Product Modals/Forms
  const handleAddProduct = () => { alert('Open Add Product Modal'); };
  const handleEditProduct = (productId: string) => { alert(`Open Edit Product Modal for ${productId}`); };
  const handleDeleteProduct = async (productId: string) => {
       if (!confirm(`Are you sure you want to delete product ${productId}? This might be irreversible.`)) return;
       console.log(`Deleting product ${productId}...`);
       // TODO: Call DELETE /api/admin/products/[productId]
       // Handle success/error and refresh list
       alert(`Product ${productId} deleted (simulation).`);
       setProducts(products.filter(p => p.id !== productId)); // Optimistic UI update
  };


  if (isLoading) {
    return <Layout><div className="p-8">Loading products...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
            <button 
              onClick={handleAddProduct}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Add New Product
            </button>
        </div>

        {/* TODO: Add Filters (Category, Status), Search Bar */} 
        <div className="mb-6 p-4 bg-white rounded-md shadow">
            Filters Placeholder
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* TODO: Add checkbox for bulk actions? */} 
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${product.price.toFixed(2)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{product.stock ?? 'N/A'}</td> {/* Handle complex stock later */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditProduct(product.id)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      {/* TODO: Add View link? */} 
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td>
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
