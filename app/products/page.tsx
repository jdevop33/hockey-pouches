'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import Layout from '../components/layout/NewLayout';
import { useCart } from '../context/CartContext';

interface Product {
    id: number;
    name: string;
    description?: string | null;
    flavor?: string | null;
    strength?: number | null;
    price: number; 
    compare_at_price?: number | null;
    image_url?: string | null; // Use image_url
    category?: string | null;
    is_active: boolean;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ProductsPage() {
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
            ...(selectedFlavor && { flavor: selectedFlavor }),
            ...(selectedStrength && { strength: selectedStrength.toString() }),
        });
        
        console.log(`Fetching /api/products?${params.toString()}`);
        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch products (${response.status})`);
        }
        const data = await response.json();
        
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });

      } catch (err: any) {
        setError(err.message || 'Could not load products.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
  }, [pagination.page, pagination.limit, selectedFlavor, selectedStrength]); 

  const availableFlavors = ['Mint', 'Fruit', 'Berry', 'Citrus', 'Apple mint', 'Cool mint', 'Peppermint', 'Cola', 'Spearmint', 'Watermelon', 'Cherry', 'Other']; // Updated placeholder
  const availableStrengths = [6, 12, 16, 22]; 

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1); 
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };
  
  const handlePageChange = (newPage: number) => {
      if(newPage >= 1 && newPage <= pagination.totalPages) {
          setPagination(prev => ({ ...prev, page: newPage }));
      }
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">{/* ... Header ... */}</div>
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">{/* ... Filters ... */}</div>
          
          {isLoading && <div className="text-center p-10">Loading products...</div>}
          {error && <div className="text-center p-10 text-red-600 bg-red-100 rounded">Error loading products: {error}</div>}

          {!isLoading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <div key={product.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
                   <Link href={`/products/${product.id}`} className="block group">
                     <div className="relative h-64 bg-gray-100 group-hover:opacity-75 transition-opacity">
                        <Image src={product.image_url || '/images/products/placeholder.svg'} alt={product.name} fill style={{ objectFit: 'contain' }} className="p-4"/> {/* Corrected: image_url */} 
                        {product.strength && <div className="absolute right-4 top-4"><span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">{product.strength}mg</span></div>}
                     </div>
                   </Link>
                  <div className="flex-grow p-6">{/* ... Product Info & Add to Cart ... */}</div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && !error && products.length === 0 && (
             <div className="rounded-lg bg-white p-8 text-center shadow-md">No products found matching your criteria.</div>
          )}
          {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center">{/* ... Pagination ... */}</div>
           )}
        </div>
      </div>
    </Layout>
  );
}
