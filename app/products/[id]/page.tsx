'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';
import { Product, ProductVariation, CartItem } from '@/types'; // Import types including CartItem

// Product type from API (including variations)
interface ProductWithVariations extends Product {
  variations?: ProductVariation[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const productIdString = params.id as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;

  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch Product Data
  useEffect(() => {
    if (productId === undefined || isNaN(productId)) {
      setError('Invalid Product ID.');
      setIsLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedVariation(null); // Reset selection on product load
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Product not found or not available.');
          else throw new Error(`Failed to fetch product (${response.status})`);
        }
        const data: ProductWithVariations = await response.json();
        setProduct(data);

        // Auto-select the first variation if available
        if (data.variations && data.variations.length > 0) {
          setSelectedVariation(data.variations[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Could not load product details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Handle Variation Selection
  const handleVariationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const variationId = parseInt(event.target.value);
    const variation = product?.variations?.find(v => v.id === variationId);
    if (variation) {
      setSelectedVariation(variation);
    }
  };

  // Memoize displayed details based on selected variation or base product
  const displayDetails = useMemo(() => {
    const source = selectedVariation || product;
    return {
      name: source?.name || product?.name || 'Product Name',
      price: source?.price !== undefined ? source.price : product?.price || 0,
      compareAtPrice:
        source?.compare_at_price !== undefined
          ? source.compare_at_price
          : product?.compare_at_price,
      imageUrl: source?.image_url || product?.image_url || '/images/products/placeholder.svg',
      flavor: source?.flavor || product?.flavor,
      strength: source?.strength || product?.strength,
      sku: (source as ProductVariation)?.sku, // SKU typically on variation
      description: product?.description, // Description usually on base product
      category: product?.category, // Category usually on base product
      inventory: (source as ProductVariation)?.inventory_quantity, // Inventory on variation
      isActive: (source as ProductVariation)?.is_active ?? product?.is_active ?? false,
    };
  }, [product, selectedVariation]);

  // Add to Cart Logic
  const handleAddToCart = () => {
    if (!product) return;
    if (product.variations && product.variations.length > 0 && !selectedVariation) {
      alert('Please select a variation.');
      return;
    }

    // Determine what to add: the variation or the base product
    const itemToAdd = selectedVariation || product;

    // **Crucially, create the CartItem object structure expected by useCart**
    // Type it explicitly as Partial<CartItem> first for clarity
    const cartItemData: Partial<CartItem> = {
      id: itemToAdd.id, // Use variation ID if selected, otherwise product ID
      product_id: product.id, // Always include base product ID
      name: displayDetails.name,
      price: displayDetails.price,
      quantity: quantity,
      image_url: displayDetails.imageUrl,
      variation_id: selectedVariation?.id,
      flavor: displayDetails.flavor,
      strength: displayDetails.strength,
      sku: displayDetails.sku,
      // --- FIX: Add missing is_active property --- 
      is_active: displayDetails.isActive, 
    };
    
    // Ensure all required CartItem fields are present before calling addToCart
    // This assumes CartContext expects a full CartItem, adjust if it accepts Partial<CartItem>
    if (!cartItemData.id || !cartItemData.product_id || !cartItemData.name || cartItemData.price === undefined || cartItemData.quantity === undefined) {
        console.error("Cannot add item to cart: Missing required fields", cartItemData);
        alert("Error: Could not add item to cart due to missing information.");
        return;
    }

    addToCart(cartItemData as CartItem, quantity); // Cast to CartItem assuming all required fields are now present
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // --- Render Logic ---
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

  // Determine if product has variations
  const hasVariations = product.variations && product.variations.length > 0;
  const showDiscount = displayDetails.compareAtPrice && displayDetails.compareAtPrice > displayDetails.price;

  return (
    <Layout>
      {/* Pass selected variation or product to ProductSchema */}
      <ProductSchema product={selectedVariation || product} />
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
                    {product.name} {/* Keep base product name in breadcrumb */}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Product image - Updates based on selected variation */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-72 w-full sm:h-80 md:h-96">
                <Image
                  src={displayDetails.imageUrl}
                  alt={displayDetails.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-4 transition-opacity duration-300 ease-in-out sm:p-6 md:p-8"
                  priority
                  key={displayDetails.imageUrl} // Add key to force re-render on image change
                />
              </div>
            </div>

            {/* Product details */}
            <div className="mt-6 px-2 sm:mt-10 sm:px-4 md:px-0 lg:mt-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {displayDetails.name}
              </h1>

              {/* Product badges - Show base category + selected variation details */}
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {displayDetails.flavor && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 sm:px-3 sm:text-sm">
                    {displayDetails.flavor}
                  </span>
                )}
                {displayDetails.strength && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 sm:px-3 sm:text-sm">
                    Strength: {displayDetails.strength}/5
                  </span>
                )}
                {displayDetails.category && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 sm:px-3 sm:text-sm">
                    {displayDetails.category}
                  </span>
                )}
              </div>

              {/* Price - Updates based on selected variation */}
              <div className="mt-4">
                <div className="flex flex-wrap items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    ${displayDetails.price.toFixed(2)}
                  </p>
                  {showDiscount && (
                    <p className="text-base font-medium text-gray-500 line-through sm:text-lg">
                      ${displayDetails.compareAtPrice?.toFixed(2)}
                    </p>
                  )}
                </div>
                {showDiscount && displayDetails.compareAtPrice && (
                  <p className="mt-1 text-xs font-medium text-red-600 sm:text-sm">
                    Save ${(displayDetails.compareAtPrice - displayDetails.price).toFixed(2)} (
                    {Math.round(
                      (1 - displayDetails.price / displayDetails.compareAtPrice) * 100
                    )}%
                    off)
                  </p>
                )}
              </div>

              {/* Variation Selector */}
              {hasVariations && (
                <div className="mt-5 sm:mt-6">
                  <label htmlFor="variation-select" className="block text-sm font-medium text-gray-700">
                    Select Flavor/Strength:
                  </label>
                  <select
                    id="variation-select"
                    name="variation"
                    value={selectedVariation?.id || ''}
                    onChange={handleVariationChange}
                    className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm focus:outline-none sm:text-sm"
                  >
                    {product.variations?.map(variation => (
                      <option key={variation.id} value={variation.id}>
                        {variation.name} (${variation.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description (Using base product description) */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 space-y-4 text-base text-gray-500">
                  <p>{displayDetails.description || 'No description available.'}</p>
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
                      disabled={quantity <= 1}
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
                      // Optionally disable if inventory limit reached
                      // disabled={selectedVariation && quantity >= selectedVariation.inventory_quantity}
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
                  disabled={hasVariations && !selectedVariation}
                  className={`flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2.5 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:py-3 sm:text-base ${
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
                  ) : hasVariations && !selectedVariation ? (
                    'Select a Variation'
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>

              {/* View cart button */}
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
                    title={displayDetails.name}
                    description={displayDetails.description || ''}
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
                    {displayDetails.description || 'No detailed description available for this product.'}
                  </p>
                  {/* Generic description remains */}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  <h3>Product Specifications</h3>
                  <ul>
                    <li>
                      <strong>Flavor:</strong> {displayDetails.flavor || 'N/A'}
                    </li>
                    <li>
                      <strong>Strength:</strong>{' '}
                      {displayDetails.strength ? `${displayDetails.strength}mg` : 'N/A'}
                    </li>
                    <li>
                      <strong>Category:</strong> {displayDetails.category || 'N/A'}
                    </li>
                    <li>
                      <strong>SKU:</strong> {displayDetails.sku || 'N/A'}
                    </li>
                    <li>
                      <strong>Contents:</strong> 20 pouches per can
                    </li>
                    {/* Other details */}
                  </ul>
                  {/* Warning */}
                </div>
              )}

              {activeTab === 'shipping' && (
                 <div className="prose prose-sm max-w-none text-gray-500">
                  <h3>Shipping Information</h3>
                  {/* ... Shipping info ... */}
                 </div>
              )}
            </div>
          </div>

          {/* Related products section (Placeholder) */}
          {/* ... */}
        </div>
      </div>
    </Layout>
  );
}
