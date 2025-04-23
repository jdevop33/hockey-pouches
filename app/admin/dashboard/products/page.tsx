'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
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
  const [showAddModal, setShowAddModal] = useState(false); // Placeholder for modal

  // Function to fetch products
  const loadProducts = async (page = 1) => {
    setIsLoadingData(true);
    setError(null);
    setActionError(null); // Clear action errors on reload
    try {
      const query = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          // TODO: Add filters
      }).toString();
      
      const response = await fetch(`/api/admin/products?${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
          if (response.status === 401) { logout(); router.push('/login'); return; }
          throw new Error(`Failed to fetch products (${response.status})`);
      }
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(data.pagination?.page || 1);

    } catch (err: any) {
      setError('Failed to load products.');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

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
  }, [user, token, authLoading, currentPage]); // Removed router, logout dependencies here

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- CRUD Handlers --- 
  const handleAddProduct = () => { 
      // TODO: Implement actual modal logic
      alert('Open Add Product Modal (Not Implemented)'); 
      // After successful add in modal, call loadProducts() to refresh
  };
  
  const handleEditProduct = (productId: number) => {
       router.push(`/admin/dashboard/products/${productId}`); 
  };
  
  const handleDeleteProduct = async (productId: number, productName: string) => {
       setActionError(null); // Clear previous errors
       if (!confirm(`Are you sure you want to deactivate product #${productId} (${productName})?`)) return;
       
       console.log(`Deactivating product ${productId}...`);
       try {
           const response = await fetch(`/api/admin/products/${productId}`, {
               method: 'DELETE',
               headers: { 'Authorization': `Bearer ${token}` }
           });
           if (!response.ok) {
               if (response.status === 401) { logout(); router.push('/login'); return; }
               const errData = await response.json();
               throw new Error(errData.message || `Failed to deactivate product (${response.status})`);
           }
            alert(`Product ${productName} deactivated successfully!`);
            // Refresh the list after successful deactivation
            loadProducts(currentPage);
            // Alternative: Optimistic UI update
            // setProducts(products.filter(p => p.id !== productId)); 
       } catch (err: any) {
           console.error('Delete product error:', err);
           setActionError(err.message || 'Could not deactivate product.');
       }
  };

  // --- Render Logic --- 
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8">Loading products...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="flex justify-between items-center mb-6">
             <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
             <button onClick={handleAddProduct} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Add New Product</button>
         </div>
         {/* Filters Placeholder */} 
         <div className="mb-6 p-4 bg-white rounded-md shadow">Filters Placeholder</div>
         {/* Display Errors */} 
         {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Error loading products: {error}</p>}
         {actionError && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">Action Error: {actionError}</p>}
         
         <div className="bg-white shadow-md rounded-lg overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             {/* Table Head */} 
             <thead className="bg-gray-50">
                 <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                 </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {products.length > 0 ? (
                 products.map((product) => (
                   <tr key={product.id}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || '-'}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${product.price.toFixed(2)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                         <button onClick={() => handleEditProduct(product.id)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                         {/* Changed Delete to Deactivate to match API */} 
                         <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-600 hover:text-red-900">Deactivate</button>
                       </td>
                   </tr>
                 ))
               ) : (
                 <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td></tr>
               )}
             </tbody>
           </table>
           {/* Pagination Placeholder */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
         </div>
       </div>
    </Layout>
  );
}
