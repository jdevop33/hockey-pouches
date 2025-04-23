'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
// import Layout from '@/components/layout/NewLayout'; // KEEP Layout commented out
// import { useCart } from '@/context/CartContext'; // KEEP useCart commented out
// import { useAuth } from '@/context/AuthContext'; // Temporarily comment out useAuth

console.log('--- ProductsPage: Top level, imports done (Auth commented out) ---');

// Define minimal Product type 
interface Product { id: number; name: string; price: number; image_url?: string | null; strength?: number; flavor?: string; description?: string; compare_at_price?: number | null; is_active?: boolean; category?: string | null;}
interface PaginationState { page: number; limit: number; total: number; totalPages: number; }

export default function ProductsPage() {
  console.log('--- ProductsPage: Component rendering START (Auth commented out) ---');
  
  // Keep useCart commented out
  // const { addToCart } = useCart(); 
  const addToCart = (product: Product, quantity: number) => { console.log('Add to cart (disabled)', product.id); alert('Add to cart disabled during debug'); }; // Dummy function

  // Keep useAuth commented out
  // console.log('ProductsPage: Calling useAuth()...');
  // const { user, token, isLoading: authLoading } = useAuth(); 
  // console.log('ProductsPage: useAuth() finished.');
  
  console.log('ProductsPage: Calling useRouter()...');
  const router = useRouter(); // Keep useRouter for now
  console.log('ProductsPage: useRouter() finished.');
  
  console.log('ProductsPage: Initializing state...');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null); // Keep cart state for button
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  console.log('ProductsPage: State initialized.');

  useEffect(() => {
    console.log('*** Product Page useEffect Running! (Auth commented out) ***'); 
    setIsLoading(false); 
    setProducts([ 
      {id: 1, name: "Test Product 1 (No Layout, No Cart, No Auth)", price: 9.99, image_url: "/images/products/placeholder.svg", strength: 6, flavor: "Mint"},
      {id: 2, name: "Test Product 2", price: 10.99, image_url: "/images/products/placeholder.svg", strength: 12, flavor: "Berry"},
      ]);
    setPagination({ page: 1, limit: 12, total: 2, totalPages: 1 });
  }, []); 

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1); 
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };
  
  const handlePageChange = (newPage: number) => { /* ... */ };

  console.log('--- ProductsPage: Render State:', { isLoading, error, productsLength: products.length });

  // Render loading state
  if (isLoading) {
    return <div className="p-8">Loading Products Page (No Layout/Cart/Auth)...</div>;
  }

  // Render main content without Layout
  return (
    <div className="bg-gray-50 py-12 border-4 border-purple-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center"><h1 className="text-3xl font-bold">Our Products (No Layout/Cart/Auth Debug)</h1></div>
        {error && <div className="text-center p-10 text-red-600 bg-red-100 rounded">Error: {error}</div>}
        {products.length > 0 ? (
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
                   <div className="mb-4 mt-2 flex justify-between text-sm">
                       <span className="text-gray-500">Flavor: <span className="text-gray-900">{product.flavor || 'N/A'}</span></span>
                   </div>
                   <div className="border-t border-gray-200 pt-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                       </div>
                       <button onClick={() => handleAddToCart(product)} className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm ${addedToCartId === product.id ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                         {addedToCartId === product.id ? 'Added!' : 'Add to Cart (Debug)'}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
            ))}
          </div>
        ) : (
           <div className="rounded-lg bg-white p-8 text-center shadow-md">No products loaded (Debug View - Auth commented out). Check console.</div>
        )}
      </div>
    </div>
  );
}
