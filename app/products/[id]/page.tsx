'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import { products } from '../../data/products';
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

  // Find the product by ID
  const productId = parseInt(params.id as string);
  const product = products.find(p => p.id === productId);

  // If product not found, redirect to products page
  useEffect(() => {
    if (!product) {
      router.push('/products');
    }
  }, [product, router]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    
    // Reset the "Added to cart" message after 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  // Calculate price with bulk discount if applicable
  const getDiscountedPrice = (qty: number) => {
    if (!product.bulkDiscounts) return product.price;
    
    const applicableDiscount = product.bulkDiscounts
      .filter(discount => qty >= discount.quantity)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
      
    if (!applicableDiscount) return product.price;
    
    const discountMultiplier = 1 - (applicableDiscount.discountPercentage / 100);
    return product.price * discountMultiplier;
  };

  const currentPrice = getDiscountedPrice(quantity);
  const showDiscount = currentPrice < product.price;
  
  // Get related products (same flavor or strength)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.flavor === product.flavor || p.strength === product.strength))
    .slice(0, 3);

  return (
    <Layout>
      <ProductSchema product={product} />
      
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/products" className="ml-2 text-gray-500 hover:text-gray-700">Products</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-900 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Product image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-8"
                />
              </div>
            </div>

            {/* Product details */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
              
              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <div className="flex items-center">
                  {showDiscount ? (
                    <>
                      <p className="text-3xl text-gray-900">${currentPrice.toFixed(2)}</p>
                      <p className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</p>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                        SAVE {((1 - (currentPrice / product.price)) * 100).toFixed(0)}%
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="ml-3 text-sm text-gray-500">Based on 42 reviews</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Flavor:</span>
                    <span className="ml-2 text-sm text-gray-900">{product.flavor}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Strength:</span>
                    <span className="ml-2 text-sm text-gray-900">{product.strength}mg</span>
                  </div>
                </div>
              </div>

              {/* Bulk discounts */}
              {product.bulkDiscounts && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Bulk Discounts</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    {product.bulkDiscounts.map((discount) => (
                      <div key={discount.quantity} className="border border-gray-200 rounded-md p-3 text-center">
                        <p className="text-sm font-medium text-gray-900">{discount.quantity}+ cans</p>
                        <p className="text-sm text-green-600">{discount.discountPercentage}% off</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mt-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="mt-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mx-2 text-center w-16 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add to cart button */}
              <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                    addedToCart ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                >
                  {addedToCart ? (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <Link
                  href="/cart"
                  className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Cart
                </Link>
              </div>

              {/* Social sharing */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <SocialShare
                  url={`https://hockeypouches.ca/products/${product.id}`}
                  title={`Check out ${product.name} from Hockey Pouches`}
                  description={product.description}
                />
              </div>
            </div>
          </div>

          {/* Product tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`${
                    activeTab === 'description'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`${
                    activeTab === 'details'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Reviews
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <p>
                    Our premium {product.flavor} nicotine pouches are designed specifically for hockey players who need a discreet, convenient option that works with their active lifestyle. With {product.strength}mg of nicotine per pouch, they provide just the right amount of satisfaction without the mess or inconvenience of traditional tobacco products.
                  </p>
                  <p>
                    Perfect for use between periods, during practice breaks, or anytime you need a quick boost. The slim, comfortable pouches fit discreetly under your lip and deliver a consistent release of nicotine without the need for spitting.
                  </p>
                  <h3>Why Hockey Players Love Our Pouches:</h3>
                  <ul>
                    <li>Discreet and easy to use - no spitting required</li>
                    <li>Perfect for use in locker rooms and on the bench</li>
                    <li>Consistent nicotine delivery for steady energy</li>
                    <li>Fresh {product.flavor} flavor that lasts</li>
                    <li>Tobacco-free formula</li>
                  </ul>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="border-t border-gray-200 py-6">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Product name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.name}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Flavor</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.flavor}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Nicotine strength</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.strength}mg per pouch</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Pouches per can</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">20</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Ingredients</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Nicotine, plant-based fibers, water, salt, pH adjusters, sweeteners, flavoring</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Storage</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Store in a cool, dry place away from direct sunlight</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Warning</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">This product contains nicotine. Nicotine is an addictive chemical. Not for sale to minors.</dd>
                    </div>
                  </dl>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <div className="mt-6 border-t border-b border-gray-200 py-6 space-y-8">
                    <div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <svg
                              key={rating}
                              className="h-5 w-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="ml-2 text-sm font-medium text-gray-900">Mark T.</p>
                        <span className="ml-4 text-sm text-gray-500">Verified Buyer</span>
                      </div>
                      <div className="mt-4 text-base text-gray-600">
                        <p>
                          These pouches are perfect for between periods. I used to use traditional products but these are so much cleaner and more convenient. The {product.flavor} flavor is great and lasts a long time.
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <svg
                              key={rating}
                              className={`h-5 w-5 ${
                                rating < 4 ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="ml-2 text-sm font-medium text-gray-900">Sarah K.</p>
                        <span className="ml-4 text-sm text-gray-500">Verified Buyer</span>
                      </div>
                      <div className="mt-4 text-base text-gray-600">
                        <p>
                          I'm a goalie and these help me stay focused during long games. The {product.strength}mg strength is perfect - not too strong, not too weak. Will definitely buy again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">You may also like</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                    <div className="relative h-64 bg-gray-100">
                      <Image
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-4"
                      />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{relatedProduct.name}</h3>
                      <p className="text-gray-500 mb-4">{relatedProduct.description}</p>
                      <div className="mt-auto flex justify-between items-center">
                        <p className="text-lg font-medium text-gray-900">${relatedProduct.price.toFixed(2)}</p>
                        <Link
                          href={`/products/${relatedProduct.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
