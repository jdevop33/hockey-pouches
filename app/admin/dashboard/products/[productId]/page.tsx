'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; // Corrected relative path (5 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context

// Placeholder Types - Adapt as needed
type Variation = { id: string; name: string; strength: string; price: number; stock?: number }; // Stock might be handled via inventory route
type ProductDetails = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // Base price?
  isActive: boolean;
  images: string[]; // Array of image URLs
  variations: Variation[];
};

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const { user, loading: authLoading } = useAuth(); // Example
  const productId = params.productId as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [editData, setEditData] = useState<Partial<ProductDetails>>({}); // Store changes

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !productId) {
      // router.push('/login'); 
      return;
    }

    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API call to /api/admin/products/[productId]
        // Use admin-specific endpoint if it differs from public one
        // const response = await fetch(`/api/admin/products/${productId}`);
        // if (!response.ok) throw new Error('Failed to fetch product');
        // const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data: ProductDetails = {
            id: productId,
            name: `Product ${productId}`, 
            description: 'This is a detailed description editable by the admin.',
            category: 'Sample Category',
            price: 9.99,
            isActive: true,
            images: ['/images/products/placeholder.svg'],
            variations: [
                { id: 'var-1', name: 'Flavor A', strength: '12mg', price: 9.99, stock: 50 },
                { id: 'var-2', name: 'Flavor B', strength: '6mg', price: 9.49, stock: 100 },
            ]
        };
        setProduct(data);
        setEditData(data); // Initialize edit form data

      } catch (err) {
        setError('Failed to load product details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [isAuthenticated, isAdmin, productId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      // Handle checkbox type for boolean fields like isActive
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setEditData(prev => ({ ...prev, [name]: val }));
  };
  
  const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      console.log('Saving changes...', editData);
      // TODO: Call PUT /api/admin/products/[productId] with editData
      try {
          // const response = await fetch(`/api/admin/products/${productId}`, { method: 'PUT', ... });
          // if (!response.ok) throw new Error('Failed to save');
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
          setProduct(editData as ProductDetails); // Update displayed data
          setIsEditing(false);
          alert('Changes saved!');
      } catch (err) { 
          alert('Failed to save changes.');
          console.error(err);
      }
  };
  
  // TODO: Implement Variation Management (Add/Edit/Delete Modals or Separate Section)
  const handleAddVariation = () => { alert('Open Add Variation Modal'); };
  const handleEditVariation = (variationId: string) => { alert(`Open Edit Variation Modal for ${variationId}`); };
  const handleDeleteVariation = (variationId: string) => { alert(`Delete Variation ${variationId}?`); };


  if (isLoading) {
    return <Layout><div className="p-8">Loading product details...</div></Layout>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Layout><div className="p-8">Access Denied.</div></Layout>;
  }
  if (error) {
    return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;
  }
  if (!product) {
     return <Layout><div className="p-8">Product not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="mb-6">
            <Link href="/admin/dashboard/products" className="text-primary-600 hover:text-primary-700">&larr; Back to Products</Link>
        </div>
        
        <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditing ? 'Edit Product' : 'Product Details'} - {product.name} 
                </h1>
                <div>
                    {isEditing ? (
                        <>
                             <button type="button" onClick={() => { setIsEditing(false); setEditData(product); }} className="mr-2 text-gray-600 hover:text-gray-800 py-2 px-4 rounded">
                                 Cancel
                             </button>
                             <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                 Save Changes
                             </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                            Edit Product
                        </button>
                    )}
                </div>
            </div>

            {/* Product Edit Form / Display View */} 
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                {/* Basic Info */} 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                         <input type="text" id="name" name="name" value={editData.name || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                         <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         <input type="text" id="category" name="category" value={editData.category || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                 </div>
                 <div>
                     <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                     <textarea id="description" name="description" rows={4} value={editData.description || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <label htmlFor="price" className="block text-sm font-medium text-gray-700">Base Price ($)</label>
                         <input type="number" step="0.01" id="price" name="price" value={editData.price || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div className="flex items-center pt-6">
                         <input type="checkbox" id="isActive" name="isActive" checked={editData.isActive || false} onChange={handleInputChange} disabled={!isEditing} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                         <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">Is Active (Visible to Customers)</label>
                     </div>
                 </div>
                 
                 {/* TODO: Image Management Section */} 
                 <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Images</h3>
                    <div className="text-sm text-gray-500">(Image upload/management UI placeholder)</div>
                 </div>
            </div>
        </form>
        
         {/* Variations Section */} 
         <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Product Variations</h2>
                 <button onClick={handleAddVariation} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded">
                    Add Variation
                 </button>
            </div>
             {product.variations.length > 0 ? (
                 <ul className="divide-y divide-gray-200">
                     {product.variations.map(variation => (
                         <li key={variation.id} className="py-3 flex justify-between items-center">
                             <div>
                                 <span className="font-medium text-gray-800">{variation.name} ({variation.strength})</span>
                                 <span className="text-sm text-gray-600 ml-4">Price: ${variation.price.toFixed(2)}</span>
                                  {/* Stock display might link to inventory page */} 
                                 {variation.stock !== undefined && <span className="text-sm text-gray-600 ml-4">Stock: {variation.stock}</span>}
                             </div>
                             <div className="space-x-3">
                                <button onClick={() => handleEditVariation(variation.id)} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</button>
                                <button onClick={() => handleDeleteVariation(variation.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                             </div>
                         </li>
                     ))}
                 </ul>
             ) : (
                 <p className="text-sm text-gray-500">No variations defined for this product.</p>
             )}
         </div>
      </div>
    </Layout>
  );
}
