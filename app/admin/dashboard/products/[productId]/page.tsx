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
  strength: number | null; 
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

  // --- Effects --- 
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
  }, [user, token, productId, router, logout]);
  
  // --- Handlers --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let finalValue: string | number | boolean | null = value;
      if (type === 'checkbox') {
          finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number' || name === 'price' || name === 'compare_at_price' || name === 'strength') {
          finalValue = value === '' ? null : parseFloat(value);
          if (value !== '' && isNaN(finalValue as number)) {
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
      
      (Object.keys(editData) as Array<keyof ProductDetails>).forEach(key => {
          if (key === 'id') return; 
          let currentVal = product[key];
          let editedVal = editData[key];
          if (editedVal === '' && ['description', 'category', 'image_url', 'compare_at_price', 'strength'].includes(key)) {
              editedVal = null;
          }
           if (typeof currentVal === 'number' && typeof editedVal === 'string') {
                editedVal = parseFloat(editedVal);
                if(isNaN(editedVal as number)) editedVal = null; 
           }
           if (editedVal === "") editedVal = null;

          if (editedVal !== currentVal) {
              // Explicitly type assignment based on key
              switch (key) {
                  case 'name':
                  case 'description':
                  case 'category':
                  case 'image_url':
                      payload[key] = editedVal as string | null;
                      break;
                  case 'price':
                  case 'compare_at_price':
                  case 'strength':
                      payload[key] = editedVal as number | null;
                      break;
                  case 'is_active':
                      payload[key] = editedVal as boolean;
                      break;
              }
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
            <div className="flex justify-between items-center mb-6"> {/* ... Header/Buttons ... */}</div>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>} 
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                 {/* ... Form Fields using editData ... */} 
            </div>
         </form>
         <div className="mt-8 bg-white shadow-lg rounded-lg p-6">{/* Variations Section Placeholder */}</div>
      </div>
    </Layout>
  );
}
