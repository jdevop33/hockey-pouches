'use client';

// Use named imports for React hooks and types
import { useState, useEffect, ChangeEvent } from 'react';
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
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-300">
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
              <label htmlFor="strength" className="mb-1 block text-sm font-medium text-gray-300">
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
              <label htmlFor="minPrice" className="mb-1 block text-sm font-medium text-gray-300">
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
              <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium text-gray-300">
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
            {products.map((product: Product) => (
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
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.compare_at_price && (
                      <div className="absolute right-0 top-0 rounded-bl-md bg-gold-500 px-2 py-1 text-xs font-bold text-dark-900">
                        EXCLUSIVE
                      </div>
                    )}
                  </div>
                </Link>

                <Link href={`/products/${product.id}`}>
                  <h3 className="mb-1 text-lg font-semibold text-gold-500 hover:underline">
                    {product.name}
                  </h3>
                </Link>

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
                      {product.strength}mg Precision
                    </span>
                  )}
                </div>

                <p className="mb-4 text-sm text-gray-400">
                  {product.description ||
                    'Exceptionally crafted for those who appreciate refined indulgence.'}
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
                    {addedToCartId === product.id ? 'Added to Collection' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!isLoading && products.length === 0 && !error && (
          <div className="rounded-lg border border-gold-500/10 bg-dark-600 p-8 text-center">
            <p className="text-gray-300">
              Your refined taste requires specific products that are currently unavailable. Please
              adjust your criteria or contact our concierge service for personalized assistance.
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
    </Layout>
  );
}
