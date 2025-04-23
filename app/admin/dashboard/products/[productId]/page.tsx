'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

// Define Product type for this page
type ProductDetails = {
  id: number; 
  name: string;
  description: string | null;
  category: string | null;
  price: number; 
  compare_at_price: number | null;
  is_active: boolean;
  image_url: string | null;
  strength: number | null; // Added missing strength
  // Complex types might be fetched separately or not needed for basic edit
  // images?: string[]; 
  // variations?: any[]; // Use specific type if needed
};

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const productIdString = params.productId as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editData, setEditData] = useState<Partial<ProductDetails>>({}); 
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects for Auth and Data Fetching --- 
  useEffect(() => {
    if (!authLoading && (!user || !token || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard'); 
    }
  }, [user, token, authLoading, router]);

  useEffect(() => {
    if (user && token && user.role === 'Admin' && productId) {
      const loadProduct = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/products/${productId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; } 
             if (response.status === 404) { throw new Error('Product not found.'); }
             throw new Error(`Failed to fetch product (${response.status})`);
          }
          const data = await response.json();
          setProduct(data as ProductDetails);
          setEditData(data); 
        } catch (err: any) {
          setError(err.message || 'Failed to load product details.');
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadProduct();
    }
  }, [user, token, productId, router, logout]); // Removed authLoading here, handled in separate effect
  
  // --- Handlers --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let finalValue: string | number | boolean | null = value;
      if (type === 'checkbox') {
          finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number' || name === 'price' || name === 'compare_at_price' || name === 'strength') {
          finalValue = value === '' ? null : parseFloat(value);
          if (value !== '' && isNaN(finalValue as number)) {
              // Revert if not a valid number (or handle error differently)
              finalValue = name in editData ? editData[name as keyof ProductDetails] : null;
          }
      }
      setEditData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product || !token) return;
      setIsSaving(true);
      setError(null);
      
      const payload: Partial<ProductDetails> = {}; 
      let hasChanges = false;
      
      // Compare editData with original product state to build payload
      (Object.keys(editData) as Array<keyof ProductDetails>).forEach(key => {
          if (key === 'id') return; 
          
          let currentVal = product[key];
          let editedVal = editData[key];

          // Normalize empty strings to null for comparison and payload
          if (editedVal === '' && ['description', 'category', 'image_url', 'compare_at_price', 'strength'].includes(key)) {
              editedVal = null;
          }
           // Handle potential number vs string comparison issue for price/strength
           if (typeof currentVal === 'number' && typeof editedVal === 'string') {
                editedVal = parseFloat(editedVal);
                if(isNaN(editedVal as number)) editedVal = null; // Treat invalid parse as null
           }
           if (editedVal === "") editedVal = null; // Treat empty string as null generally if allowed

          if (editedVal !== currentVal) {
               // Type casting here should be safe if validation below passes
              payload[key] = editedVal as any; // Using 'as any' here as TS struggles with the dynamic key typing
              hasChanges = true;
          }
      });

      // --- Validation on the payload --- 
      if (payload.name !== undefined && !payload.name?.trim()) {
          setError("Name cannot be empty."); setIsSaving(false); return;
      }
       if (payload.price !== undefined && (payload.price === null || isNaN(payload.price) || payload.price < 0)) {
          setError("Invalid Price."); setIsSaving(false); return;
      }
       // Allow strength to be null
       if (payload.strength !== undefined && payload.strength !== null && (isNaN(payload.strength) || payload.strength <= 0)) {
          setError("Invalid Strength."); setIsSaving(false); return;
      }
      // Add other validations... 
      
      if (!hasChanges) {
          setIsEditing(false); 
          setIsSaving(false);
          return;
      }
      
      console.log('Saving changes...', payload);
      try {
          const response = await fetch(`/api/admin/products/${productId}`, { 
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
           });
          if (!response.ok) {
              if (response.status === 401) { logout(); router.push('/login'); return; }
              const errData = await response.json();
              throw new Error(errData.message || 'Failed to save changes');
          }
          const updatedProductData = await response.json();
          setProduct(updatedProductData as ProductDetails);
          setEditData(updatedProductData);
          setIsEditing(false);
          alert('Changes saved!');
      } catch (err: any) { 
          setError(err.message || 'Failed to save changes.');
          console.error(err);
      } finally {
          setIsSaving(false);
      }
  };
  
  const handleAddVariation = () => { alert('Add Variation UI Needed'); };
  const handleEditVariation = (variationId: string) => { alert(`Edit Variation ${variationId} UI Needed`); };
  const handleDeleteVariation = (variationId: string) => { alert(`Delete Variation ${variationId}? API Call Needed`); };

  // --- Render Logic --- 
  if (authLoading || isLoadingData) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!user || user.role !== 'Admin') return <Layout><div className="p-8">Access Denied.</div></Layout>;
  if (error && !product) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>; 
  if (!product) return <Layout><div className="p-8">Product not found.</div></Layout>; 

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="mb-6"><Link href="/admin/dashboard/products" className="text-primary-600 hover:text-primary-700">&larr; Back to Products</Link></div>
         <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6"> {/* ... Header ... */}</div>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>} 
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                 {/* ... Form Fields using editData, mapping name/description/category/price/strength/is_active/image_url ... */} 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                         <input type="text" id="name" name="name" value={editData.name || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div>
                         <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         <input type="text" id="category" name="category" value={editData.category || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                 </div>
                 <div>
                     <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                     <textarea id="description" name="description" rows={4} value={editData.description || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <label htmlFor="price" className="block text-sm font-medium text-gray-700">Base Price ($)</label>
                         <input type="number" step="0.01" id="price" name="price" value={editData.price ?? ''} onChange={handleInputChange} readOnly={!isEditing} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                      <div>
                         <label htmlFor="compare_at_price" className="block text-sm font-medium text-gray-700">Compare At Price ($)</label>
                         <input type="number" step="0.01" id="compare_at_price" name="compare_at_price" value={editData.compare_at_price ?? ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                      <div>
                         <label htmlFor="strength" className="block text-sm font-medium text-gray-700">Strength (mg)</label>
                         <input type="number" id="strength" name="strength" value={editData.strength ?? ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                     </div>
                     <div className="flex items-center pt-6">
                         <input type="checkbox" id="is_active" name="is_active" checked={editData.is_active || false} onChange={handleInputChange} disabled={!isEditing} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                         <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
                     </div>
                 </div>
                 <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" id="image_url" name="image_url" value={editData.image_url || ''} onChange={handleInputChange} readOnly={!isEditing} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${!isEditing ? 'bg-gray-100' : ''}`} />
                 </div>
            </div>
         </form>
         <div className="mt-8 bg-white shadow-lg rounded-lg p-6">{/* Variations Section Placeholder */}</div>
      </div>
    </Layout>
  );
}
