'use client'; 

import React, { useState, useEffect } from 'react';
// Removed Link, Image, Layout, useCart imports for extreme simplification

// Define minimal Product type 
interface Product { id: number; name: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log immediately to see if effect runs at all
    console.log('*** Products Page useEffect IS DEFINITELY RUNNING NOW? ***'); 
    setIsLoading(false); 
    setProducts([{id: 1, name: "Bare Minimum Test Product"}]); 
  }, []); // Empty dependency array, runs once on mount

  console.log('--- Products Page Component Rendering --- ', { isLoading, error, productsLength: products.length });

  if (isLoading) {
    return <div className="p-8">Loading... (Bare Minimum)</div>;
  }
  if (error) {
      return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    // Removed Layout wrapper
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Products Page (Bare Minimum Debug)</h1>
      {products.length > 0 ? (
          <div>
              <p>Product list:</p>
              {products.map(p => <div key={p.id}>{p.name}</div>)}
          </div>
      ) : (
          <div>No products loaded (or effect didn't run).</div>
      )}
    </div>
  );
}
