'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; // Using alias
import { useAuth } from '@/context/AuthContext'; // Using alias

// Placeholder Type
type AdminProduct = {
  id: string; // Assuming string ID from API/DB now
  name: string;
  category: string;
  price: number;
  stock?: number; 
  isActive: boolean;
};

export default function AdminProductsPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook
  const router = useRouter(); // Use router if needed for redirects
  
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Data Fetching Effect
  useEffect(() => {
    if (!authLoading && user && token && user.role === 'Admin') {
      const loadProducts = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          // TODO: API call to /api/admin/products?page={currentPage}...
          const response = await fetch(`/api/admin/products?page=${currentPage}&limit=15`, {
               headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; }
             throw new Error(`Failed to fetch products (${response.status})`);
          }
          const data = await response.json();
          
          // Assuming API returns string IDs now
          setProducts(data.products || []);
          setTotalPages(data.pagination?.totalPages || 1);

        } catch (err: any) {
          setError('Failed to load products.');
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadProducts();
    } else if (!authLoading) {
         setIsLoadingData(false);
    }
  }, [user, token, authLoading, currentPage, router, logout]); 

   const handlePageChange = (newPage: number) => { /* ... */ };
   const handleAddProduct = () => { /* ... */ };
   const handleEditProduct = (productId: string) => { /* ... */ };
   const handleDeleteProduct = async (productId: string) => { /* ... */ };

  // Render Loading / Unauthorized states
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8">Loading products...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         {/* Header + Add Button */} 
         <div className="flex justify-between items-center mb-6">{/* ... */}</div>
         {/* Filters */} 
         <div className="mb-6 p-4 bg-white rounded-md shadow">Filters Placeholder</div>
         {error && <p className="text-red-500 mb-4">Error: {error}</p>}
         <div className="bg-white shadow-md rounded-lg overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             {/* Table Head */} 
             <thead className="bg-gray-50">{/* ... */}</thead>
             {/* Table Body */} 
             <tbody className="bg-white divide-y divide-gray-200">
               {products.length > 0 ? (
                 products.map((product) => (
                   <tr key={product.id}>
                     {/* ... table cells ... */} 
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${product.price.toFixed(2)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{product.stock ?? 'N/A'}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                         <button onClick={() => handleEditProduct(product.id)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                         <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                       </td>
                   </tr>
                 ))
               ) : (
                 <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td></tr>
               )}
             </tbody>
           </table>
           {/* Pagination */} 
           <div className="p-4 border-t">Pagination Placeholder</div>
         </div>
       </div>
    </Layout>
  );
}
