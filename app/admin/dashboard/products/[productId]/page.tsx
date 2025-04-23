'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout'; // Using alias
import { useAuth } from '@/context/AuthContext'; // Using alias

// Placeholder Types - Adapt as needed
type Variation = { id: string; name: string; strength: string; price: number; stock?: number };
type ProductDetails = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; 
  isActive: boolean;
  images: string[]; 
  variations: Variation[];
};

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Use auth hook
  const productId = params.productId as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editData, setEditData] = useState<Partial<ProductDetails>>({}); 

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
    if (!authLoading && user && token && user.role === 'Admin' && productId) {
      const loadProduct = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          // TODO: API call to /api/admin/products/[productId]
          const response = await fetch(`/api/admin/products/${productId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
             if (response.status === 401) { logout(); router.push('/login'); return; } 
             if (response.status === 404) { throw new Error('Product not found.'); }
             throw new Error(`Failed to fetch product (${response.status})`);
          }
          const data = await response.json();
          
          setProduct(data as ProductDetails); // Assuming API returns this structure
          setEditData(data); 

        } catch (err: any) {
          setError('Failed to load product details.');
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadProduct();
    } else if (!authLoading) {
         setIsLoadingData(false); 
    }
  }, [user, token, authLoading, productId, router, logout]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { /* ... */ };
  const handleSaveChanges = async (e: React.FormEvent) => { /* ... */ };
  const handleAddVariation = () => { /* ... */ };
  const handleEditVariation = (variationId: string) => { /* ... */ };
  const handleDeleteVariation = (variationId: string) => { /* ... */ };


  // Render Loading / Unauthorized states
  if (authLoading || isLoadingData) {
    return <Layout><div className="p-8">Loading product details...</div></Layout>;
  }
  if (!user || user.role !== 'Admin') {
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
         {/* Back Link */} 
         <div className="mb-6"><Link href="/admin/dashboard/products" className="text-primary-600 hover:text-primary-700">&larr; Back to Products</Link></div>
         <form onSubmit={handleSaveChanges}>
             {/* Header + Edit/Save Buttons */} 
             <div className="flex justify-between items-center mb-6">{/* ... */}</div>
             {/* Form/Display Area */} 
             <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                  {/* ... Form fields based on editData ... */} 
             </div>
         </form>
         {/* Variations Section */} 
         <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
              {/* ... Variations list and buttons ... */} 
         </div>
      </div>
    </Layout>
  );
}
