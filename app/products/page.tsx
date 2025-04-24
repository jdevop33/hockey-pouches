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

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductsPage() {
  console.log('--- ProductsPage: Component rendering START ---');

  console.log('ProductsPage: Calling useCart()...');
  const { addToCart, itemCount } = useCart();
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPriceFilter, setMinPriceFilter] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
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
          sortBy: sortBy,
          sortOrder: sortOrder,
          ...(selectedFlavor && { flavor: selectedFlavor }),
          ...(selectedStrength && { strength: selectedStrength.toString() }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(minPriceFilter && { minPrice: minPriceFilter }),
          ...(maxPriceFilter && { maxPrice: maxPriceFilter }),
        });
        const apiUrl = `/api/products?${params.toString()}`;
        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        console.log(`Response Status: ${response.status}`);
        if (!response.ok) throw new Error(`Failed to fetch products (${response.status})`);
        const data = await response.json();
        console.log('API Data Received:', JSON.stringify(data, null, 2)); // Log received data structure

        const fetchedProducts = data.products || [];
        const fetchedPagination = data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
        };
        const fetchedFilters = data.availableFilters || {
          flavors: [],
          strengths: [],
          categories: [],
          priceRange: { min: 0, max: 100 },
        };

        setProducts(fetchedProducts);
        setPagination(fetchedPagination);
        setAvailableFilters(fetchedFilters);

        console.log(`State updated. ${fetchedProducts.length} products loaded.`);
        // Log the first product structure after setting state (async nature means state might not be updated yet)
        if (fetchedProducts.length > 0) {
          console.log(
            'First product sample in state:',
            JSON.stringify(fetchedProducts[0], null, 2)
          );
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
  }, [
    pagination.page,
    pagination.limit,
    selectedFlavor,
    selectedStrength,
    selectedCategory,
    minPriceFilter,
    maxPriceFilter,
    sortBy,
    sortOrder,
  ]);

  // State for available filters
  const [availableFilters, setAvailableFilters] = useState<{
    flavors: string[];
    strengths: number[];
    categories: string[];
    priceRange: { min: number; max: number };
  }>({
    flavors: [],
    strengths: [],
    categories: [],
    priceRange: { min: 0, max: 100 },
  });

  const handleAddToCart = (product: Product) => {
    // Ensure product object matches CartProduct interface
    const productForCart: CartProduct = {
      ...product,
      description: product.description ?? null,
      compare_at_price: product.compare_at_price ?? null,
      category: product.category ?? null,
      is_active: product.is_active ?? true,
      bulkDiscounts: product.bulkDiscounts || [],
      image_url: product.image_url ?? null,
    };

    // Add the product to the cart
    addToCart(productForCart, 1);

    // Show "Added!" message
    setAddedToCartId(product.id);

    // Reset after 2 seconds
    setTimeout(() => setAddedToCartId(null), 2000);

    console.log(`Added product ${product.id} to cart`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  console.log('--- ProductsPage: Render State:', {
    isLoading,
    error,
    productsLength: products.length,
  });

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Products</h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-500">
              Premium tobacco-free nicotine pouches.
            </p>
          </div>
          {/* Filters Section - RESTORED */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="mb-4 text-lg font-medium text-gray-900 sm:mb-0">Filters</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory || ''}
                    onChange={e => {
                      setSelectedCategory(e.target.value || null);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
                  >
                    <option value="">All Categories</option>
                    {availableFilters.categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="flavor" className="mb-1 block text-sm font-medium text-gray-700">
                    Flavor
                  </label>
                  <select
                    id="flavor"
                    value={selectedFlavor || ''}
                    onChange={e => {
                      setSelectedFlavor(e.target.value || null);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
                  >
                    <option value="">All Flavors</option>
                    {availableFilters.flavors.map(flavor => (
                      <option key={flavor} value={flavor}>
                        {flavor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="strength"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Strength
                  </label>
                  <select
                    id="strength"
                    value={selectedStrength?.toString() || ''}
                    onChange={e => {
                      setSelectedStrength(e.target.value ? parseInt(e.target.value) : null);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
                  >
                    <option value="">All Strengths</option>
                    {availableFilters.strengths.map(strength => (
                      <option key={strength} value={strength}>
                        {strength}mg
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="price-range"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min"
                      value={minPriceFilter || ''}
                      onChange={e => {
                        setMinPriceFilter(e.target.value || null);
                        setPagination(p => ({ ...p, page: 1 }));
                      }}
                      className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 text-base focus:outline-none sm:text-sm"
                      min={availableFilters.priceRange.min}
                      max={availableFilters.priceRange.max}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max"
                      value={maxPriceFilter || ''}
                      onChange={e => {
                        setMaxPriceFilter(e.target.value || null);
                        setPagination(p => ({ ...p, page: 1 }));
                      }}
                      className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 text-base focus:outline-none sm:text-sm"
                      min={availableFilters.priceRange.min}
                      max={availableFilters.priceRange.max}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="sortBy" className="mb-1 block text-sm font-medium text-gray-700">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={e => {
                      setSortBy(e.target.value);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="strength">Strength</option>
                    <option value="created_at">Newest</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sortOrder"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Order
                  </label>
                  <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={e => {
                      setSortOrder(e.target.value);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedFlavor(null);
                      setSelectedStrength(null);
                      setMinPriceFilter(null);
                      setMaxPriceFilter(null);
                      setSortBy('name');
                      setSortOrder('asc');
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="focus:ring-primary-500 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isLoading && <div className="p-10 text-center">Loading products...</div>}
          {error && (
            <div className="rounded bg-red-100 p-10 text-center text-red-600">Error: {error}</div>
          )}

          {/* Cart notification */}
          {itemCount > 0 && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="ml-3 text-sm font-medium text-green-800">
                    You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
                <Link
                  href="/cart"
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm hover:bg-green-700"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}

          {/* Products Grid - RESTORED */}
          {!isLoading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md"
                >
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="relative h-64 bg-gray-100 transition-opacity group-hover:opacity-75">
                      <Image
                        src={product.image_url || '/images/products/placeholder.svg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-4"
                      />
                      {product.strength && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary-100 text-primary-800 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {product.strength}mg
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-grow p-6">
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      <Link href={`/products/${product.id}`} className="hover:text-primary-600">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-2 mb-4 flex justify-between text-sm">
                      <span className="text-gray-500">
                        Flavor: <span className="text-gray-900">{product.flavor || 'N/A'}</span>
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* Price Display - Ensure product.price is a number */}
                          {product.compare_at_price && product.compare_at_price > product.price ? (
                            <div className="flex items-center">
                              <p className="text-lg font-medium text-red-600">
                                ${product.price?.toFixed(2) ?? 'N/A'}
                              </p>
                              <p className="ml-2 text-sm text-gray-500 line-through">
                                ${product.compare_at_price?.toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-gray-900">
                              ${product.price?.toFixed(2) ?? 'N/A'}
                            </p>
                          )}
                        </div>
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm ${addedToCartId === product.id ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                        >
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
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
                    pagination.page === 1
                      ? 'cursor-not-allowed text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // For simplicity, show up to 5 pages
                  // For more complex pagination, implement logic to show current page and neighbors
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else {
                    // If more than 5 pages, show current page in the middle when possible
                    const middleIndex = 2; // Index 2 is the middle of a 5-item array (0-indexed)
                    if (pagination.page <= 3) {
                      // Near the start
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      // Near the end
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      // In the middle
                      pageNum = pagination.page - middleIndex + i;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        pagination.page === pageNum
                          ? 'border-primary-500 bg-primary-50 text-primary-600 z-10'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? 'cursor-not-allowed text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
