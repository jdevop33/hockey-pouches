'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import Layout from '@/components/layout/NewLayout'; 
// import { useCart } from '@/context/CartContext'; // Temporarily comment out
import { useAuth } from '@/context/AuthContext'; 

console.log('--- ProductsPage: Top level, imports done ---');

interface Product { /* ... */ 
id: number; name: string; description?: string | null; flavor?: string | null; strength?: number | null; price: number; compare_at_price?: number | null; image_url?: string | null; category?: string | null; is_active: boolean;
}
interface PaginationState { /* ... */ 
 page: number; limit: number; total: number; totalPages: number;
}

export default function ProductsPage() {
  console.log('--- ProductsPage: Component rendering START ---');
  
  // const { addToCart } = useCart(); // Temporarily comment out
  console.log('ProductsPage: Calling useAuth()...');
  const { user, token, isLoading: authLoading } = useAuth(); 
  console.log('ProductsPage: useAuth() finished.');
  
  console.log('ProductsPage: Calling useRouter()...');
  const router = useRouter();
  console.log('ProductsPage: useRouter() finished.');
  
  console.log('ProductsPage: Initializing state...');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  // const [addedToCartId, setAddedToCartId] = useState<number | null>(null); // Comment out state related to cart
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  console.log('ProductsPage: State initialized.');

  useEffect(() => {
    console.log('*** Product Page useEffect Running! ***');
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString(), /* Add filters */ });
        const apiUrl = `/api/products?${params.toString()}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch products (${response.status})`);
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      } catch (err: any) { setError(err.message || 'Could not load products.'); console.error(err); }
       finally { setIsLoading(false); }
    };
    fetchProducts();
  }, [pagination.page, pagination.limit, selectedFlavor, selectedStrength]); 

  const availableFlavors = []; // Placeholder 
  const availableStrengths = []; // Placeholder

  // Comment out cart-related handlers
  // const handleAddToCart = (product: Product) => { /* ... */ };
  const handlePageChange = (newPage: number) => { /* ... */ };

  console.log('--- ProductsPage: Render State:', { isLoading, error, productsLength: products.length }); 

  return (
    <Layout>
       <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center"><h1 className="text-3xl font-bold">Our Products</h1></div>
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">{/* Filters Placeholder */}</div>
          {isLoading && <div className="text-center p-10">Loading products...</div>}
          {error && <div className="text-center p-10 text-red-600 bg-red-100 rounded">Error: {error}</div>}
          {!isLoading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <div key={product.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
                   <Link href={`/products/${product.id}`} className="block group">
                     <div className="relative h-64 bg-gray-100 group-hover:opacity-75 transition-opacity">
                        <Image src={product.image_url || '/images/products/placeholder.svg'} alt={product.name} fill style={{ objectFit: 'contain' }} className="p-4"/> 
                        {product.strength && <div className="absolute right-4 top-4"><span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">{product.strength}mg</span></div>}
                     </div>
                   </Link>
                   <div className="flex-grow p-6">
                     <h3 className="mb-2 text-lg font-medium text-gray-900"><Link href={`/products/${product.id}`} className="hover:text-primary-600">{product.name}</Link></h3>
                     {/* Remove Add to Cart button temporarily */}
                   </div>
                 </div>
              ))}
            </div>
          )}
          {!isLoading && !error && products.length === 0 && (
             <div className="rounded-lg bg-white p-8 text-center shadow-md">No products found.</div>
          )}
          {/* Pagination Placeholder */}
        </div>
      </div>
    </Layout>
  );
}
