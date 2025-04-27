'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  const productId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    is_active: false,
  });
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching product details for ID: ${productId}`);
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found or not available');
          } else {
            setError('An error occurred while fetching the product');
          }
          console.error(`Error fetching product: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log('Product data received:', data);
        setProduct(data);

        // Once we have product, fetch related products
        fetchRelatedProducts(data.id);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchRelatedProducts(id: number) {
      setIsLoadingRelated(true);
      try {
        const response = await fetch(`/api/products/${id}/related`);
        if (!response.ok) {
          console.error(`Error fetching related products: ${response.status}`);
          return;
        }

        const data = await response.json();
        setRelatedProducts(data);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product.id || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      // Success message or redirect to cart could be added here
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl p-8">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-gray-400">Loading product details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product.id) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl p-8">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500">
                {error || 'Product not found or not available'}
              </h2>
              <p className="mt-4 text-gray-400">
                The product you are looking for might have been removed or is temporarily
                unavailable.
              </p>
              <div className="mt-8">
                <Link
                  href="/products"
                  className="rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-gold-600"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Pass product directly to ProductSchema */}
      <ProductSchema product={product} />
      <div className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-200">
                    Home
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link
                    href="/products"
                    className="ml-2 text-sm font-medium text-gray-400 hover:text-gray-200"
                  >
                    Products
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-200" aria-current="page">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Product image */}
            <div className="overflow-hidden rounded-lg bg-gray-800 shadow-gold-sm">
              <div className="relative h-72 w-full sm:h-80 md:h-96">
                <Image
                  src={product.image_url || '/images/products/fallback.jpg'}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-4 sm:p-6 md:p-8"
                  priority
                />
              </div>
            </div>

            {/* Product details */}
            <div className="mt-6 px-2 sm:mt-10 sm:px-4 md:px-0 lg:mt-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-100 sm:text-3xl">
                {product.name}
              </h1>

              {/* Product badges */}
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {product.flavor && (
                  <span className="inline-flex items-center rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-300 sm:px-3 sm:text-sm">
                    {product.flavor}
                  </span>
                )}
                {product.strength && (
                  <span className="inline-flex items-center rounded-full bg-yellow-900/50 px-2 py-0.5 text-xs font-medium text-yellow-300 sm:px-3 sm:text-sm">
                    Strength: {product.strength}/5
                  </span>
                )}
                {product.category && (
                  <span className="inline-flex items-center rounded-full bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-300 sm:px-3 sm:text-sm">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4">
                <div className="flex flex-wrap items-end gap-2">
                  <p className="text-2xl font-bold text-gray-100 sm:text-3xl">
                    ${product.price.toFixed(2)} <span className="text-sm text-gray-400">each</span>
                  </p>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <p className="text-base font-medium text-gray-500 line-through sm:text-lg">
                      ${product.compare_at_price.toFixed(2)}
                    </p>
                  )}
                </div>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="mt-1 text-xs font-medium text-red-400 sm:text-sm">
                    Save ${(product.compare_at_price - product.price).toFixed(2)} (
                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% off)
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-200">Why You'll Love It</h3>
                <div className="mt-2 space-y-4 text-base text-gray-300">
                  <p>
                    {product.description ||
                      'Crafted for those who demand excellence in every aspect of their lifestyle.'}
                  </p>
                </div>
              </div>

              {/* Minimum order notice */}
              <div className="mt-4 rounded-md bg-gold-900/20 p-2.5 text-sm text-gold-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gold-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>
                      <span className="font-medium">1 unit minimum</span> • Secure your premium
                      experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-5 sm:mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-medium text-gray-200">Quantity:</h3>
                  <div className="flex items-center rounded border border-gray-700 bg-gray-800">
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-gray-200 sm:p-2"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="w-10 py-1.5 text-center text-gray-200 sm:py-2">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-gray-200 sm:p-2"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Total amount info */}
                <div className="mt-2 text-sm text-gray-400">
                  <p>
                    Total:{' '}
                    <span className="font-medium text-gray-200">
                      ${(quantity * product.price).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Add to cart button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex w-full items-center justify-center rounded-md border border-transparent bg-gold-600 px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 ${
                    isAddingToCart ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? 'Adding to Your Collection...' : 'Add to Collection'}
                </button>
              </div>

              {/* Social share */}
              <div className="mt-6 border-t border-gray-700 pt-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-400">Share this product:</span>
                  <SocialShare
                    title={product.name}
                    description={product.description || ''}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Related products section */}
          {!isLoadingRelated && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold text-gray-100">You may also enjoy</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {relatedProducts.map(relatedProduct => (
                  <div key={relatedProduct.id} className="group relative">
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                      <div className="relative h-full w-full">
                        <Image
                          src={relatedProduct.image_url || '/images/products/placeholder.svg'}
                          alt={relatedProduct.name}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-2"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:mt-4 sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="text-xs text-gray-700 sm:text-sm">
                          <Link
                            href={`/products/${relatedProduct.id}`}
                            className="hover:text-primary-600"
                          >
                            <span aria-hidden="true" className="absolute inset-0" />
                            {relatedProduct.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          {relatedProduct.flavor || 'Various flavors'}
                        </p>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-900 sm:mt-0 sm:text-sm">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
