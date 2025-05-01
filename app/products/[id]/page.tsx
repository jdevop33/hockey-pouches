'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Layout from '../../components/layout/NewLayout';
import { useCart } from '../../context/CartContext';
import SocialShare from '../../components/SocialShare';
import ProductSchema from '../../components/ProductSchema';
import ProductImage from '../../components/ui/ProductImage';
import { cn, formatCurrency } from '@/lib/utils';
import * as schema from '@/lib/schema';
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
// Loading skeleton component for product details
const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image skeleton */}
      <div className="aspect-square w-full rounded-lg bg-gray-700" />
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-gray-700" />
        <div className="h-4 w-1/4 rounded bg-gray-700" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-700" />
          <div className="h-4 w-5/6 rounded bg-gray-700" />
        </div>
        <div className="h-10 w-1/3 rounded bg-gray-700" />
        <div className="flex gap-4">
          <div className="h-12 w-32 rounded bg-gray-700" />
          <div className="h-12 flex-1 rounded bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);
// Enhance product image gallery
const ProductGallery = ({ product }: { product: Product }) => {
  const [activeImage, setActiveImage] = useState(product.image_url);
  const images = [product.image_url, ...(product.gallery_images || [])];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-lg border border-gray-800">
        <ProductImage
          src={activeImage}
          alt={product.name}
          size="square"
          priority={true}
          objectFit="contain"
          enableZoom={true}
        />
      </div>

      {/* Thumbnail grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(image)}
              aria-label={`View ${product.name} image ${index + 1}`}
              className={cn(
                'aspect-square relative overflow-hidden rounded-md border',
                activeImage === image ? 'border-gold-500' : 'border-gray-800'
              )}
            >
              <ProductImage
                src={image}
                alt={`${product.name} view ${index + 1}`}
                size="square"
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
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
        // Fetch related products
        const relatedRes = await fetch(`/api/products/${params?.id}/related`);
        if (!relatedRes.ok) {
          throw new Error('Failed to fetch related products');
        }
        const relatedData = (await relatedRes.json()) as RelatedProduct[];
        setRelatedProducts(relatedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');

        // FOR DEVELOPMENT: Use mock data when API fails
        if (process.env.NODE_ENV === 'development') {
          // Find matching product from our static data
          const id = params?.id as string;
          const mockProduct = getMockProduct(id);
          if (mockProduct) {
            setProduct(mockProduct);
            setRelatedProducts(getMockRelatedProducts(id));
            setError(null);
          }
        }
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
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        is_active: true,
      };
      addToCart(productForCart, quantity);
    }
  };
  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProductSkeleton />
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/products" className="hover:text-gold-400">
                Products
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link href={`/products?category=${product.category}`} className="hover:text-gold-400">
                {product.category}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li className="text-gray-300">{product.name}</li>
          </ol>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product gallery */}
          <ProductGallery product={product} />
          {/* Product info */}
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
        {/* Product schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: product.image_url,
              sku: product.sku,
              brand: product.brand,
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'CAD',
                availability: product.stock_quantity > 0 ? 'InStock' : 'OutOfStock',
              },
              ...(product.rating && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: product.rating,
                  reviewCount: product.review_count,
                },
              }),
            }),
          }}
        />
      </div>
      {/* Reviews Section - Empty state with clear CTA */}
      <section className="mt-24 border-t border-gray-800 pt-8">
        <h2 className="mb-8 text-2xl font-bold">Customer Reviews</h2>
        <div className="rounded-lg bg-dark-800 px-6 py-10 text-center shadow-sm">
          <p className="mb-4 text-gray-400">No reviews yet. Be the first to review this product!</p>
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
    </Layout>
  );
}

// Helper function to get mock product data during development
function getMockProduct(id: string): Product | null {
  const productMap: Record<string, Product> = {
    'cool-mint': {
      id: 'cool-mint',
      name: 'PUXX Classic Mint',
      description:
        'Our flagship flavor with a perfectly balanced cooling sensation that delivers long-lasting freshness with every use.',
      price: 15.0,
      image_url: '/images/products/puxxcoolmint22mg.png',
      gallery_images: [
        '/images/products/puxxcoolmint22mg-600x600.png',
        '/images/products/puxxcoolmint22mg-300x300.png',
      ],
      sku: 'PX-CM-22MG',
      stock_quantity: 125,
      category: 'Mint',
      brand: 'PUXX',
      rating: 4.9,
      review_count: 187,
    },
    peppermint: {
      id: 'peppermint',
      name: 'PUXX Peppermint',
      description:
        'Crisp, intense peppermint for those who appreciate bold refreshment with a clean, satisfying finish.',
      price: 15.0,
      image_url: '/images/products/puxxperpermint22mg.png',
      gallery_images: [
        '/images/products/puxxperpermint22mg-600x600.png',
        '/images/products/puxxperpermint22mg-300x300.png',
      ],
      sku: 'PX-PM-22MG',
      stock_quantity: 98,
      category: 'Mint',
      brand: 'PUXX',
      rating: 4.7,
      review_count: 142,
    },
    spearmint: {
      id: 'spearmint',
      name: 'PUXX Spearmint',
      description:
        'Sophisticated spearmint with a smooth finish and lasting freshness that feels both invigorating and refined.',
      price: 15.0,
      image_url: '/images/products/puxxspearmint22mg.png',
      gallery_images: [
        '/images/products/puxxspearmint22mg-600x600.png',
        '/images/products/puxxspearmint22mg-300x300.png',
      ],
      sku: 'PX-SM-22MG',
      stock_quantity: 76,
      category: 'Mint',
      brand: 'PUXX',
      rating: 4.8,
      review_count: 156,
    },
    watermelon: {
      id: 'watermelon',
      name: 'PUXX Watermelon',
      description:
        'Premium watermelon with the perfect balance of sweetness and satisfaction for a fruity, refreshing experience.',
      price: 15.0,
      image_url: '/images/products/puxxwatermelon16mg.png',
      gallery_images: [
        '/images/products/puxxwatermelon16mg-600x600.png',
        '/images/products/puxxwatermelon16mg-300x300.png',
      ],
      sku: 'PX-WM-16MG',
      stock_quantity: 112,
      category: 'Fruit',
      brand: 'PUXX',
      rating: 4.6,
      review_count: 98,
    },
    cola: {
      id: 'cola',
      name: 'PUXX Cola',
      description:
        'Classic cola flavor with a refreshing twist, providing a familiar and satisfying experience.',
      price: 15.0,
      image_url: '/images/products/puxxcola16mg.png',
      gallery_images: [
        '/images/products/puxxcola16mg-600x600.png',
        '/images/products/puxxcola16mg-300x300.png',
      ],
      sku: 'PX-CO-16MG',
      stock_quantity: 84,
      category: 'Soda',
      brand: 'PUXX',
      rating: 4.5,
      review_count: 76,
    },
  };

  return productMap[id] || null;
}

// Helper function to get mock related products
function getMockRelatedProducts(currentId: string): RelatedProduct[] {
  const allProducts = Object.values(
    getMockProduct('cool-mint')
      ? {
          'cool-mint': getMockProduct('cool-mint'),
          peppermint: getMockProduct('peppermint'),
          spearmint: getMockProduct('spearmint'),
          watermelon: getMockProduct('watermelon'),
          cola: getMockProduct('cola'),
        }
      : {}
  ).filter(p => p && p.id !== currentId) as Product[];

  return allProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image_url: p.image_url,
  }));
}
