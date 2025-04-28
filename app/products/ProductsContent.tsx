'use client';

import React, { useState, useEffect } from 'react';
import { useCart, Product } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-pulse">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 text-3xl font-bold">Our Products</h1>

      {products.length === 0 ? (
        <p>No products available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map(product => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
            >
              {product.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
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
