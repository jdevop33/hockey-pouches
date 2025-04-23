'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; 
import { useAuth } from '@/context/AuthContext'; 

// Placeholder Types
type Variation = { id: string; name: string; strength: string; price: number; stock?: number }; 
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
  // We don't fetch these complex types in the basic product detail API yet
  // images?: string[]; 
  // variations?: Variation[]; 
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
  }, [user, token, productId, router, logout]); // Removed authLoading dependency here
  
  // --- Handlers --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let finalValue: string | number | boolean | null = value;
      if (type === 'checkbox') {
          finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number' || name === 'price' || name === 'compare_at_price' || name === 'strength') {
          // Allow empty string for optional numbers, otherwise parse
          finalValue = value === '' ? null : parseFloat(value);
          if (value !== '' && isNaN(finalValue as number)) {
              finalValue = editData[name as keyof ProductDetails]; // Revert if invalid number
          }
      }
      setEditData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product || !token) return;
      setIsSaving(true);
      setError(null);
      
      // Construct payload with only changed, valid fields
      // Explicitly type payload to satisfy TS
      const payload: { [K in keyof ProductDetails]?: ProductDetails[K] } = {}; 
      let hasChanges = false;
      
      (Object.keys(editData) as Array<keyof ProductDetails>).forEach(key => {
          // Skip complex fields or ID
          if (key === 'id') return; 
          
          // Normalize empty strings to null for nullable fields
          let editVal = editData[key];
          if (editVal === '' && ['description', 'category', 'image_url', 'compare_at_price', 'strength'].includes(key)) {
              editVal = null;
          }
          
          // Check if value actually changed
          if (editVal !== product[key]) {
              // Type assertion might be needed if TS still struggles
              payload[key] = editVal as any; 
              hasChanges = true;
          }
      });

      // Validate required fields in the *payload* (only if they are being changed)
      if (payload.name !== undefined && !payload.name?.trim()) {
          setError("Name cannot be empty."); setIsSaving(false); return;
      }
       if (payload.price !== undefined && (payload.price === null || isNaN(payload.price) || payload.price < 0)) {
          setError("Invalid Price."); setIsSaving(false); return;
      }
       if (payload.strength !== undefined && payload.strength !== null && (isNaN(payload.strength) || payload.strength <= 0)) {
          setError("Invalid Strength."); setIsSaving(false); return;
      }
      
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

  if (authLoading || isLoadingData) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!user || user.role !== 'Admin') return <Layout><div className="p-8">Access Denied.</div></Layout>;
  if (error && !product) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>; // Show error only if product failed to load
  if (!product) return <Layout><div className="p-8">Product not found.</div></Layout>; // Product load finished but not found

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-8">
         <div className="mb-6"><Link href="/admin/dashboard/products" className="text-primary-600 hover:text-primary-700">&larr; Back to Products</Link></div>
         <form onSubmit={handleSaveChanges}>
            <div className="flex justify-between items-center mb-6"> {/* ... Header ... */}</div>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>} {/* Show save errors */} 
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                {/* ... Form Fields using editData ... */} 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                         <input type="text" id="name" name="name" value={editData.name || ''} onChange={handleInputChange} readOnly={!isEditing} required className={`...`} />
                     </div>
                     <div>
                         <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         <input type="text" id="category" name="category" value={editData.category || ''} onChange={handleInputChange} readOnly={!isEditing} className={`...`} />
                     </div>
                 </div>
                 <div>
                     <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                     <textarea id="description" name="description" rows={4} value={editData.description || ''} onChange={handleInputChange} readOnly={!isEditing} className={`...`} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <label htmlFor="price" className="block text-sm font-medium text-gray-700">Base Price ($)</label>
                         <input type="number" step="0.01" id="price" name="price" value={editData.price ?? ''} onChange={handleInputChange} readOnly={!isEditing} required className={`...`} />
                     </div>
                      <div>
                         <label htmlFor="compare_at_price" className="block text-sm font-medium text-gray-700">Compare At Price ($)</label>
                         <input type="number" step="0.01" id="compare_at_price" name="compare_at_price" value={editData.compare_at_price ?? ''} onChange={handleInputChange} readOnly={!isEditing} className={`...`} />
                     </div>
                      <div>
                         <label htmlFor="strength" className="block text-sm font-medium text-gray-700">Strength (mg)</label>
                         <input type="number" id="strength" name="strength" value={editData.strength ?? ''} onChange={handleInputChange} readOnly={!isEditing} className={`...`} />
                     </div>
                     <div className="flex items-center pt-6">
                         <input type="checkbox" id="is_active" name="is_active" checked={editData.is_active || false} onChange={handleInputChange} disabled={!isEditing} className="h-4 w-4 rounded ..." />
                         <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
                     </div>
                 </div>
                 <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" id="image_url" name="image_url" value={editData.image_url || ''} onChange={handleInputChange} readOnly={!isEditing} className={`...`} />
                 </div>
            </div>
        </form>
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">{/* Variations Section Placeholder */}</div>
      </div>
    </Layout>
  );
}
