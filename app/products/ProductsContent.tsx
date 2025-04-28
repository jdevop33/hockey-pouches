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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('API response is not an array:', data);
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
  }, []);

  // Handle image load errors
  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-pulse">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">Error Loading Products</h2>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
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
      <h1 className="mb-8 text-3xl font-bold">Our Products</h1>

      {productsToRender.length === 0 ? (
        <p>No products available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {productsToRender.map(product => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-48 w-full bg-gray-100">
                {product.image_url && !imageErrors[product.id as number] ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    onError={() => handleImageError(product.id as number)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <span>No image available</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <div className="space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
