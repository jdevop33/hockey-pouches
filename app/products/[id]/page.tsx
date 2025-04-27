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
  const { addToCart, minOrderQuantity } = useCart();

  const productIdString = params.id as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(minOrderQuantity);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Could not load product details.';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // Reset any previous errors
    setAddToCartError(null);

    // Check minimum quantity
    if (quantity < minOrderQuantity) {
      setAddToCartError(`Minimum order quantity is ${minOrderQuantity} units.`);
      return;
    }

    // Pass the fetched product directly - CartContext Product type should now match
    const result = addToCart(product, quantity);

    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else if (result.message) {
      setAddToCartError(result.message);
    }
  };

  if (isLoading)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-200">Loading product...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="rounded bg-red-900/30 p-8 text-center text-red-300">Error: {error}</div>
      </Layout>
    );
  if (!product)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-200">Product not found.</div>
      </Layout>
    );

  const currentPrice = product.price;
  const showDiscount = product.compare_at_price && product.compare_at_price > product.price;

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
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
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
                    ${currentPrice.toFixed(2)} <span className="text-sm text-gray-400">each</span>
                  </p>
                  {showDiscount && (
                    <p className="text-base font-medium text-gray-500 line-through sm:text-lg">
                      ${product.compare_at_price?.toFixed(2)}
                    </p>
                  )}
                </div>
                {showDiscount && (
                  <p className="mt-1 text-xs font-medium text-red-400 sm:text-sm">
                    Save ${(product.compare_at_price! - product.price).toFixed(2)} (
                    {Math.round((1 - product.price / product.compare_at_price!) * 100)}% off)
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
                      <span className="font-medium">{minOrderQuantity} unit minimum</span> • Secure
                      your premium experience
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
                      onClick={() => setQuantity(Math.max(minOrderQuantity, quantity - 1))}
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
                    addedToCart ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  disabled={addedToCart}
                >
                  {addedToCart ? 'Added to Your Collection!' : 'Add to Collection'}
                </button>

                {/* Add to cart error message */}
                {addToCartError && <p className="mt-2 text-sm text-red-400">{addToCartError}</p>}
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

          {/* Product tabs */}
          <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
            <div className="scrollbar-hide overflow-x-auto border-b border-gray-200">
              <div className="flex min-w-full space-x-4 px-1 sm:space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-xs font-medium text-gray-500 sm:py-4 sm:text-sm ${
                    activeTab === 'description'
                      ? 'border-primary-600 text-primary-600'
                      : 'hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-xs font-medium text-gray-500 sm:py-4 sm:text-sm ${
                    activeTab === 'details'
                      ? 'border-primary-600 text-primary-600'
                      : 'hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-xs font-medium text-gray-500 sm:py-4 sm:text-sm ${
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
                    {product.description ||
                      'An elevated nicotine experience crafted for the discerning user.'}
                  </p>
                  <p className="mb-4">
                    PUXX premium nicotine pouches represent the pinnacle of sophistication and
                    satisfaction. Meticulously crafted with pharmaceutical-grade ingredients and
                    innovative technology, each pouch delivers a consistent, refined experience that
                    sets a new standard in the industry.
                  </p>
                  <p>
                    Enjoy the perfect balance of flavor complexity and nicotine delivery in a
                    discreet, elegant format that complements your lifestyle. No compromise, no
                    shortcuts—just pure excellence in every detail.
                  </p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  <h3>Premium Specifications</h3>
                  <ul>
                    <li>
                      <strong>Flavor Profile:</strong> {product.flavor || 'Signature blend'}
                    </li>
                    <li>
                      <strong>Strength Calibration:</strong>{' '}
                      {product.strength
                        ? `Precision-balanced ${product.strength}mg`
                        : 'Expertly balanced'}
                    </li>
                    <li>
                      <strong>Category:</strong> {product.category || 'Premium Collection'}
                    </li>
                    <li>
                      <strong>Contents:</strong> 20 artisan-crafted pouches per designer container
                    </li>
                    <li>
                      <strong>Nicotine Type:</strong> Pharmaceutical-grade synthetic nicotine
                      (tobacco-free)
                    </li>
                    <li>
                      <strong>Composition:</strong> Premium microcrystalline cellulose,
                      triple-filtered water, proprietary flavor compounds, pharmaceutical-grade
                      nicotine, pH-optimizing salts, precise acidity regulators, natural sweeteners
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
                  <h3>White Glove Delivery Service</h3>
                  <p>
                    We provide premium shipping throughout Canada with careful handling to ensure
                    your PUXX products arrive in perfect condition. Each order is thoughtfully
                    packaged and expedited by our logistics specialists.
                  </p>

                  <h4>Delivery Options:</h4>
                  <ul>
                    <li>
                      <strong>Classic Delivery:</strong> 3-5 business days ($5.99) with tracking
                    </li>
                    <li>
                      <strong>Priority Service:</strong> 1-2 business days ($12.99) with enhanced
                      tracking
                    </li>
                    <li>
                      <strong>Complimentary Shipping:</strong> On collections valued over $50
                      (Classic Delivery)
                    </li>
                  </ul>

                  <h4>Our Quality Guarantee:</h4>
                  <p>
                    We stand behind the exceptional quality of PUXX products. If your order doesn't
                    meet our exacting standards, we accept returns of unopened products within 30
                    days. Our dedicated concierge team is available to assist with any concerns.
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
