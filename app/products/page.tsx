'use client';

// Use named imports for React hooks and types
import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout';
import { useCart } from '@/context/CartContext';
import ProductImage from '../components/ui/ProductImage';
import { formatCurrency } from '@/lib/utils';
import Breadcrumbs from '../components/ui/Breadcrumbs';

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
  is_active: boolean;
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
  const { addToCart } = useCart();
  console.log('ProductsPage: useCart() finished.');

  console.log('ProductsPage: Initializing state...');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPriceFilter, setMinPriceFilter] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  console.log('ProductsPage: State initialized.');

  // useEffect for Data Fetching
  useEffect(() => {
    console.log('*** Product Page useEffect Running! ***');
    const fetchProducts = async () => {
      setIsLoading(true);
      console.log('--- Fetching products --- ');
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sortBy,
          sortOrder,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedFlavor && { flavor: selectedFlavor }),
          ...(selectedStrength && { strength: selectedStrength.toString() }),
          ...(minPriceFilter && { minPrice: minPriceFilter }),
          ...(maxPriceFilter && { maxPrice: maxPriceFilter }),
        });
        const apiUrl = `/api/products?${params.toString()}`;
        console.log(`Fetching: ${apiUrl}`);

        try {
          const response = await fetch(apiUrl);
          console.log(`Response Status: ${response.status}`);

          // Handle different status codes appropriately
          if (!response.ok) {
            if (response.status === 500) {
              console.error('Server error when fetching products');
              setError('The server encountered an error. Please try again later.');
              setProducts([]);
              setPagination({
                page: 1,
                limit: 12,
                total: 0,
                totalPages: 0,
              });
              return;
            } else {
              throw new Error(`Failed to fetch products (${response.status})`);
            }
          }

          const data = await response.json();
          console.log('API Data Received:', JSON.stringify(data, null, 2));

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
          // Log the first product structure after setting state
          if (fetchedProducts.length > 0) {
            console.log(
              'First product sample in state:',
              JSON.stringify(fetchedProducts[0], null, 2)
            );
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setError('Could not load products from the server. Please try again later.');
          setProducts([]);
          setPagination({
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
          });
        }
      } catch (err: unknown) {
        console.error('Error during product fetch:', err);
        setError(err instanceof Error ? err.message : 'Could not load products.');
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
    // Ensure product has is_active property set to true if missing
    const productToAdd = {
      ...product,
      is_active: product.is_active === undefined ? true : product.is_active,
    };

    const result = addToCart(productToAdd, 1);
    if (result.success) {
      setNotificationMessage('Added to collection');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    } else {
      console.error(result.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      // Add type for prev
      setPagination((prev: PaginationState) => ({ ...prev, page: newPage }));
    }
  };

  console.log('--- ProductsPage: Render State:', {
    isLoading,
    error,
    productsLength: products.length,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-dark-500 px-4 py-8 text-white sm:px-6 lg:px-8">
        {/* Notification toast */}
        {showNotification && (
          <div className="fixed right-4 top-4 z-50 rounded-md bg-green-600 px-4 py-2 text-white shadow-lg">
            {notificationMessage}
          </div>
        )}

        <div className="bg-dark-900 pb-16 pt-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs customLabels={{ '/products': 'Shop' }} />

            {/* Add persuasive introduction */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  The PUXX Collection: Excellence Refined
                </span>
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-300">
                Experience our meticulously crafted nicotine pouches—a statement of discernment and
                sophistication. Each limited batch is made with pharmaceutical-grade ingredients for
                those who expect more.
              </p>
              <div className="flex flex-wrap items-center justify-center space-x-2 text-sm text-gold-400">
                <span className="flex items-center">
                  <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  4.9/5 rating from connoisseurs
                </span>
                <span className="mx-2">•</span>
                <span>2,000+ loyal patrons</span>
                <span className="mx-2">•</span>
                <span>Complimentary shipping on orders over $50</span>
              </div>
            </div>

            {/* Filter and Sort Bar */}
            <div className="mb-8 rounded-lg border border-gold-500/20 bg-dark-600 p-4 shadow-md">
              <div className="mb-2 text-center text-sm text-gold-400">
                Curate your experience with our precision filters
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Category Filter */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory || ''}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedCategory(e.target.value || null)
                    }
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  >
                    <option value="">All Categories</option>
                    {/* Add types for category and idx */}
                    {availableFilters.categories.map((category: string, idx: number) => (
                      <option key={idx} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flavor Filter */}
                <div>
                  <label htmlFor="flavor" className="mb-1 block text-sm font-medium text-gray-300">
                    Flavor
                  </label>
                  <select
                    id="flavor"
                    value={selectedFlavor || ''}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedFlavor(e.target.value || null)
                    }
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  >
                    <option value="">All Flavors</option>
                    {/* Add types for flavor and idx */}
                    {availableFilters.flavors.map((flavor: string, idx: number) => (
                      <option key={idx} value={flavor}>
                        {flavor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Strength Filter */}
                <div>
                  <label
                    htmlFor="strength"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Strength
                  </label>
                  <select
                    id="strength"
                    value={selectedStrength || ''}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedStrength(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  >
                    <option value="">All Strengths</option>
                    {/* Add types for strength and idx */}
                    {availableFilters.strengths.map((strength: number, idx: number) => (
                      <option key={idx} value={strength}>
                        {strength}mg
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label htmlFor="sort" className="mb-1 block text-sm font-medium text-gray-300">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    value={`${sortBy}-${sortOrder}`}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="minPrice"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Min Price
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    value={minPriceFilter || ''}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMinPriceFilter(e.target.value || null)
                    }
                    placeholder={`$${availableFilters.priceRange.min}`}
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxPrice"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Max Price
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    value={maxPriceFilter || ''}
                    // Add type for e
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMaxPriceFilter(e.target.value || null)
                    }
                    placeholder={`$${availableFilters.priceRange.max}`}
                    className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gold-500"></div>
              </div>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <div className="rounded-md bg-red-900/30 p-4 text-red-200">
                <p>{error}</p>
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && products.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Add type for product */}
                {products.map((product: Product, index: number) => (
                  <div
                    key={product.id}
                    className="hover:shadow-gold/10 group relative overflow-hidden rounded-lg border border-gold-500/10 bg-dark-800/70 p-4 transition-all duration-300 hover:border-gold-500/30"
                  >
                    {/* Product image with link */}
                    <Link
                      href={`/products/${typeof product.id === 'string' ? parseInt(product.id) : product.id}`}
                    >
                      <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-dark-800">
                        <ProductImage
                          src={product.image_url}
                          alt={product.name}
                          size="square"
                          objectFit="contain"
                          className="w-full transform transition-transform duration-500 group-hover:scale-105"
                          priority={index < 4}
                          badge={
                            product.compare_at_price
                              ? {
                                  text: `${Math.round(
                                    ((product.compare_at_price - product.price) /
                                      product.compare_at_price) *
                                      100
                                  )}% OFF`,
                                  color: 'bg-gold-500',
                                }
                              : undefined
                          }
                        />
                      </div>
                    </Link>

                    {/* Product details */}
                    <div className="flex h-full flex-col">
                      {/* Flavor badge if available */}
                      {product.flavor && (
                        <div className="mb-2">
                          <span className="inline-flex items-center rounded-full bg-dark-700 px-2.5 py-0.5 text-xs font-medium text-gold-500">
                            {product.flavor}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/products/${typeof product.id === 'string' ? parseInt(product.id) : product.id}`}
                        className="flex-grow"
                      >
                        <h3 className="text-base font-medium text-white transition-colors duration-200 group-hover:text-gold-500">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Short description (truncated) */}
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                          {product.description}
                        </p>
                      )}

                      {/* Strength indicator if available */}
                      {product.strength && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="mr-2 text-xs text-gray-400">Strength:</div>
                            <div className="h-2 w-full max-w-[100px] rounded-full bg-dark-700">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                                style={{
                                  width: `${Math.min(100, (product.strength / 30) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="ml-2 text-xs font-medium text-white">
                              {product.strength}mg
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="text-base font-medium text-white">
                            {formatCurrency(product.price)}
                          </div>
                          {product.compare_at_price && (
                            <div className="text-xs text-gray-400 line-through">
                              {formatCurrency(product.compare_at_price)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="flex items-center justify-center rounded-md bg-gold-600 px-3 py-1.5 text-sm font-medium text-black shadow-sm transition-colors duration-200 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                          aria-label="Add to cart"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Products Found */}
            {!isLoading && products.length === 0 && !error && (
              <div className="rounded-lg border border-gold-500/10 bg-dark-600 p-8 text-center">
                <p className="text-gray-300">
                  Your refined taste requires specific products that are currently unavailable.
                  Please adjust your criteria or contact our concierge service for personalized
                  assistance.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="rounded-md border border-gold-500/30 bg-dark-700 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {[...Array(pagination.totalPages)].map(
                    (
                      _,
                      idx: number // Add type for idx
                    ) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`rounded-md px-3 py-1 text-sm ${
                          pagination.page === idx + 1
                            ? 'bg-gold-500 text-dark-900'
                            : 'border border-gold-500/30 bg-dark-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-md border border-gold-500/30 bg-dark-700 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
