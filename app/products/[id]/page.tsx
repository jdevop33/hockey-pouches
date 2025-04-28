'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';
import ProductImage from '../../components/ui/ProductImage';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { formatCurrency } from '@/lib/utils';

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
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    is_active: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure we have a valid ID
        const productId = params?.id;
        if (!productId) {
          throw new Error('Product ID is missing');
        }

        // Fetch product details
        console.log(`Fetching product details for ID: ${productId}`);
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error(`Error fetching product: ${response.statusText}`);
        }

        const productData = await response.json();
        console.log('Product data received:', productData);

        // Ensure product ID is a number
        if (productData.id && typeof productData.id === 'string') {
          productData.id = parseInt(productData.id);
        }

        // Ensure product is_active is a boolean
        if (productData.is_active === undefined) {
          productData.is_active = true; // Default to true if missing
        }

        setProduct(productData);

        // Fetch related products
        fetchRelatedProducts(productId);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedProducts = async (productId: string | string[]) => {
      setIsLoadingRelated(true);
      try {
        const relatedResponse = await fetch(`/api/products/${productId}/related?limit=4`);
        if (!relatedResponse.ok) {
          console.warn(`Failed to fetch related products: ${relatedResponse.statusText}`);
          setRelatedProducts([]);
          return;
        }

        const relatedData = await relatedResponse.json();
        console.log('Related products data:', relatedData);

        if (relatedData.products && Array.isArray(relatedData.products)) {
          // Ensure all product IDs are numbers
          const formattedProducts = relatedData.products.map((prod: any) => ({
            ...prod,
            id: typeof prod.id === 'string' ? parseInt(prod.id) : prod.id,
            is_active: prod.is_active === undefined ? true : prod.is_active,
          }));
          setRelatedProducts(formattedProducts);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    if (params?.id) {
      fetchProductDetails();
    }
  }, [params?.id]);

  const handleAddToCart = () => {
    if (product.id === 0) return;

    const result = addToCart(product, quantity);
    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      console.error(result.message);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Reset the quantity when the product changes
  useEffect(() => {
    setQuantity(1);
    setAddedToCart(false);
  }, [product.id]);

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
      {/* Add JSON-LD schema for the product */}
      <ProductSchema product={product} />

      <div className="mx-auto max-w-7xl pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="rounded-lg bg-dark-800 p-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <div>
                      <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white">
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
                        className="ml-4 text-sm font-medium text-gray-400 hover:text-white"
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
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    size="large"
                    priority
                    className="mx-auto"
                  />
                </div>

                {/* Product details */}
                <div className="mt-10 lg:mt-0">
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
                  <div className="mt-4 flex items-end">
                    <p className="text-3xl font-bold tracking-tight text-white">
                      {formatCurrency(product.price)}
                    </p>
                    {product.compare_at_price && (
                      <p className="ml-2 text-lg font-medium text-red-400 line-through">
                        {formatCurrency(product.compare_at_price)}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h3 className="sr-only">Description</h3>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <p>{product.description || 'No description available.'}</p>
                    </div>
                  </div>

                  {/* Quantity selector and Add to Cart */}
                  <div className="mt-8">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-300">Quantity</h3>
                      <div className="ml-4 flex items-center">
                        <button
                          onClick={decrementQuantity}
                          type="button"
                          className="rounded-l-md border border-gray-700 bg-dark-700 px-3 py-2 text-gray-400 hover:bg-dark-600"
                        >
                          <span className="sr-only">Decrease quantity</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setQuantity(val > 0 ? val : 1);
                          }}
                          min="1"
                          className="w-16 border-gray-700 bg-dark-700 px-3 py-2 text-center text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                        <button
                          onClick={incrementQuantity}
                          type="button"
                          className="rounded-r-md border border-gray-700 bg-dark-700 px-3 py-2 text-gray-400 hover:bg-dark-600"
                        >
                          <span className="sr-only">Increase quantity</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row">
                      <button
                        onClick={handleAddToCart}
                        type="button"
                        className={`flex w-full items-center justify-center rounded-md bg-gold-600 px-6 py-3 text-base font-medium text-black shadow-sm transition-all hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          addedToCart
                            ? 'animate-pulse bg-green-600 hover:bg-green-500'
                            : 'bg-gold-600 hover:bg-gold-500'
                        }`}
                      >
                        {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                      </button>

                      <Link
                        href="/products"
                        className="mt-4 flex w-full items-center justify-center rounded-md border border-gold-500/30 bg-dark-600 px-6 py-3 text-base font-medium text-gold-500 shadow-sm hover:bg-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:ml-4 sm:mt-0"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>

                  {/* Social sharing */}
                  <div className="mt-8 border-t border-gray-700 pt-8">
                    <h3 className="text-sm font-medium text-gray-300">Share</h3>
                    <ul className="mt-4 flex items-center space-x-3">
                      <SocialShare
                        url={`${window.location.origin}/products/${product.id}`}
                        title={`Check out ${product.name} at PUXX Nicotine Pouches`}
                        description={product.description || ''}
                      />
                    </ul>
                  </div>
                </div>
              </div>

              {/* Related products section */}
              {!isLoadingRelated && relatedProducts.length > 0 && (
                <div className="mt-8 border-t border-gray-700 pt-8">
                  <h2 className="text-xl font-bold text-gray-200">Related Products</h2>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {relatedProducts.map(relatedProduct => (
                      <div key={relatedProduct.id} className="group relative">
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                          <ProductImage
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            size="small"
                            objectFit="contain"
                          />
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
                            {formatCurrency(relatedProduct.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
