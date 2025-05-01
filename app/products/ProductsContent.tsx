'use client';

import React, { useState, useEffect } from 'react';
import { useCart, Product } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  // Change imageErrors state to use string keys
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?page=${currentPage}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        // Handle the API response structure (assuming it matches ProductListResult)
        if (data.products && Array.isArray(data.products)) {
          // Ensure price is a number before setting state
          const formattedProducts = data.products.map((p: unknown) => ({
            ...p,
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          }));
          setProducts(formattedProducts);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
          }
        } else {
          console.error('API response structure is invalid:', data);
          setError('Invalid data format received from server');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage]);

  // Handle image load errors - accept string productId
  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true,
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-pulse text-gold-500">Loading premium products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gold-400">Error Loading Products</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()} // Simple reload for now
            className="mt-4 rounded bg-gold-500 px-4 py-2 font-medium text-dark-900 hover:bg-gold-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Additional safety check before mapping
  const productsToRender = Array.isArray(products) ? products : [];

  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Premium Nicotine Pouches</h1>

      {productsToRender.length === 0 ? (
        <p className="text-gray-300">No products available at the moment.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productsToRender.map(product => (
              <div
                key={product.id}
                className="overflow-hidden rounded-lg border border-gold-500/10 bg-dark-600 shadow-gold-sm transition-transform hover:scale-[1.02]"
              >
                <div className="relative h-48 w-full bg-dark-700">
                  {/* Use string product.id directly */}
                  {product.image_url && !imageErrors[product.id] ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                      // Pass string product.id to handler
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-dark-700 text-gray-500">
                      <span>No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="mb-2 text-lg font-semibold text-white">{product.name}</h2>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-300">{product.description}</p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {product.flavor && (
                      <span className="inline-flex items-center rounded-full bg-dark-500 px-2.5 py-0.5 text-xs text-gray-300">
                        {product.flavor}
                      </span>
                    )}
                    {product.strength && (
                      <span className="inline-flex items-center rounded-full bg-dark-500 px-2.5 py-0.5 text-xs text-gray-300">
                        {product.strength}mg
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gold-500">
                      {/* Ensure price is a number before calling toFixed */} 
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                    </span>
                    <div className="space-x-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="rounded bg-dark-500 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-dark-400"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="rounded bg-gold-600 px-4 py-1 text-sm font-extrabold text-black shadow hover:bg-gold-500"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded border border-gold-500/20 bg-dark-600 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`rounded px-3 py-1 text-sm ${
                      currentPage === page
                        ? 'bg-gold-500 text-dark-900'
                        : 'border border-gold-500/20 bg-dark-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded border border-gold-500/20 bg-dark-600 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
