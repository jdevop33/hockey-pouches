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

  if (isLoading)
    return (
      <Layout>
        <div className="p-8 text-center">Loading product...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="rounded bg-red-100 p-8 text-center text-red-600">Error: {error}</div>
      </Layout>
    );
  if (!product)
    return (
      <Layout>
        <div className="p-8 text-center">Product not found.</div>
      </Layout>
    );

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
          <nav className="mb-8 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link
                    href="/products"
                    className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Products
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-900" aria-current="page">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Product image */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-72 w-full sm:h-80 md:h-96">
                <Image
                  src={product.image_url || '/images/products/placeholder.svg'}
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
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {product.name}
              </h1>

              {/* Product badges */}
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {product.flavor && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 sm:px-3 sm:text-sm">
                    {product.flavor}
                  </span>
                )}
                {product.strength && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 sm:px-3 sm:text-sm">
                    Strength: {product.strength}/5
                  </span>
                )}
                {product.category && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 sm:px-3 sm:text-sm">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4">
                <div className="flex flex-wrap items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    ${currentPrice.toFixed(2)}
                  </p>
                  {showDiscount && (
                    <p className="text-base font-medium text-gray-500 line-through sm:text-lg">
                      ${product.compare_at_price?.toFixed(2)}
                    </p>
                  )}
                </div>
                {showDiscount && (
                  <p className="mt-1 text-xs font-medium text-red-600 sm:text-sm">
                    Save ${(product.compare_at_price! - product.price).toFixed(2)} (
                    {Math.round((1 - product.price / product.compare_at_price!) * 100)}% off)
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 space-y-4 text-base text-gray-500">
                  <p>{product.description || 'No description available.'}</p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-5 sm:mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-medium text-gray-900">Quantity:</h3>
                  <div className="flex items-center rounded border border-gray-300">
                    <button
                      type="button"
                      className="p-1.5 text-gray-500 hover:text-gray-700 sm:p-2"
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
                    <span className="w-10 py-1.5 text-center text-gray-700 sm:py-2">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-gray-500 hover:text-gray-700 sm:p-2"
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
              </div>

              {/* Add to cart button */}
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2.5 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none sm:px-8 sm:py-3 sm:text-base ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <svg
                        className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>

              {/* View cart button (shows when item is added) */}
              {addedToCart && (
                <div className="mt-2 sm:mt-3">
                  <Link
                    href="/cart"
                    className="focus:ring-primary-500 flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:px-8 sm:py-3 sm:text-base"
                  >
                    View Cart
                  </Link>
                </div>
              )}

              {/* Features */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                <div className="mt-4">
                  <ul className="list-disc space-y-2 pl-4 text-sm">
                    <li className="text-gray-500">Premium quality nicotine pouches</li>
                    <li className="text-gray-500">Discreet and convenient</li>
                    <li className="text-gray-500">Long-lasting flavor</li>
                    <li className="text-gray-500">Tobacco-free alternative</li>
                  </ul>
                </div>
              </div>

              {/* Social sharing */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-sm font-medium text-gray-900">Share this product</h3>
                <div className="mt-2">
                  <SocialShare
                    url={`/products/${product.id}`}
                    title={product.name}
                    description={product.description || ''}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product tabs */}
          <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
            <div className="scrollbar-hide overflow-x-auto border-b border-gray-200">
              <div className="flex min-w-full space-x-4 px-1 sm:space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`border-b-2 border-transparent px-1 py-3 text-xs font-medium whitespace-nowrap text-gray-500 sm:py-4 sm:text-sm ${
                    activeTab === 'description'
                      ? 'border-primary-600 text-primary-600'
                      : 'hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`border-b-2 border-transparent px-1 py-3 text-xs font-medium whitespace-nowrap text-gray-500 sm:py-4 sm:text-sm ${
                    activeTab === 'details'
                      ? 'border-primary-600 text-primary-600'
                      : 'hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`border-b-2 border-transparent px-1 py-3 text-xs font-medium whitespace-nowrap text-gray-500 sm:py-4 sm:text-sm ${
                    activeTab === 'shipping'
                      ? 'border-primary-600 text-primary-600'
                      : 'hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Shipping
                </button>
              </div>
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  <p className="mb-4">
                    {product.description || 'No detailed description available for this product.'}
                  </p>
                  <p>
                    Our premium nicotine pouches are designed for those seeking a discreet and
                    convenient alternative to traditional tobacco products. Enjoy the perfect
                    balance of flavor and satisfaction without the mess or odor of traditional
                    products.
                  </p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  <h3>Product Specifications</h3>
                  <ul>
                    <li>
                      <strong>Flavor:</strong> {product.flavor || 'N/A'}
                    </li>
                    <li>
                      <strong>Strength:</strong>{' '}
                      {product.strength ? `${product.strength}mg` : 'N/A'}
                    </li>
                    <li>
                      <strong>Category:</strong> {product.category || 'N/A'}
                    </li>
                    <li>
                      <strong>Contents:</strong> 20 pouches per can
                    </li>
                    <li>
                      <strong>Nicotine Type:</strong> Synthetic nicotine (tobacco-free)
                    </li>
                    <li>
                      <strong>Ingredients:</strong> Microcrystalline cellulose, water, flavorings,
                      nicotine, salt, acidity regulators, sweeteners
                    </li>
                  </ul>
                  <p className="mt-4 text-sm">
                    <strong>Warning:</strong> This product contains nicotine. Nicotine is an
                    addictive chemical. Not for sale to minors. Keep out of reach of children.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  <h3>Shipping Information</h3>
                  <p>
                    We ship to all provinces in Canada. Orders are typically processed within 1-2
                    business days.
                  </p>

                  <h4>Shipping Options:</h4>
                  <ul>
                    <li>
                      <strong>Standard Shipping:</strong> 3-5 business days ($5.99)
                    </li>
                    <li>
                      <strong>Express Shipping:</strong> 1-2 business days ($12.99)
                    </li>
                    <li>
                      <strong>Free Shipping:</strong> On orders over $50 (Standard shipping)
                    </li>
                  </ul>

                  <h4>Return Policy:</h4>
                  <p>
                    We accept returns of unopened products within 30 days of delivery. Please
                    contact our customer service team to initiate a return.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related products section */}
          <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              Customers also purchased
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {/* We'll show placeholder related products for now */}
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="group relative">
                  <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/products/placeholder.svg"
                        alt="Related product"
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-2"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col sm:mt-4 sm:flex-row sm:justify-between">
                    <div>
                      <h3 className="text-xs text-gray-700 sm:text-sm">
                        <Link href={`/products/${item}`} className="hover:text-primary-600">
                          <span aria-hidden="true" className="absolute inset-0" />
                          Similar Product {item}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">Various flavors</p>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-900 sm:mt-0 sm:text-sm">
                      ${(19.99).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
