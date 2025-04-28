'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';
import ProductImage from '../../components/ui/ProductImage';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { formatCurrency } from '@/lib/utils';
import {
  Star,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
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

  // Mock reviews data - this would typically come from your API
  const reviews = {
    average: 4.7,
    count: 124,
    distribution: [
      { stars: 5, percentage: 82 },
      { stars: 4, percentage: 12 },
      { stars: 3, percentage: 4 },
      { stars: 2, percentage: 1 },
      { stars: 1, percentage: 1 },
    ],
  };

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

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-400 hover:text-gold-500">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </li>
            <li>
              <Link href="/products" className="text-gray-400 hover:text-gold-500">
                Products
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </li>
            <li className="text-gold-500">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden rounded-lg bg-dark-800">
              {selectedImage && (
                <ProductImage
                  src={selectedImage}
                  alt={product.name}
                  size="large"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <button
                className={`overflow-hidden rounded-lg border p-1 ${selectedImage === product.image_url ? 'border-gold-500' : 'border-gray-700 hover:border-gray-500'}`}
                onClick={() => setSelectedImage(product.image_url)}
                aria-label="View product image"
              >
                <ProductImage
                  src={product.image_url}
                  alt={product.name}
                  size="small"
                  className="h-16 w-16 object-contain"
                />
              </button>
              {product.gallery_images?.map((image, index) => (
                <button
                  key={index}
                  className={`overflow-hidden rounded-lg border p-1 ${selectedImage === image ? 'border-gold-500' : 'border-gray-700 hover:border-gray-500'}`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    size="small"
                    className="h-16 w-16 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">{product.name}</h1>
              {product.brand && (
                <p className="text-sm text-gray-400">
                  By <span className="text-gold-500">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-t border-gray-700 py-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(product.price)}
                </span>
                {product.stock_quantity > 0 ? (
                  <span className="rounded-full bg-green-900 px-3 py-1 text-xs font-medium text-green-300">
                    In Stock
                  </span>
                ) : (
                  <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-medium text-red-300">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? 'fill-gold-500 text-gold-500' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {product.rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>
            )}

            {/* Description */}
            <div className="prose-dark prose prose-invert max-w-none">
              <p className="text-gray-300">{product.description}</p>
            </div>

            {/* SKU */}
            <div className="text-sm text-gray-400">
              SKU: <span className="text-gray-300">{product.sku}</span>
            </div>

            {/* Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l border border-gray-700 bg-dark-700 text-white hover:bg-dark-600"
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
                      className="w-16 border-gray-700 bg-dark-700 px-3 py-2 text-center text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-r border border-gray-700 bg-dark-700 text-white hover:bg-dark-600"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gold-500 px-6 py-3 font-bold text-dark-900 transition hover:bg-gold-600"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-2 gap-6">
              {productBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <benefit.icon className="h-6 w-6 text-gold-500" />
                  <div>
                    <h3 className="font-medium text-white">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Sharing */}
            <div className="mt-8 pt-6">
              <SocialShare
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.id}`}
                title={`Check out ${product.name}`}
                description={product.description}
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 border-t border-gray-800 pt-10">
          <h2 className="mb-8 text-3xl font-bold">Customer Reviews</h2>
          {/* Reviews content would go here */}
          <div className="py-10 text-center">
            <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
            <button
              className="mt-4 rounded-lg border border-gold-500 px-6 py-2 font-medium text-gold-500 hover:bg-gold-500 hover:text-dark-900"
              aria-label="Write a review"
            >
              Write a Review
            </button>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-gray-800 pt-10">
            <h2 className="mb-8 text-3xl font-bold">You Might Also Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group overflow-hidden rounded-lg border border-gray-800 bg-dark-800 transition hover:border-gold-500"
                >
                  <div className="aspect-square bg-dark-900 p-4">
                    <ProductImage
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      size="medium"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 font-medium text-white group-hover:text-gold-500">
                      {relatedProduct.name}
                    </h3>
                    <p className="font-bold text-gold-500">
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
