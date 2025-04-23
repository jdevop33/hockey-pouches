'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import Layout from '@/components/layout/NewLayout'; 
// import { useCart } from '@/context/CartContext'; // Temporarily comment out

// Define Product type (can be simplified for testing)
interface Product { id: number; name: string; price: number; image_url?: string | null; }
interface PaginationState { page: number; limit: number; total: number; totalPages: number; }

export default function ProductsPage() {
  // const { addToCart } = useCart(); // Temporarily comment out
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Comment out unused state for now
  // const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  // const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  // const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  // const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  useEffect(() => {
    console.log('*** Product Page useEffect IS RUNNING! ***'); // Basic check
    setIsLoading(false); // Set loading to false immediately for testing
    setProducts([{id: 1, name: "Test Product", price: 9.99, image_url: "/images/products/placeholder.svg"}]); // Set dummy data
    
    // Comment out API fetch logic for now
    /*
    const fetchProducts = async () => {
      // ... fetch logic ...
    };
    fetchProducts();
    */
    
  }, []); // Removed dependencies for initial test

  console.log('Render State:', { isLoading, error, productsLength: products.length }); 

  if (isLoading) {
      return <Layout><div className="p-8">Initial Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Our Products (Debug)</h1>
          {error && <div className="text-red-600 bg-red-100 p-3">Error: {error}</div>}
          {products.length > 0 ? (
              <div>
                  <p>Product list should appear below:</p>
                  {products.map(p => <div key={p.id}>{p.name} - ${p.price}</div>)}
              </div>
          ) : (
              <div>No products loaded (check console).</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
