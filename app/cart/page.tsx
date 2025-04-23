'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout'; 
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity); 
    updateQuantity(productId, quantity);
  };

  const handleCheckout = () => {
    router.push('/checkout'); 
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>

          {itemCount === 0 ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
              <Link href="/products" className="text-primary-600 hover:text-primary-700 font-semibold">
                Continue Shopping &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Cart Items List */}
              <ul role="list" className="divide-y divide-gray-200">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex px-4 py-6 sm:px-6">
                    <div className="flex-shrink-0">
                      <Image
                        src={product.image_url || '/images/products/placeholder.svg'} // Corrected: image_url
                        alt={product.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-contain border border-gray-200 p-1"
                      />
                    </div>
                     {/* ... rest of list item ... */} 
                       <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-800">
                            <Link href={`/products/${product.id}`} className="hover:text-primary-600">
                              {product.name}
                            </Link>
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">{product.flavor}</p>
                          <p className="mt-1 text-sm text-gray-500">{product.strength}mg</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flow-root">
                          <button type="button" onClick={() => removeFromCart(product.id)} className="-m-2.5 inline-flex bg-white p-2.5 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Remove</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.234-2.326.468C2.88 4.82 2 5.737 2 6.828v6.344c0 1.09.88 1.992 2.02 2.13.746.14 1.539.267 2.326.357v.443A2.75 2.75 0 008.75 19h2.5A2.75 2.75 0 0014 16.25v-.443c.787-.09 1.58-.217 2.326-.357C17.12 15.32 18 14.41 18 13.172V6.828c0-1.09-.88-2.008-2.02-2.144A11.02 11.02 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v12.5c0 .69-.56 1.25-1.25 1.25h-2.5c-.69 0-1.25-.56-1.25-1.25V3.75z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between pt-2">
                        <p className="mt-1 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
                        <div className="ml-4">
                          <label htmlFor={`quantity-${product.id}`} className="sr-only">Quantity</label>
                          <input id={`quantity-${product.id}`} name={`quantity-${product.id}`} type="number" min="1" value={quantity} onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))} className="w-20 rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"/>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Order summary */}
               <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  {/* ... summary details ... */} 
                   <div className="flex justify-between text-base font-medium text-gray-900"><p>Subtotal</p><p>${subtotal.toFixed(2)}</p></div>
                   <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                   <div className="mt-6"><button onClick={handleCheckout} className="w-full flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700">Proceed to Checkout</button></div>
                   <div className="mt-6 flex justify-center text-center text-sm text-gray-500"><p>or{' '}<Link href="/products" className="font-medium text-primary-600 hover:text-primary-500">Continue Shopping<span aria-hidden="true"> &rarr;</span></Link></p></div>
                   <div className="mt-4 text-center"><button onClick={() => clearCart()} className="text-sm font-medium text-red-600 hover:text-red-500">Clear Cart</button></div>
               </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
