'use client'; // Added directive

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../components/layout/NewLayout'; // Using relative path
import { products, Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const productIdString = params.id as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;
  const product = productId !== undefined ? products.find(p => p.id === productId) : undefined;

  useEffect(() => {
    if (productId === undefined || !product) {
      // Redirect if ID is invalid or product not found after checking
      // router.push('/products');
      console.log('Product ID invalid or product not found, would redirect...');
    }
  }, [product, productId, router]);

  if (productId === undefined) {
      // Handle case where ID is not a valid number or missing
      return <Layout><div className="p-8">Invalid Product ID.</div></Layout>;
  }

  if (!product) {
    // Render loading state or a message while product might still be loading or if truly not found
    return <Layout><div className="p-8">Loading product or product not found...</div></Layout>;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getDiscountedPrice = (qty: number) => {
    if (!product.bulkDiscounts) return product.price;
    const applicableDiscount = product.bulkDiscounts
      .filter(discount => qty >= discount.quantity)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
    if (!applicableDiscount) return product.price;
    return product.price * (1 - applicableDiscount.discountPercentage / 100);
  };

  const currentPrice = getDiscountedPrice(quantity);
  const showDiscount = currentPrice < product.price;

  const relatedProducts = products
    .filter(
      p => p.id !== product.id && (p.flavor === product.flavor || p.strength === product.strength)
    )
    .slice(0, 3);

  return (
    <Layout>
      <ProductSchema product={product} />

      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex" aria-label="Breadcrumb">
            {/* ... breadcrumb items ... */}
             <ol className="flex items-center space-x-2">
              <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
              <li className="flex items-center"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg><Link href="/products" className="ml-2 text-gray-500 hover:text-gray-700">Products</Link></li>
              <li className="flex items-center"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg><span className="ml-2 font-medium text-gray-900">{product.name}</span></li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Product image */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-96 w-full">
                <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain' }} className="p-8"/>
              </div>
            </div>

            {/* Product details */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
              <div className="mt-3">
                {/* ... price display ... */}
                  <div className="flex items-center">
                  {showDiscount ? (
                    <>
                      <p className="text-3xl text-gray-900">${currentPrice.toFixed(2)}</p>
                      <p className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</p>
                      <span className="ml-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">SAVE {((1 - currentPrice / product.price) * 100).toFixed(0)}%</span>
                    </>
                  ) : (
                    <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">{/* ... reviews placeholder ... */}</div>
              <div className="mt-6">{/* ... flavor/strength display ... */}</div>
              {product.bulkDiscounts && <div className="mt-6">{/* ... bulk discounts display ... */}</div>}
              <div className="mt-6">{/* ... quantity selector ... */}</div>
              <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4">{/* ... add to cart / view cart buttons ... */}</div>
              <div className="mt-8 border-t border-gray-200 pt-8">
                  <SocialShare url={`/products/${product.id}`} title={product.name} description={product.description}/>
              </div>
               {/* --- MLM/Referral System Additions --- */}
               {/* TODO: Add MLM related info here */}
            </div>
          </div>

          {/* Product tabs */}
          <div className="mt-16">{/* ... tabs logic and content ... */}</div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">You may also like</h2>
              {/* ... related products grid ... */}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
