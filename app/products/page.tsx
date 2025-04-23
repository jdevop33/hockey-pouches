'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import Layout from '@/components/layout/NewLayout'; 
import { useCart, Product as CartProduct } from '@/context/CartContext'; 
import { useAuth } from '@/context/AuthContext'; 

console.log('--- ProductsPage: Top level, imports done ---');

// Define Product type based on API response/DB schema
interface Product {
    id: number;
    name: string;
    description?: string | null;
    flavor?: string | null;
    strength?: number | null;
    price: number; 
    compare_at_price?: number | null;
    image_url?: string | null; 
    category?: string | null;
    is_active?: boolean;
    bulkDiscounts?: { quantity: number; discountPercentage: number }[];
}

interface PaginationState { page: number; limit: number; total: number; totalPages: number; }

export default function ProductsPage() {
  console.log('--- ProductsPage: Component rendering START ---');
  
  console.log('ProductsPage: Calling useCart()...');
  const { addToCart } = useCart(); 
  console.log('ProductsPage: useCart() finished.');
  
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
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  console.log('ProductsPage: State initialized.');

  // useEffect for Data Fetching
  useEffect(() => {
    console.log('*** Product Page useEffect Running! ***');
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
        const apiUrl = `/api/products?${params.toString()}`;
        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        console.log(`Response Status: ${response.status}`);
        if (!response.ok) throw new Error(`Failed to fetch products (${response.status})`);
        const data = await response.json();
        console.log('API Data Received:', JSON.stringify(data, null, 2)); // Log received data structure
        
        const fetchedProducts = data.products || [];
        const fetchedPagination = data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };
        
        setProducts(fetchedProducts);
        setPagination(fetchedPagination);
        console.log(`State updated. ${fetchedProducts.length} products loaded.`);
        // Log the first product structure after setting state (async nature means state might not be updated yet)
        if (fetchedProducts.length > 0) {
            console.log('First product sample in state:', JSON.stringify(fetchedProducts[0], null, 2));
        }

      } catch (err: any) { 
        console.error('Error during product fetch:', err); 
        setError(err.message || 'Could not load products.');
      } finally {
        setIsLoading(false);
        console.log('--- Finished fetching products --- '); 
      }
    };
    fetchProducts();
  }, [pagination.page, pagination.limit, selectedFlavor, selectedStrength]); 

  // Placeholder filter options (Ideally fetch from API)
  const availableFlavors = ['Mint', 'Fruit', 'Berry', 'Citrus', 'Apple mint', 'Cool mint', 'Peppermint', 'Cola', 'Spearmint', 'Watermelon', 'Cherry', 'Other'];
  const availableStrengths = [6, 12, 16, 22]; 

  const handleAddToCart = (product: Product) => {
    // Ensure product object matches CartProduct interface
    const productForCart: CartProduct = { 
        ...product, 
        description: product.description ?? null,
        compare_at_price: product.compare_at_price ?? null,
        category: product.category ?? null,
        is_active: product.is_active ?? true,
        bulkDiscounts: product.bulkDiscounts || [],
        image_url: product.image_url ?? null
     };
    addToCart(productForCart, 1);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };
  
  const handlePageChange = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages) {
        setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  console.log('--- ProductsPage: Render State:', { isLoading, error, productsLength: products.length }); 

  return (
    <Layout>
       <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
              <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Products</h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-500">Premium tobacco-free nicotine pouches.</p>
          </div>
          {/* Filters Section - RESTORED */} 
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="mb-4 text-lg font-medium text-gray-900 sm:mb-0">Filters</h2>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                    <div>
                        <label htmlFor="flavor" className="mb-1 block text-sm font-medium text-gray-700">Flavor</label>
                        <select id="flavor" value={selectedFlavor || ''} onChange={e => { setSelectedFlavor(e.target.value || null); setPagination(p => ({...p, page: 1})); }} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                            <option value="">All Flavors</option>
                            {availableFlavors.map(flavor => (<option key={flavor} value={flavor}>{flavor}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="strength" className="mb-1 block text-sm font-medium text-gray-700">Strength</label>
                        <select id="strength" value={selectedStrength?.toString() || ''} onChange={e => { setSelectedStrength(e.target.value ? parseInt(e.target.value) : null); setPagination(p => ({...p, page: 1})); }} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                            <option value="">All Strengths</option>
                            {availableStrengths.map(strength => (<option key={strength} value={strength}>{strength}mg</option>))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={() => { setSelectedFlavor(null); setSelectedStrength(null); setPagination(p => ({...p, page: 1})); }} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Clear Filters</button>
                    </div>
                </div>
            </div>
          </div>          
          {isLoading && <div className="text-center p-10">Loading products...</div>}
          {error && <div className="text-center p-10 text-red-600 bg-red-100 rounded">Error: {error}</div>}

          {/* Products Grid - RESTORED */} 
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
                     <div className="mb-4 mt-2 flex justify-between text-sm">
                         <span className="text-gray-500">Flavor: <span className="text-gray-900">{product.flavor || 'N/A'}</span></span>
                     </div>
                     <div className="border-t border-gray-200 pt-4">
                       <div className="flex items-center justify-between">
                         <div>
                           {/* Price Display - Ensure product.price is a number */} 
                           {product.compare_at_price && product.compare_at_price > product.price ? (
                             <div className="flex items-center">
                               <p className="text-lg font-medium text-red-600">${product.price?.toFixed(2) ?? 'N/A'}</p>
                               <p className="ml-2 text-sm text-gray-500 line-through">${product.compare_at_price?.toFixed(2)}</p>
                             </div>
                           ) : (
                             <p className="text-lg font-medium text-gray-900">${product.price?.toFixed(2) ?? 'N/A'}</p>
                           )}
                         </div>
                         {/* Add to Cart Button */} 
                         <button onClick={() => handleAddToCart(product)} className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm ${addedToCartId === product.id ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                           {addedToCartId === product.id ? 'Added!' : 'Add to Cart'}
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
          {/* No Products Message */} 
          {!isLoading && !error && products.length === 0 && (
             <div className="rounded-lg bg-white p-8 text-center shadow-md">No products found.</div>
          )}
          {/* Pagination */} 
          {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                   {/* ... Pagination Controls ... */} 
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
