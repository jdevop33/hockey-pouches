'use client'; 

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout'; 
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';

// Define Product type consistently with API/DB
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
    bulkDiscounts?: { quantity: number; discountPercentage: number }[]; // Added optional bulkDiscounts
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const productIdString = params.id as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (productId === undefined || isNaN(productId)) {
      setError('Invalid Product ID.');
      setIsLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Product not found or not available.');
            else throw new Error(`Failed to fetch product (${response.status})`);
        }
        const data = await response.json();
        setProduct(data as Product);
      } catch (err: any) {
        setError(err.message || 'Could not load product details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    // Pass the fetched product directly - CartContext Product type should now match
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const relatedProducts: Product[] = []; // Placeholder

  if (isLoading) return <Layout><div className="p-8 text-center">Loading product...</div></Layout>;
  if (error) return <Layout><div className="p-8 text-center text-red-600 bg-red-100 rounded">Error: {error}</div></Layout>;
  if (!product) return <Layout><div className="p-8 text-center">Product not found.</div></Layout>;
  
  const getDiscountedPrice = (qty: number) => product.price;
  const currentPrice = getDiscountedPrice(quantity);
  const showDiscount = product.compare_at_price && product.compare_at_price > product.price; 

  return (
    <Layout>
      {/* Pass product directly to ProductSchema */} 
      <ProductSchema product={product} /> 
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           {/* Breadcrumbs */} 
           <nav className="mb-8 flex" aria-label="Breadcrumb">{/* ... */}</nav>
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Product image */} 
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-96 w-full">
                <Image src={product.image_url || '/images/products/placeholder.svg'} alt={product.name} fill style={{ objectFit: 'contain' }} className="p-8"/> 
              </div>
            </div>
            {/* Product details */} 
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
               {/* ... rest of the component using product ... */} 
                 <div className="mt-8 border-t border-gray-200 pt-8">
                  <SocialShare url={`/products/${product.id}`} title={product.name} description={product.description || ''}/>
                </div>
            </div>
          </div>
           {/* ... Product tabs ... */} 
           {/* ... Related products ... */} 
        </div>
      </div>
    </Layout>
  );
}
