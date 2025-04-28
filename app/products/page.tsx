// This is a server component
import React from 'react';
import Layout from '@/components/layout/NewLayout';
import ProductsContent from './ProductsContent';

/**
 * Products page - Server Component wrapper
 * Acts as a layout container for the client ProductsContent component
 */
export default function ProductsPage() {
  return (
    <Layout>
      <ProductsContent />
    </Layout>
  );
}
