'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/NewLayout';
import { useCart, Product as CartProduct } from '@/context/CartContext';

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

  // Mock data wrapped in useMemo to prevent re-creation on every render
  const mockProducts = useMemo<Product[]>(
    () => [
      {
        id: 1,
        name: 'Apple Mint (12mg)',
        flavor: 'Apple Mint',
        strength: 12,
        price: 6.99,
        image_url: '/images/products/apple-mint/apple-mint-12mg.png',
        category: 'Regular Strength',
        description: 'Crisp apple and cool mint flavor.',
      },
      {
        id: 2,
        name: 'Apple Mint (6mg)',
        flavor: 'Apple Mint',
        strength: 6,
        price: 6.99,
        image_url: '/images/products/apple-mint/apple-mint-6mg.png',
        category: 'Mild',
        description: 'Crisp apple and cool mint flavor, lower strength.',
      },
      {
        id: 3,
        name: 'Mint (12mg)',
        flavor: 'Mint',
        strength: 12,
        price: 6.99,
        image_url: '/images/products/mint/mint-12mg.png',
        category: 'Regular Strength',
        description: 'Cool and refreshing mint flavor.',
      },
      {
        id: 4,
        name: 'Mint (6mg)',
        flavor: 'Mint',
        strength: 6,
        price: 6.99,
        image_url: '/images/products/mint/mint-6mg.png',
        category: 'Mild',
        description: 'Cool and refreshing mint flavor, lower strength.',
      },
      {
        id: 5,
        name: 'PUXX Classic Mint',
        flavor: 'Mint',
        strength: 22,
        price: 14.99,
        image_url: '/images/products/puxxcoolmint22mg.png',
        category: 'Strong',
        description: 'Refined flavor profile with subtle cooling effect.',
      },
      {
        id: 6,
        name: 'PUXX Peppermint',
        flavor: 'Peppermint',
        strength: 22,
        price: 14.99,
        image_url: '/images/products/puxxperpermint22mg.png',
        category: 'Strong',
        description: 'Crisp peppermint with exceptional clarity.',
      },
      {
        id: 7,
        name: 'PUXX Spearmint',
        flavor: 'Spearmint',
        strength: 22,
        price: 14.99,
        image_url: '/images/products/puxxspearmint22mg.png',
        category: 'Strong',
        description: 'Sophisticated spearmint with lasting freshness.',
      },
      {
        id: 8,
        name: 'PUXX Watermelon',
        flavor: 'Watermelon',
        strength: 16,
        price: 14.99,
        image_url: '/images/products/puxxwatermelon16mg.png',
        category: 'Medium',
        description: 'Sweet and refreshing watermelon flavor.',
      },
      {
        id: 9,
        name: 'PUXX Cola',
        flavor: 'Cola',
        strength: 16,
        price: 14.99,
        image_url: '/images/products/puxxcola16mg.png',
        category: 'Medium',
        description: 'Classic cola flavor with a refreshing twist.',
      },
    ],
    []
  );

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
              setError('The server encountered an error. Using mock data instead.');
              // Set mock data
              setProducts(mockProducts);
              setPagination({
                page: 1,
                limit: 12,
                total: mockProducts.length,
                totalPages: Math.ceil(mockProducts.length / 12),
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
          setError('Could not load products from the server. Using fallback data.');
          // Use mock data as fallback
          setProducts(mockProducts);
          setPagination({
            page: 1,
            limit: 12,
            total: mockProducts.length,
            totalPages: Math.ceil(mockProducts.length / 12),
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
    mockProducts,
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
      <div className="min-h-screen bg-dark-500 px-4 py-8 text-white sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Shop Premium Nicotine Pouches</h1>

        {/* Filter and Sort Bar */}
        <div className="mb-8 rounded-lg border border-gold-500/20 bg-dark-600 p-4 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory || ''}
                onChange={e => setSelectedCategory(e.target.value || null)}
                className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map((category, idx) => (
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
                onChange={e => setSelectedFlavor(e.target.value || null)}
                className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
              >
                <option value="">All Flavors</option>
                {availableFilters.flavors.map((flavor, idx) => (
                  <option key={idx} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>

            {/* Strength Filter */}
            <div>
              <label htmlFor="strength" className="mb-1 block text-sm font-medium text-gray-300">
                Strength
              </label>
              <select
                id="strength"
                value={selectedStrength || ''}
                onChange={e => setSelectedStrength(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
              >
                <option value="">All Strengths</option>
                {availableFilters.strengths.map((strength, idx) => (
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
                onChange={e => {
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
              <label htmlFor="minPrice" className="mb-1 block text-sm font-medium text-gray-300">
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                value={minPriceFilter || ''}
                onChange={e => setMinPriceFilter(e.target.value || null)}
                placeholder={`$${availableFilters.priceRange.min}`}
                className="w-full rounded-md border-gray-700 bg-dark-700 text-white focus:border-gold-500 focus:ring focus:ring-gold-500/20"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium text-gray-300">
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                value={maxPriceFilter || ''}
                onChange={e => setMaxPriceFilter(e.target.value || null)}
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
            {products.map(product => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-lg border border-gold-500/10 bg-dark-700 p-4 shadow-md transition-all duration-300 hover:border-gold-500/30 hover:shadow-gold"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-dark-800">
                    <Image
                      src={product.image_url || '/images/products/fallback.jpg'}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.compare_at_price && (
                      <div className="absolute right-0 top-0 rounded-bl-md bg-gold-500 px-2 py-1 text-xs font-bold text-dark-900">
                        SALE
                      </div>
                    )}
                  </div>
                </Link>

                <h3 className="mb-1 text-lg font-semibold text-gold-500">{product.name}</h3>

                <div className="mb-2 flex items-center gap-2">
                  {product.category && (
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-xs text-gray-300">
                      {product.category}
                    </span>
                  )}
                  {product.flavor && (
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-xs text-gray-300">
                      {product.flavor}
                    </span>
                  )}
                  {product.strength && (
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-xs text-gray-300">
                      {product.strength}mg
                    </span>
                  )}
                </div>

                <p className="mb-4 text-sm text-gray-400">
                  {product.description || 'Premium nicotine pouches with exceptional quality.'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedToCartId === product.id}
                    className={`rounded-md px-3 py-1.5 text-sm font-bold transition-all ${
                      addedToCartId === product.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gold-500 text-black hover:bg-gold-600'
                    }`}
                  >
                    {addedToCartId === product.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!isLoading && products.length === 0 && !error && (
          <div className="rounded-lg border border-gold-500/10 bg-dark-600 p-8 text-center">
            <p className="text-gray-300">No products found matching your criteria.</p>
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

              {[...Array(pagination.totalPages)].map((_, idx) => (
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
              ))}

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
    </Layout>
  );
}
