'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';
import ProductImage from '../../components/ui/ProductImage';
import { formatCurrency } from '@/lib/utils';
import {
  Star,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Award,
} from 'lucide-react';

// Define proper types for the product
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  gallery_images?: string[];
  sku: string;
  stock_quantity: number;
  category: string;
  brand?: string;
  rating?: number;
  review_count?: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface ProductBenefit {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

// Product benefits to highlight key selling points
const productBenefits: ProductBenefit[] = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: Shield,
    title: '2-Year Warranty',
    description: 'Full coverage',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'Within 30 days',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Expertly crafted',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch product details
        const productRes = await fetch(`/api/products/${params?.id}`);

        if (!productRes.ok) {
          throw new Error('Failed to fetch product details');
        }

        const productData = (await productRes.json()) as Product;

        setProduct(productData);

        // Handle undefined case for selectedImage
        if (productData.image_url) {
          setSelectedImage(productData.image_url);
        }

        // Fetch related products
        const relatedRes = await fetch(`/api/products/${params?.id}/related`);

        if (!relatedRes.ok) {
          throw new Error('Failed to fetch related products');
        }

        const relatedData = (await relatedRes.json()) as RelatedProduct[];
        setRelatedProducts(relatedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchProductDetails();
    }
  }, [params?.id]);

  const handleAddToCart = () => {
    if (product) {
      // Convert the product to match the Product type required by CartContext
      const productForCart = {
        id: parseInt(product.id),
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        is_active: true, // Required by the Product type in CartContext
      };

      addToCart(productForCart, quantity);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="mb-4 text-3xl font-bold text-red-500">Error</div>
          <p className="mb-8 text-xl text-gray-300">{error}</p>
          <Link
            href="/products"
            className="rounded bg-gold-500 px-6 py-3 font-semibold text-dark-900 hover:bg-gold-600"
          >
            Return to Products
          </Link>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="mb-4 text-3xl font-bold">Product Not Found</div>
          <Link
            href="/products"
            className="rounded bg-gold-500 px-6 py-3 font-semibold text-dark-900 hover:bg-gold-600"
          >
            Return to Products
          </Link>
        </div>
      </Layout>
    );
  }

  // Convert product to format expected by ProductSchema
  const schemaProduct = {
    id: parseInt(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    image_url: product.image_url,
    category: product.category,
  };

  return (
    <Layout>
      {/* Add JSON-LD schema for the product */}
      <ProductSchema product={schemaProduct} />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumbs - Smaller, lighter styling for secondary navigation */}
        <nav className="mb-12" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-400 transition-colors hover:text-gold-500">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </li>
            <li>
              <Link
                href="/products"
                className="text-gray-400 transition-colors hover:text-gold-500"
              >
                Products
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </li>
            <li className="font-medium text-gold-500">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-16 md:grid-cols-2">
          {/* Product Images - Left column with focus on image quality */}
          <div className="space-y-8">
            <div className="aspect-square overflow-hidden rounded-lg bg-dark-800 shadow-md">
              {selectedImage && (
                <ProductImage
                  src={selectedImage}
                  alt={product.name}
                  size="square"
                  priority
                  className="h-full w-full"
                  objectFit="contain"
                  enableZoom={true}
                />
              )}
            </div>
            <div className="scrollbar-thin scrollbar-track-dark-700 scrollbar-thumb-gold-500/50 flex gap-4 overflow-x-auto pb-2">
              <button
                className={`overflow-hidden rounded-lg shadow-sm transition ${
                  selectedImage === product.image_url
                    ? 'ring-2 ring-gold-500'
                    : 'hover:ring-1 hover:ring-gray-500'
                }`}
                onClick={() => setSelectedImage(product.image_url)}
                aria-label="View main product image"
              >
                <ProductImage
                  src={product.image_url}
                  alt={`${product.name} - Main`}
                  size="small"
                  className="h-20 w-20"
                />
              </button>

              {/* Gallery Images */}
              {product.gallery_images &&
                product.gallery_images.map((img, index) => (
                  <button
                    key={index}
                    className={`overflow-hidden rounded-lg shadow-sm transition ${
                      selectedImage === img
                        ? 'ring-2 ring-gold-500'
                        : 'hover:ring-1 hover:ring-gray-500'
                    }`}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.name} - View ${index + 1}`}
                      size="small"
                      className="h-20 w-20"
                    />
                  </button>
                ))}
            </div>

            {/* Image description or instructions */}
            <div className="mt-2 rounded-lg bg-dark-800/50 p-3 text-center text-sm text-gray-400">
              <span className="flex items-center justify-center gap-1">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 15L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Click image to zoom
              </span>
            </div>
          </div>

          {/* Product Details - Right column with well-defined hierarchy */}
          <div className="flex flex-col gap-8">
            {/* Primary product information */}
            <div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-gray-400">
                  By <span className="text-gold-500">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Price and availability - High visibility information */}
            <div className="border-b border-gray-800 pb-4 pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(product.price)}
                </span>
                {product.stock_quantity > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-green-900/30 px-3 py-1 text-xs font-medium text-green-300">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-900/30 px-3 py-1 text-xs font-medium text-red-300">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Rating - Visual representation with stars */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating || 0)
                          ? 'fill-gold-500 text-gold-500'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {product.rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>
            )}

            {/* Description - Clean, readable text block with controlled width */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="leading-relaxed text-gray-300">{product.description}</p>
            </div>

            {/* Product SKU - De-emphasized label with inline value */}
            <div className="text-sm text-gray-500">
              SKU: <span className="text-gray-400">{product.sku}</span>
            </div>

            {/* Add to Cart - Primary CTA with clear emphasis */}
            {product.stock_quantity > 0 && (
              <div className="mt-4 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center overflow-hidden rounded-md border border-gray-800 shadow-sm">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="flex h-10 w-10 items-center justify-center bg-dark-800 text-white transition-colors hover:bg-dark-700"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setQuantity(val > 0 ? val : 1);
                      }}
                      min="1"
                      className="w-16 border-x border-gray-800 bg-dark-900 px-3 py-2 text-center text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="flex h-10 w-10 items-center justify-center bg-dark-800 text-white transition-colors hover:bg-dark-700"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-500 px-8 py-3 font-extrabold text-black shadow-sm transition-colors hover:bg-gold-400"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            )}

            {/* Benefits - Visual anchors with icons */}
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-800 pt-6">
              {productBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <benefit.icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-gold-500" />
                  <div>
                    <h3 className="text-sm font-medium text-white">{benefit.title}</h3>
                    <p className="text-xs text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Sharing */}
            <div className="mt-6 border-t border-gray-800 pt-6">
              <SocialShare
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.id}`}
                title={`Check out ${product.name}`}
                description={product.description}
              />
            </div>
          </div>
        </div>

        {/* Reviews Section - Empty state with clear CTA */}
        <section className="mt-24 border-t border-gray-800 pt-8">
          <h2 className="mb-8 text-2xl font-bold">Customer Reviews</h2>
          <div className="rounded-lg bg-dark-800 px-6 py-10 text-center shadow-sm">
            <p className="mb-4 text-gray-400">
              No reviews yet. Be the first to review this product!
            </p>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-gold-500 px-6 py-2 font-medium text-gold-500 transition-colors hover:bg-gold-500 hover:text-dark-900"
              aria-label="Write a review"
            >
              Write a Review
            </button>
          </div>
        </section>

        {/* Related Products - Card-based layout with visual consistency */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-gray-800 pt-8">
            <h2 className="mb-8 text-2xl font-bold">You Might Also Like</h2>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg bg-dark-800 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-dark-900 p-4">
                    <ProductImage
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      size="medium"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-4">
                    <h3 className="mb-2 font-medium text-white transition-colors group-hover:text-gold-500">
                      {relatedProduct.name}
                    </h3>
                    <p className="mt-auto font-bold text-gold-500">
                      {formatCurrency(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
